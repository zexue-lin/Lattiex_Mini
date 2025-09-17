// packageA/pages/verify_code/verify_code.ts
import { redirectAfterLogin } from "../../../utils/post_login";
interface ApiResp<T> {
  status: boolean;
  msg: string;
  data: T;
}

interface LoginByCodePayload {
  method: "user.login";
  mobile: string;
  deviceId: "wxminiprogram";
  code: string;
  type: 2;
}

interface SendSmsPayload {
  method: "user.sms";
  mobile: string;
  code: "veri";
}

type TimerId = number | null;

Page({
  data: {
    veCode: [] as string[], // 验证码数组（4 位）
    countdown: 60, // 倒计时秒数
    timer: null as TimerId, // 定时器 id
    phoneNumber: "", // 手机号
    loading: false, // 提交中状态
  },

  onLoad(options: { phoneNumber?: string }) {
    const phoneNumber = options?.phoneNumber ?? "";
    this.setData({ phoneNumber });
    this.startCountdown();
    // 注意：通常是上个页面发送成功后才跳转过来，所以这里不自动再发一次
  },

  onUnload() {
    if (this.data.timer !== null) {
      clearInterval(this.data.timer);
      this.setData({ timer: null });
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 输入验证码（只保留数字，长度上限 4）
  inputValue(e: WechatMiniprogram.Input) {
    const raw = String(e.detail.value || "");
    const value = raw.replace(/[^0-9]/g, "").slice(0, 4);
    this.setData({ veCode: value.split("") });

    if (value.length === 4) {
      this.checkCode(value);
    }
  },

  // === 迁入自上一页的“发送短信验证码”逻辑（用于本页的“重新发送”）===
  async sendSms(): Promise<void> {
    const { phoneNumber } = this.data;
    if (!phoneNumber) {
      wx.showToast({ title: "请输入手机号", icon: "none" });
      return;
    }

    this.setData({ loading: true });
    try {
      const app = getApp<IAppOption>();
      const resp = await app.$http.post<ApiResp<unknown>>("", {
        method: "user.sms",
        mobile: phoneNumber,
        code: "veri",
      } as SendSmsPayload);

      if (resp.status) {
        wx.showToast({ title: "验证码已发送", icon: "none" });
        // 重置倒计时与输入框
        this.resetCountdown(60);
        this.setData({ veCode: [] });
      } else {
        wx.showToast({ title: resp.msg || "发送失败，请重试", icon: "none" });
      }
    } catch (e) {
      wx.showToast({ title: "网络请求失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 校验验证码并登录
  async checkCode(code: string) {
    const { phoneNumber } = this.data;
    if (!phoneNumber) {
      wx.showToast({ title: "请输入手机号", icon: "none" });
      return;
    }

    this.setData({ loading: true });
    wx.showLoading({ title: "校验中..." });

    try {
      const app = getApp<IAppOption>();
      const resp = await app.$http.post<ApiResp<string>>("", {
        method: "user.login",
        mobile: phoneNumber,
        deviceId: "wxminiprogram",
        code,
        type: 2,
      } as LoginByCodePayload);

      if (resp.status && resp.data) {
        wx.setStorageSync("token", resp.data);
        wx.showToast({ title: "登录成功", icon: "success", duration: 800 });
        // 不再固定跳 my/home，而是：
        redirectAfterLogin();
      } else {
        wx.showToast({ title: resp.msg || "登录失败请重试", icon: "none" });
      }
    } catch {
      wx.showToast({ title: "网络请求失败", icon: "none" });
    } finally {
      wx.hideLoading();
      this.setData({ loading: false });
    }
  },

  // 启动倒计时（仅当没有计时器时）
  startCountdown() {
    if (this.data.timer !== null) return;

    const id = (setInterval(() => {
      const n = this.data.countdown;
      if (n <= 0) {
        clearInterval(id as number);
        this.setData({ timer: null, countdown: 0 });
        return;
      }
      this.setData({ countdown: n - 1 });
    }, 1000) as unknown) as number;

    this.setData({ timer: id });
  },

  // 重置倒计时并重新开始
  resetCountdown(sec = 60) {
    if (this.data.timer !== null) {
      clearInterval(this.data.timer);
    }
    this.setData({ countdown: sec, timer: null });
    this.startCountdown();
  },

  // 重新发送验证码：改为真正发短信 + 重置倒计时；不跳转页面
  resendCode() {
    if (this.data.countdown > 0) return;
    this.sendSms();
  },
});
