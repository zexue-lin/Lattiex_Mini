// pages/cate/cate.ts
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
    // 当前屏幕可用高度
    wh: 0,
    categoryList: [] as Category[],
    active: 0,
    cateLevel2: [], // 二级分类列表
    scrollTop: 0, // 如果当前页面导航条透明，必须填这个
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 获取窗口信息
    const windowInfo = wx.getWindowInfo()
    // console.log(windowInfo.windowHeight)
    this.setData({
      wh: windowInfo.windowHeight,
    })

    this.getCategoryList()
  },

  // 如果当前页面导航条透明，必须填这个
  onPageScroll(e) {
    // e.scrollTop 兼容 iOS/安卓/开发者工具
    this.setData({ scrollTop: e.scrollTop })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  async getCategoryList() {
    try {
      const app = getApp<IAppOption>()
      const { data: res } = await app.$http.post<Category[]>('', { method: 'categories.getallcat' })

      console.log(res)
      this.setData({
        categoryList: res || [],
        cateLevel2: res[0].child,
      })
    } catch (e) {
      wx.showToast({ title: 'error', duration: 1500, icon: 'none' })
    }
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

  onTapLeftItem(e) {
    const i = e.currentTarget.dataset.index
    this.setData({ active: i, cateLevel2: this.data.categoryList[i].child })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
})
