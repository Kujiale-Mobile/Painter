import Pen, { penCache, clearPenCache } from './lib/pen';
import Downloader from './lib/downloader';
import WxCanvas from './lib/wx-canvas';

const util = require('./lib/util');
const calc = require('./lib/calc');

const downloader = new Downloader();

// 最大尝试的绘制次数
const MAX_PAINT_COUNT = 5;
const ACTION_DEFAULT_SIZE = 24;
const ACTION_OFFSET = '2rpx';
Component({
  canvasWidthInPx: 0,
  canvasHeightInPx: 0,
  canvasNode: null,
  paintCount: 0,
  currentPalette: {},
  outterDisabled: false,
  isDisabled: false,
  needClear: false,
  /**
   * 组件的属性列表
   */
  properties: {
    use2D: {
      type: Boolean,
    },
    customStyle: {
      type: String,
    },
    // 运行自定义选择框和删除缩放按钮
    customActionStyle: {
      type: Object,
    },
    palette: {
      type: Object,
      observer: function (newVal, oldVal) {
        if (this.isNeedRefresh(newVal, oldVal)) {
          this.paintCount = 0;
          clearPenCache();
          this.startPaint();
        }
      },
    },
    dancePalette: {
      type: Object,
      observer: function (newVal, oldVal) {
        if (!this.isEmpty(newVal) && !this.properties.use2D) {
          clearPenCache();
          this.initDancePalette(newVal);
        }
      },
    },
    // 缩放比，会在传入的 palette 中统一乘以该缩放比
    scaleRatio: {
      type: Number,
      value: 1,
    },
    widthPixels: {
      type: Number,
      value: 0,
    },
    // 启用脏检查，默认 false
    dirty: {
      type: Boolean,
      value: false,
    },
    LRU: {
      type: Boolean,
      value: false,
    },
    action: {
      type: Object,
      observer: function (newVal, oldVal) {
        if (newVal && !this.isEmpty(newVal) && !this.properties.use2D) {
          this.doAction(newVal, null, false, true);
        }
      },
    },
    disableAction: {
      type: Boolean,
      observer: function (isDisabled) {
        this.outterDisabled = isDisabled;
        this.isDisabled = isDisabled;
      },
    },
    clearActionBox: {
      type: Boolean,
      observer: function (needClear) {
        if (needClear && !this.needClear) {
          if (this.frontContext) {
            setTimeout(() => {
              this.frontContext.draw();
            }, 100);
            this.touchedView = {};
            this.prevFindedIndex = this.findedIndex;
            this.findedIndex = -1;
          }
        }
        this.needClear = needClear;
      },
    },
  },

  data: {
    picURL: '',
    showCanvas: true,
    painterStyle: '',
  },

  methods: {
    /**
     * 判断一个 object 是否为 空
     * @param {object} object
     */
    isEmpty(object) {
      for (const i in object) {
        return false;
      }
      return true;
    },

    isNeedRefresh(newVal, oldVal) {
      if (!newVal || this.isEmpty(newVal) || (this.data.dirty && util.equal(newVal, oldVal))) {
        return false;
      }
      return true;
    },

    getBox(rect, type) {
      const boxArea = {
        type: 'rect',
        css: {
          height: `${rect.bottom - rect.top}px`,
          width: `${rect.right - rect.left}px`,
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          borderWidth: '4rpx',
          borderColor: '#1A7AF8',
          color: 'transparent',
        },
      };
      if (type === 'text') {
        boxArea.css = Object.assign({}, boxArea.css, {
          borderStyle: 'dashed',
        });
      }
      if (this.properties.customActionStyle && this.properties.customActionStyle.border) {
        boxArea.css = Object.assign({}, boxArea.css, this.properties.customActionStyle.border);
      }
      Object.assign(boxArea, {
        id: 'box',
      });
      return boxArea;
    },

    getScaleIcon(rect, type) {
      let scaleArea = {};
      const { customActionStyle } = this.properties;
      if (customActionStyle && customActionStyle.scale) {
        scaleArea = {
          type: 'image',
          url: type === 'text' ? customActionStyle.scale.textIcon : customActionStyle.scale.imageIcon,
          css: {
            height: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            width: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            borderRadius: `${ACTION_DEFAULT_SIZE}rpx`,
          },
        };
      } else {
        scaleArea = {
          type: 'rect',
          css: {
            height: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            width: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            borderRadius: `${ACTION_DEFAULT_SIZE}rpx`,
            color: '#0000ff',
          },
        };
      }
      scaleArea.css = Object.assign({}, scaleArea.css, {
        align: 'center',
        left: `${rect.right + ACTION_OFFSET.toPx()}px`,
        top:
          type === 'text'
            ? `${rect.top - ACTION_OFFSET.toPx() - scaleArea.css.height.toPx() / 2}px`
            : `${rect.bottom - ACTION_OFFSET.toPx() - scaleArea.css.height.toPx() / 2}px`,
      });
      Object.assign(scaleArea, {
        id: 'scale',
      });
      return scaleArea;
    },

    getDeleteIcon(rect) {
      let deleteArea = {};
      const { customActionStyle } = this.properties;
      if (customActionStyle && customActionStyle.scale) {
        deleteArea = {
          type: 'image',
          url: customActionStyle.delete.icon,
          css: {
            height: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            width: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            borderRadius: `${ACTION_DEFAULT_SIZE}rpx`,
          },
        };
      } else {
        deleteArea = {
          type: 'rect',
          css: {
            height: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            width: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            borderRadius: `${ACTION_DEFAULT_SIZE}rpx`,
            color: '#0000ff',
          },
        };
      }
      deleteArea.css = Object.assign({}, deleteArea.css, {
        align: 'center',
        left: `${rect.left - ACTION_OFFSET.toPx()}px`,
        top: `${rect.top - ACTION_OFFSET.toPx() - deleteArea.css.height.toPx() / 2}px`,
      });
      Object.assign(deleteArea, {
        id: 'delete',
      });
      return deleteArea;
    },

    doAction(action, callback, isMoving, overwrite) {
      if (this.properties.use2D) {
        return;
      }
      let newVal = null;
      if (action) {
        newVal = action.view;
      }
      if (newVal && newVal.id && this.touchedView.id !== newVal.id) {
        // 带 id 的动作给撤回时使用，不带 id，表示对当前选中对象进行操作
        const { views } = this.currentPalette;
        for (let i = 0; i < views.length; i++) {
          if (views[i].id === newVal.id) {
            // 跨层回撤，需要重新构建三层关系
            this.touchedView = views[i];
            this.findedIndex = i;
            this.sliceLayers();
            break;
          }
        }
      }

      const doView = this.touchedView;

      if (!doView || this.isEmpty(doView)) {
        return;
      }
      if (newVal && newVal.css) {
        if (overwrite) {
          doView.css = newVal.css;
        } else if (Array.isArray(doView.css) && Array.isArray(newVal.css)) {
          doView.css = Object.assign({}, ...doView.css, ...newVal.css);
        } else if (Array.isArray(doView.css)) {
          doView.css = Object.assign({}, ...doView.css, newVal.css);
        } else if (Array.isArray(newVal.css)) {
          doView.css = Object.assign({}, doView.css, ...newVal.css);
        } else {
          doView.css = Object.assign({}, doView.css, newVal.css);
        }
      }
      if (newVal && newVal.rect) {
        doView.rect = newVal.rect;
      }
      if (newVal && newVal.url && doView.url && newVal.url !== doView.url) {
        downloader
          .download(newVal.url, this.properties.LRU)
          .then(path => {
            if (newVal.url.startsWith('https')) {
              doView.originUrl = newVal.url;
            }
            doView.url = path;
            wx.getImageInfo({
              src: path,
              success: res => {
                doView.sHeight = res.height;
                doView.sWidth = res.width;
                this.reDraw(doView, callback, isMoving);
              },
              fail: () => {
                this.reDraw(doView, callback, isMoving);
              },
            });
          })
          .catch(error => {
            // 未下载成功，直接绘制
            console.error(error);
            this.reDraw(doView, callback, isMoving);
          });
      } else {
        newVal && newVal.text && doView.text && newVal.text !== doView.text && (doView.text = newVal.text);
        newVal &&
          newVal.content &&
          doView.content &&
          newVal.content !== doView.content &&
          (doView.content = newVal.content);
        this.reDraw(doView, callback, isMoving);
      }
    },

    reDraw(doView, callback, isMoving) {
      const draw = {
        width: this.currentPalette.width,
        height: this.currentPalette.height,
        views: this.isEmpty(doView) ? [] : [doView],
      };
      const pen = new Pen(this.globalContext, draw);

      pen.paint(callbackInfo => {
        callback && callback(callbackInfo);
        this.triggerEvent('viewUpdate', {
          view: this.touchedView,
        });
      });

      const { rect, css, type } = doView;

      this.block = {
        width: this.currentPalette.width,
        height: this.currentPalette.height,
        views: this.isEmpty(doView) ? [] : [this.getBox(rect, doView.type)],
      };
      if (css && css.scalable) {
        this.block.views.push(this.getScaleIcon(rect, type));
      }
      if (css && css.deletable) {
        this.block.views.push(this.getDeleteIcon(rect));
      }
      const topBlock = new Pen(this.frontContext, this.block);
      topBlock.paint();
    },

    isInView(x, y, rect) {
      return x > rect.left && y > rect.top && x < rect.right && y < rect.bottom;
    },

    isInDelete(x, y) {
      for (const view of this.block.views) {
        if (view.id === 'delete') {
          return x > view.rect.left && y > view.rect.top && x < view.rect.right && y < view.rect.bottom;
        }
      }
      return false;
    },

    isInScale(x, y) {
      for (const view of this.block.views) {
        if (view.id === 'scale') {
          return x > view.rect.left && y > view.rect.top && x < view.rect.right && y < view.rect.bottom;
        }
      }
      return false;
    },

    touchedView: {},
    findedIndex: -1,
    onClick() {
      const x = this.startX;
      const y = this.startY;
      const totalLayerCount = this.currentPalette.views.length;
      let canBeTouched = [];
      let isDelete = false;
      let deleteIndex = -1;
      for (let i = totalLayerCount - 1; i >= 0; i--) {
        const view = this.currentPalette.views[i];
        const { rect } = view;
        if (this.touchedView && this.touchedView.id && this.touchedView.id === view.id && this.isInDelete(x, y, rect)) {
          canBeTouched.length = 0;
          deleteIndex = i;
          isDelete = true;
          break;
        }
        if (this.isInView(x, y, rect)) {
          canBeTouched.push({
            view,
            index: i,
          });
        }
      }
      this.touchedView = {};
      if (canBeTouched.length === 0) {
        this.findedIndex = -1;
      } else {
        let i = 0;
        const touchAble = canBeTouched.filter(item => Boolean(item.view.id));
        if (touchAble.length === 0) {
          this.findedIndex = canBeTouched[0].index;
        } else {
          for (i = 0; i < touchAble.length; i++) {
            if (this.findedIndex === touchAble[i].index) {
              i++;
              break;
            }
          }
          if (i === touchAble.length) {
            i = 0;
          }
          this.touchedView = touchAble[i].view;
          this.findedIndex = touchAble[i].index;
          this.triggerEvent('viewClicked', {
            view: this.touchedView,
          });
        }
      }
      if (this.findedIndex < 0 || (this.touchedView && !this.touchedView.id)) {
        // 证明点击了背景 或无法移动的view
        this.frontContext.draw();
        if (isDelete) {
          this.triggerEvent('touchEnd', {
            view: this.currentPalette.views[deleteIndex],
            index: deleteIndex,
            type: 'delete',
          });
          this.doAction();
        } else if (this.findedIndex < 0) {
          this.triggerEvent('viewClicked', {});
        }
        this.findedIndex = -1;
        this.prevFindedIndex = -1;
      } else if (this.touchedView && this.touchedView.id) {
        this.sliceLayers();
      }
    },

    sliceLayers() {
      const bottomLayers = this.currentPalette.views.slice(0, this.findedIndex);
      const topLayers = this.currentPalette.views.slice(this.findedIndex + 1);
      const bottomDraw = {
        width: this.currentPalette.width,
        height: this.currentPalette.height,
        background: this.currentPalette.background,
        views: bottomLayers,
      };
      const topDraw = {
        width: this.currentPalette.width,
        height: this.currentPalette.height,
        views: topLayers,
      };
      if (this.prevFindedIndex < this.findedIndex) {
        new Pen(this.bottomContext, bottomDraw).paint();
        this.doAction();
        new Pen(this.topContext, topDraw).paint();
      } else {
        new Pen(this.topContext, topDraw).paint();
        this.doAction();
        new Pen(this.bottomContext, bottomDraw).paint();
      }
      this.prevFindedIndex = this.findedIndex;
    },

    startX: 0,
    startY: 0,
    startH: 0,
    startW: 0,
    isScale: false,
    startTimeStamp: 0,
    onTouchStart(event) {
      if (this.isDisabled) {
        return;
      }
      const { x, y } = event.touches[0];
      this.startX = x;
      this.startY = y;
      this.startTimeStamp = new Date().getTime();
      if (this.touchedView && !this.isEmpty(this.touchedView)) {
        const { rect } = this.touchedView;
        if (this.isInScale(x, y, rect)) {
          this.isScale = true;
          this.startH = rect.bottom - rect.top;
          this.startW = rect.right - rect.left;
        } else {
          this.isScale = false;
        }
      } else {
        this.isScale = false;
      }
    },

    onTouchEnd(e) {
      if (this.isDisabled) {
        return;
      }
      const current = new Date().getTime();
      if (current - this.startTimeStamp <= 500 && !this.hasMove) {
        !this.isScale && this.onClick(e);
      } else if (this.touchedView && !this.isEmpty(this.touchedView)) {
        this.triggerEvent('touchEnd', {
          view: this.touchedView,
        });
      }
      this.hasMove = false;
    },

    onTouchCancel(e) {
      if (this.isDisabled) {
        return;
      }
      this.onTouchEnd(e);
    },

    hasMove: false,
    onTouchMove(event) {
      if (this.isDisabled) {
        return;
      }
      this.hasMove = true;
      if (!this.touchedView || (this.touchedView && !this.touchedView.id)) {
        return;
      }
      const { x, y } = event.touches[0];
      const offsetX = x - this.startX;
      const offsetY = y - this.startY;
      const { rect, type } = this.touchedView;
      let css = {};
      if (this.isScale) {
        clearPenCache(this.touchedView.id);
        const newW = this.startW + offsetX > 1 ? this.startW + offsetX : 1;
        if (this.touchedView.css && this.touchedView.css.minWidth) {
          if (newW < this.touchedView.css.minWidth.toPx()) {
            return;
          }
        }
        if (this.touchedView.rect && this.touchedView.rect.minWidth) {
          if (newW < this.touchedView.rect.minWidth) {
            return;
          }
        }
        const newH = this.startH + offsetY > 1 ? this.startH + offsetY : 1;
        css = {
          width: `${newW}px`,
        };
        if (type !== 'text') {
          if (type === 'image') {
            css.height = `${(newW * this.startH) / this.startW}px`;
          } else {
            css.height = `${newH}px`;
          }
        }
      } else {
        this.startX = x;
        this.startY = y;
        css = {
          left: `${rect.x + offsetX}px`,
          top: `${rect.y + offsetY}px`,
          right: undefined,
          bottom: undefined,
        };
      }
      this.doAction(
        {
          view: {
            css,
          },
        },
        null,
        !this.isScale,
      );
    },

    initScreenK() {
      if (!(getApp() && getApp().systemInfo && getApp().systemInfo.screenWidth)) {
        try {
          getApp().systemInfo = wx.getSystemInfoSync();
        } catch (e) {
          console.error(`Painter get system info failed, ${JSON.stringify(e)}`);
          return;
        }
      }
      this.screenK = 0.5;
      if (getApp() && getApp().systemInfo && getApp().systemInfo.screenWidth) {
        this.screenK = getApp().systemInfo.screenWidth / 750;
      }
      setStringPrototype(this.screenK, this.properties.scaleRatio);
    },

    initDancePalette() {
      if (this.properties.use2D) {
        return;
      }
      this.isDisabled = true;
      this.initScreenK();
      this.downloadImages(this.properties.dancePalette).then(async palette => {
        this.currentPalette = palette;
        const { width, height } = palette;

        if (!width || !height) {
          console.error(`You should set width and height correctly for painter, width: ${width}, height: ${height}`);
          return;
        }
        this.setData({
          painterStyle: `width:${width.toPx()}px;height:${height.toPx()}px;`,
        });
        this.frontContext || (this.frontContext = await this.getCanvasContext(this.properties.use2D, 'front'));
        this.bottomContext || (this.bottomContext = await this.getCanvasContext(this.properties.use2D, 'bottom'));
        this.topContext || (this.topContext = await this.getCanvasContext(this.properties.use2D, 'top'));
        this.globalContext || (this.globalContext = await this.getCanvasContext(this.properties.use2D, 'k-canvas'));
        new Pen(this.bottomContext, palette, this.properties.use2D).paint(() => {
          this.isDisabled = false;
          this.isDisabled = this.outterDisabled;
          this.triggerEvent('didShow');
        });
        this.globalContext.draw();
        this.frontContext.draw();
        this.topContext.draw();
      });
      this.touchedView = {};
    },

    startPaint() {
      this.initScreenK();
      const { width, height } = this.properties.palette;

      if (!width || !height) {
        console.error(`You should set width and height correctly for painter, width: ${width}, height: ${height}`);
        return;
      }

      let needScale = false;
      // 生成图片时，根据设置的像素值重新绘制
      if (width.toPx() !== this.canvasWidthInPx) {
        this.canvasWidthInPx = width.toPx();
        needScale = this.properties.use2D;
      }
      if (this.properties.widthPixels) {
        setStringPrototype(this.screenK, this.properties.widthPixels / this.canvasWidthInPx);
        this.canvasWidthInPx = this.properties.widthPixels;
      }

      if (this.canvasHeightInPx !== height.toPx()) {
        this.canvasHeightInPx = height.toPx();
        needScale = needScale || this.properties.use2D;
      }
      this.setData(
        {
          photoStyle: `width:${this.canvasWidthInPx}px;height:${this.canvasHeightInPx}px;`,
        },
        function () {
          this.downloadImages(this.properties.palette).then(async palette => {
            if (!this.photoContext) {
              this.photoContext = await this.getCanvasContext(this.properties.use2D, 'photo');
            }
            if (needScale) {
              const scale = getApp().systemInfo.pixelRatio;
              this.photoContext.width = this.canvasWidthInPx * scale;
              this.photoContext.height = this.canvasHeightInPx * scale;
              this.photoContext.scale(scale, scale);
            }
            new Pen(this.photoContext, palette).paint(() => {
              this.saveImgToLocal();
            });
            setStringPrototype(this.screenK, this.properties.scaleRatio);
          });
        },
      );
    },

    downloadImages(palette) {
      return new Promise((resolve, reject) => {
        let preCount = 0;
        let completeCount = 0;
        const paletteCopy = JSON.parse(JSON.stringify(palette));
        if (paletteCopy.background) {
          preCount++;
          downloader.download(paletteCopy.background, this.properties.LRU).then(
            path => {
              paletteCopy.background = path;
              completeCount++;
              if (preCount === completeCount) {
                resolve(paletteCopy);
              }
            },
            () => {
              completeCount++;
              if (preCount === completeCount) {
                resolve(paletteCopy);
              }
            },
          );
        }
        if (paletteCopy.views) {
          for (const view of paletteCopy.views) {
            if (view && view.type === 'image' && view.url) {
              preCount++;
              /* eslint-disable no-loop-func */
              downloader.download(view.url, this.properties.LRU).then(
                path => {
                  view.originUrl = view.url;
                  view.url = path;
                  wx.getImageInfo({
                    src: path,
                    success: res => {
                      // 获得一下图片信息，供后续裁减使用
                      view.sWidth = res.width;
                      view.sHeight = res.height;
                    },
                    fail: error => {
                      // 如果图片坏了，则直接置空，防止坑爹的 canvas 画崩溃了
                      console.warn(`getImageInfo ${view.originUrl} failed, ${JSON.stringify(error)}`);
                      view.url = '';
                    },
                    complete: () => {
                      completeCount++;
                      if (preCount === completeCount) {
                        resolve(paletteCopy);
                      }
                    },
                  });
                },
                () => {
                  completeCount++;
                  if (preCount === completeCount) {
                    resolve(paletteCopy);
                  }
                },
              );
            }
          }
        }
        if (preCount === 0) {
          resolve(paletteCopy);
        }
      });
    },

    saveImgToLocal() {
      const that = this;
      const optionsOf2d = {
        canvas: that.canvasNode,
      }
      const optionsOfOld = {
        canvasId: 'photo',
        destWidth: that.canvasWidthInPx,
        destHeight: that.canvasHeightInPx,
      }
      setTimeout(() => {
        wx.canvasToTempFilePath(
          {
            ...(that.properties.use2D ? optionsOf2d : optionsOfOld),
            success: function (res) {
              that.getImageInfo(res.tempFilePath);
            },
            fail: function (error) {
              console.error(`canvasToTempFilePath failed, ${JSON.stringify(error)}`);
              that.triggerEvent('imgErr', {
                error: error,
              });
            },
          },
          this,
        );
      }, 300);
    },

    getCanvasContext(use2D, id) {
      const that = this;
      return new Promise(resolve => {
        if (use2D) {
          const query = wx.createSelectorQuery().in(that);
          const selectId = `#${id}`;
          query
            .select(selectId)
            .fields({ node: true, size: true })
            .exec(res => {
              that.canvasNode = res[0].node;
              const ctx = that.canvasNode.getContext('2d');
              const wxCanvas = new WxCanvas('2d', ctx, id, true, that.canvasNode);
              resolve(wxCanvas);
            });
        } else {
          const temp = wx.createCanvasContext(id, that);
          resolve(new WxCanvas('mina', temp, id, true));
        }
      });
    },

    getImageInfo(filePath) {
      const that = this;
      wx.getImageInfo({
        src: filePath,
        success: infoRes => {
          if (that.paintCount > MAX_PAINT_COUNT) {
            const error = `The result is always fault, even we tried ${MAX_PAINT_COUNT} times`;
            console.error(error);
            that.triggerEvent('imgErr', {
              error: error,
            });
            return;
          }
          // 比例相符时才证明绘制成功，否则进行强制重绘制
          if (
            Math.abs(
              (infoRes.width * that.canvasHeightInPx - that.canvasWidthInPx * infoRes.height) /
                (infoRes.height * that.canvasHeightInPx),
            ) < 0.01
          ) {
            that.triggerEvent('imgOK', {
              path: filePath,
            });
          } else {
            that.startPaint();
          }
          that.paintCount++;
        },
        fail: error => {
          console.error(`getImageInfo failed, ${JSON.stringify(error)}`);
          that.triggerEvent('imgErr', {
            error: error,
          });
        },
      });
    },
  },
});

function setStringPrototype(screenK, scale) {
  /* eslint-disable no-extend-native */
  /**
   * string 到对应的 px
   * @param {Number} baseSize 当设置了 % 号时，设置的基准值
   */
  String.prototype.toPx = function toPx(_, baseSize) {
    if (this === '0') {
      return 0;
    }
    const REG = /-?[0-9]+(\.[0-9]+)?(rpx|px|%)/;

    const parsePx = origin => {
      const results = new RegExp(REG).exec(origin);
      if (!origin || !results) {
        console.error(`The size: ${origin} is illegal`);
        return 0;
      }
      const unit = results[2];
      const value = parseFloat(origin);

      let res = 0;
      if (unit === 'rpx') {
        res = Math.round(value * (screenK || 0.5) * (scale || 1));
      } else if (unit === 'px') {
        res = Math.round(value * (scale || 1));
      } else if (unit === '%') {
        res = Math.round((value * baseSize) / 100);
      }
      return res;
    };
    const formula = /^calc\((.+)\)$/.exec(this);
    if (formula && formula[1]) {
      // 进行 calc 计算
      const afterOne = formula[1].replace(/([^\s\(\+\-\*\/]+)\.(left|right|bottom|top|width|height)/g, word => {
        const [id, attr] = word.split('.');
        return penCache.viewRect[id][attr];
      });
      const afterTwo = afterOne.replace(new RegExp(REG, 'g'), parsePx);
      return calc(afterTwo);
    } else {
      return parsePx(this);
    }
  };
}
