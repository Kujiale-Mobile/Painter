import Downloader from './downloader';

const downloader = new Downloader();
const QR = require('./qrcode.js');

export default class Painter {
  constructor(ctx, data) {
    this.ctx = ctx;
    this.data = data;
  }

  paint(callback) {
    this.style = {
      width: this.data.width.toPx(),
      height: this.data.height.toPx(),
    };
    const all = [];
    this._background();

    for (const view of this.data.views) {
      all.push(this._drawAbsolute(view));
    }
    Promise.all(all).then(() => {
      this.ctx.draw(false, () => {
        callback();
      });
    });
  }

  _background() {
    return new Promise((resolve, reject) => {
      this.ctx.save();
      const { width, height } = this.style;
      const bg = this.data.background;
      this.ctx.translate(width / 2, height / 2);

      this._doBorder(this.data.borderRadius, width, height);
      if (!bg) {
      // 如果未设置背景，则默认使用白色
        this.ctx.setFillStyle('#fff');
        this.ctx.fillRect(-(width / 2), -(height / 2), width, height);
        this.ctx.restore();
        resolve();
      } else if (bg.startsWith('#') || bg.startsWith('rgba')) {
      // 背景填充颜色
        this.ctx.setFillStyle(bg);
        this.ctx.fillRect(-(width / 2), -(height / 2), width, height);
        this.ctx.restore();
        resolve();
      } else {
      // 背景填充图片
        downloader.download(bg).then((path) => {
          this.ctx.drawImage(path, -(width / 2), -(height / 2), width, height);
          this.ctx.restore();
          resolve();
        }, () => {
          this.ctx.restore();
          resolve();
        });
      }
    });
  }

  _drawAbsolute(view) {
    // 证明 css 为数组形式，需要合并
    if (view.css.length) {
      /* eslint-disable no-param-reassign */
      view.css = Object.assign(...view.css);
    }
    return new Promise((resolve, reject) => {
      switch (view.type) {
        case 'image':
          downloader.download(view.url).then((path) => {
            this._drawAbsImage(view, path);
            resolve();
          }, () => {
            resolve();
          });
          break;
        case 'text':
          this._fillAbsText(view);
          resolve();
          break;
        case 'rect':
          this._drawAbsRect(view);
          resolve();
          break;
        case 'qrcode':
          this._drawQRCode(view);
          resolve();
          break;
        default:
          resolve();
          break;
      }
    });
  }

  _doBorder(borderRadius, width, height) {
    if (borderRadius && width && height) {
      const r = Math.min(borderRadius.toPx(), width / 2, height / 2);

      this.ctx.beginPath();
      this.ctx.arc(-width / 2 + r, -height / 2 + r, r, 1 * Math.PI, 1.5 * Math.PI);
      this.ctx.lineTo(width / 2 - r, -height / 2);
      this.ctx.arc(width / 2 - r, -height / 2 + r, r, 1.5 * Math.PI, 2 * Math.PI);
      this.ctx.lineTo(width / 2, height / 2 - r);
      this.ctx.arc(width / 2 - r, height / 2 - r, r, 0, 0.5 * Math.PI);
      this.ctx.lineTo(-width / 2 + r, height / 2);
      this.ctx.arc(-width / 2 + r, height / 2 - r, r, 0.5 * Math.PI, 1 * Math.PI);
      this.ctx.closePath();
      this.ctx.fill();
      // 在 ios 的 6.6.6 版本上 clip 有 bug，禁掉此类型上的 clip，也就意味着，在此版本微信的 ios 设备下无法使用 border 属性
      if (!(getApp().systemInfo
          && getApp().systemInfo.version <= '6.6.6'
          && getApp().systemInfo.platform === 'ios')) {
        this.ctx.clip();
      }
    }
  }

  _preProcess(view) {
    let width;
    let height;
    let x;
    let y;
    if (view.type === 'text') {
      this.ctx.setFillStyle(view.css.color ? view.css.color : 'black');
      this.ctx.setFontSize(view.css.fontSize.toPx());
      /* eslint-disable prefer-destructuring */
      width = this.ctx.measureText(view.text).width;
      height = view.css.fontSize.toPx();
      x = view.css.right ? this.style.width - width - view.css.right.toPx() : (view.css.left ? view.css.left.toPx() : 0);
      y = view.css.bottom ? this.style.height - height - view.css.bottom.toPx() : (view.css.top ? view.css.top.toPx() : 0);
    } else {
      width = view.css.width.toPx();
      height = view.css.height.toPx();
      x = view.css.right ? this.style.width - width - view.css.right.toPx() : (view.css.left ? view.css.left.toPx() : 0);
      y = view.css.bottom ? this.style.height - height - view.css.bottom.toPx() : (view.css.top ? view.css.top.toPx() : 0);
    }
    const angle = view.css.rotate ? this._getAngle(view.css.rotate) : 0;
    this.ctx.translate(x + width / 2, y + height / 2);
    this.ctx.rotate(angle);
    this._doBorder(view.css.borderRadius, width, height);

    return {
      width: width, height: height, x: x, y: y,
    };
  }

  _drawQRCode(view) {
    this.ctx.save();
    const {
      width, height,
    } = this._preProcess(view);
    QR.api.draw(view.content, this.ctx, -width / 2, -height / 2, width, height, view.css.background);
    this.ctx.restore();
  }

  _drawAbsImage(view, path) {
    if (!path) {
      return;
    }
    this.ctx.save();
    const {
      width, height,
    } = this._preProcess(view);
    this.ctx.drawImage(path, -(width / 2), -(height / 2), width, height);
    this.ctx.restore();
  }

  _fillAbsText(view) {
    if (!view.text) {
      return;
    }
    this.ctx.save();
    const {
      width, height,
    } = this._preProcess(view);

    this.ctx.fillText(view.text, -(width / 2), (height / 2));
    this.ctx.restore();
  }

  _drawAbsRect(view) {
    this.ctx.save();
    const {
      width, height,
    } = this._preProcess(view);
    this.ctx.setFillStyle(view.css.color);
    this.ctx.fillRect(-(width / 2), -(height / 2), width, height);
    this.ctx.restore();
  }

  _getAngle(angle) {
    return Number(angle) * Math.PI / 180;
  }
}
