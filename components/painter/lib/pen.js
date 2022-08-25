const QR = require('./qrcode.js');
const GD = require('./gradient.js');
require('./string-polyfill.js');

export const penCache = {
  // 用于存储带 id 的 view 的 rect 信息
  viewRect: {},
  textLines: {},
};
export const clearPenCache = id => {
  if (id) {
    penCache.viewRect[id] = null;
    penCache.textLines[id] = null;
  } else {
    penCache.viewRect = {};
    penCache.textLines = {};
  }
};
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
      callback && callback();
    });
  }

  _background() {
    this.ctx.save();
    const { width, height } = this.style;
    const bg = this.data.background;
    this.ctx.translate(width / 2, height / 2);

    this._doClip(this.data.borderRadius, width, height);
    if (!bg) {
      // 如果未设置背景，则默认使用透明色
      this.ctx.fillStyle = 'transparent';
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
    if (!(view && view.type)) {
      // 过滤无效 view
      return;
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
      case 'inlineText':
        this._fillAbsInlineText(view);
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

  _border({ borderRadius = 0, width, height, borderWidth = 0, borderStyle = 'solid' }) {
    let r1 = 0,
      r2 = 0,
      r3 = 0,
      r4 = 0;
    const minSize = Math.min(width, height);
    if (borderRadius) {
      const border = borderRadius.split(/\s+/);
      if (border.length === 4) {
        r1 = Math.min(border[0].toPx(false, minSize), width / 2, height / 2);
        r2 = Math.min(border[1].toPx(false, minSize), width / 2, height / 2);
        r3 = Math.min(border[2].toPx(false, minSize), width / 2, height / 2);
        r4 = Math.min(border[3].toPx(false, minSize), width / 2, height / 2);
      } else {
        r1 = r2 = r3 = r4 = Math.min(borderRadius && borderRadius.toPx(false, minSize), width / 2, height / 2);
      }
    }
    const lineWidth = borderWidth && borderWidth.toPx(false, minSize);
    this.ctx.lineWidth = lineWidth;
    if (borderStyle === 'dashed') {
      this.ctx.setLineDash([(lineWidth * 4) / 3, (lineWidth * 4) / 3]);
      // this.ctx.lineDashOffset = 2 * lineWidth
    } else if (borderStyle === 'dotted') {
      this.ctx.setLineDash([lineWidth, lineWidth]);
    }
    const notSolid = borderStyle !== 'solid';
    this.ctx.beginPath();

    notSolid && r1 === 0 && this.ctx.moveTo(-width / 2 - lineWidth, -height / 2 - lineWidth / 2); // 顶边虚线规避重叠规则
    r1 !== 0 && this.ctx.arc(-width / 2 + r1, -height / 2 + r1, r1 + lineWidth / 2, 1 * Math.PI, 1.5 * Math.PI); //左上角圆弧
    this.ctx.lineTo(
      r2 === 0 ? (notSolid ? width / 2 : width / 2 + lineWidth / 2) : width / 2 - r2,
      -height / 2 - lineWidth / 2,
    ); // 顶边线

    notSolid && r2 === 0 && this.ctx.moveTo(width / 2 + lineWidth / 2, -height / 2 - lineWidth); // 右边虚线规避重叠规则
    r2 !== 0 && this.ctx.arc(width / 2 - r2, -height / 2 + r2, r2 + lineWidth / 2, 1.5 * Math.PI, 2 * Math.PI); // 右上角圆弧
    this.ctx.lineTo(
      width / 2 + lineWidth / 2,
      r3 === 0 ? (notSolid ? height / 2 : height / 2 + lineWidth / 2) : height / 2 - r3,
    ); // 右边线

    notSolid && r3 === 0 && this.ctx.moveTo(width / 2 + lineWidth, height / 2 + lineWidth / 2); // 底边虚线规避重叠规则
    r3 !== 0 && this.ctx.arc(width / 2 - r3, height / 2 - r3, r3 + lineWidth / 2, 0, 0.5 * Math.PI); // 右下角圆弧
    this.ctx.lineTo(
      r4 === 0 ? (notSolid ? -width / 2 : -width / 2 - lineWidth / 2) : -width / 2 + r4,
      height / 2 + lineWidth / 2,
    ); // 底边线

    notSolid && r4 === 0 && this.ctx.moveTo(-width / 2 - lineWidth / 2, height / 2 + lineWidth); // 左边虚线规避重叠规则
    r4 !== 0 && this.ctx.arc(-width / 2 + r4, height / 2 - r4, r4 + lineWidth / 2, 0.5 * Math.PI, 1 * Math.PI); // 左下角圆弧
    this.ctx.lineTo(
      -width / 2 - lineWidth / 2,
      r1 === 0 ? (notSolid ? -height / 2 : -height / 2 - lineWidth / 2) : -height / 2 + r1,
    ); // 左边线
    notSolid && r1 === 0 && this.ctx.moveTo(-width / 2 - lineWidth, -height / 2 - lineWidth / 2); // 顶边虚线规避重叠规则

    if (!notSolid) {
      this.ctx.closePath();
    }
  }

  /**
   * 根据 borderRadius 进行裁减
   */
  _doClip(borderRadius, width, height, borderStyle) {
    if (borderRadius && width && height) {
      // 防止在某些机型上周边有黑框现象，此处如果直接设置 fillStyle 为透明，在 Android 机型上会导致被裁减的图片也变为透明， iOS 和 IDE 上不会
      // globalAlpha 在 1.9.90 起支持，低版本下无效，但把 fillStyle 设为了 white，相对默认的 black 要好点
      this.ctx.globalAlpha = 0;
      this.ctx.fillStyle = 'white';
      this._border({
        borderRadius,
        width,
        height,
        borderStyle,
      });
      this.ctx.fill();
      // 在 ios 的 6.6.6 版本上 clip 有 bug，禁掉此类型上的 clip，也就意味着，在此版本微信的 ios 设备下无法使用 border 属性
      if (!(getApp().systemInfo && getApp().systemInfo.version <= '6.6.6' && getApp().systemInfo.platform === 'ios')) {
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
    const { borderRadius, borderWidth, borderColor, borderStyle } = view.css;
    if (!borderWidth) {
      return;
    }
    this.ctx.save();
    this._preProcess(view, true);
    this.ctx.strokeStyle = borderColor || 'black';
    this._border({
      borderRadius,
      width,
      height,
      borderWidth,
      borderStyle,
    });
    this.ctx.stroke();
    this.ctx.restore();
  }

  _preProcess(view, notClip) {
    let width = 0;
    let height;
    let extra;
    const paddings = this._doPaddings(view);
    switch (view.type) {
      case 'inlineText': {
        {
          // 计算行数
          let lines = 0;
          // 文字总长度
          let textLength = 0;
          // 行高
          let lineHeight = 0;
          const textList = view.textList || [];
          for (let i = 0; i < textList.length; i++) {
            let subView = textList[i];
            const fontWeight = subView.css.fontWeight || '400';
            const textStyle = subView.css.textStyle || 'normal';
            if (!subView.css.fontSize) {
              subView.css.fontSize = '20rpx';
            }
            this.ctx.font = `${textStyle} ${fontWeight} ${subView.css.fontSize.toPx()}px "${subView.css.fontFamily || 'sans-serif'}"`;
            textLength += this.ctx.measureText(subView.text).width;
            let tempLineHeight = subView.css.lineHeight ? subView.css.lineHeight.toPx() : subView.css.fontSize.toPx();
            lineHeight = Math.max(lineHeight, tempLineHeight);
          }
          width = view.css.width ? view.css.width.toPx(false, this.style.width) - paddings[1] - paddings[3] : textLength;;
          const calLines = Math.ceil(textLength / width);

          lines += calLines;
          // lines = view.css.maxLines < lines ? view.css.maxLines : lines;
          height = lineHeight * lines;
          extra = {
            lines: lines,
            lineHeight: lineHeight,
            // textArray: textArray,
            // linesArray: linesArray,
          };
        }
        break;
      }
      case 'text': {
        const textArray = String(view.text).split('\n');
        // 处理多个连续的'\n'
        for (let i = 0; i < textArray.length; ++i) {
          if (textArray[i] === '') {
            textArray[i] = ' ';
          }
        }
        const fontWeight = view.css.fontWeight || '400';
        const textStyle = view.css.textStyle || 'normal';
        if (!view.css.fontSize) {
          view.css.fontSize = '20rpx';
        }
        this.ctx.font = `${textStyle} ${fontWeight} ${view.css.fontSize.toPx()}px "${
          view.css.fontFamily || 'sans-serif'
        }"`;
        // 计算行数
        let lines = 0;
        const linesArray = [];
        for (let i = 0; i < textArray.length; ++i) {
          const textLength = this.ctx.measureText(textArray[i]).width;
          const minWidth = view.css.fontSize.toPx() + paddings[1] + paddings[3];
          let partWidth = view.css.width
            ? view.css.width.toPx(false, this.style.width) - paddings[1] - paddings[3]
            : textLength;
          if (partWidth < minWidth) {
            partWidth = minWidth;
          }
          const calLines = Math.ceil(textLength / partWidth);
          // 取最长的作为 width
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
          height = view.css.height.toPx(false, this.style.height);
          width = (view.sWidth / view.sHeight) * height;
        } else if (view.css.height === 'auto') {
          width = view.css.width.toPx(false, this.style.width);
          height = (view.sHeight / view.sWidth) * width;
        } else {
          width = view.css.width.toPx(false, this.style.width);
          height = view.css.height.toPx(false, this.style.height);
        }
        break;
      }
      default:
        if (!(view.css.width && view.css.height)) {
          console.error('You should set width and height');
          return;
        }
        width = view.css.width.toPx(false, this.style.width);
        height = view.css.height.toPx(false, this.style.height);
        break;
    }
    let x;
    if (view.css && view.css.right) {
      if (typeof view.css.right === 'string') {
        x = this.style.width - view.css.right.toPx(true, this.style.width);
      } else {
        // 可以用数组方式，把文字长度计算进去
        // [right, 文字id, 乘数（默认 1）]
        const rights = view.css.right;
        x =
          this.style.width -
          rights[0].toPx(true, this.style.width) -
          penCache.viewRect[rights[1]].width * (rights[2] || 1);
      }
    } else if (view.css && view.css.left) {
      if (typeof view.css.left === 'string') {
        x = view.css.left.toPx(true, this.style.width);
      } else {
        const lefts = view.css.left;
        x = lefts[0].toPx(true, this.style.width) + penCache.viewRect[lefts[1]].width * (lefts[2] || 1);
      }
    } else {
      x = 0;
    }
    //const y = view.css && view.css.bottom ? this.style.height - height - view.css.bottom.toPx(true) : (view.css && view.css.top ? view.css.top.toPx(true) : 0);
    let y;
    if (view.css && view.css.bottom) {
      y = this.style.height - height - view.css.bottom.toPx(true, this.style.height);
    } else {
      if (view.css && view.css.top) {
        if (typeof view.css.top === 'string') {
          y = view.css.top.toPx(true, this.style.height);
        } else {
          const tops = view.css.top;
          y = tops[0].toPx(true, this.style.height) + penCache.viewRect[tops[1]].height * (tops[2] || 1);
        }
      } else {
        y = 0;
      }
    }

    const angle = view.css && view.css.rotate ? this._getAngle(view.css.rotate) : 0;
    // 当设置了 right 时，默认 align 用 right，反之用 left
    const align = view.css && view.css.align ? view.css.align : view.css && view.css.right ? 'right' : 'left';
    const verticalAlign = view.css && view.css.verticalAlign ? view.css.verticalAlign : 'top';
    // 记录绘制时的画布
    let xa = 0;
    switch (align) {
      case 'center':
        xa = x;
        break;
      case 'right':
        xa = x - width / 2;
        break;
      default:
        xa = x + width / 2;
        break;
    }
    let ya = 0;
    switch (verticalAlign) {
      case 'center':
        ya = y;
        break;
      case 'bottom':
        ya = y - height / 2;
        break;
      default:
        ya = y + height / 2;
        break;
    }
    this.ctx.translate(xa, ya);
    // 记录该 view 的有效点击区域
    // TODO ，旋转和裁剪的判断
    // 记录在真实画布上的左侧
    let left = x;
    if (align === 'center') {
      left = x - width / 2;
    } else if (align === 'right') {
      left = x - width;
    }
    var top = y;
    if (verticalAlign === 'center') {
      top = y - height / 2;
    } else if (verticalAlign === 'bottom') {
      top = y - height;
    }
    if (view.rect) {
      view.rect.left = left;
      view.rect.top = top;
      view.rect.right = left + width;
      view.rect.bottom = top + height;
      view.rect.x = view.css && view.css.right ? x - width : x;
      view.rect.y = y;
    } else {
      view.rect = {
        left: left,
        top: top,
        right: left + width,
        bottom: top + height,
        x: view.css && view.css.right ? x - width : x,
        y: y,
      };
    }

    view.rect.left = view.rect.left - paddings[3];
    view.rect.top = view.rect.top - paddings[0];
    view.rect.right = view.rect.right + paddings[1];
    view.rect.bottom = view.rect.bottom + paddings[2];
    if (view.type === 'text') {
      view.rect.minWidth = view.css.fontSize.toPx() + paddings[1] + paddings[3];
    }

    this.ctx.rotate(angle);
    if (!notClip && view.css && view.css.borderRadius && view.type !== 'rect') {
      this._doClip(view.css.borderRadius, width, height, view.css.borderStyle);
    }
    this._doShadow(view);
    if (view.id) {
      penCache.viewRect[view.id] = {
        width,
        height,
        left: view.rect.left,
        top: view.rect.top,
        right: view.rect.right,
        bottom: view.rect.bottom,
      };
    }
    return {
      width: width,
      height: height,
      x: x,
      y: y,
      extra: extra,
    };
  }

  _doPaddings(view) {
    const { padding } = view.css ? view.css : {};
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
    return pd;
  }

  // 画文字的背景图片
  _doBackground(view) {
    this.ctx.save();
    const { width: rawWidth, height: rawHeight } = this._preProcess(view, true);

    const { background } = view.css;
    let pd = this._doPaddings(view);
    const width = rawWidth + pd[1] + pd[3];
    const height = rawHeight + pd[0] + pd[2];

    this._doClip(view.css.borderRadius, width, height, view.css.borderStyle);
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
    const { width, height } = this._preProcess(view);
    QR.api.draw(view.content, this.ctx, -width / 2, -height / 2, width, height, view.css.background, view.css.color);
    this.ctx.restore();
    this._doBorder(view, width, height);
  }

  _drawAbsImage(view) {
    if (!view.url) {
      return;
    }
    this.ctx.save();
    const { width, height } = this._preProcess(view);
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
      view.rect.startX = startX / view.sWidth;
      view.rect.startY = startY / view.sHeight;
      view.rect.endX = (startX + rWidth) / view.sWidth;
      view.rect.endY = (startY + rHeight) / view.sHeight;
    }
    this.ctx.restore();
    this._doBorder(view, width, height);
  }
  /**
   * 
   * @param {*} view 
   * @description 一行内文字多样式的方法
   * 
   * 暂不支持配置 text-align，默认left
   * 暂不支持配置 maxLines
   */
  _fillAbsInlineText(view) {
    if (!view.textList) {
      return;
    }
    if (view.css.background) {
      // 生成背景
      this._doBackground(view);
    }
    this.ctx.save();
    const { width, height, extra } = this._preProcess(view, view.css.background && view.css.borderRadius);
    const { lines, lineHeight } = extra;
    let staticX = -(width / 2);
    let lineIndex = 0; // 第几行
    let x = staticX; // 开始x位置
    let leftWidth = width; // 当前行剩余多少宽度可以使用

    let getStyle = css => {
      const fontWeight = css.fontWeight || '400';
      const textStyle = css.textStyle || 'normal';
      if (!css.fontSize) {
        css.fontSize = '20rpx';
      }
      return `${textStyle} ${fontWeight} ${css.fontSize.toPx()}px "${css.fontFamily || 'sans-serif'}"`;
    }

    // 遍历行内的文字数组
    for (let j = 0; j < view.textList.length; j++) {
      const subView = view.textList[j];

      // 某个文字开始位置
      let start = 0;
      // 文字已使用的数量
      let alreadyCount = 0;
      // 文字总长度
      let textLength = subView.text.length;
      // 文字总宽度
      let textWidth = this.ctx.measureText(subView.text).width;
      // 每个文字的平均宽度
      let preWidth = Math.ceil(textWidth / textLength);

      // 循环写文字
      while (alreadyCount < textLength) {
        // alreadyCount - start + 1 -> 当前摘取出来的文字
        // 比较可用宽度，寻找最大可写文字长度
        while ((alreadyCount - start + 1) * preWidth < leftWidth && alreadyCount < textLength) {
          alreadyCount++;
        }

        // 取出文字
        let text = subView.text.substr(start, alreadyCount - start);

        const y = -(height / 2) + subView.css.fontSize.toPx() + lineIndex * lineHeight;

        // 设置文字样式
        this.ctx.font = getStyle(subView.css);

        this.ctx.fillStyle = subView.css.color || 'black';
        this.ctx.textAlign = 'left';

        // 执行画布操作
        if (subView.css.textStyle === 'stroke') {
          this.ctx.strokeText(text, x, y);
        } else {
          this.ctx.fillText(text, x, y);
        }

        // 当次已使用宽度
        let currentUsedWidth = this.ctx.measureText(text).width;

        const fontSize = subView.css.fontSize.toPx();

        // 画 textDecoration
        let textDecoration;
        if (subView.css.textDecoration) {
          this.ctx.lineWidth = fontSize / 13;
          this.ctx.beginPath();
          if (/\bunderline\b/.test(subView.css.textDecoration)) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + currentUsedWidth, y);
            textDecoration = {
              moveTo: [x, y],
              lineTo: [x + currentUsedWidth, y],
            };
          }
          if (/\boverline\b/.test(subView.css.textDecoration)) {
            this.ctx.moveTo(x, y - fontSize);
            this.ctx.lineTo(x + currentUsedWidth, y - fontSize);
            textDecoration = {
              moveTo: [x, y - fontSize],
              lineTo: [x + currentUsedWidth, y - fontSize],
            };
          }
          if (/\bline-through\b/.test(subView.css.textDecoration)) {
            this.ctx.moveTo(x, y - fontSize / 3);
            this.ctx.lineTo(x + currentUsedWidth, y - fontSize / 3);
            textDecoration = {
              moveTo: [x, y - fontSize / 3],
              lineTo: [x + currentUsedWidth, y - fontSize / 3],
            };
          }
          this.ctx.closePath();
          this.ctx.strokeStyle = subView.css.color;
          this.ctx.stroke();
        }

        // 重置数据
        start = alreadyCount;
        leftWidth -= currentUsedWidth;
        x += currentUsedWidth;
        // 如果剩余宽度 小于等于0 或者小于一个字的平均宽度，换行
        if (leftWidth <= 0 || leftWidth < preWidth) {
          leftWidth = width;
          x = staticX;
          lineIndex++;
        }
      }
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
    const { width, height, extra } = this._preProcess(view, view.css.background && view.css.borderRadius);
    this.ctx.fillStyle = view.css.color || 'black';
    if (view.id && penCache.textLines[view.id]) {
      this.ctx.textAlign = view.css.textAlign ? view.css.textAlign : 'left';
      for (const i of penCache.textLines[view.id]) {
        const { measuredWith, text, x, y, textDecoration } = i;
        if (view.css.textStyle === 'stroke') {
          this.ctx.strokeText(text, x, y, measuredWith);
        } else {
          this.ctx.fillText(text, x, y, measuredWith);
        }
        if (textDecoration) {
          const fontSize = view.css.fontSize.toPx();
          this.ctx.lineWidth = fontSize / 13;
          this.ctx.beginPath();
          this.ctx.moveTo(...textDecoration.moveTo);
          this.ctx.lineTo(...textDecoration.lineTo);
          this.ctx.closePath();
          this.ctx.strokeStyle = view.css.color;
          this.ctx.stroke();
        }
      }
    } else {
      const { lines, lineHeight, textArray, linesArray } = extra;
      // 如果设置了id，则保留 text 的长度
      if (view.id) {
        let textWidth = 0;
        for (let i = 0; i < textArray.length; ++i) {
          const _w = this.ctx.measureText(textArray[i]).width;
          textWidth = _w > textWidth ? _w : textWidth;
        }
        penCache.viewRect[view.id].width = width ? (textWidth < width ? textWidth : width) : textWidth;
      }
      let lineIndex = 0;
      for (let j = 0; j < textArray.length; ++j) {
        const preLineLength = Math.ceil(textArray[j].length / linesArray[j]);
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
          while (
            start + alreadyCount <= textArray[j].length &&
            (width - measuredWith > view.css.fontSize.toPx() || measuredWith - width > view.css.fontSize.toPx())
          ) {
            if (measuredWith < width) {
              text = textArray[j].substr(start, ++alreadyCount);
            } else {
              if (text.length <= 1) {
                // 如果只有一个字符时，直接跳出循环
                break;
              }
              text = textArray[j].substr(start, --alreadyCount);
              // break;
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
          this.ctx.textAlign = view.css.textAlign ? view.css.textAlign : 'left';
          let x;
          let lineX;
          switch (view.css.textAlign) {
            case 'center':
              x = 0;
              lineX = x - measuredWith / 2;
              break;
            case 'right':
              x = width / 2;
              lineX = x - measuredWith;
              break;
            default:
              x = -(width / 2);
              lineX = x;
              break;
          }

          const y =
            -(height / 2) +
            (lineIndex === 0 ? view.css.fontSize.toPx() : view.css.fontSize.toPx() + lineIndex * lineHeight);
          lineIndex++;
          if (view.css.textStyle === 'stroke') {
            this.ctx.strokeText(text, x, y, measuredWith);
          } else {
            this.ctx.fillText(text, x, y, measuredWith);
          }
          const fontSize = view.css.fontSize.toPx();
          let textDecoration;
          if (view.css.textDecoration) {
            this.ctx.lineWidth = fontSize / 13;
            this.ctx.beginPath();
            if (/\bunderline\b/.test(view.css.textDecoration)) {
              this.ctx.moveTo(lineX, y);
              this.ctx.lineTo(lineX + measuredWith, y);
              textDecoration = {
                moveTo: [lineX, y],
                lineTo: [lineX + measuredWith, y],
              };
            }
            if (/\boverline\b/.test(view.css.textDecoration)) {
              this.ctx.moveTo(lineX, y - fontSize);
              this.ctx.lineTo(lineX + measuredWith, y - fontSize);
              textDecoration = {
                moveTo: [lineX, y - fontSize],
                lineTo: [lineX + measuredWith, y - fontSize],
              };
            }
            if (/\bline-through\b/.test(view.css.textDecoration)) {
              this.ctx.moveTo(lineX, y - fontSize / 3);
              this.ctx.lineTo(lineX + measuredWith, y - fontSize / 3);
              textDecoration = {
                moveTo: [lineX, y - fontSize / 3],
                lineTo: [lineX + measuredWith, y - fontSize / 3],
              };
            }
            this.ctx.closePath();
            this.ctx.strokeStyle = view.css.color;
            this.ctx.stroke();
          }
          if (view.id) {
            penCache.textLines[view.id]
              ? penCache.textLines[view.id].push({
                  text,
                  x,
                  y,
                  measuredWith,
                  textDecoration,
                })
              : (penCache.textLines[view.id] = [
                  {
                    text,
                    x,
                    y,
                    measuredWith,
                    textDecoration,
                  },
                ]);
          }
        }
      }
    }
    this.ctx.restore();
    this._doBorder(view, width, height);
  }

  _drawAbsRect(view) {
    this.ctx.save();
    const { width, height } = this._preProcess(view);
    if (GD.api.isGradient(view.css.color)) {
      GD.api.doGradient(view.css.color, width, height, this.ctx);
    } else {
      this.ctx.fillStyle = view.css.color;
    }
    const { borderRadius, borderStyle, borderWidth } = view.css;
    this._border({
      borderRadius,
      width,
      height,
      borderWidth,
      borderStyle,
    });
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
    const box = view.css.shadow.replace(/,\s+/g, ',').split(/\s+/);
    if (box.length > 4) {
      console.error("shadow don't spread option");
      return;
    }
    this.ctx.shadowOffsetX = parseInt(box[0], 10);
    this.ctx.shadowOffsetY = parseInt(box[1], 10);
    this.ctx.shadowBlur = parseInt(box[2], 10);
    this.ctx.shadowColor = box[3];
  }

  _getAngle(angle) {
    return (Number(angle) * Math.PI) / 180;
  }
}
