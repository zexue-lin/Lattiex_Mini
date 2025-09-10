// packageA/pages/goods_list/goods_list.ts
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cateId: "",
		loading: false,
		hasMore:true,
    page: 1,
		pageSize: 10,
		goodsList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const encodeKw = options.kw;
    if (encodeKw) {
      const kw = decodeURIComponent(encodeKw);
      console.log("搜索关键词", kw);
    }
    const cateId = options.cateId; // 分类id
    this.setData({ cateId });
    this.refreshGoods(true);
  },

	refreshGoods(reset = true){
		if(reset) this.setData({ page :1 , hasMore:true, goodsList:[] });
		 this.fetchGoodsByCat(!reset);
	}
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  async fetchGoodsByCat(isLoadMore = false) {
		if (this.data.loading || (!this.data.hasMore && isLoadMore)) return;
		const page = isLoadMore ? this.data.page : 1;
		this.setData({ loading: true });

    const app = getApp<IAppOption>();
    const whereObj = JSON.stringify({
      cat_id: this.data.cateId,
      search_name: "",
		});
		
    const { data : res } = await app.$http.post("", {
			method: "goods.getlist",
			where: whereObj,
			order: 'sort asc',
			page,
			limit: this.data.pageSize,
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
