export default class ImageExample {
  palette() {
    return ({
      width: '654rpx',
      height: '1000rpx',
      background: '#eee',
      views: [{
          type: 'image',
          url: '/palette/sky.jpg',
        },
        {
          id: "changeText",
          type: 'text',
          text: '高端不好计算的一行文字这里可以进行已该元素为基点的向下追加元素，假设这里有好多好多的文字了',
          css: {
            right: '0rpx',
            top: '60rpx',
            fontSize: '30rpx',
            width: '200rpx'
          }
        },
        {
          type: 'image',
          url: '/palette/sky.jpg',
          css: {
            width: '200rpx',
            height: '200rpx',
            top: ['20rpx','changeText']//这里的图片定位是基于上一行变动文本的高度的
          }
        }
      ]
    });
  }
}