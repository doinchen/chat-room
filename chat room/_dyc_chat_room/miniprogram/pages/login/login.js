var app = getApp()
const db = wx.cloud.database()
const user_name_photo = db.collection('user_name_photo')
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
function formatDate() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hh = date.getHours();
  var mm = date.getMinutes();
  var ss = date.getSeconds();
  var arr = ['日', '一', '二', '三', '四', '五', '六'];
  var week = arr[date.getDay()];
  function add0(val) {
    return (val < 10 ? '0' + val : val);
  }
  month = add0(month); day = add0(day); hh = add0(hh); mm = add0(mm); ss = add0(ss);
  return year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss

}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: defaultAvatarUrl,
  },
  onChooseAvatar(e) {
    let avatarUrl = e.detail.avatarUrl
    app.globalData.avatarUrl = e.detail.avatarUrl
    this.setData({
      avatarUrl: avatarUrl,
    })
  },
  getName: function (e) {
    this.setData({ name: e.detail.value })
  },
  upload: function (e) {
    const filePath = app.globalData.avatarUrl
    const cloudPath = app.globalData.openid
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        wx.showToast({
          title: '上传成功',
          duration: 3000
        })
        console.log(res.fileID)
        let name = ''
        name = this.data.name;
        let filename = res.fileID
        console.log(filename)
        let avatarUrl
        avatarUrl = app.globalData.avatarUrl
        let openid = app.globalData.openid
        let today = formatDate()
        console.log(avatarUrl)
        console.log(name)
        console.log(today)
        console.log(openid)
        if (avatarUrl == undefined || name == undefined || name == '') {
          avatarUrl = undefined
          name = undefined
          wx.showToast({
            title: '头像或昵称未填写',
            icon: 'none',
            duration: 3000
          })
        } else {
          user_name_photo.where({
            _openid: openid
          }).get({
            success: res => {
              console.log(res.data)
              let user = res.data
              if (user == '') {
                user_name_photo.add({
                  data: {
                    avatarUrl: avatarUrl,
                    avatar: filename,
                    nickName: name,
                    addDate: today,
                    user_login: 1
                  },
                })
              } else if (user[0]._openid == openid) {
                user_name_photo.where({
                  _openid: openid
                })
                  .update({
                    data: {
                      avatarUrl: avatarUrl,
                      avatar: filename,
                      nickName: name,
                      addDate: today,
                      user_login: 1
                    },
                  })
              } else {
                wx.showToast({
                  title: '联系作者',
                  icon: 'none',
                  duration: 3000
                })
              }
            }
          })
          wx.reLaunch({
            url: '../index/index?id=' + app.globalData.openid
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('自动', options.id)
    wx.hideHomeButton({
      success: function () { }
    });
    let openid = options.id
    this.setData({
      openid: openid
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
  }
})