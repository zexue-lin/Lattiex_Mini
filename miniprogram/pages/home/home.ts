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

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pointsBannerList: [] as any[],
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getSwpierList(),
      this.getCategoryList(),
      // 获取新季穿搭
      this.getNewSeasonList();
    // 直接从mobx里面拿到tabbar的高度
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ["safeBottom"], // 直接拿来用
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
      this.setData({
        pointsBannerList: res.points_banner_list || [],
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
   * 事件点击----------------------------------
   */

  handlerCate(e) {
    // console.log(e.currentTarget.dataset.id)
    const cateId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/cate/cate",
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 拿到自定义导航栏的高度，然后给页面一个padding-bototm，不然内容显示不全
    // const sys = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    // const safeBottom = sys.safeArea ? Math.max(0, sys.screenHeight - sys.safeArea.bottom) : 0;
    // this.setData({ safeBottomTarbar: safeBottom });
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
