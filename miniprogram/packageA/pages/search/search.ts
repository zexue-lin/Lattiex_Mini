
// packageA/pages/search/search.ts
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		value: '', // 输入的值
		timer: null,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad() {

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

	},
	// 输入事件 - 做了防抖处理
	onChange(e) {

		clearTimeout(this.data.timer);

		this.data.timer = setTimeout(() => {
			// 如果500毫秒内，没有触发新的输入事件，则为搜索关键字赋值
			this.setData({
				value: e.detail,
			});
			// console.log(this.data.value);
		}, 500)

	}
})