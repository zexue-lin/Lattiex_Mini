// 在这个ts里面，专门用来创建 store 的实例对象
// 全局数据共享池
import { observable, action } from "mobx-miniprogram";

// 登录后跳回原来的页面
export type OpenType = "navigateTo" | "redirectTo" | "switchTab" | "reLaunch" | "back";
export interface RedirectInfo {
  /** 登录后怎么回去：优先 back（若能算出 delta），否则按 url + openType
	 * 1) openType 该怎么选？

		"back"：默认优先用它，表示“登录完直接返回到当前来源页”（不重新创建页面，保留页面状态）。

		"switchTab"：目标页是 tabBar 时必须用它。

		"redirectTo"：想用同一路由替换当前页（不增加栈层数）。

		"navigateTo"：登录后要新开一个普通页面（加一层栈），一般很少用在“回跳”。

		"reLaunch"：清空栈后重开一个页面（如登录后想回到一个干净的首页流程）。

		实战建议：能 back 就 back；目标是 tabBar 再用 switchTab；其他少数场景再用 redirectTo。
	 */
  openType: OpenType;
  /** 来源页的路由（以 / 开头，如 /packageA/pages/good_detail/good_detail） */
  url: string;
  /** 页面参数（会拼接到 url 上） */
  params?: Record<string, any>;
  /** 若来源是 tabBar，记录它的索引，登录成功 switchTab 时恢复选中态 */
  tabIndex?: number;
}

export type PointsBanner = {
  banner_img: string;
  banner_img_src: string;
  banner_type: string;
  banner_value: string;
  price: string;
  // [k: string]: any;
};

// 定义 state 的类型 （定义接口）
interface IStore {
  activeTabBarIndex: number; // 当前激活的tabBar
  cartNum: number; // 购物车内商品数量
  updateCartNum(step: number): void;
  updateActiveTabBarIndex(index: number): void;

  updateNumCartNumReduce(step: number): void;
  numA: number;
  numB: number;
  readonly sum: number;

  // ✅ 新增：微信小程序配置
  wx_appid: string;
  wx_app_secret: string;
  setWxMiniConfig(appid: string, secret: string): void;

  // ✅ 新增：底部安全区像素
  safeBottom: number;

  // ✅ 新增：banner 列表
  pointsBannerList: PointsBanner[];
  setPointsBannerList(list: PointsBanner[]): void;

  // ✅新增：登录后跳转信息
  redirectInfo: RedirectInfo | null;
  setRedirectInfo(info: RedirectInfo | null): void;

  updateSafeBottom(px: number): void;
}

export const store = observable<IStore>({
  // 数据字段
  activeTabBarIndex: 0,
  cartNum: 10,

  numA: 1,
  numB: 90,
  // 计算属性
  get sum() {
    return this.numA + this.numB;
  },

  // ===== 新增：小程序配置，默认空
  wx_appid: "",
  wx_app_secret: "",
  setWxMiniConfig: action(function (this: IStore, appid: string, secret: string) {
    this.wx_appid = appid || "";
    this.wx_app_secret = secret || "";
    // 可选：本地缓存，避免冷启动还没拉到配置
    try {
      wx.setStorageSync("wx_mini_cfg", { appid: this.wx_appid, secret: this.wx_app_secret });
    } catch (_) {}
  }),

  // ✅ 默认 0
  safeBottom: 0,

  // ====== 新增字段：banner 缓存 ======
  pointsBannerList: [],

  // actions 方法，用来修改 store 中的数据;
  // (因为直接修改很危险，只能通过我们提供的方法来修改共享数据)
  updateActiveTabBarIndex: action(function (this: IStore, index: number) {
    this.activeTabBarIndex = index;
  }),
  updateCartNum: action(function (this: IStore, step: number) {
    this.cartNum += step;
  }),
  updateNumCartNumReduce: action(function (this: IStore, step: number) {
    this.cartNum += step;
  }),

  // 新增
  redirectInfo: null,
  setRedirectInfo: action(function (this: IStore, info: RedirectInfo | null) {
    this.redirectInfo = info;
  }),

  // ✅ 新增：更新 safeBottom
  updateSafeBottom: action(function (this: IStore, px: number) {
    this.safeBottom = px >= 0 ? px : 0;
  }),

  // ✅ 新增：一次性写入 banner 列表
  setPointsBannerList: action(function (this: IStore, list: PointsBanner[]) {
    this.pointsBannerList = Array.isArray(list) ? list : [];
  }),
});
