import Pen from './lib/pen';

// 最大尝试的绘制次数
const MAX_PAINT_COUNT = 5;
Component({
  canvasWidthInPx: 0,
  canvasHeightInPx: 0,
  paintCount: 0,
  /**
   * 组件的属性列表
   */
  properties: {
    palette: {
      type: Object,
      observer: function (newVal, oldVal) {
        if (this.isNeedRefresh(newVal, oldVal)) {
          this.paintCount = 0;
          this.startPaint();
        }
      },
    },
  },

  data: {
    picURL: '',
    showCanvas: true,
    painterStyle: '',
  },

  attached() {
    if (!getApp().systemInfo) {
      try {
        getApp().systemInfo = wx.getSystemInfoSync();
      } catch (e) {
        console.error(`kool-canvas get system info failed, ${JSON.stringify(e)}`);
      }
    }
    screenK = getApp().systemInfo.screenWidth / 750;
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
      if (!newVal) {
        return false;
      }
      return true;
    },

    startPaint() {
      if (this.isEmpty(this.properties.palette)) {
        return;
      }
      const { width, height } = this.properties.palette;
      this.canvasWidthInPx = width.toPx();
      this.canvasHeightInPx = height.toPx();
      if (!width || !height) {
        console.error(`You should set width and height correctly for painter, width: ${width}, height: ${height}`);
        return;
      }
      this.setData({
        painterStyle: `width:${width};height:${height};`,
      });
      const ctx = wx.createCanvasContext('k-canvas', this);
      const pen = new Pen(ctx, this.properties.palette);
      pen.paint(() => {
        this.saveImg();
      });
    },

    saveImg() {
      const that = this;
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'k-canvas',
          success: function (res) {
            wx.getImageInfo({
              src: res.tempFilePath,
              success: (infoRes) => {
                if (that.paintCount > MAX_PAINT_COUNT) {
                  const error = `The result is always fault, even we tried ${MAX_PAINT_COUNT} times`;
                  console.error(error);
                  that.triggerEvent('imgErr', { error: error });
                  return;
                }
                // 比例相符时才证明绘制成功，否则进行强制重绘制
                if (Math.abs((infoRes.width * that.canvasHeightInPx - that.canvasWidthInPx * infoRes.height) / (infoRes.height * that.canvasHeightInPx)) < 0.01) {
                  that.triggerEvent('imgOK', { path: res.tempFilePath });
                } else {
                  that.startPaint();
                }
                that.paintCount++;
              },
              fail: (error) => {
                console.error(`getImageInfo failed, ${JSON.stringify(error)}`);
                that.triggerEvent('imgErr', { error: error });
              },
            });
          },
          fail: function (error) {
            console.error(`canvasToTempFilePath failed, ${JSON.stringify(error)}`);
            that.triggerEvent('imgErr', { error: error });
          },
        }, this);
      }, 300);
    },
  },
});

let screenK = 1;

/* eslint-disable no-extend-native */
String.prototype.toPx = function toPx() {
  const reg = /^[0-9]+([.]{1}[0-9]+){0,1}(rpx|px)$/g;
  const results = reg.exec(this);
  if (!this || !results) {
    console.error(`The size: ${this} is illegal`);
    return 0;
  }
  const unit = results[2];
  const value = parseFloat(this);

  let res = 0;
  if (unit === 'rpx') {
    res = value * screenK;
  } else if (unit === 'px') {
    res = value;
  }
  return res;
};
