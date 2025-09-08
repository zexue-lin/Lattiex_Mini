// 在这个ts里面，专门用来创建 store 的实例对象
// 全局数据共享池
import { observable, action } from 'mobx-miniprogram'

// 定义 state 的类型 （定义接口）
interface IStore {
  numA: number
  numB: number
  activeTabBarIndex: number
  readonly sum: number
  updateNum1(step: number): void
  updateNum2(step: number): void
  updateActiveTabBarIndex(index: number): void
}

export const store = observable<IStore>({
  // 数据字段
  numA: 1,
  numB: 90,
  activeTabBarIndex: 0,

  // 计算属性
  get sum() {
    return this.numA + this.numB
  },

  // actions 方法，用来修改 store 中的数据;
  // (因为直接修改很危险，只能通过我们提供的方法来修改共享数据)
  updateNum1: action(function (this: IStore, step: number) {
    this.numA += step
  }),
  updateNum2: action(function (this: IStore, step: number) {
    this.numB += step
  }),
  updateActiveTabBarIndex: action(function (this: IStore, index: number) {
    this.activeTabBarIndex = index
  }),
})
