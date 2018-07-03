import Card from '../../palette/card';

// src/pages/xml2can/xml2can.js
Page({
  card: new Card(),
  userInfo: {
    avatar: 'https://qhyxpicoss.kujiale.com/r/2017/12/04/L3D123I45VHNYULVSAEYCV3P3X6888_3200x2400.jpg@!70q',
  },

  /**
   * 页面的初始数据
   */
  data: {
    template: {},
  },

  onImgOK(e) {
    console.log(e);
    wx.saveImageToPhotosAlbum({
      filePath: e.detail.path,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      template: this.card.do(this.userInfo),
    });
  },
});
