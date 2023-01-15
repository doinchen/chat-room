var app = getApp()
const db = wx.cloud.database()
const user_name_photo = db.collection('user_name_photo')
const talk = db.collection('The_world_talk_about')
const room = db.collection('room')
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
    avatarUrl: '../../images/logo.png',
    nickName: 'name',
    login: true,
    searching: false
  },
  search() {
    this.setData({ searching: true })
    let openid = this.data.openid
    console.log('index', openid)
  },
  off() {
    this.setData({ searching: false })
  },
  login(e) {
    this.setData({
      login: false
    })
    wx.reLaunch({
      url: '../login/login'
    })
  },
  exit() {
    this.setData({
      avatarUrl: '../../images/logo.png',
      nickName: 'name',
      login: true
    })
    let openid = this.data.openid
    user_name_photo.where({
      _openid: openid
    }).update({
      data: {
        user_login: 0
      },
    })
  },
  copy: function (e) {
    var code = e.currentTarget.dataset.copy;
    talk.orderBy('sendTimeTS', 'desc').where({ copy: false }).get({
      success: function (res) {
        for (let i = 0; i < res.data.length; i++) {
          if (code == res.data[i].talkabout) {
            code = code.match(/\d+/g).join('')
            wx.setClipboardData({
              data: code,
              success: function (res) {
                wx.showToast({
                  title: '复制成功',
                });
              },
              fail: function (res) {
                wx.showToast({
                  title: '复制失败',
                });
              }
            })
          }
        }
      }
    })
  },
  onTextInput: function (e) {
    this.setData({ talkabout: e.detail.value })
  },
  onSend() {
    let openid = this.data.openid
    let talkabout = this.data.talkabout;
    if (!talkabout) {
      return
    }
    let sendtime = formatDate()
    user_name_photo.where({
      _openid: openid
    }).get({
      success: res => {
        const doc = {
          copy: true,
          avatarUrl: res.data[0].avatar,
          nickName: res.data[0].nickName,
          msgText: 'text',
          talkabout: talkabout,
          date: sendtime,
          sendTime: new Date(),
          sendTimeTS: Date.now(),
        }
        talk.add({
          data: doc,
        })
        this.setData({
          talkabout: '',
        })
      }
    })
  },
  buildroom: function () {
    let openid = this.data.openid
    user_name_photo.where({ _openid: openid }).get({
      success: function (res) {
        const roomnumber = Math.floor(Math.random() * 1000000) + formatDate().match(/\d+/g).join('')
        room.add({
          data: {
            _room_number: roomnumber,
            users: {
              0: {
                avartr: res.data[0].avatar,
                nickName: res.data[0].nickName,
                userid: openid,
              },
              1: null,
              2: null,
            }
          },
        })
        wx.reLaunch({
          url: '../room/room?id=' + roomnumber,
        })
      }
    })

  },
  onRoomInput: function (e) {
    this.setData({ room_number: e.detail.value })
  },
  joinroom: function () {
    let openid = this.data.openid
    let number = this.data.room_number
    let c = 1
    var b;
    for (var i = 0; i < number.length; i++) {
      b = number % 10;
      if (b != 0 && b != 1 && b != 2 && b != 3 && b != 4 && b != 5 && b != 6 && b != 7 && b != 8 && b != 9) {
        c = 0;
      }
    }
    if (c == 0) {
      wx.showToast({
        title: '不能为字母,特殊符号',
        icon: 'none'
      });
    } else if (c != 0) {
      user_name_photo.where({ _openid: app.globalData.openid }).get({
        success: function (res) {
          let avartr = res.data[0].avatar
          let nickname = res.data[0].nickName
          room.where({ _room_number: number }).get({
            success: function (res) {
              if (res.data.length == 0) {
                wx.showToast({
                  title: '该房间不存在',
                  icon: 'none'
                });
              } else if (res.data[0]._room_number == number) {
                let list = res.data[0].users
                let user = new Array(3)
                let person = 0
                for (let i = 0; i < 3; i++) {
                  if (list[i] != null && list[i].avartr != "" && list[i].nickName != "") {
                    user[i] = {
                      avartr: list[i].avartr,
                      nickName: list[i].nickName,
                      userid: list[i].userid,
                    }
                    person += 1
                  }
                }
                if (person >= 3) {
                  wx.showToast({
                    title: '该房间人数已满',
                    icon: 'none'
                  });
                } else {
                  wx.reLaunch({
                    url: '../room/room?id=' + number,
                  })
                  for (let i = 0; i < 3; i++) {
                    if (list[i] == null || list[i].avartr == "" && list[i].nickName == "") {
                      user[i] = {
                        avartr: avartr,
                        nickName: nickname,
                        userid: openid,
                      }
                      room.where({ _room_number: number }).update({
                        data: {
                          users: user
                        }
                      })
                      break;
                    }
                  }
                }
              }
            }
          })
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ openid: options.id })
    let a = this.data.openid
    wx.cloud.callFunction({
      name: 'getOpenid',
      complete: res => {
        this.setData({ openid: res.result.openid })
        app.globalData.openid = res.result.openid
      }
    })
    wx.hideHomeButton({
      success: function () { }
    });
    const that = this
    talk.orderBy('sendTimeTS', 'asc').watch({
      onChange: function (snapshot) {
        that.setData({
          stars: snapshot.docs,
          toLast: 'item' + (snapshot.docs.length - 1)
        })
      },
      onError: function (err) {
        console.error('监听因错误停止', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
 

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.cloud.callFunction({
      name: 'getOpenid',
      complete: res => {
        app.globalData.openid = res.result.openid
        this.setData({ openid: res.result.openid })
        let openid = this.data.openid
        user_name_photo.orderBy('_openid', 'decs').where({ _openid: openid }).get({
          success: res => {
            let user_login = res.data[0].user_login
            if (user_login == 0 || user_login == '') {
              this.setData({ login: true })
            } else {
              this.setData({ login: false })
              user_name_photo.orderBy('_openid', 'decs').where({
                _openid: openid
              }).get({
                success: res => {
                  let photoList = res.data
                  this.setData({
                    avatarUrl: photoList[0].avatar,
                    nickName: photoList[0].nickName,
                    photoList: photoList
                  })
                }
              })
            }
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {


  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})