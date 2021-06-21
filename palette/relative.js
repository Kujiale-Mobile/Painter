export default class LastMayday {
  palette() {
    return ({
      width: '654rpx',
      height: '1000rpx',
      background: '#eee',
      views: [
        {
          id: 'one',
          type: 'rect',
          css: {
            width: '200rpx',
            left: '50%',
            align: 'center',
            top: '30rpx',
            height: '100rpx',
          },
        },
        {
          id: 'two',
          type: 'rect',
          css: {
            width: '200rpx',
            left: 'calc(one.left + 100rpx)',
            align: 'center',
            top: 'calc(one.bottom + 10rpx)',
            height: '100rpx',
          },
        },
        {
          id: 'three',
          type: 'rect',
          css: {
            width: '200rpx',
            left: 'calc(two.left + 100rpx)',
            align: 'center',
            top: 'calc(two.bottom + 3 * 10rpx)',
            height: '100rpx',
          },
        },
        {
          id: 'four',
          type: 'rect',
          css: {
            width: 'calc(2 * one.width)',
            left: 'calc(one.left)',
            align: 'center',
            top: 'calc(three.bottom + 10rpx)',
            height: '100rpx',
          },
        },
      ],
    });
  }
}
