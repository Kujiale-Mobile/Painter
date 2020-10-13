# Painter 2.0

## 画家计划

想到小程序中有如此大量的生成图片需求，而 Canvas 生成方法又是如此难用和坑爹（有关小程序的坑，可看 https://github.com/Kujiale-Mobile/MP-Keng ）。我们就想到可不可以做一款可以很方便生成图片，并且还能屏蔽掉直接使用 Canvas 的一些坑的库呢？对此我们发起了 “`画家计划`— 通过 json 数据形式，来进行动态渲染并绘制出图片”。 Painter 库的整体架构如下：

![整体架构](https://user-images.githubusercontent.com/4279515/46778561-d46b3280-cd46-11e8-99c8-62e182e6f943.png)

首先，我们定义了一套绘图 JSON 规范，开发者可以根据需求构建生成图片的 Palette（调色板），然后在程序运行过程中把调色板传入给 Painter（画家）。Painter 会调用 Pen（画笔），根据 Palette 内容绘制出对应的图片后返回。

经过了一段时间的进步，painter 在大家的建议与贡献下得到了长足的成长。我们感谢各位使用者在这个过程中对 painter 的支持和帮助，这也是我们不断完善 painter 的最大动力。我们将为大家介绍 painter 的新能力，并明确下一阶段的迭代目标。

**Painter 的优势**

- 功能全，支持文本、图片、矩形、qrcode 类型的 view 绘制
- 布局全，支持多种布局方式，如 align（对齐方式）、rotate（旋转）
- 支持圆角，其中图片，矩形，和整个画布支持 borderRadius 来设置圆角
- 支持边框，同时支持 solid、dashed、dotted 三种类型
- 支持渐变色，包括线性渐变与径向渐变。
- 支持 box-shadow 和 text-shadow，统一使用 shadow 表示。
- 支持文字背景、获取宽度、主动换行
- 支持图片 mode
- 支持元素的相对定位方法
- 杠杠的性能优化，我们对网络素材图片加载实现了一套 LRU 存储机制，不用重复下载素材图片。
- 杠杠的容错，因为某些特殊情况会导致 Canvas 绘图不完整。我们对此加入了对结果图片进行检测机制，如果绘图出错会进行重绘。
- 生成的图片支持分辨率调节
- 支持使用拖动等操作动态编辑绘制内容

**TODO**

- [ ] canvas2d 接口支持 [测试版本](https://github.com/Kujiale-Mobile/Painter/tree/heidao)
- [ ] base64 图片支持 [测试版本](https://github.com/Kujiale-Mobile/Painter/tree/base64)
- [ ] node 端服务版的 painter
- [ ] line-space 属性支持
- [ ] 三角形等常用图形的支持
- [ ] painter“插件” —— 支持使用者通过少量代码传入自行拓展 painter 能力

painter 的 “canvas2d 版本”与“base64 支持”正处于测试状态，可以在上方测试版本处链接获取对应版本，欢迎各位在实际体验后向我们反馈存在的问题，并给出宝贵的改进经验。你的支持将帮助 painter 做的更好

## How To Use

### 运行例子

```powershell
git clone https://github.com/Kujiale-Mobile/Painter.git
```

代码下载后，用小程序 IDE 打开后即可使用。

**注：请选择小程序项目，非小游戏，例子中无 appid，所以无法在手机上运行，如果需要真机调试，请在打开例子时，填上自己的小程序 id**

### 快速开始

mpvue 的使用方法请移步 [mpvue 接入方案](https://github.com/Kujiale-Mobile/Painter/wiki/mpvue-%E6%8E%A5%E5%85%A5%E6%96%B9%E5%BC%8F)

taro 的使用方法请参考 [Taro 接入方案](https://github.com/Kujiale-Mobile/Taro-Painter-Demo)

1. 引入代码

   Painter 的核心代码在另一个 repo 中，https://github.com/Kujiale-Mobile/PainterCore.git 。你可以通过 submodule 的方式进行库的引入。有关 submodule 的用法可自行 Google。

   ```powershell
   git submodule add https://github.com/Kujiale-Mobile/PainterCore.git components/painter
   ```

2. 作为自定义组件引入，注意目录为第一步引入的代码所在目录

   ```json
   "usingComponents":{
     "painter":"/components/painter/painter"
   }
   ```

3. 组件接收 `palette` 字段作为画图数据的数据源, 图案数据以 json 形式存在，推荐使用“皮肤模板”的方法进行传递，示例代码如下：

   ```xml
   <painter palette="{{data}}" bind:imgOK="onImgOK" />
   ```

   你可以通过设置 widthPixels 来强制指定生成的图片的像素宽度，否则，会根据你画布中设置的大小来动态调节，比如你用了 rpx，则在 iphone 6 上会生成 0.5 倍像素的图片。由于 canvas 绘制的图片像素直接由 Canvas 本身大小决定，此处通过同比例放大整个画布来实现对最后生成的图片大小的调节。

   ```xml
   <painter customStyle='position: absolute; left: -9999rpx;' palette="{{template}}" bind:imgOK="onImgOK" widthPixels="1000"/>
   ```

4. 数据传入后，则会自动进行绘图。绘图完成后，你可以通过绑定 imgOK 或 imgErr 事件来获得成功后的图片 或失败的原因。

   ```javascript
   bind:imgOK="onImgOK"
   bind:imgErr="onImgErr"

   onImgOK(e) {
     其中 e.detail.path 为生成的图片路径
   },
   ```

5. 你也可以通过使用 `dancePalette` 、 `action` 等字段开启 painter 的高阶用法。具体使用方式将会在下方有详细描述。在新版 painter 中，静态模版默认相对 painter 本身 left: -9999px 。因此正常情况下使用 painter 时出现在页面上的都是动态模版。如果希望禁止用户的操作，可以按照使用静态模版的做法，只传 palette 属性即可。

## 组件文档

| 属性              | 类型               | 说明                                                                                               | 必填 | 默认值 |
| ----------------- | ------------------ | -------------------------------------------------------------------------------------------------- | ---- | ------ |
| customStyle       | string             | canvas 的自定义样式                                                                                | 否   |        |
| palette           | IPalette           | 静态模版，具体规范下文有详细介绍                                                                   | 否   |        |
| scaleRatio        | number             | 缩放比，会在传入的 palette 中统一乘以该缩放比                                                      | 否   | 1      |
| widthPixels       | number             | 生成的图片的像素宽度，如不传则根据模版动态生成                                                     | 否   | 0      |
| dirty             | boolean            | 是否启用脏检查                                                                                     | 否   | false  |
| LRU               | boolean            | 是否开启 LRU 机制                                                                                  | 否   | true   |
| dancePalette      | IPalette           | 动态模版，规范同静态模版                                                                           | 否   |        |
| customActionStyle | ICustomActionStyle | 选择框、缩放图标、删除图标的自定义样式与图片                                                       | 否   |        |
| action            | IView              | 动态编辑内容，用于刷新动态模版                                                                     | 否   |        |
| disableAction     | boolean            | 禁止动态编辑操作                                                                                   | 否   | false  |
| clearActionBox    | boolean            | 清除动态编辑框                                                                                     | 否   | false  |
| imgErr            | function           | 图片生成失败，可以从 e.detail.error 获取错误信息                                                   | 否   |        |
| imgOk             | function           | 图片生成成功，可以从 e.detail.path 获取生成的图片路径                                              | 否   |        |
| viewUpdate        | function           | 动态模版， view 被更新，可从 e.detail.view 获取更新的 view                                         | 否   |        |
| viewClicked       | function           | 动态模版， view 被选中， 可从 e.detail.view 获取点击的 view，如为空，则是选中背景                  | 否   |        |
| touchEnd          | function           | 动态模版，触碰结束。只有 view，代表触碰的对象；包含 view、type、index，代表点击了删除 icon； | 否   |
| didShow           | function           | 动态模版，绘制结束时触发                                                                           | 否   |        |

```typescript
interface IView {
  type: "rect" | "text" | "image" | "qrcode";
  text?: string;
  url?: string;
  id?: string;
  /** 事实上painter中view的css属性并不完全与CSSProperties一致。 */
  /** 有一些属性painter并不支持，而当你需要开启一些“高级”能力时，属性的使用方式也与css规范不一致。 */
  /** 具体的区别我们将在下方对应的view介绍中详细讲解，在这里使用CSSProperties仅仅是为了让你享受代码提示 */
  css: CSSProperties;
}

interface IPalette {
  background: string; // 整个模版的背景，支持网络图片的链接、纯色和渐变色
  width: string;
  height: string;
  borderRadius: string;
  views: Array<IView>;
}

interface ICustomActionStyle {
  border: string; // 动态编辑选择框的边框样式
  scale: {
    textIcon: string; // 文字view所使用的缩放图标图片
    imageIcon: string; // 图片view所使用的缩放图标图片
  };
  delete: {
    icon: string; // 删除图标图片
  };
}
```

## Palette 规范

如你使用 wxss + wxml 规范进行绘制一样，Painter 需要根据一定的规范来进行图片绘制。当然 Painter 的绘制规范要比 wxml 简单很多。这部分的例子都是基于 `palette` 属性实现的**静态**模版

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

| type   | 内容    | description                    | 自有 css                                                          |
| ------ | ------- | ------------------------------ | ----------------------------------------------------------------- |
| image  | url     | 表示图片资源的地址，本地或网络 | 见 image 小节                                                     |
| text   | text    | 文本的内容                     | 见 text 小节                                                      |
| rect   | 无      | 矩形                           | color: 颜色，支持渐变色                                           |
| qrcode | content | 画二维码                       | background: 背景颜色（默认为透明色）color: 二维码颜色（默认黑色） |

#### image

Painter 的 image 可以设置成本地图片或者网络图片，注意本地图片请使用绝对路径。并且如果未设置 image 的长宽，则长宽的属性值会默认设为 auto。若长宽均为 auto 则会使用图片本身的长宽来布局，大小为图片的像素值除以 pixelRatio 。

| 属性名称 | 说明                 | 默认值     |
| -------- | -------------------- | ---------- |
| width    | image 的宽度         | auto       |
| height   | image 的高度         | auto       |
| mode     | 图片裁剪、缩放的模式 | aspectFill |

**scaleToFill**：不保持纵横比缩放图片，使图片的宽高完全拉伸至填满 image 元素

**aspectFill**：保持纵横比缩放图片，只保证图片的短边能完全显示出来。也就是说，图片通常只在水平或垂直方向是完整的，另一个方向将会发生截取。

**注：mode 属性和小程序 image 的 mode 属性功能一致，只是支持的类型只有两种，且默认值不同。 当 width 或 height 属性设置为 auto 时，mode 属性失效**

![](https://user-images.githubusercontent.com/49523717/61441645-a4f1f200-a978-11e9-9f9c-467cfcf3ec04.png)

<details><summary>例子代码（点击展开）</summary><br>

```javascript
export default class ImageExample {
  palette() {
    return {
      width: "654rpx",
      height: "1000rpx",
      background: "#eee",
      views: [
        {
          type: "image",
          url: "/palette/sky.jpg",
        },
        {
          type: "text",
          text: "未设置height、width时",
          css: {
            right: "0rpx",
            top: "60rpx",
            fontSize: "30rpx",
          },
        },
        {
          type: "image",
          url: "/palette/sky.jpg",
          css: {
            width: "200rpx",
            height: "200rpx",
            top: "230rpx",
          },
        },
        {
          type: "text",
          text: "mode: 'aspectFill' 或 无",
          css: {
            left: "210rpx",
            fontSize: "30rpx",
            top: "290rpx",
          },
        },
        {
          type: "image",
          url: "/palette/sky.jpg",
          css: {
            width: "200rpx",
            height: "200rpx",
            mode: "scaleToFill",
            top: "500rpx",
          },
        },
        {
          type: "text",
          text: "mode: 'scaleToFill'",
          css: {
            left: "210rpx",
            top: "560rpx",
            fontSize: "30rpx",
          },
        },
        {
          type: "image",
          url: "/palette/sky.jpg",
          css: {
            width: "200rpx",
            height: "auto",
            top: "750rpx",
          },
        },
        {
          type: "text",
          text: "设置height为auto",
          css: {
            left: "210rpx",
            top: "780rpx",
            fontSize: "30rpx",
          },
        },
      ],
    };
  }
}
```

</details>

#### text

因为 text 的特殊性，此处对 text 进行单独说明。

| 属性名称       | 说明                                                                     | 默认值              |
| -------------- | ------------------------------------------------------------------------ | ------------------- |
| width          | text 的宽度                                                              |                     |
| height         | text 的高度                                                              |                     |
| fontSize       | 字体大小                                                                 | 20rpx               |
| color          | 字体颜色                                                                 | black               |
| maxLines       | 最大行数                                                                 | 不限，根据 width 来 |
| lineHeight     | 行高（上下两行文字 baseline 的距离）                                     | fontSize 大小       |
| fontWeight     | 字体粗细。仅支持 normal, bold                                            | normal              |
| textDecoration | 文本修饰，支持 underline、 overline、 line-through，也可组合使用         | 无效果              |
| textStyle      | fill： 填充样式，stroke：镂空样式                                        | fill                |
| background     | 文字背景颜色                                                             | 无                  |
| padding        | 文字背景颜色边际与文字间距                                               | 0rpx                |
| textAlign      | 文字的对齐方式，分为 left, center, right，view 的对齐方式请看 align 属性 | left                |

当文字设置 width 属性后，则文字布局的最大宽度不会超过该 width 。如果内容超过 width，则会进行换行，如果此时未设置 maxLines 属性，则会把所有内容进行换行处理，行数由内容和 width 决定。如果此时设置了 maxLines 属性，则最大展示所设置的行数，如果还有多余内容未展示出来，则后面会带上 ... 。

关于 fontFamily 属性，有一点需要澄清，最开始文档中写的可以通过 wx.loadFontFace 来加载自定义字体，是不严谨的。事实上，原版 canvas 接口不支持自定义字体。而从 2.13.0 版本基础库开始，canvas2d 版本的接口开始支持自定义字体。我们找到了如下问答作为依据： [问题链接](https://developers.weixin.qq.com/community/develop/doc/000c26f9cc4f48af2b9aed8e25b000?highLine=canvas%2520%25E5%25AD%2597%25E4%25BD%2593)。

- **以下用个例子说下上述几个属性的用法**

![](https://user-images.githubusercontent.com/4279515/46778602-07152b00-cd47-11e8-9965-091a3d58f417.png)

<details><summary>例子代码（点击展开）</summary><br>

```javascript
export default class LastMayday {
  palette() {
    return {
      width: "654rpx",
      height: "700rpx",
      background: "#eee",
      views: [
        _textDecoration("overline", 0),
        _textDecoration("underline", 1),
        _textDecoration("line-through", 2),
        _textDecoration("overline underline line-through", 3, "red"),
        {
          type: "text",
          text: "fontWeight: 'bold'",
          css: [
            {
              top: `${startTop + 4 * gapSize}rpx`,
              fontWeight: "bold",
            },
            common,
          ],
        },
        {
          type: "text",
          text: "我是把width设置为300rpx后，我就换行了",
          css: [
            {
              top: `${startTop + 5 * gapSize}rpx`,
              width: "400rpx",
            },
            common,
          ],
        },
        {
          type: "text",
          text: "我设置了maxLines为1，看看会产生什么效果",
          css: [
            {
              top: `${startTop + 7 * gapSize}rpx`,
              width: "400rpx",
              maxLines: 1,
            },
            common,
          ],
        },
        {
          type: "text",
          text: "textStyle: 'stroke'",
          css: [
            {
              top: `${startTop + 8 * gapSize}rpx`,
              textStyle: "stroke",
              fontWeight: "bold",
            },
            common,
          ],
        },
      ],
    };
  }
}

const startTop = 50;
const gapSize = 70;
const common = {
  left: "20rpx",
  fontSize: "40rpx",
};

function _textDecoration(decoration, index, color) {
  return {
    type: "text",
    text: decoration,
    css: [
      {
        top: `${startTop + index * gapSize}rpx`,
        color: color,
        textDecoration: decoration,
      },
      common,
    ],
  };
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

```

注意：

- 比例一定为一个 number
- 获得的长度为 view 自身的尺寸，而非该 view 到对应边的 距离 + 自身尺寸

如果想获得高度，top 也支持上述用法，并且除文本外，你可以对任何 view 设置一个 id，然后使用上述方法进行相对布局。

**注：相对布局的那个 view 代码一定需要在被相对的 view 的下面。**

#### border 类型

| 属性         | 说明                                                           | 默认                   |
| ------------ | -------------------------------------------------------------- | ---------------------- |
| borderRadius | 边界圆角程度，如果是正方形布局，该属性为一半宽或高时，则为圆形 | 0                      |
| borderWidth  | 边界宽度，外边界                                               | 必设值，否则无边框效果 |
| borderColor  | 边框颜色                                                       | black                  |
| borderStyle  | 边框样式，支持 dashed、dotted、solid                           | solid                  |

![](https://user-images.githubusercontent.com/4279515/46778646-3cba1400-cd47-11e8-916a-3fddc172534d.png)

#### align

Painter 的 align 类型与 css 中的 align 有些许不同。在 Painter 中 align 表示 view 本身的对齐方式，而不像 css 中表示对其子 view 的操作。align 可以作用在 Painter 支持的所有 view 上。它以设置的 left、top、right、bottom 的位置为基准，然后做不同的对齐操作。并且 align 在文字多行情况下，会影响多行文字的对齐方式。

**注意：如果布局使用了 right 确定位置，则该 view 会默认右对齐布局，但此时文字还是从左边绘制。**

![](https://user-images.githubusercontent.com/4279515/46778660-4e9bb700-cd47-11e8-8d93-e522185e8188.png)

<details><summary>例子代码（点击展开）</summary><br>

```javascript
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

```javascript
export default class ShadowExample {
  palette() {
    return {
      width: "654rpx",
      height: "400rpx",
      background: "#eee",
      views: [
        {
          type: "image",
          url: "/palette/sky.jpg",
          css: {
            shadow: "10rpx 10rpx 5rpx #888888",
          },
        },
        {
          type: "rect",
          css: {
            width: "250rpx",
            height: "150rpx",
            right: "50rpx",
            top: "60rpx",
            shadow: "10rpx 10rpx 5rpx #888888",
            color:
              "linear-gradient(-135deg, #fedcba 0%, rgba(18, 52, 86, 1) 20%, #987 80%)",
          },
        },
        {
          type: "qrcode",
          content: "https://github.com/Kujiale-Mobile/Painter",
          css: {
            top: "230rpx",
            width: "120rpx",
            height: "120rpx",
            shadow: "10rpx 10rpx 5rpx #888888",
          },
        },
        {
          type: "text",
          text: "shadow: '10rpx 10rpx 5rpx #888888'",
          css: {
            left: "180rpx",
            fontSize: "30rpx",
            shadow: "10rpx 10rpx 5rpx #888888",
            top: "290rpx",
          },
        },
      ],
    };
  }
}
```

</details>

#### 渐变色支持

你可以在画布的 background 属性或者 rect 的 color 属性中使用以下方式实现 css 3 的渐变色，其中 radial-gradient 渐变的圆心为 view 中点，半径为最长边，目前不支持自己设置。

```css
 {
  background: linear-gradient(
    -135deg,
    blue 0%,
    rgba(18, 52, 86, 1) 20%,
    #987 80%
  );

  color: radial-gradient(rgba(0, 0, 0, 0) 5%, #0ff 15%, #f0f 60%);
}
```

**！！！注意：颜色后面的百分比一定得写。**

### 其他技巧

#### 文字竖行显示

因为 Painter 支持换行符，所以我们可以配合向字符之间插入换行符来达到竖排显示的效果，并且我们还能自由控制是从左到右或从右到左，如下图所示。

![竖排效果](https://user-images.githubusercontent.com/4279515/61357471-f16efc00-a8aa-11e9-84b3-192fe158f38d.png)

<details><summary>例子代码（点击展开）</summary><br>

```javascript
const text = "锄禾日当午汗滴禾下土谁知盘中餐粒粒皆辛苦";
export default class ImageExample {
  palette() {
    const views = [];
    let tmpText = "";
    let index = 0;
    for (let i = 0; i < text.length; i++) {
      tmpText = `${tmpText}${text[i]}\n`;
      if (i % 5 === 4) {
        views.push({
          type: "text",
          text: tmpText,
          css: {
            right: `${50 + index}rpx`,
            top: "60rpx",
            fontSize: "40rpx",
            lineHeight: "50rpx",
          },
        });
        index += 50;
        tmpText = "";
      }
    }
    return {
      width: "654rpx",
      height: "500rpx",
      background: "#eee",
      views: views,
    };
  }
}
```

</details>

## 动态模版

### 使用方法

```xml
<painter
    customStyle='margin-left: 40rpx; height: 1000rpx;'
    palette="{{paintPallette}}"
    bind:imgOK="onImgOK"
    customActionStyle="{{customActionStyle}}"
    dancePalette="{{template}}"
    bind:touchEnd="touchEnd"
    action="{{action}}"
    />
```

```javascript
// ···
data: {
  // ···
  customActionStyle: {
    border: {
      borderColor: "#1A7AF8",
    },
    scale: {
      textIcon: "/palette/switch.png",
      imageIcon: "/palette/scale.png",
    },
    delete: {
      icon: "/palette/close.png",
    },
  },
},
// ···
```

动态模版向用户提供了一个可供编辑的海报模版。在使用动态模版时，painter默认支持用户对海报中 view 的拖动、缩放和删除操作，增加海报自由度。（[了解更多关于动态模版](https://github.com/Kujiale-Mobile/Painter/wiki/%E5%8A%A8%E6%80%81%E6%A8%A1%E7%89%88%E7%AE%80%E4%BB%8B)）

customStyle、palette、imgOk 三个属性是旧版 painter 已存在的，使用方式并没有发生变化，因此不再赘述。(这里同时使用静态模版和动态模版，是为了在动态模版上编辑完毕后，通过静态模版生成一整张图片交给用户)

可以通过 customActionStyle 自定义操作 icon 与操作框的样式。通过 dancePalette，我们传入初始的模版，当后续有模版级别的刷新的时候，我们也是修改 dancePlette 的传入值。action 用于传入单个 view 级别的修改。若传入的 view 含 id，则将覆盖该 id 匹配的 view，若无 id，则默认覆盖当前选中的 view。可以通过 touchEnd 获取当前选中的 view 或是感知到用户的删除操作。

若是要使 view 可被缩放，需要在 css 中配置 scalable: true,而如果需要 view 可被删除，需要在 css 中配置 deletable: true,

### 拓展能力

通过动态模版能力拓展出的几种进阶用法：

1. 动态更新 view 属性，如替换图片 url、修改文字、修改文字样式

<details><summary>效果展示（点击展开，多图预警）</summary>

初始状态

![初始状态](https://qhstaticssl.kujiale.com/newt/100082/image/jpeg/1601360499189/C95F8D892B9D3699F71C65A6B104D0AE.jpg?x-oss-process=image/resize,w_200)

图片缩放、移动

![图片缩放、移动](https://qhstaticssl.kujiale.com/newt/100082/image/jpeg/1601360499011/E5EE3DBDE555A053CCF8A6734409E4F9.jpg?x-oss-process=image/resize,w_200)

图片切换

![图片切换](https://qhstaticssl.kujiale.com/newt/100082/image/jpeg/1601360499048/D593CB0BF382860058228702EEB16386.jpg?x-oss-process=image/resize,w_200)

图片裁剪(这里的裁剪是配合另一个库 CropperCore 实现的，painter 本身无法裁剪图片)

![图片裁剪](https://qhstaticssl.kujiale.com/newt/100082/image/jpeg/1601360499054/8B931E9628FEE5D67C3774096CB5F6B1.jpg?x-oss-process=image/resize,w_200)

文字选中

![文字选中](https://qhstaticssl.kujiale.com/newt/100082/image/jpeg/1601360499617/D38D3DE8E92FB13D1656F745E4010584.jpg?x-oss-process=image/resize,w_200)

文字缩放

![文字缩放](https://qhstaticssl.kujiale.com/newt/100082/image/jpeg/1601360499042/E5D70B678460DBC4DAB280AE6BF02956.jpg?x-oss-process=image/resize,w_200)

文字编辑

![文字编辑](https://qhstaticssl.kujiale.com/newt/100082/image/jpeg/1601360499041/156FEFA0FCCD8C0C2F011A9071DEBAAC.jpg?x-oss-process=image/resize,w_200)

字号调节

![字号调节](https://qhstaticssl.kujiale.com/newt/100082/image/jpeg/1601360499449/51516F4253AA68A6E85C558C994193A7.jpg?x-oss-process=image/resize,w_200)

文字颜色

![文字颜色](https://qhstaticssl.kujiale.com/newt/100082/image/jpeg/1601360499252/FA70651AE9A80BD68EAFE1273204449B.jpg?x-oss-process=image/resize,w_200)

文字样式

![文字样式](https://qhstaticssl.kujiale.com/newt/100082/image/jpeg/1601360499450/8F58A08A568287CBEE7993DF90469B81.jpg?x-oss-process=image/resize,w_200)

背景颜色

![背景颜色](https://qhstaticssl.kujiale.com/newt/100082/image/jpeg/1601360499471/BD61462977BA8E65E02FBAEB98BD2D70.jpg?x-oss-process=image/resize,w_200)

新增文字

![新增文字1](https://qhstaticssl.kujiale.com/newt/100082/image/jpeg/1601360499018/E8DD995983063961D05FBC77653EEB84.jpg?x-oss-process=image/resize,w_200)

新增文字

![新增文字](https://qhstaticssl.kujiale.com/newt/100082/image/jpeg/1601360499433/FF5B1F5DA3CA9A463ED844C0091C453C.jpg?x-oss-process=image/resize,w_200)

</details>

2. 撤销、恢复修改
   在示例中，我们实现了简单的撤销恢复功能，大致思路为：在页面中维护 future 、 history 两个数组，分别记录需要恢复和需要撤销的变动，当作出修改操作，则在修改前先将该 view 的当前状态传入 history，同时清空 future。若是点击撤销，则将点击时刻的 view 传入 future，再用 history 顶部的 view 更新模版。若点击恢复，则将点击时刻的 view 传入 history，在用 future 顶部的 view 更新模版。

<details><summary>示例代码（点击展开）</summary>

```javascript
// ···
onRevert() {
  const pre = this.history.pop();
  if (!pre) {
    return;
  }
  // ···
  this.future.push(pre);
  // ···
},

onRecover() {
  const fut = this.future.pop();
  if (!fut) {
    return;
  }
  // ···
  this.history.push(fut);
  // ···
},

touchEnd({ detail }) {
  // ···
  this.history.push({
    ...detail,
  });
  // ···
  this.future.length = 0;
  // ···
},
// ···
```

</details>

## Tips（一定要看哦～）

1，目前 Painter 中支持两种尺寸单位，px 和 rpx，代表的意思和小程序中一致，此处就不多说。

2，目前子 view 的 css 属性支持 object 或 array。所以意味着，你可以把几个子 view 共用的 css 属性提取出来。做到让 Palette 更加简洁。

3，因为我们的 palette 是以 js 承载的 json，所以意味着你可以在每一个属性中很方便的加上自己的逻辑。也可以把某些属性单独提取出来，让多个 palette 共用，做到模块化。

4，如果你只希望获得一张生成的图片来展示，可以把 Painter 挪动到屏幕外进行绘制，绘制完后得到一张图片再进行展示，如下面这样。

```xml
<painter style="position:fixed;top:-9999rpx" palette="{{userInfoTemplate}}" bind:imgOK="onImgOK" />
```

### 举个栗子

```javascript
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

|                                                                   酷咖名片                                                                    |                                                        爱敲代码的猫                                                        |                                                                   春节对联                                                                   |                                                                    致室友                                                                    |                                                 GitHub 小程序客户端                                                 |                                                                                  SwitchDog                                                                                   |                                                                   小确幸                                                                    |
| :-------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------: |
| <img src="https://user-images.githubusercontent.com/4279515/42991545-804561d4-8c38-11e8-8fc3-9f1a07a42c45.jpg" width="100" title="酷咖名片"/> | <img src="https://blog.eunji.cn/upload/2019/0/gh_95b7370bf8c9_34420190104173815780.jpg" width="100" title="爱敲代码的猫"/> | <img src="https://user-images.githubusercontent.com/848691/51151536-4606cf80-18a6-11e9-935c-08ba88401e71.png" width="100" title="春节对联"/> | <img src="https://user-images.githubusercontent.com/16663265/51538435-3aaa3a00-1e8c-11e9-946b-a35fc230db29.png" width="100" title="致室友"/> | <img src="https://raw.githubusercontent.com/huangjianke/Gitter/master/images/code.png" width="100" title="Gitter"/> | <img width="100" src="https://user-images.githubusercontent.com/10265417/52628946-ad3e9080-2ef3-11e9-8462-32616535e95b.jpg" alt="switch dog wxa qrcode" title="SwitchDog" /> | <img src="https://user-images.githubusercontent.com/7540755/56562941-2be33880-65dd-11e9-9594-15c4056b896f.png" width="100" title="小确幸"/> |

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
