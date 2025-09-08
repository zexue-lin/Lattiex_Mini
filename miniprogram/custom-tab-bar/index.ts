// custom-tab-bar/index.ts
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { store } from '../store/store'

Component({
  options:{
    styleIsolation: 'shared',
  },
  // 挂载behaviors
  behaviors: [storeBindingsBehavior],
  storeBindings:{
    store,
    fields:{
      sum: 'sum',
      active: 'activeTabBarIndex' // 将store里定义的映射到组件里面使用
    },
    actions: {
      updataActive: 'updateActiveTabBarIndex'
    },
  },
  /**
   * 把sum的值转存到下面购物车的info上面
   * 使用数据监听器，监听sum的变化然后给info赋值
   */
  observers: {
    'sum': function (val) {
      this.setData({
        'list[3].info' : val
      })
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    "list": [
      {
        "pagePath": "/pages/home/home",
        "text": "首页",
        "iconPath": "../static/tabBar/ic_main1.png",
        "selectedIconPath": "../static/tabBar/ic_main1_s.png"  
      },
      {
        "pagePath":  "/pages/video/video",
        "text": "视频",
        "iconPath": "../static/tabBar/ic_main2.png",
        "selectedIconPath": "../static/tabBar/ic_main2_s.png"
      }, 
      {
        "pagePath":  "/pages/points_mall/points_mall",
        "text": "积分",
        "iconPath": "../static/tabBar/ic_main3.png",
        "selectedIconPath": "../static/tabBar/ic_main3_s.png"
      }, 
      {
        "pagePath":  "/pages/cart/cart",
        "text": "购物车",
        "iconPath": "../static/tabBar/ic_main4.png",
        "selectedIconPath": "../static/tabBar/ic_main4_s.png",
        info: 0
      },
      {
        "pagePath": "/pages/my/my",
        "text": "我的",
        "iconPath": "../static/tabBar/ic_main5.png",
        "selectedIconPath": "../static/tabBar/ic_main5_s.png"
      }
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event) {
      // event.detail 的值为当前选中项的索引
      this.updataActive(event.detail)
      wx.switchTab({
        url: this.data.list[event.detail].pagePath
      })
    },
  }
})