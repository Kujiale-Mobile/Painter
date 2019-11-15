import Pen from './lib/pen';
import Downloader from './lib/downloader';

const util = require('./lib/util');

const downloader = new Downloader();

// 最大尝试的绘制次数
const MAX_PAINT_COUNT = 5;
Component({
  canvasWidthInPx: 0,
  canvasHeightInPx: 0,
  paintCount: 0,
  currentPalette: {},
  globalContext: {},
  frontContext: {},
  bottomContext: {},
  topContext: {},
  hasIdViews: [],
  /**
   * 组件的属性列表
   */
  properties: {
    customStyle: {
      type: String,
    },
    palette: {
      type: Object,
      observer: function(newVal, oldVal) {
        if (this.isNeedRefresh(newVal, oldVal)) {
          this.paintCount = 0;
          this.startPaint();
        }
      },
    },
    widthPixels: {
      type: Number,
      value: 0
    },
    // 启用脏检查，默认 false
    dirty: {
      type: Boolean,
      value: false,
    },
    actions: {
      type: Object,
      observer: function(newVal, oldVal) {
        this.doAction(newVal)
      },
    }
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

    doAction(newVal) {
      if (newVal && newVal.css) {
        if (Array.isArray(this.touchedView.css)) {
          this.touchedView.css = [...this.touchedView.css, newVal.css]
        } else {
          this.touchedView.css = [this.touchedView.css, newVal.css]
        }
      }
      const draw = {
        width: this.currentPalette.width,
        height: this.currentPalette.height,
        views: [this.touchedView]
      }
      const pen = new Pen(this.globalContext, draw);
      pen.paint();
      const { rect } = this.touchedView
      const block = {
        width: this.currentPalette.width,
        height: this.currentPalette.height,
        views: [{
          type: 'rect',
          css: {
            height: `${rect.bottom - rect.top}px`,
            width: `${rect.right - rect.left}px`,
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            borderWidth: '2rpx',
            borderColor: '#0000ff',
            color: 'transparent'
          }
        }, {
          type: 'rect',
          css: {
            height: '20px',
            width: '20px',
            borderRadius: '10px',
            color: '#0000ff',
            left: `${rect.right - 10}px`,
            top: `${rect.bottom - 10}px`
          }
        }]
      }
      const topBlock = new Pen(this.topContext, block)
      topBlock.paint();
    },

    inArea(x, y, rect, hasTouchedView) {
      return (hasTouchedView &&
          ((x > rect.left &&
              y > rect.top &&
              x < rect.right &&
              y < rect.bottom) ||
            (x > rect.right - 10 &&
              y > rect.bottom - 10 &&
              x < rect.right + 10 &&
              y < rect.bottom + 10))
        ) ||
        (x > rect.left &&
          y > rect.top &&
          x < rect.right &&
          y < rect.bottom
        )
    },

    touchedView: {},
    findedIndex: -1,
    onClick(event) {
      const x = this.startX
      const y = this.startY
      const totalLayerCount = this.currentPalette.views.length
      const hasTouchedView = this.findedIndex !== -1
      this.touchedView = {}
      const canBeTouched = []
      for (let i = totalLayerCount - 1; i >= 0; i--) {
        const view = this.currentPalette.views[i]
        const { rect, id } = view
        if (this.inArea(x, y, rect, hasTouchedView) && id) {
          canBeTouched.push({
            view,
            index: i
          })
        }
      }
      if (canBeTouched.length === 0) {
        this.findedIndex = -1
      } else {
        let i = 0
        for (i = 0; i < canBeTouched.length; i++) {
          if (this.findedIndex === canBeTouched[i].index) {
            i++
            break
          }
        }
        if (i === canBeTouched.length) {
          i = 0
        }
        this.touchedView = canBeTouched[i].view
        this.findedIndex = canBeTouched[i].index
        const { rect, id, css } = this.touchedView
        this.triggerEvent('touchStart', {
          id: id,
          css: css,
          rect: rect
        })
      }
      if (this.findedIndex < 0 || (this.touchedView && !this.touchedView.id)) {
        // 证明点击了背景 或无法移动的view
        this.touchedView = {}
        this.findedIndex = -1
        const block = {
          width: this.currentPalette.width,
          height: this.currentPalette.height,
          views: []
        }
        const topBlock = new Pen(this.topContext, block)
        topBlock.paint();
        this.triggerEvent('touchStart', {})
      } else if (this.touchedView && this.touchedView.id) {
        const bottomLayers = this.currentPalette.views.slice(0, this.findedIndex)
        const topLayers = this.currentPalette.views.slice(this.findedIndex + 1)
        const bottomDraw = {
          width: this.currentPalette.width,
          height: this.currentPalette.height,
          background: this.currentPalette.background,
          views: bottomLayers
        }
        const topDraw = {
          width: this.currentPalette.width,
          height: this.currentPalette.height,
          views: topLayers
        }
        if (this.prevFindedIndex < this.findedIndex) {
          new Pen(this.bottomContext, bottomDraw).paint();
          this.doAction()
          new Pen(this.frontContext, topDraw).paint();
        } else {
          new Pen(this.frontContext, topDraw).paint();
          this.doAction()
          new Pen(this.bottomContext, bottomDraw).paint();
        }
      }
      this.prevFindedIndex = this.findedIndex
    },

    startX: 0,
    startY: 0,
    startH: 0,
    startW: 0,
    isScale: false,
    startTimeStamp: 0,
    onTouchStart(event) {
      const {
        x,
        y
      } = event.touches[0]
      this.startX = x
      this.startY = y
      this.startTimeStamp = new Date().getTime()
      if (this.touchedView && JSON.stringify(this.touchedView) !== JSON.stringify({})) {
        const { rect } = this.touchedView
        if (rect.right - 10 < x && x < rect.right + 10 && rect.bottom - 10 < y && y < rect.bottom + 10) {
          this.isScale = true
          this.startH = rect.bottom - rect.top
          this.startW = rect.right - rect.left
        } else {
          this.isScale = false
        }
      }
    },

    onTouchEnd(e) {
      const current = new Date().getTime()
      if ((current - this.startTimeStamp) <= 100 && !this.hasMove) {
        this.onClick(e)
      }
      this.hasMove = false
      this.triggerEvent('touchEnd')
    },

    onTouchCancel() {
      this.triggerEvent('touchCancel')
    },

    hasMove: false,
    onTouchMove(event) {
      this.hasMove = true
      if (!this.touchedView || (this.touchedView && !this.touchedView.id)) {
        return
      }
      const {
        x,
        y
      } = event.touches[0]
      const offsetX = x - this.startX
      const offsetY = y - this.startY
      const { rect, type } = this.touchedView
      let css = {}
      if (this.isScale) {
        const newW = this.startW + offsetX > 1 ? this.startW + offsetX : 1
        const newH = this.startH + offsetY > 1 ? this.startH + offsetY : 1
        css = {
          width: `${newW}px`,
        }
        if (type !== 'text') {
          if (type === 'image') {
            css.height = `${(newW) * this.startH / this.startW }px`
          } else {
            css.height = `${newH}px`
          }
        }
      } else {
        this.startX = x
        this.startY = y
        css = {
          left: `${rect.x + offsetX}px`,
          top: `${rect.y + offsetY}px`,
          right: undefined,
          bottom: undefined
        }
      }
      this.doAction({
        id: this.touchedView.id,
        css
      })
      this.triggerEvent('touchMove', {
        id: this.touchedView.id,
        css
      })
    },

    startPaint() {
      if (this.isEmpty(this.properties.palette)) {
        return;
      }

      if (!(getApp().systemInfo && getApp().systemInfo.screenWidth)) {
        try {
          getApp().systemInfo = wx.getSystemInfoSync();
        } catch (e) {
          const error = `Painter get system info failed, ${JSON.stringify(e)}`;
          this.triggerEvent('imgErr', {
            error: error
          });
          console.error(error);
          return;
        }
      }
      let screenK = getApp().systemInfo.screenWidth / 750;
      setStringPrototype(screenK, 1);

      this.downloadImages().then((palette) => {
        this.currentPalette = palette
        this.hasIdViews = []
        palette.views && palette.views.map(view => {
          if (view.id) {
            this.hasIdViews.push(view)
          }
        })
        const {
          width,
          height
        } = palette;

        if (!width || !height) {
          console.error(`You should set width and height correctly for painter, width: ${width}, height: ${height}`);
          return;
        }
        this.canvasWidthInPx = width.toPx();
        if (this.properties.widthPixels) {
          // 如果重新设置过像素宽度，则重新设置比例
          setStringPrototype(screenK, this.properties.widthPixels / this.canvasWidthInPx)
          this.canvasWidthInPx = this.properties.widthPixels
        }

        this.canvasHeightInPx = height.toPx();
        this.setData({
          painterStyle: `width:${this.canvasWidthInPx}px;height:${this.canvasHeightInPx}px;`,
        });
        this.globalContext = wx.createCanvasContext('k-canvas', this);
        const pen = new Pen(this.globalContext, palette);
        pen.paint(() => {
          this.saveImgToLocal();
        });
        this.frontContext = wx.createCanvasContext('front', this);
        this.bottomContext = wx.createCanvasContext('bottom', this);
        this.topContext = wx.createCanvasContext('top', this)
      });
    },

    downloadImages() {
      return new Promise((resolve, reject) => {
        let preCount = 0;
        let completeCount = 0;
        const paletteCopy = JSON.parse(JSON.stringify(this.properties.palette));
        if (paletteCopy.background) {
          preCount++;
          downloader.download(paletteCopy.background).then((path) => {
            paletteCopy.background = path;
            completeCount++;
            if (preCount === completeCount) {
              resolve(paletteCopy);
            }
          }, () => {
            completeCount++;
            if (preCount === completeCount) {
              resolve(paletteCopy);
            }
          });
        }
        if (paletteCopy.views) {
          for (const view of paletteCopy.views) {
            if (view && view.type === 'image' && view.url) {
              preCount++;
              /* eslint-disable no-loop-func */
              downloader.download(view.url).then((path) => {
                view.url = path;
                wx.getImageInfo({
                  src: view.url,
                  success: (res) => {
                    // 获得一下图片信息，供后续裁减使用
                    view.sWidth = res.width;
                    view.sHeight = res.height;
                  },
                  fail: (error) => {
                    // 如果图片坏了，则直接置空，防止坑爹的 canvas 画崩溃了
                    view.url = "";
                    console.error(`getImageInfo ${view.url} failed, ${JSON.stringify(error)}`);
                  },
                  complete: () => {
                    completeCount++;
                    if (preCount === completeCount) {
                      resolve(paletteCopy);
                    }
                  },
                });
              }, () => {
                completeCount++;
                if (preCount === completeCount) {
                  resolve(paletteCopy);
                }
              });
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
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'k-canvas',
          success: function(res) {
            that.getImageInfo(res.tempFilePath);
          },
          fail: function(error) {
            console.error(`canvasToTempFilePath failed, ${JSON.stringify(error)}`);
            that.triggerEvent('imgErr', {
              error: error
            });
          },
        }, this);
      }, 300);
    },

    getImageInfo(filePath) {
      const that = this;
      wx.getImageInfo({
        src: filePath,
        success: (infoRes) => {
          if (that.paintCount > MAX_PAINT_COUNT) {
            const error = `The result is always fault, even we tried ${MAX_PAINT_COUNT} times`;
            console.error(error);
            that.triggerEvent('imgErr', {
              error: error
            });
            return;
          }
          // 比例相符时才证明绘制成功，否则进行强制重绘制
          if (Math.abs((infoRes.width * that.canvasHeightInPx - that.canvasWidthInPx * infoRes.height) / (infoRes.height * that.canvasHeightInPx)) < 0.01) {
            that.triggerEvent('imgOK', {
              path: filePath
            });
          } else {
            that.startPaint();
          }
          that.paintCount++;
        },
        fail: (error) => {
          console.error(`getImageInfo failed, ${JSON.stringify(error)}`);
          that.triggerEvent('imgErr', {
            error: error
          });
        },
      });
    },
  },
});


function setStringPrototype(screenK, scale) {
  /* eslint-disable no-extend-native */
  /**
   * 是否支持负数
   * @param {Boolean} minus 是否支持负数
   */
  String.prototype.toPx = function toPx(minus) {
    let reg;
    if (minus) {
      reg = /^-?[0-9]+([.]{1}[0-9]+){0,1}(rpx|px)$/g;
    } else {
      reg = /^[0-9]+([.]{1}[0-9]+){0,1}(rpx|px)$/g;
    }
    const results = reg.exec(this);
    if (!this || !results) {
      console.error(`The size: ${this} is illegal`);
      return 0;
    }
    const unit = results[2];
    const value = parseFloat(this);

    let res = 0;
    if (unit === 'rpx') {
      res = Math.round(value * screenK * (scale || 1));
    } else if (unit === 'px') {
      res = value * (scale || 1);
    }
    return res;
  };
}
