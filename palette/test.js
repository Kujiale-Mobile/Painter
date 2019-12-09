export default class ImageExample {
    palette() {
        return {
            width: '610rpx',
            height: '753rpx',
            borderRadius: '22rpx',
            views: [
                {
                    type: 'image',
                    name: '头像',
                    url: avatar,
                    css: {
                        top: '0rpx',
                        left: '0rpx',
                        width: '610rpx',
                        height: '610rpx',
                        borderRadius: '0rpx'
                    }
                },
                {
                    type: 'image',
                    name: '背景图',
                    url: 'https://t1.focus-img.cn/sh320wsh/ask-test/20191113/b66072a8850bd8d57c3b9f4eeae6d5c9.jpg',
                    css: {
                        top: '406rpx',
                        left: '0rpx',
                        width: '610rpx',
                        height: '347rpx',
                        borderRadius: '0rpx'
                    }
                },
                {
                    type: 'image',
                    name: '二维码',
                    url: qrCode,
                    css: {
                        top: '552rpx',
                        left: '416rpx',
                        width: '172rpx',
                        height: '172rpx',
                        borderRadius: '86rpx'
                    }
                },
                {
                    type: 'text',
                    name: '姓名',
                    id: 'name',
                    text: name,
                    css: {
                        fontSize: '40rpx',
                        fontWeight: 'bold',
                        color: '#fff',
                        top: '456rpx',
                        left: '30rpx',
                        width: '300rpx',
                        maxLines: 1
                    }
                },
                {
                    type: 'image',
                    name: '金牌',
                    url: gradeIcon,
                    css: {
                        top: '465rpx',
                        left: ['18rpx', 'name'],
                        width: '18rpx',
                        height: '22rpx'
                    }
                },
                {
                    type: 'text',
                    name: '等级',
                    text: `   ${gradeName}`,
                    css: {
                        fontSize: '22rpx',
                        color: '#D6E6F0',
                        top: '456rpx',
                        left: ['18rpx', 'name'],
                        lineHeight: '40rpx',
                        background: 'rgba(48,48,51,0.5)',
                        borderRadius: '21rpx',
                        padding: '0 10rpx'
                    }
                },
                {
                    type: 'text',
                    name: '描述',
                    text: description,
                    css: {
                        fontSize: '24rpx',
                        color: '#fff',
                        top: '512rpx',
                        left: '30rpx',
                        width: '520rpx',
                        maxLines: 1
                    }
                },
                {
                    type: 'text',
                    text: likeCount,
                    css: {
                        fontSize: '32rpx',
                        fontWeight: 'bold',
                        color: '#fff',
                        top: '580rpx',
                        left: '90rpx',
                        align: 'center'
                    }
                },
                {
                    type: 'text',
                    text: liveness,
                    css: {
                        fontSize: '32rpx',
                        fontWeight: 'bold',
                        color: '#fff',
                        top: '580rpx',
                        left: '210rpx',
                        align: 'center'
                    }
                },
                {
                    type: 'text',
                    text: imCount,
                    css: {
                        fontSize: '32rpx',
                        fontWeight: 'bold',
                        color: '#fff',
                        top: '580rpx',
                        left: '330rpx',
                        align: 'center'
                    }
                },
                {
                    type: 'text',
                    text: '点赞数',
                    css: {
                        fontSize: '22rpx',
                        fontWeight: 'bold',
                        color: '#e6e6e6',
                        top: '630rpx',
                        left: '90rpx',
                        align: 'center'
                    }
                },
                {
                    type: 'text',
                    text: '活跃度',
                    css: {
                        fontSize: '22rpx',
                        fontWeight: 'bold',
                        color: '#e6e6e6',
                        top: '630rpx',
                        left: '210rpx',
                        align: 'center'
                    }
                },
                {
                    type: 'text',
                    text: '咨询数',
                    css: {
                        fontSize: '22rpx',
                        fontWeight: 'bold',
                        color: '#e6e6e6',
                        top: '630rpx',
                        left: '330rpx',
                        align: 'center'
                    }
                }
            ]
        }
    }
}

let data = { 
    avatar: "https://t3.focus-img.cn/mp/rz/884cbe97-09d0-4275-8e25-8d2e2fe4a5f8.JPEG",
    name: "一定要认真生活呀，我叫龙旭，16年从业经验为您置业保驾护航😁",
    description: "我叫龙旭，16年从业经验为您置业保驾护航，大家可以添加微信：12345678",
    gradeName: "银牌经纪人",
    gradeIcon: "https://t.focus-res.cn/front-end/applet/static/broker/icon-silver.png",
    likeCount: "1",
    liveness: "111",
    imCount: "2",
    qrCode: "https://t1.focus-img.cn/wx/acode/f9d5-6a7a-7e02-79c7-f024-0500-a18a-39ea.jpg"
}
let { avatar, name, description, qrCode, gradeName, gradeIcon, likeCount, liveness, imCount } = data
