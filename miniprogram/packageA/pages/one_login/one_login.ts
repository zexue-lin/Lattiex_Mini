import { reserveArrayBuffer } from "mobx-miniprogram/dist/internal";
import { redirectAfterLogin } from "../../../utils/post_login";
interface ApiResp<T> {
  status: boolean;
  msg: string;
  data: T;
}

interface WxMiniLoginPayload {
  method: "user.wxminilogin";
  appid: string;
  secret: string;
  js_code: string;
  grant_type: "authorization_code";
  encryptedData: string;
  iv: string;
}

interface WxMiniLoginData {
  mobile: string; // 后端解密回传的手机号
  // ...若还有其他字段可继续补充
}

interface LoginPayloadByMobile {
  method: "user.login";
  mobile: string;
  deviceId: "wxminiprogram";
  type: 1;
}

// Promise 化 wx.login
function wxLogin(): Promise<WechatMiniprogram.LoginSuccessCallbackResult> {
  return new Promise((resolve, reject) => {
    wx.login({
      success: resolve,
      fail: reject,
    });
  });
}

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
    loading: false,
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
      canIUseGetPhoneNumber: wx.canIUse("button.open-type.getPhoneNumber"),
    });
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

  // ------- 点击事件 -------
  // onBeforePhoneLogin() {
  //   wx.showToast({ title: "请阅读并同意协议", icon: "none" });
  // },
  // 拦截第一次点击，打开底部弹窗
  openAgreementSheet() {
    this.setData({ showAgreeSheet: true });
  },
  closeAgreementSheet() {
    this.setData({ showAgreeSheet: false });
  },
  // 同意并继续：关闭弹窗、标记同意，并引导用户再点一次
  agreeAndContinue() {
    this.setData({ isAgreed: true, showAgreeSheet: false }, () => {
      // 这里不能自动触发 getPhoneNumber（平台限制）
      // 也不要 setTimeout 去模拟点击，审核/风控会拦。
    });
  },
  stopScroll() {}, // 阻止穿透滚动
  noop() {},
  // 手机号一键登录（open-type="getPhoneNumber" 的事件）
  async getPhoneNumber(
    e: WechatMiniprogram.CustomEvent<{
      iv?: string;
      encryptedData?: string;
      code?: string; // 新版可能返回 code，这里按你现有逻辑仍用 iv/encryptedData
    }>
  ): Promise<void> {
    if (!this.data.isAgreed) {
      wx.showToast({ title: "请阅读并同意协议", icon: "none" });
      return;
    }

    const iv = e.detail?.iv;
    const encryptedData = e.detail?.encryptedData;
    if (!iv || !encryptedData) {
      wx.showToast({ title: "用户拒绝授权", icon: "none" });
      return;
    }

    this.setData({ loading: true });
    try {
      // 1) 获取登录凭证 code
      const loginRes = await wxLogin();
      if (!loginRes?.code) {
        wx.showToast({ title: "获取登录凭证失败", icon: "none" });
        return;
      }

      const app = getApp<IAppOption>();
      // 2) 发送到服务端解密手机号
      const miniResp = await app.$http.post<ApiResp<WxMiniLoginData>>("", {
        method: "user.wxminilogin",
        appid: "wxf0fa64c918890e88", // TODO: 从配置读取
        secret: "ed4cc295236ef8ccc7fdc0007dcbc022", // TODO: 从配置读取
        js_code: loginRes.code,
        grant_type: "authorization_code",
        encryptedData,
        iv,
      } as WxMiniLoginPayload);

      if (!miniResp.status || !miniResp.data?.mobile) {
        wx.showToast({ title: miniResp.msg || "登录失败", icon: "none" });
        return;
      }

      // 3) 用手机号走你们的登录，拿 token
      await this.login(miniResp.data.mobile);
    } catch (err) {
      wx.showToast({ title: "网络请求失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 用手机号登录，拿 token 并跳首页
  async login(mobile: string): Promise<void> {
    try {
      const app = getApp<IAppOption>();
      const resp = await app.$http.post<ApiResp<string>>("", {
        method: "user.login",
        mobile,
        deviceId: "wxminiprogram",
        type: 1,
      } as LoginPayloadByMobile);

      if (resp.status && resp.data) {
        wx.setStorageSync("token", resp.data);
        // 不再固定跳 my/home，而是：
        redirectAfterLogin();
      } else {
        wx.showToast({ title: resp.msg || "登录失败", icon: "none" });
      }
    } catch {
      wx.showToast({ title: "网络请求失败", icon: "none" });
    }
  },
  otherBtn() {
    wx.navigateTo({
      url: "/packageA/pages/login/login",
    });
  },
  goRegister() {
    wx.navigateTo({
      url: "/pages/register/register",
    });
  },
  openOneLoginProtocol() {
    wx.navigateTo({
      url: `/pages/richText/richText?url=https://wap.cmpassport.com/resources/html/contract.html`,
    });
  },
  //用户协议
  openProtocol() {
    wx.navigateTo({
      url: `/pages/richText/richText?id=11`,
    });
  },

  //用户协议
  openPrivacyPolicy() {
    wx.navigateTo({
      url: `/pages/richText/richText?id=10`,
    });
  },
  // 处理协议勾选事件
  handleAgreementChange() {
    this.setData({
      isAgreed: !this.data.isAgreed,
    });
  },
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
  onUnload() {
    clearInterval(this.switchTimer);
  },

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
