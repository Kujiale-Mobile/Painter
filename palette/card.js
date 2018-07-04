// 名片分享样式
export default class LastMayday {
  cardInfo = {}

  do(cardInfo) {
    this.cardInfo = JSON.parse(JSON.stringify(cardInfo));
    return this._template();
  }

  TEXT_SMALL = {
    fontSize: '24rpx',
  }

  _template() {
    return ({
      background: '#eee',
      width: '654rpx',
      height: '400rpx',
      borderRadius: '20rpx',
      views: [
        {
          type: 'image',
          url: this.cardInfo.avatar,
          css: {
            top: '48rpx',
            right: '48rpx',
            width: '192rpx',
            height: '192rpx',
          },
        },
        {
          type: 'qrcode',
          content: 'https://github.com/Kujiale-Mobile',
          css: {
            left: '30rpx',
            bottom: '30rpx',
            width: '100rpx',
            height: '100rpx',
          },
        },
        {
          type: 'text',
          text: '酷家乐 移动前端',
          css: {
            left: '20rpx',
            top: '50rpx',
            fontSize: '40rpx'
          },
        },
      ],
    });
  }
}