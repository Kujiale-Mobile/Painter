import Card from '../../palette/card';

// src/pages/xml2can/xml2can.js
Page({
  imagePath: '',
  history: [],

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
  },

  onRevert() {
    const pre = this.history.pop()
    if (!pre) {
      return
    }
    for (let view of this.data.template.views) {
      if (view.id === pre.id) {
        view.css = pre.css
        break
      }
    }
    this.setData({
      action: pre,
      paintPallette: this.data.template,
    })
  },

  saveImage() {
    wx.saveImageToPhotosAlbum({
      filePath: this.imagePath,
    });
  },

  touchEnd(e) {
    for (let view of this.data.template.views) {
      if (view.id === e.detail.id) {
        this.history.push({
          id: view.id,
          css: view.css
        })
        view.css = e.detail.css
        break
      }
    }
    console.log(this.history)

    this.setData({
      paintPallette: this.data.template,
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