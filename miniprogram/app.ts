// app.ts
import { $http } from './utils/request'
import { config } from './utils/config'

App<IAppOption>({
  globalData: {
    config, // 挂载globalData 方便全局用
  },
  onLaunch() {
    // 配置 baseUrl
    $http.baseUrl = config.baseUrl

    // ✅ 挂到 App 实例，页面就能 getApp().$http
    // 防御性分号（断句），防止编译成js的时候跟上面一句连在一起了，这里明确告诉JS。跟上一行没关系
    // 遇到 (、[、` 开头的语句 → 前面必须写分号。
    ;(this as any).$http = $http

    // 配置拦截器
    $http.setRequestInterceptor(options => {
      const token = wx.getStorageSync('token')
      if (token) {
        options.header = {
          ...options.header,
          Authorization: `Bearer ${token}`,
        }
      }
      wx.showLoading({ title: '加载中...' })
      return options
    })

    $http.setResponseInterceptor((res: any) => {
      wx.hideLoading()
      if (res.statusCode !== 200) {
        wx.showToast({ title: '请求失败', icon: 'none' })
        return Promise.reject(res)
      }
      return res.data
    })

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },
})
