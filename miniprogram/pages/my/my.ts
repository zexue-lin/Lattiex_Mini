// pages/my/my.ts
import { store } from "../../store/store";
import { getCurrentPageInfo } from "../../utils/util";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoggedIn: false, // 用户是否已登录
    userInfo: {},
    infoList: [
      {
        number: "0",
        label: "点赞",
      },
      {
        number: "0",
        label: "收藏",
      },
      {
        number: "0",
        label: "粉丝",
      },
    ],
    is_promoter: 0,
    page: 1, // 当前页码
    pageSize: 10, // 每页条数
    hasMore: true,
    my_invite_friend: "", // 邀请好友图片
    goodsList: [] as any, // 商品列表数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getRecommendList();
  },

  async getRecommendList() {
    if (!this.data.hasMore) return;
    try {
      const app = getApp<IAppOption>();
      const { data: res } = await app.$http.post("", {
        method: "goods.recommendList",
        page: this.data.page,
        limit: this.data.pageSize,
      });
      const newList = res;
      this.setData({
        goodsList: [...this.data.goodsList, ...newList], // ✅ 追加数据
        hasMore: newList.length === this.data.pageSize, // ✅ 判断是否还有更多
        page: this.data.page + 1, // ✅ 页码增加
      });
    } catch (e) {
      console.error("获取失败", e);
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  // --------------- 点击事件 ---------------
  //判断是否已经登录后再调整{{page}}页面
  goToPage(page) {
    const token = wx.getStorageSync("token");
    if (token) {
      wx.navigateTo({
        url: page,
      });
    } else {
      console.log("没登录呢");
      // 拿到当前页面的信息
      const { url, params } = getCurrentPageInfo();
      store.setRedirectInfo({
        openType: "switchTab",
        url,
        params,
        tabIndex: 4,
      });
      wx.navigateTo({
        url: "/packageA/pages/one_login/one_login",
      });
    }
  },
  goToLogin() {
    this.goToPage("/pages/personalCenter/personalCenter");
  },
  gotoInfoStats(e) {
    const index = e.currentTarget.dataset.index;
    const infoMsg = this.data.infoList[index];
    // console.log(infoMsg.label);
    switch (infoMsg.label) {
      case "点赞":
        this.gotoLike();
        break;
      case "收藏":
        this.gotoCollect();
        break;
      case "粉丝":
        this.goToMyFans();
        break;
      default:
        break;
    }
  },
  gotoSetting() {
    this.goToPage("/pages/setting/setting");
  },
  goToAddress() {
    this.goToPage("/pages/address-list/address-list");
  },
  handleGoMessage() {
    this.goToPage("/pages/message/message");
  },
  goToBecomeVip() {
    if (this.data.userInfo.promoter_apply) {
      this.goToPage("/pages/identity-info-result/identity-info-result");
    } else {
      this.goToPage("/pages/identity-info/identity-info");
    }
  },
  gotoLike() {
    this.goToPage("/pages/myLike/myLike");
  },
  gotoCollect() {
    this.goToPage("/pages/myCollect/myCollect");
  },
  goToInviteFriends() {
    this.goToPage("/pages/InviteFriends/InviteFriends");
  },
  goToRoleInfo() {
    this.goToPage("/pages/roleInfo/roleInfo");
  },
  goToMyFans() {
    this.goToPage("/pages/my-fans/my-fans");
  },
  goToWaitMoney(e) {
    const type = e.currentTarget.dataset.type; // '预收入' 或 '累计收入'
    this.goToPage(`/pages/wait-money/wait-money?type=${type}`);
  },
  goToWallet() {
    this.goToPage("/pages/wallet/wallet");
  },
  // 系统消息点击事件
  goToSysMsg() {
    this.goToPage("/pages/message/message");
  },
  // 提现按钮点击事件
  handleWithdraw() {
    wx.navigateTo({
      url: "/pages/withdraw/withdraw",
    });
  },
  goToGoodsDetail(e) {
    // 跳转到商品详情页，可传递商品id等参数
    const index = e.currentTarget.dataset.index;
    // console.log("推荐商品点击：" + index);
    const goods_id = this.data.goodsList[index].id; // 假设商品有id字段，实际需补充
    // console.log("推荐商品点击：" + goodsId);
    wx.navigateTo({
      url: `/packageA/pages/goods_detail/goods_detail?id=${goods_id}`,
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
  onReachBottom() {
    this.getRecommendList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
