import { reserveArrayBuffer } from "mobx-miniprogram/dist/internal";

// packageA/pages/one_login/one_login.ts
Page({
  /**
   * 页面的初始数据
   */
  data: {
    modelImages: [], // 存接口返回的三张图
    currentModelIndex: 0, // 当前显示的索引
		canIUseGetPhoneNumber: false,
		isAgreed: false,
		showAgreeSheet: false, // 隐私弹窗
    // canIUse: wx.canIUse("button.open-type.getUserInfo"),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getModelImages();
    this.startImageSwitch();
    // 检查小程序API可用性
    this.setData({
      canIUseGetPhoneNumber: wx.canIUse('button.open-type.getPhoneNumber'),
    }),
  },
  // bindGetUserInfo(e) {
  //   // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
  //   // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
  //   console.log(e);
  //   //e里面包含所有的用户信息
  //   //使用wx.login()方法来调用获取成功后的数据信息
  //   wx.login({
  //     success: (res) => {
  //       console.log(res); // 返回一个code
  //       let code = res.code; //返回一个code  唯一的
  //       //定义一个数组来接收可能用到的数据（loadingParams）
  //       // const loadingParams = {
  //       //   encryptedData: e.detail.encryptedData,
  //       //   rawData: e.detail.rawData,
  //       //   iv: e.detail.iv,
  //       //   signature: e.detail.signature,
  //       //   code,
  //       // }; // 创建一个对象 执行resolve
  //       // resolve(loadingParams); // 把创建的对象当作参数
  //     },
  //     fail(err) {
  //       reject(err);
  //     },
  //   });
  // },

  // 获取模特图
  async getModelImages() {
    try {
      const app = getApp<IAppOption>();
      const { data: res } = await app.$http.post("", {
        method: "user.oneLoginImages",
      });

      this.setData({
        modelImages: res,
      });
    } catch (e) {
      console.error("获取失败"), e;
    }
  },
  // 模特图切换
  startImageSwitch() {
    this.switchTimer = setInterval(() => {
      this.setData({
        currentModelIndex: (this.data.currentModelIndex + 1) % 3,
      });
    }, 3000);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  // 用户授权之后，获取用户的基本信息
  // getUserInfo(e) {
  //   if (e.detail.errMsg === "getUserInfo:fail auth deny") {
  //     wx.showToast({
  //       title: "您取消了授权",
  //       icon: "none",
  //     });
  //     return;
  //   }
  //   console.log(e);
  //   console.log(e.detail.userInfo);
  // },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
