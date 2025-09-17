import { reserveArrayBuffer } from "mobx-miniprogram/dist/internal";

import Toast from "@vant/weapp/toast/toast";
import { store } from "../../../store/store";
import { getCurrentPageInfo } from "../../../utils/util";
// packageA/pages/goods_detail/goods_detail.ts
Page({
  /**
   * 页面的初始数据
   */
  data: {
    goods_info: {}, // 商品信息
    goods_param: [], // 商品参数
    productBean: {}, // 商品product属性
    product_id: "",
    thead: [],
    tbody: [],

    currentSwiper: 0,
    totalSwiper: 0,
    isMuted: true, // 初始静音
    isPlaying: true,

    sizeCards: [], // 尺码指南
    default_spes_desc: [], // 默认尺码
    selectedSpecs: "",
    showfwsm: false, // 服务说明弹窗
    showyfx: false, // 运费险弹窗
    Size: ["1"], // 尺码默认打开
    gmxzNodes: "", // rich-text 内容 购买须知
    loadingGmxz: false, // 加载中
    loadFailGmxz: false, // 失败标记
    showPurchasePop: false, // 购买-加入购物车-弹窗
    isAddCart: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const goods_id = options.goods_id || options.id;

    this.getGoodsDetail(goods_id).then(() => {
      this.getParamsData(goods_id);
    });
  },

  async getGoodsDetail(goods_id) {
    try {
      const app = getApp<IAppOption>();
      const token = wx.getStorageSync("token") || "";
      const { data: res } = await app.$http.post("", {
        method: "goods.getdetial",
        id: goods_id,
        token,
      });

      const album = Array.isArray(res.album) ? res.album : [];
      const video_url_raw = res.video_url;
      // 后端可能给 0 / false / 空串 (md这里给的就是空串)
      const hasVideo = typeof video_url_raw === "string" && video_url_raw.length > 5;
      const video_url = hasVideo ? video_url_raw : "";

      const totalSwiper = album.length + (hasVideo ? 1 : 0);

      const mediaList = hasVideo
        ? [{ type: "video", url: video_url, cover: res.video_cover || "" }].concat(
            album.map((u) => ({
              type: "img",
              url: u,
            }))
          )
        : album.map((u) => ({ type: "img", url: u }));

      // ---- 尺码数据安全处理 ----
      const size = res.size || {};
      const thead = Array.isArray(size.thead) ? size.thead : [];
      const tbody = Array.isArray(size.tbody) ? size.tbody : [];

      let sizeCards = [];
      if (thead.length && tbody.length) {
        const attrNames = thead
          .slice(1)
          .map((i) => i && i.name)
          .filter(Boolean);
        sizeCards = tbody.map((row) => {
          const r = Array.isArray(row) ? row : [];
          const sizeLabel = r[0] || "";
          const pairs = r.slice(1).map((v, i) => ({
            label: attrNames[i] || "",
            value: v || "",
          }));
          return { size: sizeLabel, pairs };
        });
      }

      // ---- 其他字段兜底/归一化 ----
      const isfav = res.isfav === true || res.isfav === "true" || res.isfav === 1 || res.isfav === "1";

      const default_spes_desc = (res.product && res.product.default_spes_desc) || [];
      const product_id = (res.product && res.product.id) || res.product_id || res.id || "";

      const show_type = Number(res.show_type) || 0;
      const isPoints = show_type === 2 || show_type === 4;

      const recImgs = Array.isArray(res.pairRecommendations) ? res.pairRecommendations : [];

      this.setData(
        {
          goods_info: { ...res, isfav }, // 标准化 isfav
          productBean: res.product || {},
          product_id,
          buyBtnText: isPoints ? "立即兑换" : "立即购买",
          showCartBtn: !isPoints,
          default_spes_desc,
          totalSwiper,
          sizeCards,
          show_type,
          mediaList,
          recImgs,
        },
        () => {
          this.initDefaultSelected();
          //  setTimeout(() => this.setData({ showTipBox: true }), 5000)
        }
      );
    } catch (e) {
      console.error("获取商品详情失败", e);
    }
  },
  async getParamsData(goods_id) {
    try {
      const app = getApp<IAppOption>();
      const { data: res } = await app.$http.post("", {
        method: "goods.getgoodsparams",
        id: goods_id,
      });
      this.setData({ goods_param: res });
    } catch (e) {
      console.error("获取商品参数详情失败", e);
    }
  },

  // 初始化默认选中的规格
  initDefaultSelected() {
    const defaultSpecs = {};
    if (!this.data.default_spes_desc) {
      return;
    }

    this.data.default_spes_desc.forEach((category) => {
      const defaultItem = category.fenlei.find((item) => item.is_default);
      if (defaultItem) {
        defaultSpecs[category.items] = defaultItem.name;
      }
    });
    this.setData(
      {
        selectedSpecs: defaultSpecs,
      },
      () => {
        console.log("默认选中状态：" + JSON.stringify(this.data.selectedSpecs));
      }
    );
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  // -------------点击事件-------------
  /* 若轮播切换到下一页需要暂停，可在 swiperChange 里加： */
  swiperChange(e) {
    const newIdx = e.detail.current;
    const oldIdx = this.data.currentSwiper;

    this.setData({ currentSwiper: newIdx });
    // 初始化 ctx
    this.videoCtx = this.videoCtx || wx.createVideoContext("swiperVideo", this);

    /* ① 离开第 1 页 → 暂停并手动把 isPlaying 设 false */
    if (oldIdx === 0 && newIdx !== 0) {
      this.videoCtx.pause();
      this.setData({ isPlaying: false }); // ★ 立即同步状态
      return; // 直接返回，避免再执行下面逻辑
    }

    /* ② 回到第 1 页且当前没在播放 → 自动播放 */
    if (newIdx === 0 && !this.data.isPlaying) {
      this.videoCtx.play();
      this.setData({ isPlaying: true }); // ★ 播放中，隐藏中心按钮
    }
  },

  // 切换静音 / 有声
  toggleMute() {
    this.setData({ isMuted: !this.data.isMuted });

    this.videoCtx = this.videoCtx || wx.createVideoContext("swiperVideo", this);
    if (this.data.isMuted) {
      this.videoCtx.mute();
    } else {
      this.videoCtx.unmute();
    }
  },
  // 直接使用微信自带的
  openViewer(e) {
    const idx = Number(e.currentTarget.dataset.idx || 0); // 当前下标

    // ↓ 兼容极老版本（可选）
    if (!wx.canIUse("previewMedia")) {
      wx.showToast({ title: "微信版本过低，无法预览", icon: "none" });
      return;
    }

    // 把 mediaList 转成 previewMedia 需要的 sources
    const sources = this.data.mediaList.map((m) => {
      return m.type === "video"
        ? { url: m.url, type: "video", poster: m.poster || "" }
        : {
            url: m.url,
            type: "image",
          };
    });

    wx.previewMedia({
      sources,
      current: idx,
    });
  },

  onShowFwsm() {
    this.setData({ showfwsm: true });
  },
  onCloseFwsm() {
    this.setData({ showfwsm: false });
  },
  onShowYfx() {
    this.setData({ showyfx: true });
  },
  onCloseYfx() {
    this.setData({ showyfx: false });
  },
  onShowPurchasePop() {
    this.setData({ showPurchasePop: true });
  },
  onClosePurchasePop() {
    this.setData({ showPurchasePop: false });
  },
  // 打开运费险介绍
  openFreightInsuranceIntro() {
    wx.navigateTo({
      url: `/pages/richText/richText?id=14`,
    });
  },
  // 尺码指南
  onChangeSize(event) {
    this.setData({
      Size: event.detail,
    });
  },
  // 质检报告
  onChangeQuality(event) {
    this.setData({
      Quality: event.detail,
    });
  },
  // 原创声明
  onChangeCopyright(event) {
    this.setData({
      Copyright: event.detail,
    });
  },
  // 购买须知
  onChangePurchaseNotice(event) {
    // 第一次展开且还没加载过
    if (!this.data.gmxzNodes && !this.data.loadingGmxz) {
      this.fetchGmxz();
    }
    this.setData({
      purchaseNotice: event.detail,
    });
  },
  // 获取购买须知html
  async fetchGmxz() {
    try {
      this.setData({ loadingGmxz: true, loadFailGmxz: false });

      const app = getApp<IAppOption>();
      const res = await app.$http.get("https://zhenda.wdzhengda.com/111gmxz.html");

      // console.log(res);
      // 直接把 html 字符串塞给 <rich-text>
      this.setData({
        gmxzNodes: res || "",
        loadingGmxz: false,
      });
    } catch (e) {
      this.setData({
        loadingGmxz: false,
        loadFailGmxz: true,
      });
      console.error("购买须知载失败", e);
    }
  },
  onClickKF() {
    Toast("点击了客服");
    // Toast.success("成功文案");
    // Toast.fail("失败文案");
    // Toast.loading({
    //   message: "加载中...",
    //   forbidClick: true, // 背景不可点击
    // });
  },
  onClickCart() {
    // 上面先引入store
    store.updateActiveTabBarIndex(3); // 先把全局 active 改了
    wx.switchTab({
      url: "/pages/cart/cart",
    });
    Toast("点击了购物车");
  },
  onClickShop() {
    Toast("点击了店铺");
  },
  openDialog(e) {
    const token = wx.getStorageSync("token");
    if (token) {
    } else {
      Toast.fail("未登陆");
      const { url, params } = getCurrentPageInfo();
      store.setRedirectInfo({
        openType: "back",
        url,
        params,
      });
      wx.navigateTo({
        url: "/packageA/pages/one_login/one_login",
      });
    }
    // const type = e.currentTarget.dataset.type;
    // this.setData({ isAddCart: type == "addCart", showPurchasePop: true });
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
