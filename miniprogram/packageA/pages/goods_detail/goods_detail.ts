// packageA/pages/goods_detail/goods_detail.ts
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		goods_info: [], // 商品信息
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		const goods_id = options.goods_id

		this.getGoodsDetail(goods_id)
	},

	async getGoodsDetail(goods_id) {
		try {
			const app = getApp<IAppOption>();
			const token = wx.getStorageSync('token') || ''
			const { data: res } = await app.$http?.post('', {
				method: 'goods.getdetial',
				id: goods_id,
				token,
			})

			console.log(res);

		} catch (e) {
			console.error('获取商品详情失败', e);

		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	}
})