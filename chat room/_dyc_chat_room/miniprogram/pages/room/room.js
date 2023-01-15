var app = getApp()
const db = wx.cloud.database()
const _ = db.command
const user_name_photo = db.collection('user_name_photo')
const room = db.collection('room')
const talk = db.collection('The_world_talk_about')
const room_talk = db.collection('room_talk')
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
    avartr: '../../images/logo.png',
    nickName: 'name',
    about: true
  },
  say: function () {
    this.setData({ about: false })
  },
  return: function () {
    this.setData({ about: true })
  },
  sendnumber: function () {
    let openid = app.globalData.openid
    console.log('index', openid)
    let talkabout = '房间号：' + this.data.number;
    if (!talkabout) {
      return
    }
    let sendtime = formatDate()
    user_name_photo.where({
      _openid: openid
    }).get({
      success: res => {
        const doc = {
          copy: false,
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
      }
    })
  },
  quit: function (e) {
    let user_openid = app.globalData.openid
    let number = this.data.number
    room.where({ _room_number: number }).get({
      success: function (res) {
        let arr = new Array(3)
        let a = 0
        for (let i = 0; i < 3; i++) {
          if (res.data[0].users[i] != null) {
            a = a + 1
          }
        }
        console.log(a);
        if (a <= 1) {
          room.where({ _room_number: number }).remove({
            success: function (res) {
            }
          })
          room_talk.where({ number: number }).remove({
            success: function (res) {
              console.log(res)
            }
          })
        } else {
          for (let i = 0; i < 3; i++) {
            arr[i] = res.data[0].users[i]
          }
          console.log(arr);
          console.log(user_openid);
          for (let i = 0; i < 3; i++) {
            console.log(res.data[0].users[i]);
            if (res.data[0].users[i] == null) {
              continue
            } else if (res.data[0].users[i].userid == user_openid) {
              arr[i] = null
              console.log('dafdaf', i);
              room.where({ _room_number: number }).update({
                data: {
                  users: arr
                },
                success: function (res) {
                  //console.log(res.data)
                }
              })
            }
          }
        }
      }
    })
    wx.reLaunch({
      url: '../index/index'
    })
  },
  onTextInput: function (e) {
    this.setData({ talkabout: e.detail.value })
  },
  onSend() {
    let openid = app.globalData.openid
    console.log('index', openid)
    let talkabout = this.data.talkabout;
    let number = this.data.number;
    console.log(number)
    if (!talkabout) {
      return
    }
    let sendtime = formatDate()
    user_name_photo.where({
      _openid: openid
    }).get({
      success: res => {
        console.log(res.data)
        const doc = {
          number: number,
          copy: true,
          avatarUrl: res.data[0].avatar,
          nickName: res.data[0].nickName,
          msgText: 'text',
          talkabout: talkabout,
          date: sendtime,
          sendTime: new Date(),
          sendTimeTS: Date.now(),
        }
        room_talk.add({
          data: doc,
        })
        this.setData({
          talkabout: '',
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ number: options.id })
    let number = options.id
    let room_say = new Array()
    this.setData({ openid: app.globalData.openid })
    let a = this.data.openid
    wx.hideHomeButton({
      success: function () { }
    });
    const that = this
    room_talk.orderBy('sendTimeTS', 'asc').watch({
      onChange: function (snapshot) {
        let j = 0
        for (let i = 0; i < snapshot.docs.length; i++) {
          if (snapshot.docs[i].number == number) {
            room_say[j] = snapshot.docs[i]
            j = j + 1
          }
        }
        that.setData({
          star: room_say,
          toLast: 'item' + (snapshot.docs.length - 1)
        })
      },
      onError: function (err) {
        console.error('监听因错误停止', err)
      }
    })
    wx.hideHomeButton({
      success: function () { }
    });
    this.setData({ number: options.id })
    room.where({ _room_number: number }).watch({
      onChange: function (snapshot) {
        let a = snapshot.docs.length
        if (a != 0) {
          that.setData({
            stars: snapshot.docs[0].users,
          })
        }
      },
      onError: function (err) {
        console.error('监听因错误停止', err)
      }
    })
  },
  onReady() {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (e) {
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