// packageA/pages/login/login.ts
// 可选：声明一个 App 类型（你项目里已有 IAppOption 就用它）
import { redirectAfterLogin } from "../../../utils/post_login";
interface LoginPayload {
  method: "user.login";
  mobile: string;
  password: string;
  deviceId: string;
  type: 3; // 3=小程序（按你后端约定）
}

interface SendSmsPayload {
  method: "user.sms";
  mobile: string;
  code: "veri";
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    phoneNumber: "", // 手机号
    isPhoneValid: false, // 手机号是否有效
    isCodeBtnDisabled: false,
    isAgreed: false,
    loading: false,
    /* ===== 登录方式相关 ===== */
    isPasswordLogin: true, // ← 默认走密码登录
    isShowPasswordInput: true, // ← 默认显示密码框
    passwordLoginText: "验证码登录", // 初始文字对应上面逻辑
    loginText: "登录",

    /* 其它原有字段保持不变 */
    password: "",
    isPasswordVisible: false,
    activeField: "", // 如果你用它当高亮索引，也保持 'phone'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  // 处理手机号输入事件
  handlePhoneInput(e) {
    const value = e.detail.value;
    this.setData({
      phoneNumber: value,
    });
    // 简单校验手机号格式（正则可根据实际需求完善，这里示例为11位数字）
    const reg = /^1\d{10}$/;
    const isValid = reg.test(value);
    // console.log("isValid===" + isValid);
    this.setData({
      isPhoneValid: isValid,
    });
    this.checkCanLogin();
  },
  // 输入框默认灰色底线，点击之后变成黑色
  handleFocus(e) {
    this.setData({ activeField: e.currentTarget.dataset.key });
  },

  handleBlur() {
    this.setData({ activeField: "" });
  },

  // 清除手机号输入框内容
  clearPhoneInput() {
    this.setData({
      phoneNumber: "",
      isPhoneValid: false,
    });
  },
  // 处理密码输入
  handlePasswordInput(e) {
    const value = e.detail.value;
    this.setData(
      {
        isCodeBtnDisabled: value == "" ? false : true,
        password: value,
      },
      () => {
        console.log("isCodeBtnDisabled:" + this.data.isCodeBtnDisabled);
      }
    );
    this.checkCanLogin();
  },

  // 切换密码可见性
  togglePasswordVisibility() {
    this.setData({
      isPasswordVisible: !this.data.isPasswordVisible,
    });
    // 强制刷新输入框
    setTimeout(() => {
      this.setData({
        password: this.data.password, // 重新设置密码值，触发输入框刷新
      });
    }, 50);
  },

  // 切换到其他登录方式（如验证码登录）
  goPasswordLogin() {
    this.setData({
      isPasswordLogin: !this.data.isPasswordLogin,
    });
    this.updatePasswordLoginText();

    // wx.navigateTo({ url: '/pages/otherLogin/otherLogin' });
  },
  // 更新密码登录按钮文字
  updatePasswordLoginText() {
    const text = this.data.isPasswordLogin ? "验证码登录" : "密码登录";
    const loginText = this.data.isPasswordLogin ? "登录" : "获取验证码";
    this.setData({
      passwordLoginText: text,
      loginText: loginText,
      isShowPasswordInput: this.data.isPasswordLogin ? true : false,
    });
  },
  // 检查是否可以登录（手机号和密码都有内容时可登录）
  checkCanLogin() {
    const { phoneNumber, password } = this.data;
    const canLogin = phoneNumber.length === 11 && password.length > 0;
    this.setData({
      canLogin,
    });
  },
  switchTab(e) {
    const id = e.currentTarget.dataset.id; // 'password' or 'code'
    const isPwd = id === "password";
    if (isPwd !== this.data.isPasswordLogin) {
      this.setData(
        { isPasswordLogin: isPwd }, // 切换布尔
        this.updatePasswordLoginText // 复用你原来的文字更新逻辑
      );
    }
  },

  async getVerificationCode(): Promise<void> {
    const { phoneNumber, password, isAgreed, isShowPasswordInput } = this.data as {
      phoneNumber: string;
      password: string;
      isAgreed: boolean;
      isShowPasswordInput: boolean;
    };

    // 基础校验
    if (!phoneNumber) {
      wx.showToast({ title: "请输入手机号", icon: "none" });
      return;
    }
    if (isShowPasswordInput && !password) {
      wx.showToast({ title: "请输入密码", icon: "none" });
      return;
    }
    if (!isAgreed) {
      wx.showToast({ title: "请阅读并同意协议", icon: "none" });
      return;
    }

    // 验证码登录：直接跳转到验证码页
    if (!isShowPasswordInput) {
      this.gotoVerifyCode(); // 确保有此方法
      return;
    }

    // 密码登录：调用后端
    this.setData({ loading: true });
    try {
      const app = getApp<IAppOption>();

      // ⚠️ 按你封装的“解构出 data 就是业务数据”的风格：
      // 这里 token 就是后端返回的 data（字符串或对象均可）
      const res = await app.$http.post<string>("", {
        method: "user.login",
        mobile: phoneNumber,
        password,
        deviceId: "wxminiprogram",
        type: 3,
      } as LoginPayload);

      if (res.status) {
        console.log(res);
        wx.showToast({ title: "登录成功", icon: "success" });
        const token = res.data;
        wx.setStorageSync("token", token);
        // 不再固定跳 my/home，而是：
        redirectAfterLogin();
      } else {
        wx.showToast({ title: res.msg, icon: "none" });
      }
    } catch (e: any) {
      // 你的 $http 一般会在拦截器里抛错到这里
      wx.showToast({ title: e?.msg || e?.message || "网络请求失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },
  async gotoVerifyCode(): Promise<void> {
    const { phoneNumber } = this.data as { phoneNumber: string };

    if (!phoneNumber) {
      wx.showToast({ title: "请输入手机号", icon: "none" });
      return;
    }

    this.setData({ loading: true });

    try {
      const app = getApp<IAppOption>();

      // 按你封装：不解构时拿到 { status, msg, data }
      const res = await app.$http.post<unknown>("", {
        method: "user.sms",
        mobile: phoneNumber,
        code: "veri",
      } as SendSmsPayload);

      wx.navigateTo({
        url: `/packageA/pages/verify_code/verify_code?phoneNumber=${phoneNumber}`,
      });
    } catch (e) {
      wx.showToast({ title: "网络请求失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  //忘记密码
  goToForgotPassword() {
    wx.navigateTo({
      url: `/pages/resetPwd/resetPwd?id=forgotPassword`,
    });
  },
  oneClickLogin() {
    wx.redirectTo({
      url: `/packageA/pages/one_login/one_login`,
    });
  },
  //用户协议
  openProtocol() {
    console.log("1");

    wx.navigateTo({
      url: `/pages/richText/richText?id=11`,
    });
  },

  //用户协议
  openPrivacyPolicy() {
    console.log("2");
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
