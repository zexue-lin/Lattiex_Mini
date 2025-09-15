// pages/home/home.ts
// import { $http } from '../../utils/request'
import Toast from "@vant/weapp/toast/toast";
import { createStoreBindings } from "mobx-miniprogram-bindings";
import { store } from "../../store/store";

//定义一下类型
interface Category {
  id: number;
  parent_id: number;
  name: string;
  image_url: string;
  sort: number;
  child: Category[];
}
type GetGoodsListOptions = { reset?: boolean };

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // pointsBannerList: [] as any[], 不用写了，在onload里面已经绑定了fields
    categoryList: [] as Category[],
    title1: "",
    title2: "",
    title2_1: "",
    title3: "",
    title4: "",
    title2_en: "",
    title3_en: "",
    title4_en: "",
    newSwiperAlive: true, // 新季穿搭
    newSeasonList: [],
    uiIndex: 0, // 只负责“放大”样式
    currentControlled: 0, // 只负责 newSwiper 的受控 current
    is_show_settledIn: 1, // 是否显示入住申请
    goodsList: [] as any[], // 商品列表
    page: 1, // 当前页码
    pageSize: 10, // 每页数量
    hasMore: true, // 是否还有更多数据
    loading: false, // 加载状态
    isLoggedIn: false, // 用户是否已登录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getSwpierList(),
      this.getCategoryList(),
      // 获取新季穿搭
      this.getNewSeasonList();
    // 首次 / 重新进入页面
    this.getGoodsList({ reset: true });
    // 直接从mobx里面拿到tabbar的高度
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ["safeBottom", "pointsBannerList"], // 直接拿来用
      actions: ["setPointsBannerList"], // 若需要直接调用 action，也可以写在 actions
    });
  },

  /**
   * 数据获取----------------------------------
   */
  async getSwpierList() {
    try {
      // 拿到全局配置的接口
      const app = getApp<IAppOption>();
      const url = app.globalData.config.api_url_platform_config;

      // 发起请求 这里对http做非空断言就不会提示警告了
      // 非空断言（!）：告诉 TS 我保证 $http 已经挂载过了
      const res = await app.$http.get(url);

      const title2Arr = (res.tutor_activity_intro || "").split("&");
      const title3Arr = (res.topic_img || "").split("&");
      const title4Arr = (res.top_img || "").split("&");
      // 把banner列表放进store
      store.setPointsBannerList(res.points_banner_list || []);
      this.setData({
        // pointsBannerList: res.points_banner_list || [],不需要 setData —— 已经由 store 绑定自动注入
        title1: res.tutor_activity_title,
        title2: title2Arr[0] || "",
        title2_en: title2Arr[1] || "",
        title2_1: res.member_article,
        title3: title3Arr[0] || "",
        title3_en: title3Arr[1] || "",
        title4: title4Arr[0] || "",
        title4_en: title4Arr[1] || "",
        is_show_settledIn: res.is_show_settledIn || 1,
      });
    } catch (err) {
      console.error("获取banner失败", err);
      // wx.showToast({ title: '加载失败', icon: 'none', duration: 1500 })
      Toast.fail("加载失败");
    }
  },

  // 新季穿搭
  async getNewSeasonList() {
    try {
      const app = getApp<IAppOption>();
      const { data: res } = await app.$http.post("", {
        method: "goods.NewSeasonList",
        show_type: 3,
      });

      this.setData({ newSeasonList: res });
    } catch (e) {
      console.error(e);
    }
  },

  /** 同一个方法：首次/刷新 + 加载更多 */
  async getGoodsList(options: GetGoodsListOptions = {}) {
    const { reset = false } = options;
    // 1) 并发保护 & 是否还有更多（加载更多场景才判断 hasMore）
    if (this.data.loading) return;
    if (!reset && !this.data.hasMore) return;
    try {
      if (reset) {
        // 2) 重置：回第一页并清空
        this.setData({
          page: 1,
          goodsList: [],
          hasMore: true,
        });
      }
      this.setData({ loading: true });

      const app = getApp<IAppOption>();
      const { data: res } = await app.$http.post("", {
        method: "goods.goodsList",
        page: this.data.page,
        pageSize: this.data.pageSize,
      });

      // 3) 按你现有写法：res 就是列表
      const newList: any[] = Array.isArray(res) ? res : [];

      // 4) 是否还有更多：本次返回条数 >= pageSize
      const hasMore = newList.length >= this.data.pageSize;

      // 5) 追加或替换
      const merged = reset ? newList : this.data.goodsList.concat(newList);

      this.setData({
        goodsList: merged,
        hasMore,
        page: hasMore ? this.data.page + 1 : this.data.page, // 仅在还有更多时自增页码
      });
    } catch (e) {
      console.error("获取商品失败", e);
      wx.showToast({ title: "获取商品失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
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
      const app = getApp<IAppOption>(); // 每一个请求里面都要写这句

      // 这里走 POST 请求（只传 method → 会自动拼接 baseUrl）
      // const res = await app.$http.post('', { method: 'categories.getallcat' })
      const { data: res } = await app.$http.post<Category[]>("", { method: "categories.getallcat" });

      this.setData({
        categoryList: res || [],
      });
      // console.log(res)
    } catch (err) {
      console.error("获取分类失败", err);
    } finally {
    }
  },

  /**
   * ------------------------------- 事件点击 ----------------------------------
   */

  handlerCate(e) {
    // console.log(e.currentTarget.dataset.id)
    const cateId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/cate/cate",
    });
  },
  gotoGoodsDetail(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    wx.navigateTo({
      url: `/packageA/pages/goods_detail/goods_detail?id=${id}`,
    });
  },
  onPrimaryBtnTap() {
    if (!this.data.isLoggedIn) {
      Toast.fail("去登录");
      // 未登录 → 去登录页
      wx.navigateTo({
        url: "/pages/one-login/one-login",
      });
      return;
    }
    if (this.data.pointsBannerList) {
      const goods_id = this.data.pointsBannerList[0].banner_value;
      wx.navigateTo({
        url: `/packageA/pages/good_detail/good_detail?id=${goods_id}`,
      });
    } else {
      wx.showToast({
        title: "未获取到商品ID",
        icon: "none",
      });
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * ------------------------------- 监控事件 ----------------------------------
   */
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 拿到自定义导航栏的高度，然后给页面一个padding-bototm，不然内容显示不全
    // const sys = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    // const safeBottom = sys.safeArea ? Math.max(0, sys.screenHeight - sys.safeArea.bottom) : 0;
    // this.setData({ safeBottomTarbar: safeBottom });
    const token = wx.getStorageSync("token");
    if (token) {
      Toast.success("已经登录");
      this.setData({ isLoggedIn: true });
    } else {
      Toast.fail("未登陆");
    }
  },

  // 新季穿搭的指示器
  // 动画开始时就让 UI 放大（视觉即时），不要改 currentControlled
  onSeasonChange(e) {
    const { current, source } = e.detail || {};
    const len = this.data.newSeasonList.length || 0;
    if (!len) return;

    // 可选：过滤掉未知来源，降低噪声（触摸/自动切换两种保留）
    if (source && source !== "autoplay" && source !== "touch") return;

    const idx = current % len;
    if (idx !== this.data.uiIndex) {
      this.setData({ uiIndex: idx }); // ✅ 只改 UI 索引，立即放大
    }
  },
  // 动画结束时再“校准”受控 current，避免互相刺激导致抖动
  onSeasonFinish(e) {
    const len = this.data.newSeasonList.length || 0;
    if (!len) return;
    const idx = e.detail.current % len;

    if (idx !== this.data.currentControlled) {
      this.setData({ currentControlled: idx }); // ✅ 只在动画结束时同步
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.storeBindings.destroyStoreBindings();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 下拉刷新：与首次一样，重置后加载
    this.getGoodsList({ reset: true }).finally(() => wx.stopPullDownRefresh());
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.getGoodsList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
