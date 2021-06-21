export default class LastMayday {
  palette() {
    return ({
      width: '654rpx',
      height: '1000rpx',
      background: '#eee',
      views: [
        {
          id: 'one',
          type: 'qrcode',
          content: '12345',
          css: {
            width: '400rpx',
            left: '50%',
            align: 'center',
            top: '30rpx',
            height: '400rpx',
          },
        },
        {
          id: 'two',
          type: 'image',
          url: '/palette/avatar.jpg',
          css: {
            width: '100rpx',
            left: 'calc(one.left)',
            align: 'center',
            top: 'calc(one.top + one.height / 2 - 50rpx)',
            height: '100rpx',
            borderRadius: '10rpx',
            borderWidth: '10rpx',
            borderColor: '#fff'
          },
        },
        {
          type: 'rect',
          css: {
            width: 'calc(one.width / 2)',
            left: 'calc(one.left)',
            align: 'center',
            top: 'calc(one.bottom + 10rpx)',
            height: '100rpx',
          },
        },
      ],
    });
  }
}
