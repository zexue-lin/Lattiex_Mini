// 在这个ts里面，专门用来创建 store 的实例对象
// 全局数据共享池
import { observable, action } from "mobx-miniprogram";

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

  // ✅ 新增：底部安全区像素
  safeBottom: number;

  // ✅ 新增：banner 列表
  pointsBannerList: PointsBanner[];
  setPointsBannerList(list: PointsBanner[]): void;

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

  // ✅ 新增：更新 safeBottom
  updateSafeBottom: action(function (this: IStore, px: number) {
    this.safeBottom = px >= 0 ? px : 0;
  }),

  // ✅ 新增：一次性写入 banner 列表
  setPointsBannerList: action(function (this: IStore, list: PointsBanner[]) {
    this.pointsBannerList = Array.isArray(list) ? list : [];
  }),
});
