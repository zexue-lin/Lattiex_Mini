// 在这个ts里面，专门用来创建 store 的实例对象
// 全局数据共享池
import { observable, action } from 'mobx-miniprogram'

export const store = observable({
  numA : 1,
  numB : 2,
  // 计算属性
  get sum(){
    return this.numA + this.numB
  },
  // actions 方法，用来修改 store 中的数据;
  // (因为直接修改很危险，只能通过我们提供的方法来修改共享数据)
  updateNum1: action(function (step) {
    this.numA += step
  }),
  updateNum2: action(function (step) {
    this.numB += step
  }),
})
