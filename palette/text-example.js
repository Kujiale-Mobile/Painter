export default class TextExample {
    palette() {
        return ({
            width: '654rpx',
            height: '1000rpx',
            background: '#eee',
            views: [
                {
                    type: 'text',
                    text: '我是一大串文字我是一大串文字我是一大串文字我是一大串文字我是一大串文字我是一大串',
                    css: {
                        left: '50rpx',
                        top: '50rpx',
                        fontSize: '30rpx',
                        background: '#538e60',
                        padding: '10rpx',
                        width: '400rpx',
                        letterSpacing: 4,
                    },
                },
            ],
        });
    }
}