// @ts-check
export default class WxCanvas {
  ctx;
  type;
  canvasId;
  canvasNode;
  stepList = [];
  canvasPrototype = {};

  constructor(type, ctx, canvasId, isNew, canvasNode) {
    this.ctx = ctx;
    this.canvasId = canvasId;
    this.type = type;
    if (isNew) {
      this.canvasNode = canvasNode || {};
    }
  }

  set width(w) {
    if (this.canvasNode) {
      this.canvasNode.width = w;
      // 经测试，在 2d 接口中如果不设置这个值，IOS 端有一定几率会出现图片显示不全的情况。
      this.canvasNode._width = w;
    }
  }

  get width() {
    if (this.canvasNode) return this.canvasNode.width;
    return 0;
  }

  set height(h) {
    if (this.canvasNode) {
      this.canvasNode.height = h;
      // 经测试，在 2d 接口中如果不设置这个值，IOS 端有一定几率会出现图片显示不全的情况。
      this.canvasNode._height = h;
    }
  }

  get height() {
    if (this.canvasNode) return this.canvasNode.height;
    return 0;
  }

  set lineWidth(args) {
    this.canvasPrototype.lineWidth = args;
    this.stepList.push({
      action: "lineWidth",
      args,
      actionType: "set",
    });
  }

  get lineWidth() {
    return this.canvasPrototype.lineWidth;
  }

  set lineCap(args) {
    this.canvasPrototype.lineCap = args;
    this.stepList.push({
      action: "lineCap",
      args,
      actionType: "set",
    });
  }

  get lineCap() {
    return this.canvasPrototype.lineCap;
  }

  set lineJoin(args) {
    this.canvasPrototype.lineJoin = args;
    this.stepList.push({
      action: "lineJoin",
      args,
      actionType: "set",
    });
  }

  get lineJoin() {
    return this.canvasPrototype.lineJoin;
  }

  set miterLimit(args) {
    this.canvasPrototype.miterLimit = args;
    this.stepList.push({
      action: "miterLimit",
      args,
      actionType: "set",
    });
  }

  get miterLimit() {
    return this.canvasPrototype.miterLimit;
  }

  set lineDashOffset(args) {
    this.canvasPrototype.lineDashOffset = args;
    this.stepList.push({
      action: "lineDashOffset",
      args,
      actionType: "set",
    });
  }

  get lineDashOffset() {
    return this.canvasPrototype.lineDashOffset;
  }

  set font(args) {
    this.canvasPrototype.font = args;
    this.ctx.font = args;
    this.stepList.push({
      action: "font",
      args,
      actionType: "set",
    });
  }

  get font() {
    return this.canvasPrototype.font;
  }

  set textAlign(args) {
    this.canvasPrototype.textAlign = args;
    this.stepList.push({
      action: "textAlign",
      args,
      actionType: "set",
    });
  }

  get textAlign() {
    return this.canvasPrototype.textAlign;
  }

  set textBaseline(args) {
    this.canvasPrototype.textBaseline = args;
    this.stepList.push({
      action: "textBaseline",
      args,
      actionType: "set",
    });
  }

  get textBaseline() {
    return this.canvasPrototype.textBaseline;
  }

  set fillStyle(args) {
    this.canvasPrototype.fillStyle = args;
    this.stepList.push({
      action: "fillStyle",
      args,
      actionType: "set",
    });
  }

  get fillStyle() {
    return this.canvasPrototype.fillStyle;
  }

  set strokeStyle(args) {
    this.canvasPrototype.strokeStyle = args;
    this.stepList.push({
      action: "strokeStyle",
      args,
      actionType: "set",
    });
  }

  get strokeStyle() {
    return this.canvasPrototype.strokeStyle;
  }

  set globalAlpha(args) {
    this.canvasPrototype.globalAlpha = args;
    this.stepList.push({
      action: "globalAlpha",
      args,
      actionType: "set",
    });
  }

  get globalAlpha() {
    return this.canvasPrototype.globalAlpha;
  }

  set globalCompositeOperation(args) {
    this.canvasPrototype.globalCompositeOperation = args;
    this.stepList.push({
      action: "globalCompositeOperation",
      args,
      actionType: "set",
    });
  }

  get globalCompositeOperation() {
    return this.canvasPrototype.globalCompositeOperation;
  }

  set shadowColor(args) {
    this.canvasPrototype.shadowColor = args;
    this.stepList.push({
      action: "shadowColor",
      args,
      actionType: "set",
    });
  }

  get shadowColor() {
    return this.canvasPrototype.shadowColor;
  }

  set shadowOffsetX(args) {
    this.canvasPrototype.shadowOffsetX = args;
    this.stepList.push({
      action: "shadowOffsetX",
      args,
      actionType: "set",
    });
  }

  get shadowOffsetX() {
    return this.canvasPrototype.shadowOffsetX;
  }

  set shadowOffsetY(args) {
    this.canvasPrototype.shadowOffsetY = args;
    this.stepList.push({
      action: "shadowOffsetY",
      args,
      actionType: "set",
    });
  }

  get shadowOffsetY() {
    return this.canvasPrototype.shadowOffsetY;
  }

  set shadowBlur(args) {
    this.canvasPrototype.shadowBlur = args;
    this.stepList.push({
      action: "shadowBlur",
      args,
      actionType: "set",
    });
  }

  get shadowBlur() {
    return this.canvasPrototype.shadowBlur;
  }

  save() {
    this.stepList.push({
      action: "save",
      args: null,
      actionType: "func",
    });
  }

  restore() {
    this.stepList.push({
      action: "restore",
      args: null,
      actionType: "func",
    });
  }

  setLineDash(...args) {
    this.canvasPrototype.lineDash = args;
    this.stepList.push({
      action: "setLineDash",
      args,
      actionType: "func",
    });
  }

  moveTo(...args) {
    this.stepList.push({
      action: "moveTo",
      args,
      actionType: "func",
    });
  }

  closePath() {
    this.stepList.push({
      action: "closePath",
      args: null,
      actionType: "func",
    });
  }

  lineTo(...args) {
    this.stepList.push({
      action: "lineTo",
      args,
      actionType: "func",
    });
  }

  quadraticCurveTo(...args) {
    this.stepList.push({
      action: "quadraticCurveTo",
      args,
      actionType: "func",
    });
  }

  bezierCurveTo(...args) {
    this.stepList.push({
      action: "bezierCurveTo",
      args,
      actionType: "func",
    });
  }

  arcTo(...args) {
    this.stepList.push({
      action: "arcTo",
      args,
      actionType: "func",
    });
  }

  arc(...args) {
    this.stepList.push({
      action: "arc",
      args,
      actionType: "func",
    });
  }

  rect(...args) {
    this.stepList.push({
      action: "rect",
      args,
      actionType: "func",
    });
  }

  scale(...args) {
    this.stepList.push({
      action: "scale",
      args,
      actionType: "func",
    });
  }

  rotate(...args) {
    this.stepList.push({
      action: "rotate",
      args,
      actionType: "func",
    });
  }

  translate(...args) {
    this.stepList.push({
      action: "translate",
      args,
      actionType: "func",
    });
  }

  transform(...args) {
    this.stepList.push({
      action: "transform",
      args,
      actionType: "func",
    });
  }

  setTransform(...args) {
    this.stepList.push({
      action: "setTransform",
      args,
      actionType: "func",
    });
  }

  clearRect(...args) {
    this.stepList.push({
      action: "clearRect",
      args,
      actionType: "func",
    });
  }

  fillRect(...args) {
    this.stepList.push({
      action: "fillRect",
      args,
      actionType: "func",
    });
  }

  strokeRect(...args) {
    this.stepList.push({
      action: "strokeRect",
      args,
      actionType: "func",
    });
  }

  fillText(...args) {
    this.stepList.push({
      action: "fillText",
      args,
      actionType: "func",
    });
  }

  strokeText(...args) {
    this.stepList.push({
      action: "strokeText",
      args,
      actionType: "func",
    });
  }

  beginPath() {
    this.stepList.push({
      action: "beginPath",
      args: null,
      actionType: "func",
    });
  }

  fill() {
    this.stepList.push({
      action: "fill",
      args: null,
      actionType: "func",
    });
  }

  stroke() {
    this.stepList.push({
      action: "stroke",
      args: null,
      actionType: "func",
    });
  }

  drawFocusIfNeeded(...args) {
    this.stepList.push({
      action: "drawFocusIfNeeded",
      args,
      actionType: "func",
    });
  }

  clip() {
    this.stepList.push({
      action: "clip",
      args: null,
      actionType: "func",
    });
  }

  isPointInPath(...args) {
    this.stepList.push({
      action: "isPointInPath",
      args,
      actionType: "func",
    });
  }

  drawImage(...args) {
    this.stepList.push({
      action: "drawImage",
      args,
      actionType: "func",
    });
  }

  addHitRegion(...args) {
    this.stepList.push({
      action: "addHitRegion",
      args,
      actionType: "func",
    });
  }

  removeHitRegion(...args) {
    this.stepList.push({
      action: "removeHitRegion",
      args,
      actionType: "func",
    });
  }

  clearHitRegions(...args) {
    this.stepList.push({
      action: "clearHitRegions",
      args,
      actionType: "func",
    });
  }

  putImageData(...args) {
    this.stepList.push({
      action: "putImageData",
      args,
      actionType: "func",
    });
  }

  getLineDash() {
    return this.canvasPrototype.lineDash;
  }

  createLinearGradient(...args) {
    return this.ctx.createLinearGradient(...args);
  }

  createRadialGradient(...args) {
    if (this.type === "2d") {
      return this.ctx.createRadialGradient(...args);
    } else {
      return this.ctx.createCircularGradient(...args.slice(3, 6));
    }
  }

  createPattern(...args) {
    return this.ctx.createPattern(...args);
  }

  measureText(...args) {
    return this.ctx.measureText(...args);
  }

  createImageData(...args) {
    return this.ctx.createImageData(...args);
  }

  getImageData(...args) {
    return this.ctx.getImageData(...args);
  }

  async draw(reserve, func) {
    const realstepList = this.stepList.slice();
    this.stepList.length = 0;
    if (this.type === "mina") {
      if (realstepList.length > 0) {
        for (const step of realstepList) {
          this.implementMinaStep(step);
        }
        realstepList.length = 0;
      }
      this.ctx.draw(reserve, func);
    } else if (this.type === "2d") {
      if (!reserve) {
        this.ctx.clearRect(0, 0, this.canvasNode.width, this.canvasNode.height);
      }
      if (realstepList.length > 0) {
        for (const step of realstepList) {
          await this.implement2DStep(step);
        }
        realstepList.length = 0;
      }
      if (func) {
        func();
      }
    }
    realstepList.length = 0;
  }

  implementMinaStep(step) {
    switch (step.action) {
      case "textAlign": {
        this.ctx.setTextAlign(step.args);
        break;
      }
      case "textBaseline": {
        this.ctx.setTextBaseline(step.args);
        break;
      }
      default: {
        if (step.actionType === "set") {
          this.ctx[step.action] = step.args;
        } else if (step.actionType === "func") {
          if (step.args) {
            this.ctx[step.action](...step.args);
          } else {
            this.ctx[step.action]();
          }
        }
        break;
      }
    }
  }

  implement2DStep(step) {
    return new Promise((resolve) => {
      if (step.action === "drawImage") {
        const img = this.canvasNode.createImage();
        img.src = step.args[0];
        img.onload = () => {
          this.ctx.drawImage(img, ...step.args.slice(1));
          resolve();
        };
      } else {
        if (step.actionType === "set") {
          this.ctx[step.action] = step.args;
        } else if (step.actionType === "func") {
          if (step.args) {
            this.ctx[step.action](...step.args);
          } else {
            this.ctx[step.action]();
          }
        }
        resolve();
      }
    });
  }
}
