# Painter

![](http://7xq276.com2.z0.glb.qiniucdn.com/painter.gif)

由于我们无法将小程序直接分享到朋友圈，但分享到朋友圈的需求目前又很多，业界目前的做法是利用小程序的 Canvas 功能生成一张带有二维码的图片，然后引导用户下载图片到本地后再分享到朋友圈。而小程序 Canvas 功能是很难用的，往往为了绘制一张简单图片，就得写上一堆 boilerplate code 。如果此时一个小程序中包含多个绘图的需求，那绝壁要疯。另外 Canvas 上有很多绘图的坑，肯定会让你疯上加疯。

这边说上几个小程序 Canvas 的坑：

1， Canvas 绘图是用的 px，而在小程序中我们一般使用 rpx 进行相对布局。

2，小程序的 drawCanvas 方法，在 IDE 中可以直接设置网络图片进行绘制，但在真机上设置网络图片无用。

3，canvasContext.clip 方法在 iOS 设备上 微信 6.6.6 版本及以下有 bug，会导致该 clip 下面使用的的 restore 方法失效。



## 画家计划

想到小程序中有如此大量的生成图片需求，而 Canvas 生成方法又是如此难用和坑爹。那我们就想到可不可以做一款可以很方便生成图片的库，而且还能屏蔽掉直接使用 Canvas 的那些坑呢。所以我们发起了 “画家计划— 通过 json 数据形式，来进行动态渲染并绘制出图片”。 Painter 库的整体架构如下：

![整体架构](http://7xq276.com2.z0.glb.qiniucdn.com/painter.png)

首先，我们定义了一套绘图 JSON 规范，开发者可以根据需求构建生成图片的 Palette（调色板），然后在程序运行过程中把调色板传入给 Painter（画家）。Painter 会调用 Pen（画笔），根据 Palette 内容绘制出对应的图片后返回。



## How To Use

### 运行例子

因该项目为 submodule 管理方式。首次 clone 代码时，需加上 `--recursive` 参数。

```
git clone https://github.com/Kujiale-Mobile/Painter.git --recursive
```

代码下载后，用小程序 IDE 打开后即可使用。

**注：请选择小程序项目，非小游戏**



### 使用 Painter

1. 引入代码

   可以在主项目下执行以下命令，通过 submodule 的方式引入 painter 组件。建议是在 components 目录下。

   ```
   git submodule add https://github.com/Kujiale-Mobile/PainterCore.git painter
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


4. 数据传入后，则会自动进行绘图。绘图完成后，你可以通过绑定 imgOK 或 onImgErr 事件来获得成功后的图片 或失败的原因。

   ```
   bind:imgOK="onImgOK"
   bind:imgErr="onImgErr"
   ```



## Palette 规范

如你使用 wxss + wxml 规范进行绘制一样，Painter 需要根据一定的规范来进行图片绘制。当然 Painter 的绘制规范要比 wxml 简单很多。

### 调色板属性

一个调色板首先需要给予一些整体属性

```
background: 可以是颜色值，也可以为网络图片的链接，默认为白色
width: 宽度
height: 高度
borderRadius: 边框的圆角（该属性也同样适用于子 view）
views: 里面承载子 view
```

### 子 View 属性

当我们把整体的调色板属性构建起来后，里面就可以添加子 View 来进行绘制了。

| type   | content | description     | 自有css                             |
| ------ | ------- | --------------- | --------------------------------- |
| image  | url     | 表示图片资源的地址，本地或网络 |                                   |
| text   | text    | 文本的内容           | fontSize: 文字大小，color: 字体颜色（默认为黑色） |
| rect   | 无       | 矩形              | color: 颜色                         |
| qrcode | content | 画二维码            | background:  背景颜色（默认为透明色），        |



### 布局属性

以上 View ，除去自己拥有的特别属性外，还有以下的通用布局属性

| 属性                    | 意义                                       |
| --------------------- | ---------------------------------------- |
| rotate                | 旋转，按照顺时针旋转的度数，默认不旋转                      |
| borderRadius          | 边界圆角程度，如果是正方形布局，该属性为一半宽或高时，则为圆形          |
| top、right、bottom、left | 如 css 中为 absolute 布局时的作用，默认 top 和 left 为 0 |

### 尺寸即其他

1，目前 Painter 中支持两种尺寸单位，px 和 rpx，代表的意思和小程序中一致，此处就不多说。

2，目前子 view 的 css 属性支持 object 或 array。所以意味着，你可以把几个子 view 共用的 css 属性提取出来。做到让 Palette 更加简洁。

3，因为我们的 palette 是以 js 承载的 json，所以意味着你可以在每一个属性中很方便的加上自己的逻辑。也可以把某些属性单独提取出来，让多个 palette 共用，做到模块化。



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
  ],
}
```

绘制效果如下

![](http://7xq276.com2.z0.glb.qiniucdn.com/first.png)



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