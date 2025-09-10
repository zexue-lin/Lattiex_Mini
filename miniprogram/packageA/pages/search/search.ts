// packageA/pages/search/search.ts
Page({
  /**
   * 页面的初始数据
   */
  data: {
    value: "", // 输入的值
    timer: null,
    suggestionsList: [],
    historyList: [],
    show: {
      primary: true,
      success: true,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // const cache = wx.getStorageSync("search_history");
    // if (cache) {
    //   this.setData({ historyList: cache || [] });
    // }
    this.setData({ historyList: wx.getStorageSync("search_history") || [] });
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
  // 输入事件 - 做了防抖处理
  onChange(e) {
    clearTimeout(this.data.timer);

    this.data.timer = setTimeout(() => {
      // 如果500毫秒内，没有触发新的输入事件，则为搜索关键字赋值
      this.setData({
        value: e.detail,
      });
      // console.log(this.data.value);
      this.getSearchSuggestionsList();
    }, 500);
  },
  // 根据关键词，查询搜索建议
  async getSearchSuggestionsList() {
    const app = getApp<IAppOption>();
    const kw = (this.data.value || "").trim();
    if (!kw) {
      this.setData({
        suggestionsList: [],
      });
      return;
    }

    try {
      const { data: res } = await app.$http.post("", {
        method: "pages.searchSuggestions",
        kw,
        limit: 10,
      });
      if (res) {
        this.setData({ suggestionsList: res || [] });
      } else {
        this.setData({ suggestionsList: [] });
      }

      this.saveSearchHistory();
    } catch (e) {
      wx.showToast({ title: "error", icon: "none" });
    }
  },

  // 点击事件-------------
  gotoGoodsDetail(e) {
    const goodsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/packageA/pages/goods_detail/goods_detail?goodsId=${goodsId}`,
    });
  },

  // 清空搜索历史
  clearHistory() {
    wx.showModal({
      title: "提示",
      content: "确定清空搜索历史吗?",
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync("search_history");
          this.setData({ historyList: [] });
        }
      },
    });
  },

  // 搜索历史点击
  gotoGoodsList(e) {
    const kw = (e.currentTarget.dataset.kw || "").trim();

    if (!kw) return;
    wx.navigateTo({
      url: `/packageA/pages/goods_list/goods_list?kw=${encodeURIComponent(kw)}`,
    });
  },

  // 保存搜索关键词
  saveSearchHistory() {
    const val = (this.data.value || "").trim();
    if (!val) return;

    // 取旧值，去重 + 置顶
    let list = this.data.historyList || [];
    list = list.filter((v) => v !== val);
    list.unshift(val); // 把 val 插到数组头部，其它元素整体后移，只改变顺序一次，得到“最新在最前”的效果。
    // 截断长度
    // if (list.length > 10) list = list.slice(0, 10);

    this.setData({ historyList: list });
    wx.setStorageSync("search_history", list); // 本地持久化
  },
});
