const QR = require('./qrcode.js');
const GD = require('./gradient.js');

export default class Painter {
  constructor(ctx, data) {
    this.ctx = ctx;
    this.data = data;
    this.globalWidth = {};
    this.globalHeight = {};
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

    this._doClip(this.data.borderRadius, width, height);
    if (!bg) {
      // 如果未设置背景，则默认使用白色
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(-(width / 2), -(height / 2), width, height);
    } else if (bg.startsWith('#') || bg.startsWith('rgba') || bg.toLowerCase() === 'transparent') {
      // 背景填充颜色
      this.ctx.fillStyle = bg;
      this.ctx.fillRect(-(width / 2), -(height / 2), width, height);
    } else if (GD.api.isGradient(bg)) {
      GD.api.doGradient(bg, width, height, this.ctx);
      this.ctx.fillRect(-(width / 2), -(height / 2), width, height);
    } else {
      // 背景填充图片
      this.ctx.drawImage(bg, -(width / 2), -(height / 2), width, height);
    }
    this.ctx.restore();
  }

  _drawAbsolute(view) {
    if (!view) {
      return
    }
    // 证明 css 为数组形式，需要合并
    if (view.css && view.css.length) {
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

  /**
   * 根据 borderRadius 进行裁减
   */
  _doClip(borderRadius, width, height) {
    if (borderRadius && width && height) {
      const r = Math.min(borderRadius.toPx(), width / 2, height / 2);
      // 防止在某些机型上周边有黑框现象，此处如果直接设置 fillStyle 为透明，在 Android 机型上会导致被裁减的图片也变为透明， iOS 和 IDE 上不会
      // globalAlpha 在 1.9.90 起支持，低版本下无效，但把 fillStyle 设为了 white，相对默认的 black 要好点
      this.ctx.globalAlpha = 0;
      this.ctx.fillStyle = 'white';
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
      this.ctx.globalAlpha = 1;
    }
  }

  /**
   * 画边框
   */
  _doBorder(view, width, height) {
    if (!view.css) {
      return;
    }
    const {
      borderRadius,
      borderWidth,
      borderColor,
    } = view.css;
    if (!borderWidth) {
      return;
    }
    this.ctx.save();
    this._preProcess(view, true);
    let r;
    if (borderRadius) {
      r = Math.min(borderRadius.toPx(), width / 2, height / 2);
    } else {
      r = 0;
    }
    const lineWidth = borderWidth.toPx();
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = (borderColor || 'black');
    this.ctx.beginPath();
    this.ctx.arc(-width / 2 + r, -height / 2 + r, r + lineWidth / 2, 1 * Math.PI, 1.5 * Math.PI);
    this.ctx.lineTo(width / 2 - r, -height / 2 - lineWidth / 2);
    this.ctx.arc(width / 2 - r, -height / 2 + r, r + lineWidth / 2, 1.5 * Math.PI, 2 * Math.PI);
    this.ctx.lineTo(width / 2 + lineWidth / 2, height / 2 - r);
    this.ctx.arc(width / 2 - r, height / 2 - r, r + lineWidth / 2, 0, 0.5 * Math.PI);
    this.ctx.lineTo(-width / 2 + r, height / 2 + lineWidth / 2);
    this.ctx.arc(-width / 2 + r, height / 2 - r, r + lineWidth / 2, 0.5 * Math.PI, 1 * Math.PI);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.restore();
  }

  _preProcess(view, notClip) {
    let width = 0;
    let height;
    let extra;
    switch (view.type) {
      case 'text': {
        const textArray = view.text.split('\n');
        // 处理多个连续的'\n'
        for (let i = 0; i < textArray.length; ++i) {
          if (textArray[i] === '') {
            textArray[i] = ' ';
          }
        }
        const fontWeight = view.css.fontWeight === 'bold' ? 'bold' : 'normal';
        view.css.fontSize = view.css.fontSize ? view.css.fontSize : '20rpx';
        this.ctx.font = `normal ${fontWeight} ${view.css.fontSize.toPx()}px ${view.css.fontFamily ? view.css.fontFamily : 'sans-serif'}`;
        // this.ctx.setFontSize(view.css.fontSize.toPx());
        // 计算行数
        let lines = 0;
        const linesArray = [];
        for (let i = 0; i < textArray.length; ++i) {
          const textLength = this.ctx.measureText(textArray[i]).width;
          const partWidth = view.css.width ? view.css.width.toPx() : textLength;
          const calLines = Math.ceil(textLength / partWidth);
          width = partWidth > width ? partWidth : width;
          lines += calLines;
          linesArray[i] = calLines;
        }
        lines = view.css.maxLines < lines ? view.css.maxLines : lines;
        const lineHeight = view.css.lineHeight ? view.css.lineHeight.toPx() : view.css.fontSize.toPx();
        height = lineHeight * lines;
        extra = {
          lines: lines,
          lineHeight: lineHeight,
          textArray: textArray,
          linesArray: linesArray,
        };
        break;
      }
      case 'image': {
        // image的长宽设置成auto的逻辑处理
        const ratio = getApp().systemInfo.pixelRatio ? getApp().systemInfo.pixelRatio : 2;
        // 有css却未设置width或height，则默认为auto
        if (view.css) {
          if (!view.css.width) {
            view.css.width = 'auto';
          }
          if (!view.css.height) {
            view.css.height = 'auto';
          }
        }
        if (!view.css || (view.css.width === 'auto' && view.css.height === 'auto')) {
          width = Math.round(view.sWidth / ratio);
          height = Math.round(view.sHeight / ratio);
        } else if (view.css.width === 'auto') {
          height = view.css.height.toPx();
          width = view.sWidth / view.sHeight * height;
        } else if (view.css.height === 'auto') {
          width = view.css.width.toPx();
          height = view.sHeight / view.sWidth * width;
        } else {
          width = view.css.width.toPx();
          height = view.css.height.toPx();
        }
        break;
      }
      default:
        if (!(view.css.width && view.css.height)) {
          console.error('You should set width and height');
          return;
        }
        width = view.css.width.toPx();
        height = view.css.height.toPx();
        break;
    }
    let x;
    if (view.css && view.css.right) {
      if (typeof view.css.right === 'string') {
        x = this.style.width - view.css.right.toPx(true);
      } else {
        // 可以用数组方式，把文字长度计算进去
        // [right, 文字id, 乘数（默认 1）]
        const rights = view.css.right;
        x = this.style.width - rights[0].toPx(true) - this.globalWidth[rights[1]] * (rights[2] || 1);
      }
    } else if (view.css && view.css.left) {
      if (typeof view.css.left === 'string') {
        x = view.css.left.toPx(true);
      } else {
        const lefts = view.css.left;
        x = lefts[0].toPx(true) + this.globalWidth[lefts[1]] * (lefts[2] || 1);
      }
    } else {
      x = 0;
    }
    //const y = view.css && view.css.bottom ? this.style.height - height - view.css.bottom.toPx(true) : (view.css && view.css.top ? view.css.top.toPx(true) : 0);
    let y;
    if (view.css && view.css.bottom) {
      y = this.style.height - height - view.css.bottom.toPx(true);
    } else {
      if (view.css && view.css.top) {
        if (typeof view.css.top === 'string') {
          y = view.css.top.toPx(true);
        } else {
          const tops = view.css.top;
          y = tops[0].toPx(true) + this.globalHeight[tops[1]] * (tops[2] || 1);
        }
      } else {
        y = 0
      }
    }

    const angle = view.css && view.css.rotate ? this._getAngle(view.css.rotate) : 0;
    // 当设置了 right 时，默认 align 用 right，反之用 left
    const align = view.css && view.css.align ? view.css.align : (view.css && view.css.right ? 'right' : 'left');
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
    if (!notClip && view.css && view.css.borderRadius && view.type !== 'rect') {
      this._doClip(view.css.borderRadius, width, height);
    }
    this._doShadow(view);
    if (view.id) {
      this.globalWidth[view.id] = width;
      this.globalHeight[view.id] = height;
    }
    return {
      width: width,
      height: height,
      x: x,
      y: y,
      extra: extra,
    };
  }

  // 画文字的背景图片
  _doBackground(view) {
    this.ctx.save();
    const {
      width: rawWidth,
      height: rawHeight,
    } = this._preProcess(view, true);

    const {
      background,
      padding,
    } = view.css;
    let pd = [0, 0, 0, 0];
    if (padding) {
      const pdg = padding.split(/\s+/);
      if (pdg.length === 1) {
        const x = pdg[0].toPx();
        pd = [x, x, x, x];
      }
      if (pdg.length === 2) {
        const x = pdg[0].toPx();
        const y = pdg[1].toPx();
        pd = [x, y, x, y];
      }
      if (pdg.length === 3) {
        const x = pdg[0].toPx();
        const y = pdg[1].toPx();
        const z = pdg[2].toPx();
        pd = [x, y, z, y];
      }
      if (pdg.length === 4) {
        const x = pdg[0].toPx();
        const y = pdg[1].toPx();
        const z = pdg[2].toPx();
        const a = pdg[3].toPx();
        pd = [x, y, z, a];
      }
    }
    const width = rawWidth + pd[1] + pd[3];
    const height = rawHeight + pd[0] + pd[2];
    this._doClip(view.css.borderRadius, width, height)
    if (GD.api.isGradient(background)) {
      GD.api.doGradient(background, width, height, this.ctx);
    } else {
      this.ctx.fillStyle = background;
    }
    this.ctx.fillRect(-(width / 2), -(height / 2), width, height);

    this.ctx.restore();
  }

  _drawQRCode(view) {
    this.ctx.save();
    const {
      width,
      height,
    } = this._preProcess(view);
    QR.api.draw(view.content, this.ctx, -width / 2, -height / 2, width, height, view.css.background, view.css.color);
    this.ctx.restore();
    this._doBorder(view, width, height);
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
    // 获得缩放到图片大小级别的裁减框
    let rWidth = view.sWidth;
    let rHeight = view.sHeight;
    let startX = 0;
    let startY = 0;
    // 绘画区域比例
    const cp = width / height;
    // 原图比例
    const op = view.sWidth / view.sHeight;
    if (cp >= op) {
      rHeight = rWidth / cp;
      startY = Math.round((view.sHeight - rHeight) / 2);
    } else {
      rWidth = rHeight * cp;
      startX = Math.round((view.sWidth - rWidth) / 2);
    }
    if (view.css && view.css.mode === 'scaleToFill') {
      this.ctx.drawImage(view.url, -(width / 2), -(height / 2), width, height);
    } else {
      this.ctx.drawImage(view.url, startX, startY, rWidth, rHeight, -(width / 2), -(height / 2), width, height);
    }
    this.ctx.restore();
    this._doBorder(view, width, height);
  }

  _fillAbsText(view) {
    if (!view.text) {
      return;
    }
    if (view.css.background) {
      // 生成背景
      this._doBackground(view);
    }
    this.ctx.save();
    const {
      width,
      height,
      extra,
    } = this._preProcess(view, view.css.background && view.css.borderRadius);

    this.ctx.fillStyle = (view.css.color || 'black');
    const {
      lines,
      lineHeight,
      textArray,
      linesArray,
    } = extra;
    // 如果设置了id，则保留 text 的长度
    if (view.id) {
      let textWidth = 0;
      for (let i = 0; i < textArray.length; ++i) {
        textWidth = this.ctx.measureText(textArray[i]).width > textWidth ? this.ctx.measureText(textArray[i]).width : textWidth;
      }
      this.globalWidth[view.id] = width ? (textWidth < width ? textWidth : width) : textWidth;
    }
    let lineIndex = 0;
    for (let j = 0; j < textArray.length; ++j) {
      const preLineLength = Math.round(textArray[j].length / linesArray[j]);
      let start = 0;
      let alreadyCount = 0;
      for (let i = 0; i < linesArray[j]; ++i) {
        // 绘制行数大于最大行数，则直接跳出循环
        if (lineIndex >= lines) {
          break;
        }
        alreadyCount = preLineLength;
        let text = textArray[j].substr(start, alreadyCount);
        let measuredWith = this.ctx.measureText(text).width;
        // 如果测量大小小于width一个字符的大小，则进行补齐，如果测量大小超出 width，则进行减除
        // 如果已经到文本末尾，也不要进行该循环
        while ((start + alreadyCount <= textArray[j].length) && (width - measuredWith > view.css.fontSize.toPx() || measuredWith > width)) {
          if (measuredWith < width) {
            text = textArray[j].substr(start, ++alreadyCount);
          } else {
            if (text.length <= 1) {
              // 如果只有一个字符时，直接跳出循环
              break;
            }
            text = textArray[j].substr(start, --alreadyCount);
          }
          measuredWith = this.ctx.measureText(text).width;
        }
        start += text.length;
        // 如果是最后一行了，发现还有未绘制完的内容，则加...
        if (lineIndex === lines - 1 && (j < textArray.length - 1 || start < textArray[j].length)) {
          while (this.ctx.measureText(`${text}...`).width > width) {
            if (text.length <= 1) {
              // 如果只有一个字符时，直接跳出循环
              break;
            }
            text = text.substring(0, text.length - 1);
          }
          text += '...';
          measuredWith = this.ctx.measureText(text).width;
        }
        this.ctx.setTextAlign(view.css.textAlign ? view.css.textAlign : 'left');
        let x;
        switch (view.css.textAlign) {
          case 'center':
            x = 0;
            break;
          case 'right':
            x = (width / 2);
            break;
          default:
            x = -(width / 2);
            break;
        }
        const y = -(height / 2) + (lineIndex === 0 ? view.css.fontSize.toPx() : (view.css.fontSize.toPx() + lineIndex * lineHeight));
        lineIndex++;
        if (view.css.textStyle === 'stroke') {
          this.ctx.strokeText(text, x, y, measuredWith);
        } else {
          this.ctx.fillText(text, x, y, measuredWith);
        }
        const fontSize = view.css.fontSize.toPx();
        if (view.css.textDecoration) {
          this.ctx.beginPath();
          if (/\bunderline\b/.test(view.css.textDecoration)) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + measuredWith, y);
          }
          if (/\boverline\b/.test(view.css.textDecoration)) {
            this.ctx.moveTo(x, y - fontSize);
            this.ctx.lineTo(x + measuredWith, y - fontSize);
          }
          if (/\bline-through\b/.test(view.css.textDecoration)) {
            this.ctx.moveTo(x, y - fontSize / 3);
            this.ctx.lineTo(x + measuredWith, y - fontSize / 3);
          }
          this.ctx.closePath();
          this.ctx.strokeStyle = view.css.color;
          this.ctx.stroke();
        }
      }
    }
    this.ctx.restore();
    this._doBorder(view, width, height);
  }

  _drawAbsRect(view) {
    this.ctx.save();
    const {
      width,
      height,
    } = this._preProcess(view);
    if (GD.api.isGradient(view.css.color)) {
      GD.api.doGradient(view.css.color, width, height, this.ctx);
    } else {
      this.ctx.fillStyle = view.css.color;
    }
    const borderRadius = view.css.borderRadius
    const r = borderRadius ? Math.min(borderRadius.toPx(), width / 2, height / 2) : 0;
    this.ctx.beginPath();
    this.ctx.arc(-width / 2 + r, -height / 2 + r, r, 1 * Math.PI, 1.5 * Math.PI); //左上角圆弧
    this.ctx.lineTo(width / 2 - r, -height / 2);
    this.ctx.arc(width / 2 - r, -height / 2 + r, r, 1.5 * Math.PI, 2 * Math.PI); // 右上角圆弧
    this.ctx.lineTo(width / 2, height / 2 - r);
    this.ctx.arc(width / 2 - r, height / 2 - r, r, 0, 0.5 * Math.PI); // 右下角圆弧
    this.ctx.lineTo(-width / 2 + r, height / 2);
    this.ctx.arc(-width / 2 + r, height / 2 - r, r, 0.5 * Math.PI, 1 * Math.PI); // 左下角圆弧
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
    this._doBorder(view, width, height);
  }

  // shadow 支持 (x, y, blur, color), 不支持 spread
  // shadow:0px 0px 10px rgba(0,0,0,0.1);
  _doShadow(view) {
    if (!view.css || !view.css.shadow) {
      return;
    }
    const box = view.css.shadow.replace(/,\s+/g, ',').split(' ');
    if (box.length > 4) {
      console.error('shadow don\'t spread option');
      return;
    }
    this.ctx.shadowOffsetX = parseInt(box[0], 10);
    this.ctx.shadowOffsetY = parseInt(box[1], 10);
    this.ctx.shadowBlur = parseInt(box[2], 10);
    this.ctx.shadowColor = box[3];
  }

  _getAngle(angle) {
    return Number(angle) * Math.PI / 180;
  }
}