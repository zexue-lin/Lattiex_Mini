// app.ts
import { $http } from './utils/request'
App<IAppOption>({
  globalData: {},
  onLaunch() {

        // 配置 baseUrl
        $http.baseUrl = 'https://zhenda.wdzhengda.com/api.html'
        
            // 配置拦截器
    $http.setRequestInterceptor((options) => {
      const token = wx.getStorageSync('token')
      if (token) {
        options.header = {
          ...options.header,
          Authorization: `Bearer ${token}`
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