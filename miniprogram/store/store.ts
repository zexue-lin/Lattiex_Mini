// 在这个ts里面，专门用来创建 store 的实例对象
// 全局数据共享池
import { observable, action } from "mobx-miniprogram";

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
});
