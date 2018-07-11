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
    this._background();
    for (const view of this.data.views) {
      this._drawAbsolute(view);
    }
    this.ctx.draw(false, () => {
      callback();
    });
  }

  _background() {
    this.ctx.save();
    const {
      width,
      height,
    } = this.style;
    const bg = this.data.background;
    this.ctx.translate(width / 2, height / 2);

    this._doBorder(this.data.borderRadius, width, height);
    if (!bg) {
      // 如果未设置背景，则默认使用白色
      this.ctx.setFillStyle('#fff');
      this.ctx.fillRect(-(width / 2), -(height / 2), width, height);
    } else if (bg.startsWith('#') || bg.startsWith('rgba')) {
      // 背景填充颜色
      this.ctx.setFillStyle(bg);
      this.ctx.fillRect(-(width / 2), -(height / 2), width, height);
    } else {
      // 背景填充图片
      this.ctx.drawImage(bg, -(width / 2), -(height / 2), width, height);
    }
    this.ctx.restore();
  }

  _drawAbsolute(view) {
    // 证明 css 为数组形式，需要合并
    if (view.css.length) {
      /* eslint-disable no-param-reassign */
      view.css = Object.assign(...view.css);
    }
    switch (view.type) {
      case 'image':
        this._drawAbsImage(view);
        break;
      case 'text':
        this._fillAbsText(view);
        break;
      case 'rect':
        this._drawAbsRect(view);
        break;
      case 'qrcode':
        this._drawQRCode(view);
        break;
      default:
        break;
    }
  }

  _doBorder(borderRadius, width, height) {
    if (borderRadius && width && height) {
      const r = Math.min(borderRadius.toPx(), width / 2, height / 2);
      // 防止在某些机型上周边有黑框现象，此处如果直接设置 setFillStyle 为透明，在 Android 机型上会导致被裁减的图片也变为透明， iOS 和 IDE 上不会
      // setGlobalAlpha 在 1.9.90 起支持，低版本下无效，但把 setFillStyle 设为了 white，相对默认的 black 要好点
      this.ctx.setGlobalAlpha(0);
      this.ctx.setFillStyle('white');
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
      if (!(getApp().systemInfo &&
          getApp().systemInfo.version <= '6.6.6' &&
          getApp().systemInfo.platform === 'ios')) {
        this.ctx.clip();
      }
      this.ctx.setGlobalAlpha(1);
    }
  }

  _preProcess(view) {
    let width;
    let height;
    let x;
    let y;
    let extra;
    if (view.type === 'text') {
      this.ctx.setFillStyle(view.css.color ? view.css.color : 'black');
      this.ctx.setFontSize(view.css.fontSize.toPx());
      const textLength = this.ctx.measureText(view.text).width;
      width = view.css.width ? view.css.width.toPx() : textLength;
      // 计算行数
      const calLines = Math.ceil(textLength / width);
      const lines = view.css.maxLines < calLines ? view.css.maxLines : calLines;
      const lineHeight = view.css.lineHeight ? view.css.lineHeight.toPx() : view.css.fontSize.toPx();
      height = lineHeight * lines;

      x = view.css.right ? this.style.width - width - view.css.right.toPx() : (view.css.left ? view.css.left.toPx() : 0);
      y = view.css.bottom ? this.style.height - height - view.css.bottom.toPx() : (view.css.top ? view.css.top.toPx() : 0);
      extra = { lines: lines, lineHeight: lineHeight };
    } else {
      width = view.css.width.toPx();
      height = view.css.height.toPx();
      x = view.css.right ? this.style.width - width - view.css.right.toPx() : (view.css.left ? view.css.left.toPx() : 0);
      y = view.css.bottom ? this.style.height - height - view.css.bottom.toPx() : (view.css.top ? view.css.top.toPx() : 0);
    }
    const angle = view.css.rotate ? this._getAngle(view.css.rotate) : 0;
    const align = view.css.align ? view.css.align : 'left';
    switch (align) {
      case 'center':
        this.ctx.translate(x, y + height / 2);
        break;
      case 'right':
        this.ctx.translate(x - width / 2, y + height / 2);
        break;
      default:
        this.ctx.translate(x + width / 2, y + height / 2);
        break;
    }
    this.ctx.rotate(angle);
    this._doBorder(view.css.borderRadius, width, height);

    return {
      width: width,
      height: height,
      x: x,
      y: y,
      extra: extra,
    };
  }

  _drawQRCode(view) {
    this.ctx.save();
    const {
      width,
      height,
    } = this._preProcess(view);
    QR.api.draw(view.content, this.ctx, -width / 2, -height / 2, width, height, view.css.background);
    this.ctx.restore();
  }

  _drawAbsImage(view) {
    if (!view.url) {
      return;
    }
    this.ctx.save();
    const {
      width,
      height,
    } = this._preProcess(view);
    this.ctx.drawImage(view.url, -(width / 2), -(height / 2), width, height);
    this.ctx.restore();
  }

  _fillAbsText(view) {
    if (!view.text) {
      return;
    }
    this.ctx.save();
    const {
      width,
      height,
      extra,
    } = this._preProcess(view);
    const { lines, lineHeight } = extra;
    const preLineLength = Math.round(view.text.length / lines);
    let start = 0;
    let alreadyCount = 0;
    for (let i = 0; i < lines; ++i) {
      alreadyCount = preLineLength;
      let text = view.text.substr(start, alreadyCount);
      let measuredWith = this.ctx.measureText(text).width;
      // 如果测量大小小于width一个字符的大小，则进行补齐，如果测量大小超出 width，则进行减除
      // 如果已经到文本末尾，也不要进行该循环
      while ((start + alreadyCount <= view.text.length) && (width - measuredWith > view.css.fontSize.toPx() || measuredWith > width)) {
        if (measuredWith < width) {
          text = view.text.substr(start, ++alreadyCount);
        } else {
          text = view.text.substr(start, --alreadyCount);
        }
        measuredWith = this.ctx.measureText(text).width;
      }
      start += text.length;
      // 如果是最后一行了，发现还有未绘制完的内容，则加...
      if (i === lines - 1 && start < view.text.length) {
        while (this.ctx.measureText(`${text}...`).width > width) {
          text = text.substring(0, text.length - 1);
        }
        text += '...';
      }
      this.ctx.fillText(text, -(width / 2), -(height / 2) + (i === 0 ? view.css.fontSize.toPx() : (view.css.fontSize.toPx() + i * lineHeight)));
    }

    this.ctx.restore();
  }

  _drawAbsRect(view) {
    this.ctx.save();
    const {
      width,
      height,
    } = this._preProcess(view);
    this.ctx.setFillStyle(view.css.color);
    this.ctx.fillRect(-(width / 2), -(height / 2), width, height);
    this.ctx.restore();
  }

  _getAngle(angle) {
    return Number(angle) * Math.PI / 180;
  }
}
