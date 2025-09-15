// pages/points_mall/points_mall.ts
import { createStoreBindings } from "mobx-miniprogram-bindings";
import { AssetLoadSchema } from "XrFrame/components";
import { store } from "../../store/store";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    swiperCurrent: 0,
    groupedGoodsList: [],
    isLoggedIn: false, // 初始未登录
    userInfo: {},
    page: 1,
    pageSize: 10,
    show_type: 2,
    hasMore: true,
    isLoading: false, // 节流阀
    showRegisterModal: false, // 注册登录弹窗
    showActivityModal: false, // 活动弹窗
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ["pointsBannerList"], // 直接读
    });
    this.getGoodsList();
  },

  async getGoodsList() {
    if (!this.data.hasMore || this.data.isLoading) return;
    this.setData({ isLoading: true });
    try {
      const app = getApp<IAppOption>();
      const { data: res } = await app.$http?.post("", {
        method: "goods.goodsList",
        page: this.data.page,
        pageSize: this.data.pageSize,
        show_type: this.data.show_type,
      });
      // 先获取旧的列表
      const oldGrouped = this.data.groupedGoodsList || [];

      // 分页后组装新的 group
      const newGrouped = [];
      for (let i = 0; i < res.length; i += 3) {
        const groupItems = res.slice(i, i + 3);
        if (groupItems.length === 0) continue;

        newGrouped.push({
          leftBig: Math.floor(oldGrouped.length + i / 3) % 2 === 0,
          items: groupItems,
        });
      }

      this.setData({ groupedGoodsList: oldGrouped.concat(newGrouped), hasMore: res.length >= 1 });
      // console.log(this.data.groupedGoodsList);
    } catch (e) {
      console.error("获取积分商品失败", e);
    } finally {
      this.setData({
        isLoading: false,
      });
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
  /**
   * ------------------------------- 事件点击 ----------------------------------
   */
  goPointsList() {
    wx.showActionSheet({
      itemList: ["A", "B", "C"],
      success(res) {
        console.log(res.tapIndex);
      },
      fail(res) {
        console.log(res.errMsg);
      },
    });

    // wx.showModal({
    //   title: "提示",
    //   content: "这是一个模态弹窗",
    //   success(res) {
    //     if (res.confirm) {
    //       console.log("用户点击确定");
    //     } else if (res.cancel) {
    //       console.log("用户点击取消");
    //     }
    //   },
    // });
  },
  // 注册登录按钮点击
  goLogin() {
    if (this.data.isLoggedIn) {
      this.setData({
        showRegisterModal: true,
      });
    } else {
      wx.navigateTo({
        url: "/pages/one-login/one-login",
      });
    }
  },
  gocategoryList() {
    if (this.data.isLoggedIn) {
      wx.navigateTo({
        url: "/pages/categoryList/categoryList",
      });
    } else {
      wx.navigateTo({
        url: "/pages/one-login/one-login",
      });
    }
  },
  goInviteFriend() {
    wx.navigateTo({
      url: "/pages/InviteFriends/InviteFriends",
    });
  },
  goActivities() {
    this.setData({
      showActivityModal: true,
    });
  },
  clickBanner(e) {
    const index = e.currentTarget.dataset.id;
    const item = this.data.pointsBannerList[index];
    // console.log(index);
    // console.log(item.banner_type);
    switch (item.banner_type) {
      case "1":
        wx.navigateTo({
          url: `/pages/richText/richText?url=${item.banner_value}`,
        });
        break;
      case "2":
        wx.navigateTo({
          url: `/packageA/pages/goods_detail/goods_detail?id=${item.banner_value}`,
        });
        break;
      case "3":
        break;
    }
  },
  gotoGoodsDetail(e) {
    const goods_id = e.currentTarget.dataset.id;
    // console.log(goods_id);
    // 跳转到商品详情页，并传递商品 ID
    wx.navigateTo({
      url: `/packageA/pages/goods_detail/goods_detail?id=${goods_id}`,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  onSwiperChange(e) {
    this.setData({
      swiperCurrent: e.detail.current,
    });
  },
  /* ◀ 上一张 */
  prevSlide() {
    const cur = this.data.swiperCurrent;
    const last = this.data.pointsBannerList.length - 1;
    this.setData({
      swiperCurrent: cur === 0 ? last : cur - 1, // 首张再点就跳到最后一张
    });
  },

  /* ▶ 下一张 */
  nextSlide() {
    const cur = this.data.swiperCurrent;
    const last = this.data.pointsBannerList.length - 1;
    this.setData({
      swiperCurrent: cur === last ? 0 : cur + 1, // 最后一张再点回到首张
    });
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 解绑，防止内存泄漏
    this.storeBindings.destroyStoreBindings();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.isLoading || !this.data.hasMore) return;
    this.setData({
      page: this.data.page + 1,
    });
    this.getGoodsList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
