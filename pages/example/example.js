import Card from '../../palette/card';

// src/pages/xml2can/xml2can.js
Page({
  imagePath: '',

  /**
   * 页面的初始数据
   */
  data: {
    template: {},
  },

  onImgOK(e) {
    this.imagePath = e.detail.path;
    this.setData({
      image: this.imagePath
    })
    console.log(e);
  },

  saveImage() {
    wx.saveImageToPhotosAlbum({
      filePath: this.imagePath,
    });
  },

  touchEnd(e) {
    this.setData({
      paintPallette: e.detail,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      template: new Card().palette(),
    });
  },
});
