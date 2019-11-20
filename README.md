# Painter

**Painter 的优势**

- 功能全，支持文本、图片、矩形、qrcode 类型的 view 绘制
- 布局全，支持多种布局方式，如 align（对齐方式）、rotate（旋转）
- 支持圆角，其中图片，矩形，和整个画布支持 borderRadius 来设置圆角
- 杠杠的性能优化，我们对网络素材图片加载实现了一套 LRU 存储机制，不用重复下载素材图片。
- 杠杠的容错，因为某些特殊情况会导致 Canvas 绘图不完整。我们对此加入了对结果图片进行检测机制，如果绘图出错会进行重绘。

**TODO**

- [x] borderWidth 和 borderColor 属性支持，可设置边框
- [x] image 加入 mode 属性
- [x] fontFamily 属性支持，使用方法见下方详细说明
- [x] 支持渐变色
- [x] 支持 box-shadow 和 text-shadow，统一使用 shadow 表示。具体说明请看下方。
- [x] text 加入 background 属性。具体说明请看下方。
- [x] 可获取 text 的宽度
- [x] 支持元素的相对定位方法
- [x] 可通过文本中的换行符进行主动换行
- [x] 生成的图片支持分辨率调节
- [x] 支持 borderStyle
- [] line-space 属性支持

## 画家计划

想到小程序中有如此大量的生成图片需求，而 Canvas 生成方法又是如此难用和坑爹（有关小程序的坑，可看 https://github.com/Kujiale-Mobile/MP-Keng ）。我们就想到可不可以做一款可以很方便生成图片，并且还能屏蔽掉直接使用 Canvas 的一些坑的库呢？对此我们发起了 “`画家计划`— 通过 json 数据形式，来进行动态渲染并绘制出图片”。 Painter 库的整体架构如下：

![整体架构](https://user-images.githubusercontent.com/4279515/46778561-d46b3280-cd46-11e8-99c8-62e182e6f943.png)

首先，我们定义了一套绘图 JSON 规范，开发者可以根据需求构建生成图片的 Palette（调色板），然后在程序运行过程中把调色板传入给 Painter（画家）。Painter 会调用 Pen（画笔），根据 Palette 内容绘制出对应的图片后返回。



## How To Use

### 运行例子

```
git clone https://github.com/Kujiale-Mobile/Painter.git
```

代码下载后，用小程序 IDE 打开后即可使用。

**注：请选择小程序项目，非小游戏，例子中无 appid，所以无法在手机上运行，如果需要真机调试，请在打开例子时，填上自己的小程序 id**  



### 使用 Painter

mpvue 的使用方法请移步 [mpvue接入方案](https://github.com/Kujiale-Mobile/Painter/wiki/mpvue-%E6%8E%A5%E5%85%A5%E6%96%B9%E5%BC%8F)

1. 引入代码

   Painter 的核心代码在另一个 repo 中，https://github.com/Kujiale-Mobile/PainterCore.git 。你可以通过submodule 的方式进行库的引入。有关 submodule 的用法可自行 Google。

   ```
   git submodule add https://github.com/Kujiale-Mobile/PainterCore.git components/painter
   ```

2. 作为自定义组件引入，注意目录为第一步引入的代码所在目录

   ```
   "usingComponents":{
     "painter":"/components/painter/painter"
   }
   ```

3. 组件接收 `palette` 字段作为画图数据的数据源, 图案数据以json形式存在，推荐使用“皮肤模板”的方法进行传递，示例代码如下：

   ```
   <painter palette="{{data}}" bind:imgOK="onImgOK" />
   ```
   你可以通过设置 widthPixels 来强制指定生成的图片的像素宽度，否则，会根据你画布中设置的大小来动态调节，比如你用了 rpx，则在 iphone 6 上会生成 0.5 倍像素的图片。由于 canvas 绘制的图片像素直接由 Canvas 本身大小决定，此处通过同比例放大整个画布来实现对最后生成的图片大小的调节。

   ```
   <painter customStyle='position: absolute; left: -9999rpx;' palette="{{template}}" bind:imgOK="onImgOK" widthPixels="1000"/>
   ```

4. 数据传入后，则会自动进行绘图。绘图完成后，你可以通过绑定 imgOK 或 imgErr 事件来获得成功后的图片 或失败的原因。

   ```
   bind:imgOK="onImgOK"
   bind:imgErr="onImgErr"
   
   onImgOK(e) {
     其中 e.detail.path 为生成的图片路径
   },
   ```



## Palette 规范

如你使用 wxss + wxml 规范进行绘制一样，Painter 需要根据一定的规范来进行图片绘制。当然 Painter 的绘制规范要比 wxml 简单很多。

### 调色板属性

一个调色板首先需要给予一些整体属性

```
background: 可以是颜色值，也可以为网络图片的链接，默认为白色，支持渐变色
width: 宽度
height: 高度
borderRadius: 边框的圆角（该属性也同样适用于子 view）
views: 里面承载子 view
```

### View 属性

当我们把整体的调色板属性构建起来后，里面就可以添加子 View 来进行绘制了。

| type   | 内容    | description                    | 自有css                                                      |
| ------ | ------- | ------------------------------ | ------------------------------------------------------------ |
| image  | url     | 表示图片资源的地址，本地或网络 | 见 image 小节                                                |
| text   | text    | 文本的内容                     | 见 text 小节                                                 |
| rect   | 无      | 矩形                           | color: 颜色，支持渐变色                                      |
| qrcode | content | 画二维码                       | background:  背景颜色（默认为透明色）color: 二维码颜色（默认黑色） |

#### image

Painter 的 image 可以设置成本地图片或者网络图片，注意本地图片请使用绝对路径。并且如果未设置 image 的长宽，则长宽的属性值会默认设为auto。若长宽均为auto则会使用图片本身的长宽来布局，大小为图片的像素值除以 pixelRatio 。

| 属性名称 | 说明                 | 默认值     |
| -------- | -------------------- | ---------- |
| width    | image的宽度        | auto       |
| height   | image的高度        | auto       |
| mode     | 图片裁剪、缩放的模式 | aspectFill |

**scaleToFill**：不保持纵横比缩放图片，使图片的宽高完全拉伸至填满 image 元素

**aspectFill**：保持纵横比缩放图片，只保证图片的短边能完全显示出来。也就是说，图片通常只在水平或垂直方向是完整的，另一个方向将会发生截取。

**注：mode 属性和小程序 image 的 mode 属性功能一致，只是支持的类型只有两种，且默认值不同。 当 width 或 height 属性设置为 auto 时，mode 属性失效**

![](https://user-images.githubusercontent.com/49523717/61441645-a4f1f200-a978-11e9-9f9c-467cfcf3ec04.png)

<details><summary>例子代码（点击展开）</summary><br>

```
export default class ImageExample {
  palette() {
    return ({
      width: '654rpx',
      height: '1000rpx',
      background: '#eee',
      views: [
        {
          type: 'image',
          url: '/palette/sky.jpg',
        },
        {
          type: 'text',
          text: '未设置height、width时',
          css: {
            right: '0rpx',
            top: '60rpx',
            fontSize: '30rpx',
          },
        },
        {
          type: 'image',
          url: '/palette/sky.jpg',
          css: {
            width: '200rpx',
            height: '200rpx',
            top: '230rpx',
          },
        },
        {
          type: 'text',
          text: "mode: 'aspectFill' 或 无",
          css: {
            left: '210rpx',
            fontSize: '30rpx',
            top: '290rpx',
          },
        },
        {
          type: 'image',
          url: '/palette/sky.jpg',
          css: {
            width: '200rpx',
            height: '200rpx',
            mode: 'scaleToFill',
            top: '500rpx',
          },
        },
        {
          type: 'text',
          text: "mode: 'scaleToFill'",
          css: {
            left: '210rpx',
            top: '560rpx',
            fontSize: '30rpx',
          },
        },
        {
          type: 'image',
          url: '/palette/sky.jpg',
          css: {
            width: '200rpx',
            height: 'auto',
            top: '750rpx',
          },
        },
        {
          type: 'text',
          text: '设置height为auto',
          css: {
            left: '210rpx',
            top: '780rpx',
            fontSize: '30rpx',
          },
        },
      ],
    });
  }
}
```

</details>

#### text

因为 text 的特殊性，此处对 text 进行单独说明。

| 属性名称       | 说明                                                         | 默认值              |
| -------------- | ------------------------------------------------------------ | ------------------- |
| fontSize       | 字体大小                                                     | 20rpx               |
| color          | 字体颜色                                                     | black               |
| maxLines       | 最大行数                                                     | 不限，根据 width 来 |
| lineHeight     | 行高（上下两行文字baseline的距离）                           | fontSize 大小       |
| fontWeight     | 字体粗细。仅支持 normal, bold                                | normal              |
| textDecoration | 文本修饰，支持 underline、 overline、 line-through，也可组合使用 | 无效果              |
| textStyle      | fill： 填充样式，stroke：镂空样式                            | fill                |
| fontFamily     | 字体，如需加载网络字体，前提前使用 wx.loadFontFace 进行加载（https://developers.weixin.qq.com/miniprogram/dev/api/media/font/wx.loadFontFace.html） | sans-serif          |
| background     | 文字背景颜色                                               | 无       |
| padding        | 文字背景颜色边际与文字间距                                       | 0rpx      |
| textAlign | 文字的对齐方式，分为 left, center, right，view 的对齐方式请看 align 属性 | left |

当文字设置 width 属性后，则文字布局的最大宽度不会超过该 width 。如果内容超过 width，则会进行换行，如果此时未设置 maxLines 属性，则会把所有内容进行换行处理，行数由内容和 width 决定。如果此时设置了 maxLines 属性，则最大展示所设置的行数，如果还有多余内容未展示出来，则后面会带上 ... 。

- **以下用个例子说下上述几个属性的用法**

![](https://user-images.githubusercontent.com/4279515/46778602-07152b00-cd47-11e8-9965-091a3d58f417.png)

<details><summary>例子代码（点击展开）</summary><br>

```
export default class LastMayday {
  palette() {
    return ({
      width: '654rpx',
      height: '700rpx',
      background: '#eee',
      views: [
        _textDecoration('overline', 0),
        _textDecoration('underline', 1),
        _textDecoration('line-through', 2),
        _textDecoration('overline underline line-through', 3, 'red'),
        {
          type: 'text',
          text: "fontWeight: 'bold'",
          css: [{
            top: `${startTop + 4 * gapSize}rpx`,
            fontWeight: 'bold',
          }, common],
        },
        {
          type: 'text',
          text: '我是把width设置为300rpx后，我就换行了',
          css: [{
            top: `${startTop + 5 * gapSize}rpx`,
            width: '400rpx',
          }, common],
        },
        {
          type: 'text',
          text: '我设置了maxLines为1，看看会产生什么效果',
          css: [{
            top: `${startTop + 7 * gapSize}rpx`,
            width: '400rpx',
            maxLines: 1,
          }, common],
        },
        {
          type: 'text',
          text: "textStyle: 'stroke'",
          css: [{
            top: `${startTop + 8 * gapSize}rpx`,
            textStyle: 'stroke',
            fontWeight: 'bold',
          }, common],
        },
      ],
    });
  }
}

const startTop = 50;
const gapSize = 70;
const common = {
  left: '20rpx',
  fontSize: '40rpx',
};

function _textDecoration(decoration, index, color) {
  return ({
    type: 'text',
    text: decoration,
    css: [{
      top: `${startTop + index * gapSize}rpx`,
      color: color,
      textDecoration: decoration,
    }, common],
  });
}
```

</details>

### 布局属性

以上 View ，除去自己拥有的特别属性外，还有以下的通用布局属性

| 属性                     | 说明                                           | 默认                  |
| ------------------------ | ---------------------------------------------- | --------------------- |
| rotate                   | 旋转，按照顺时针旋转的度数                     | 不旋转                |
| width、height            | view 的宽度和高度，其中 image 和 text 可不设置 |                       |
| top、right、bottom、left | 如 css 中为 absolute 布局时的作用，可为 负值   | 默认 top 和 left 为 0 |

![](https://user-images.githubusercontent.com/4279515/46778627-290ead80-cd47-11e8-8483-2e36e39b36f0.png)

#### 相对布局方法

很多人有获得文本宽度的需求，因为文本宽度随着字数不同而动态变化，如果想在文本后面加个图标，那么我们就需要获得文本宽度。Painter 的解决方案如下：

```
1，首先你需要为检测长度的文本添加一个 id。如下
{
  id: 'my-text-id',
  type: 'text',
  
2，然后在后面的 view 中，你可以在 left 和 right 属性中使用这个id。如下
left: ['10rpx', 'my-text-id', 比例] 
表示布局在距离左边（10rpx + 该text文本宽度 * 比例） 的距离，比例默认为 1，可省去，你也可以使用负数或小数来做计算，最终的 left 会加上文本宽度乘以该数的值。

注意：比例一定为一个 number
```
如果想获得高度，top 也支持上述用法，并且除文本外，你可以对任何 view 设置一个 id，然后使用上述方法进行相对布局。

**注：相对布局的那个 view 代码一定需要在被相对的 view 的下面。**

#### border 类型

| 属性         | 说明                                                         | 默认                   |
| ------------ | ------------------------------------------------------------ | ---------------------- |
| borderRadius | 边界圆角程度，如果是正方形布局，该属性为一半宽或高时，则为圆形 | 0                      |
| borderWidth  | 边界宽度，外边界                                             | 必设值，否则无边框效果 |
| borderColor  | 边框颜色                                                     | black                  |
| borderStyle  | 边框样式，支持 dashed、dotted、solid                           | solid                  |

![](https://user-images.githubusercontent.com/4279515/46778646-3cba1400-cd47-11e8-916a-3fddc172534d.png)

#### align

Painter 的 align 类型与 css 中的 align 有些许不同。在 Painter 中 align 表示 view 本身的对齐方式，而不像 css 中表示对其子 view 的操作。align 可以作用在 Painter 支持的所有 view 上。它以设置的 left、top、right、bottom 的位置为基准，然后做不同的对齐操作。并且 align 在文字多行情况下，会影响多行文字的对齐方式。

**注意：如果布局使用了 right 确定位置，则该 view 会默认右对齐布局，但此时文字还是从左边绘制。**

![](https://user-images.githubusercontent.com/4279515/46778660-4e9bb700-cd47-11e8-8d93-e522185e8188.png)

<details><summary>例子代码（点击展开）</summary><br>

```
{
  width: '654rpx',
  height: '600rpx',
  background: '#eee',
  views: [
    {
      type: 'rect',
      css: {
        top: '40rpx',
        left: '327rpx',
        color: 'rgba(255, 0, 0, 0.5)',
        width: '5rpx',
        height: '500rpx',
      },
    },
    {
      type: 'image',
      url: '/palette/avatar.jpg',
      css: {
        top: '40rpx',
        left: '327rpx',
        width: '100rpx',
        height: '100rpx',
      },
    },
    {
      type: 'qrcode',
      content: '/palette/avatar.jpg',
      css: {
        top: '180rpx',
        left: '327rpx',
        width: '120rpx',
        height: '120rpx',
      },
    },
    {
      type: 'text',
      text: "align: 'left' 或者不写",
      css: {
        top: '320rpx',
        left: '327rpx',
        fontSize: '30rpx',
      },
    },
    {
      type: 'text',
      text: "align: 'right'",
      css: {
        top: '370rpx',
        left: '327rpx',
        align: 'right',
        fontSize: '30rpx',
      },
    },
    {
      type: 'text',
      text: "align: 'center'",
      css: {
        top: '420rpx',
        left: '327rpx',
        align: 'center',
        fontSize: '30rpx',
      },
    },
    {
      type: 'text',
      text: "在多行的情况下，align 会影响内部 text 的对齐，比如这边设置 align: 'center'",
      css: {
        top: '480rpx',
        right: '327rpx',
        width: '400rpx',
        align: 'center',
        fontSize: '30rpx',
      },
    },
  ],
}
```

</details>

### CSS3 支持

#### shadow

Painter 中的 shadow 可以同时修饰 image、rect、text、qrcode 等 。在修饰 text 时则相当于 text-shadow；修饰 image 和 rect 时相当于 box-shadow；修饰 qrcode 时，则相当于二维码有效区域的投影。

![](https://user-images.githubusercontent.com/4279515/51457535-ab6a2d00-1d8c-11e9-8812-9ab1ee8dafa4.png)



使用方法：

```
shadow: 'h-shadow v-shadow blur color';
h-shadow: 必需。水平阴影的位置。允许负值。
v-shadow: 必需。垂直阴影的位置。允许负值。
blur: 必需。模糊的距离。
color: 必需。阴影的颜色。
```

<details><summary>例子代码（点击展开）</summary><br>

```
export default class ShadowExample {
  palette() {
    return ({
      width: '654rpx',
      height: '400rpx',
      background: '#eee',
      views: [{
          type: 'image',
          url: '/palette/sky.jpg',
          css: {
            shadow: '10rpx 10rpx 5rpx #888888',
          }
        },
        {
          type: 'rect',
          css: {
            width: '250rpx',
            height: '150rpx',
            right: '50rpx',
            top: '60rpx',
            shadow: '10rpx 10rpx 5rpx #888888',
            color: 'linear-gradient(-135deg, #fedcba 0%, rgba(18, 52, 86, 1) 20%, #987 80%)',
          }
        },
        {
          type: 'qrcode',
          content: 'https://github.com/Kujiale-Mobile/Painter',
          css: {
            top: '230rpx',
            width: '120rpx',
            height: '120rpx',
            shadow: '10rpx 10rpx 5rpx #888888',
          },
        },
        {
          type: 'text',
          text: "shadow: '10rpx 10rpx 5rpx #888888'",
          css: {
            left: '180rpx',
            fontSize: '30rpx',
            shadow: '10rpx 10rpx 5rpx #888888',
            top: '290rpx',
          },
        },
      ],
    });
  }
}
```
</details>

#### 渐变色支持

你可以在画布的 background 属性或者 rect 的 color 属性中使用以下方式实现 css 3 的渐变色，其中 radial-gradient 渐变的圆心为 view 中点，半径为最长边，目前不支持自己设置。

```
linear-gradient(-135deg, blue 0%, rgba(18, 52, 86, 1) 20%, #987 80%)

radial-gradient(rgba(0, 0, 0, 0) 5%, #0ff 15%, #f0f 60%)
```

**！！！注意：颜色后面的百分比一定得写。**

### 其他技巧

#### 文字竖行显示

因为 Painter 支持换行符，所以我们可以配合向字符之间插入换行符来达到竖排显示的效果，并且我们还能自由控制是从左到右或从右到左，如下图所示。

![](https://user-images.githubusercontent.com/4279515/61357471-f16efc00-a8aa-11e9-84b3-192fe158f38d.png)

<details><summary>例子代码（点击展开）</summary><br>

```
const text = '锄禾日当午汗滴禾下土谁知盘中餐粒粒皆辛苦';
export default class ImageExample {
  palette() {
    const views = [];
    let tmpText = '';
    let index = 0;
    for (let i = 0; i < text.length; i++) {
      tmpText = `${tmpText}${text[i]}\n`;
      if (i % 5 === 4) {
        views.push({
          type: 'text',
          text: tmpText,
          css: {
            right: `${50 + index}rpx`,
            top: '60rpx',
            fontSize: '40rpx',
            lineHeight: '50rpx',
          },
        });
        index += 50;
        tmpText = '';
      }
    }
    return ({
      width: '654rpx',
      height: '500rpx',
      background: '#eee',
      views: views,
    });
  }
}
```
</details>

### Tips（一定要看哦～）

1，目前 Painter 中支持两种尺寸单位，px 和 rpx，代表的意思和小程序中一致，此处就不多说。

2，目前子 view 的 css 属性支持 object 或 array。所以意味着，你可以把几个子 view 共用的 css 属性提取出来。做到让 Palette 更加简洁。

3，因为我们的 palette 是以 js 承载的 json，所以意味着你可以在每一个属性中很方便的加上自己的逻辑。也可以把某些属性单独提取出来，让多个 palette 共用，做到模块化。

4，如果你只希望获得一张生成的图片来展示，可以把 Painter 挪动到屏幕外进行绘制，绘制完后得到一张图片再进行展示，如下面这样。

```
<painter style="position:fixed;top:-9999rpx" palette="{{userInfoTemplate}}" bind:imgOK="onImgOK" />
```



## 举个栗子

```
{
  background: '#eee',
  width: '654rpx',
  height: '400rpx',
  borderRadius: '20rpx',
  views: [
  {
    type: 'image',
    url: 'https://qhyxpicoss.kujiale.com/r/2017/12/04/L3D123I45VHNYULVSAEYCV3P3X6888_3200x2400.jpg@!70q',
    css: {
      top: '48rpx',
      right: '48rpx',
      width: '192rpx',
      height: '192rpx',
    },
  }
  ...
  ],
}
```

绘制效果如下

![](https://user-images.githubusercontent.com/4279515/46778534-ba315480-cd46-11e8-940a-4c8f53f93928.png)

## 使用 Painter 的项目

| 酷咖名片 | 爱敲代码的猫  | 春节对联 | 致室友 | GitHub小程序客户端 | SwitchDog | 小确幸 |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| <img src="https://user-images.githubusercontent.com/4279515/42991545-804561d4-8c38-11e8-8fc3-9f1a07a42c45.jpg" width="100" title="酷咖名片"/> |   <img src="https://blog.eunji.cn/upload/2019/0/gh_95b7370bf8c9_34420190104173815780.jpg" width="100" title="爱敲代码的猫"/>   | <img src="https://user-images.githubusercontent.com/848691/51151536-4606cf80-18a6-11e9-935c-08ba88401e71.png" width="100" title="春节对联"/> | <img src="https://user-images.githubusercontent.com/16663265/51538435-3aaa3a00-1e8c-11e9-946b-a35fc230db29.png" width="100" title="致室友"/> | <img src="https://raw.githubusercontent.com/huangjianke/Gitter/master/images/code.png" width="100" title="Gitter"/> | <img width="100" src="https://user-images.githubusercontent.com/10265417/52628946-ad3e9080-2ef3-11e9-8462-32616535e95b.jpg" alt="switch dog wxa qrcode" title="SwitchDog" /> | <img src="https://user-images.githubusercontent.com/7540755/56562941-2be33880-65dd-11e9-9594-15c4056b896f.png" width="100" title="小确幸"/> |

欢迎提交自己的项目，一起交流学习。[点子征集](https://github.com/Kujiale-Mobile/Painter/issues/23)

## Thanks

感谢 [demi520](https://github.com/demi520) 的 [wxapp-qrcode](https://github.com/demi520/wxapp-qrcode) 库，Painter 中二维码绘制部分使用了该库的部分代码，并做了些修改。

## License

```
Copyright (c) 2018 Kujiale

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
