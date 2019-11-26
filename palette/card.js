export default class LastMayday {
  palette() {
    return ({
      width: '654rpx',
      height: '1000rpx',
      background: '#eee',
      views: [
        _textDecoration('overline', 0),
        _textDecoration('underline', 1),
        _textDecoration('line-through', 2),
        _textDecoration('overline underline line-through', 3, 'red'),
        {
          type: 'rect',
          css: {
            width: '200rpx',
            right: '20rpx',
            top: '30rpx',
            height: '100rpx',
            borderRadius: '100%',
            shadow: '10rpx 10rpx 5rpx #888888',
            color: 'linear-gradient(-135deg, #fedcba 0%, rgba(18, 52, 86, 1) 20%, #987 80%)',
          },
        },
        {
          id: 'my-text-id',
          type: 'text',
          text: "fontWeight: 'bold'",
          css: [{
            top: `${startTop + 4 * gapSize}rpx`,
            shadow: '10rpx 10rpx 5rpx #888888',
            fontWeight: 'bold',
          }, common],
        },
        {
          type: 'rect',
          css: {
            width: '20rpx',
            height: '20rpx',
            color: 'red',
            left: [`${startTop}rpx`, 'my-text-id'],
            top: `${startTop + 4 * gapSize + 15}rpx`,
          },
        },
        {
          id: 'text-id-2',
          type: 'text',
          text: '我是把width设置为400rpx后，我就换行了xx行了',
          css: [{
            top: `${startTop + 5 * gapSize}rpx`,
            align: 'center',
            width: '400rpx',
            background: '#538e60',
            textAlign: 'center',
            padding: '10rpx',
            scalable: true,
            deletable: true,
          }, common, { left: '300rpx' }],
        },
        {
          type: 'rect',
          css: {
            width: '20rpx',
            height: '20rpx',
            color: 'red',
            left: '200rpx',
            top: [`${startTop + 5 * gapSize}rpx`, 'text-id-2'],
          },
        },
        {
          type: 'text',
          text: '我设置了maxLines为1，看看会产生什么效果',
          css: [{
            top: `${startTop + 7 * gapSize}rpx`,
            width: '500rpx',
            maxLines: 1,
          }, common],
        },
        _image(0),
        _des(0, '普通'),
        _image(1, 30),
        _des(1, 'rotate: 30'),
        _image(2, 30, '20rpx'),
        _des(2, 'borderRadius: 30rpx'),
        _image(3, 0, '60rpx'),
        _des(3, '圆形'),
        {
          type: 'image',
          url: '/palette/avatar.jpg',
          css: {
            bottom: '40rpx',
            left: '40rpx',
            borderRadius: '50rpx',
            borderWidth: '10rpx',
            borderColor: 'yellow',
            width: '100rpx',
            height: '100rpx',
          },
        },
        {
          type: 'qrcode',
          content: 'https://github.com/Kujiale-Mobile/Painter',
          css: {
            bottom: '40rpx',
            left: '180rpx',
            color: 'red',
            borderWidth: '10rpx',
            borderColor: 'blue',
            borderStyle: 'dashed',
            width: '120rpx',
            height: '120rpx',
          },
        },
        {
          type: 'rect',
          css: {
            bottom: '40rpx',
            right: '40rpx',
            color: 'radial-gradient(rgba(0, 0, 0, 0) 5%, #0ff 15%, #f0f 60%)',
            borderRadius: '20rpx',
            borderWidth: '10rpx',
            width: '120rpx',
            height: '120rpx',
          },
        },
        {
          type: 'text',
          text: 'borderWidth',
          css: {
            bottom: '40rpx',
            right: '200rpx',
            color: 'green',
            borderWidth: '2rpx',
          },
        },
        {
          type: 'rect',
          css: {
            width: '100rpx',
            height: '100rpx',
            color: 'rgba(0,0,0,0.2)',
            left: '50%',
            top: '50%',
            align: 'center',
            verticalAlign: 'center',
          }
        }
      ],
    });
  }
}

const startTop = 50;
const startLeft = 20;
const gapSize = 70;
const common = {
  left: `${startLeft}rpx`,
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

function _image(index, rotate, borderRadius) {
  return (
    {
      id: `image-${index}`,
      type: 'image',
      url: '/palette/avatar.jpg',
      css: {
        top: `${startTop + 8.5 * gapSize}rpx`,
        left: `${startLeft + 160 * index}rpx`,
        width: '120rpx',
        height: '120rpx',
        shadow: '10rpx 10rpx 5rpx #888888',
        rotate: rotate,
        minWidth: '60rpx',
        borderRadius: borderRadius,
        scalable: true,
      },
    }
  );
}

function _des(index, content) {
  const des = {
    type: 'text',
    text: content,
    css: {
      fontSize: '22rpx',
      top: `${startTop + 8.5 * gapSize + 140}rpx`,
    },
  };
  if (index === 3) {
    des.css.right = '60rpx';
  } else {
    des.css.left = `${startLeft + 120 * index + 30}rpx`;
  }
  return des;
}
