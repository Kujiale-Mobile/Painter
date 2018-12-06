/* eslint-disable */
// 当ctx传入当前文件，const grd = ctx.createCircularGradient() 和 
// const grd = this.ctx.createLinearGradient() 无效，因此只能分开处理
// 先分析，在外部创建grd，再传入使用就可以

!(function () {

  var api = {
    toPoint: function(percent) {
      let str = percent.replace('%', '');
      str /= 100;
      return str;
    },

    analizeRadial: function(bg, width, height) {
      let count = 0;
      const coordinate = bg.match(/(?:(\d{1,3})[,])/g);
      const colors = bg.match(/((?:#(?:\w{6}|\w{3}))|(?:rgba[(](?:(?:\d{1,3})\W\s){3}\d[)]))/g);
      const status = bg.match(/\d{1,3}[%]/g);
      for (let i = 0; i < colors.length; i++) {
        if (colors[i].startsWith('rgba')) {
          count += 3;
        }
      }
      const length = coordinate.length - count;
      switch (length) {
        case 3: radialParams.coordinate = [coordinate[0].replace(',', ''), coordinate[1].replace(',', ''), coordinate[2].replace(',', '')]; break;
        case 2: radialParams.coordinate = [coordinate[0].replace(',', ''), coordinate[1].replace(',', ''), Math.sqrt(width * width / 4 + height * height / 4)]; break;
        case 1: radialParams.coordinate = [0, 0, coordinate[0].replace(',', '')]; break;
        default: radialParams.coordinate = [0, 0, Math.sqrt(width * width / 4 + height * height / 4)]; break;
      }
      radialParams.colors = colors;
      radialParams.status = status;
      return radialParams.coordinate;
    },

    radialEffect: function(width, height, grd, ctx) {
      if (radialParams.status && radialParams.status[0] && radialParams.status.length === radialParams.colors.length) {
        for (let i = 0; i < radialParams.colors.length; i++) {
          grd.addColorStop(this.toPoint(radialParams.status[i]), radialParams.colors[i]);
        }
      } else {
        for (let i = 0; i < radialParams.colors.length; i++) {
          grd.addColorStop(i / (radialParams.colors.length - 1), radialParams.colors[i]);
        }
      }
      ctx.setFillStyle(grd);
      ctx.fillRect(-(width / 2), -(height / 2), width, height);
    },

    analizeLinear: function(bg, width, height) {
      const direction = bg.match(/([-]?\d{1,3})deg/);
      const colors = bg.match(/((?:#(?:\w{6}|\w{3}))|(?:rgba[(](?:(?:\d{1,3})\W\s){3}\d[)]))/g);
      const status = bg.match(/\d{1,3}[%]/g);
      const dir = direction && direction[1] ? parseFloat(direction[1]) : 0;
      switch (dir) {
        case 0: console.log('case 0:'); linearParams.coordinate = [0, -height / 2, 0, height / 2]; break;
        case 90: console.log('case 90:'); linearParams.coordinate = [width / 2, 0, -width / 2, 0]; break;
        case -90: console.log('case -90:'); linearParams.coordinate = [-width / 2, 0, width / 2, 0]; break;
        case 180: console.log('case 180:'); linearParams.coordinate = [0, height / 2, 0, -height / 2]; break;
        case -180: console.log('case -180:'); linearParams.coordinate = [0, -height / 2, 0, height / 2]; break;
        default:
          console.log('default:');
          let x1 = 0;
          let y1 = 0;
          let x2 = 0;
          let y2 = 0;
          if (direction[1] > 0 && direction[1] < 90) {
            x1 = (width / 2) - ((width / 2) * Math.tan((90 - direction[1]) * Math.PI * 2 / 360) - height / 2) * Math.sin(2 * (90 - direction[1]) * Math.PI * 2 / 360) / 2;
            y2 = Math.tan((90 - direction[1]) * Math.PI * 2 / 360) * x1;
            x2 = -x1;
            y1 = -y2;
          } else if (direction[1] > -180 && direction[1] < -90) {
            x1 = -(width / 2) + ((width / 2) * Math.tan((90 - direction[1]) * Math.PI * 2 / 360) - height / 2) * Math.sin(2 * (90 - direction[1]) * Math.PI * 2 / 360) / 2;
            y2 = Math.tan((90 - direction[1]) * Math.PI * 2 / 360) * x1;
            x2 = -x1;
            y1 = -y2;
          } else if (direction[1] > 90 && direction[1] < 180) {
            x1 = (width / 2) + (-(width / 2) * Math.tan((90 - direction[1]) * Math.PI * 2 / 360) - height / 2) * Math.sin(2 * (90 - direction[1]) * Math.PI * 2 / 360) / 2;
            y2 = Math.tan((90 - direction[1]) * Math.PI * 2 / 360) * x1;
            x2 = -x1;
            y1 = -y2;
          } else {
            x1 = -(width / 2) - (-(width / 2) * Math.tan((90 - direction[1]) * Math.PI * 2 / 360) - height / 2) * Math.sin(2 * (90 - direction[1]) * Math.PI * 2 / 360) / 2;
            y2 = Math.tan((90 - direction[1]) * Math.PI * 2 / 360) * x1;
            x2 = -x1;
            y1 = -y2;
          }
          linearParams.coordinate = [x1, y1, x2, y2];
        break;
      }
      linearParams.colors = colors;
      linearParams.status = status;
      return linearParams.coordinate;
    },

    linearEffect: function(width, height, grd, ctx) {
      if (linearParams.status && linearParams.status[0] && linearParams.status.length === linearParams.colors.length) {
        for (let i = 0; i < linearParams.colors.length; i++) {
          grd.addColorStop(this.toPoint(linearParams.status[i]), linearParams.colors[i]);
        }
      } else {
        for (let i = 0; i < linearParams.colors.length; i++) {
          grd.addColorStop(i / (linearParams.colors.length - 1), linearParams.colors[i]);
        }
      }
      ctx.setFillStyle(grd);
      ctx.fillRect(-(width / 2), -(height / 2), width, height);
    },
  }

  const linearParams = {
    coordinate: [],
    colors: [],
    status: [],
  }

  const radialParams = {
    coordinate: [],
    colors: [],
    status: [],
  }

  module.exports = { api }

})();
