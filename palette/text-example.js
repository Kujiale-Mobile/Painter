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
