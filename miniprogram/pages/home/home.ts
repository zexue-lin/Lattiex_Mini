// pages/home/home.ts
// import { $http } from '../../utils/request'
import Toast from '@vant/weapp/toast/toast'

//定义一下类型
interface Category {
  id: number
  parent_id: number
  name: string
  image_url: string
  sort: number
  child: Category[]
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pointsBannerList: [] as any[],
    categoryList: [] as Category[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getSwpierList(), this.getCategoryList()
  },

  /**
   * 数据获取----------------------------------
   */
  async getSwpierList() {
    try {
      // 拿到全局配置的接口
      const app = getApp<IAppOption>()
      const url = app.globalData.config.api_url_platform_config

      // 发起请求 这里对http做非空断言就不会提示警告了
      // 非空断言（!）：告诉 TS 我保证 $http 已经挂载过了
      const res = await app.$http.get(url)

      this.setData({
        pointsBannerList: res.points_banner_list || [],
      })
    } catch (err) {
      console.error('获取banner失败', err)
      // wx.showToast({ title: '加载失败', icon: 'none', duration: 1500 })
      Toast.fail('加载失败')
    }
  },

  // 与原生的相比，
  /**
   * success → try 里的逻辑

     fail → catch 里的逻辑

     complete → finally 里的逻辑
   */
  async getCategoryList() {
    try {
      const app = getApp<IAppOption>() // 每一个请求里面都要写这句

      // 这里走 POST 请求（只传 method → 会自动拼接 baseUrl）
      // const res = await app.$http.post('', { method: 'categories.getallcat' })
      const { data: res } = await app.$http.post<Category[]>('', { method: 'categories.getallcat' })

      this.setData({
        categoryList: res || [],
      })
      // console.log(res)
    } catch (err) {
      console.error('获取分类失败', err)
    } finally {
    }
  },

  /**
   * 事件点击----------------------------------
   */

  handlerCate(e) {
    // console.log(e.currentTarget.dataset.id)
    const cateId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/cate/cate',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

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
})
