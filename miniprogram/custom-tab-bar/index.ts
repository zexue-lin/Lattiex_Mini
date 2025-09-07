// custom-tab-bar/index.ts
Component({
  options:{
    styleIsolation: 'shared',
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
    active: 0,
    "list": [
      {
        "pagePath": "pages/home/home",
        "text": "首页",
        "iconPath": "../static/tabBar/ic_main1.png",
        "selectedIconPath": "../static/tabBar/ic_main1_s.png"  
      },
      {
        "pagePath":  "pages/video/video",
        "text": "视频",
        "iconPath": "../static/tabBar/ic_main2.png",
        "selectedIconPath": "../static/tabBar/ic_main2_s.png"
      }, 
      {
        "pagePath":  "pages/points_mall/points_mall",
        "text": "积分",
        "iconPath": "../static/tabBar/ic_main3.png",
        "selectedIconPath": "../static/tabBar/ic_main3_s.png"
      }, 
      {
        "pagePath":  "pages/cart/cart",
        "text": "购物车",
        "iconPath": "../static/tabBar/ic_main4.png",
        "selectedIconPath": "../static/tabBar/ic_main4_s.png",
        info: 2
      },
      {
        "pagePath": "pages/my/my",
        "text": "朕的",
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
      this.setData({ active: event.detail });
    },
  }
})