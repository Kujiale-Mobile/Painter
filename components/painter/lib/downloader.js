/**
 * LRU 文件存储，使用该 downloader 可以让下载的文件存储在本地，下次进入小程序后可以直接使用
 * 详细设计文档可查看 https://juejin.im/post/5b42d3ede51d4519277b6ce3
 */
const util = require('./util');

const SAVED_FILES_KEY = 'savedFiles';
const KEY_TOTAL_SIZE = 'totalSize';
const KEY_PATH = 'path';
const KEY_TIME = 'time';
const KEY_SIZE = 'size';

// 可存储总共为 6M，目前小程序可允许的最大本地存储为 10M
let MAX_SPACE_IN_B = 6 * 1024 * 1024;
let savedFiles = {};

export default class Dowloader {
  constructor() {
    // app 如果设置了最大存储空间，则使用 app 中的
    if (getApp().PAINTER_MAX_LRU_SPACE) {
      MAX_SPACE_IN_B = getApp().PAINTER_MAX_LRU_SPACE;
    }
    wx.getStorage({
      key: SAVED_FILES_KEY,
      success: function (res) {
        if (res.data) {
          savedFiles = res.data;
        }
      },
    });
  }

  /**
   * 下载文件，会用 lru 方式来缓存文件到本地
   * @param {String} url 文件的 url
   */
  download(url) {
    return new Promise((resolve, reject) => {
      if (!(url && util.isValidUrl(url))) {
        resolve(url);
        return;
      }
      const file = getFile(url);

      if (file) {
        // 检查文件是否正常，不正常需要重新下载
        wx.getSavedFileInfo({
          filePath: file[KEY_PATH],
          success: (res) => {
            resolve(file[KEY_PATH]);
          },
          fail: (error) => {
            console.error(`the file is broken, redownload it, ${JSON.stringify(error)}`);
            downloadFile(url).then((path) => {
              resolve(path);
            }, () => {
              reject();
            });
          },
        });
      } else {
        downloadFile(url).then((path) => {
          resolve(path);
        }, () => {
          reject();
        });
      }
    });
  }
}

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: url,
      success: function (res) {
        if (res.statusCode !== 200) {
          console.error(`downloadFile ${url} failed res.statusCode is not 200`);
          reject();
          return;
        }
        const { tempFilePath } = res;
        wx.getFileInfo({
          filePath: tempFilePath,
          success: (tmpRes) => {
            const newFileSize = tmpRes.size;
            doLru(newFileSize).then(() => {
              saveFile(url, newFileSize, tempFilePath).then((filePath) => {
                resolve(filePath);
              });
            }, () => {
              resolve(tempFilePath);
            });
          },
          fail: (error) => {
          // 文件大小信息获取失败，则此文件也不要进行存储
            console.error(`getFileInfo ${res.tempFilePath} failed, ${JSON.stringify(error)}`);
            resolve(res.tempFilePath);
          },
        });
      },
      fail: function (error) {
        console.error(`downloadFile failed, ${JSON.stringify(error)} `);
        reject();
      },
    });
  });
}

function saveFile(key, newFileSize, tempFilePath) {
  return new Promise((resolve, reject) => {
    wx.saveFile({
      tempFilePath: tempFilePath,
      success: (fileRes) => {
        const totalSize = savedFiles[KEY_TOTAL_SIZE] ? savedFiles[KEY_TOTAL_SIZE] : 0;
        savedFiles[key] = {};
        savedFiles[key][KEY_PATH] = fileRes.savedFilePath;
        savedFiles[key][KEY_TIME] = new Date().getTime();
        savedFiles[key][KEY_SIZE] = newFileSize;
        savedFiles['totalSize'] = newFileSize + totalSize;
        wx.setStorage({
          key: SAVED_FILES_KEY,
          data: savedFiles,
        });
        resolve(fileRes.savedFilePath);
      },
      fail: (error) => {
        console.error(`saveFile ${key} failed, then we delete all files, ${JSON.stringify(error)}`);
        // 由于 saveFile 成功后，res.tempFilePath 处的文件会被移除，所以在存储未成功时，我们还是继续使用临时文件
        resolve(tempFilePath);
        // 如果出现错误，就直接情况本地的所有文件，因为你不知道是不是因为哪次lru的某个文件未删除成功
        reset();
      },
    });
  });
}

/**
 * 清空所有下载相关内容
 */
function reset() {
  wx.removeStorage({
    key: SAVED_FILES_KEY,
    success: () => {
      wx.getSavedFileList({
        success: (listRes) => {
          removeFiles(listRes.fileList);
        },
        fail: (getError) => {
          console.error(`getSavedFileList failed, ${JSON.stringify(getError)}`);
        },
      });
    },
  });
}

function doLru(size) {
  return new Promise((resolve, reject) => {
    let totalSize = savedFiles[KEY_TOTAL_SIZE] ? savedFiles[KEY_TOTAL_SIZE] : 0;

    if (size + totalSize <= MAX_SPACE_IN_B) {
      resolve();
      return;
    }
    // 如果加上新文件后大小超过最大限制，则进行 lru
    const pathsShouldDelete = [];
    // 按照最后一次的访问时间，从小到大排序
    const allFiles = JSON.parse(JSON.stringify(savedFiles));
    delete allFiles[KEY_TOTAL_SIZE];
    const sortedKeys = Object.keys(allFiles).sort((a, b) => {
      return allFiles[a][KEY_TIME] - allFiles[b][KEY_TIME];
    });

    for (const sortedKey of sortedKeys) {
      totalSize -= savedFiles[sortedKey].size;
      pathsShouldDelete.push(savedFiles[sortedKey][KEY_PATH]);
      delete savedFiles[sortedKey];
      if (totalSize + size < MAX_SPACE_IN_B) {
        break;
      }
    }

    savedFiles['totalSize'] = totalSize;

    wx.setStorage({
      key: SAVED_FILES_KEY,
      data: savedFiles,
      success: () => {
      // 保证 storage 中不会存在不存在的文件数据
        if (pathsShouldDelete.length > 0) {
          removeFiles(pathsShouldDelete);
        }
        resolve();
      },
      fail: (error) => {
        console.error(`doLru setStorage failed, ${JSON.stringify(error)}`);
        reject();
      },
    });
  });
}

function removeFiles(pathsShouldDelete) {
  for (const pathDel of pathsShouldDelete) {
    let delPath = pathDel;
    if (typeof pathDel === 'object') {
      delPath = pathDel.filePath;
    }
    wx.removeSavedFile({
      filePath: delPath,
      fail: (error) => {
        console.error(`removeSavedFile ${pathDel} failed, ${JSON.stringify(error)}`);
      },
    });
  }
}

function getFile(key) {
  if (!savedFiles[key]) {
    return;
  }
  savedFiles[key]['time'] = new Date().getTime();
  wx.setStorage({
    key: SAVED_FILES_KEY,
    data: savedFiles,
  });
  return savedFiles[key];
}
