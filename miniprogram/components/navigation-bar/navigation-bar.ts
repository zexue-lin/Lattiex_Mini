Component({
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    extClass: {
      type: String,
      value: '',
    },
    title: {
      type: String,
      value: '',
    },
    background: {
      type: String,
      value: '',
    },
    color: {
      type: String,
      value: '',
    },
    back: {
      type: Boolean,
      value: true,
    },
    loading: {
      type: Boolean,
      value: false,
    },
    homeButton: {
      type: Boolean,
      value: false,
    },
    animated: {
      // 显示隐藏的时候opacity动画效果
      type: Boolean,
      value: true,
    },
    show: {
      // 显示隐藏导航，隐藏的时候navigation-bar的高度占位还在
      type: Boolean,
      value: true,
      observer: '_showChange',
    },
    // back为true的时候，返回的页面深度
    delta: {
      type: Number,
      value: 1,
    },
    fixed: {
      // ✅ 新增：是否固定顶部
      type: Boolean,
      value: true,
    },
    // ✅ 新增：是否覆盖内容（不占位）
    /**
     * 新增属性：overlayContent（默认 false）。

      overlayContent=false（默认）：导航固定 + 占位（内容被顶下去）。

      overlayContent=true：导航固定 + 不占位（内容从 0 顶到导航下面，适合透明渐变首屏）。

      删除 withPlaceholder（或保留但不再使用），占位逻辑统一由 overlayContent 控制。

      “隐藏时也占位”的需求：当 overlayContent=false 时，无论 show true/false 都占位；当 overlayContent=true 时永不占位。
     */
    overlayContent: { type: Boolean, value: false },
    withPlaceholder: {
      // ✅ 新增：固定时是否自动占位
      type: Boolean,
      value: true,
    },
    useCover: {
      // ✅ 新增：是否使用 cover-view 版本
      type: Boolean,
      value: false,
    },
    /**
     * ✅ 是否启用随滚动渐变（适用于 background="transparent" 场景）
     * 开启后会根据 scrollTop 和 fadeRange 计算 rgba(255,255,255, α)
     */
    fadeWithScroll: { type: Boolean, value: false },

    /** ✅ 渐变区间：从 0 ~ fadeRange px 线性过渡到完全不透明 */
    fadeRange: { type: Number, value: 200 },

    /**
     * ✅ 当前页面滚动距离（由页面 onPageScroll 传入）
     * 组件内部根据该值计算透明度
     */
    scrollTop: { type: Number, value: 0 },
  },

  /**
   * 组件的初始数据
   */
  data: {
    displayStyle: '',
    placeholderHeight: 0, // ✅ 新增：占位高度（px）
    bgComputed: '', // ✅ 计算后的背景（优先于 props.background）
  },

  observers: {
    /** ✅ 根据滚动与开关计算背景色 */
    'scrollTop, fadeWithScroll, fadeRange, background'(scrollTop: number, fadeWithScroll: boolean, fadeRange: number) {
      if (!fadeWithScroll) {
        // 未开启渐变：不干预外部 background
        this.setData({ bgComputed: '' })
        return
      }
      // 线性透明度 0~1
      const alpha = Math.max(0, Math.min(1, (scrollTop || 0) / (fadeRange || 1)))
      // 目标为“白色” -> rgba(255,255,255, α)
      const bg = `rgba(255,255,255, ${alpha})`
      this.setData({ bgComputed: bg })
    },
  },

  // 用同步 API，避免异步竞态在真机上高度为 0
  lifetimes: {
    attached() {
      var rect = wx.getMenuButtonBoundingClientRect()
      var sys = wx.getSystemInfoSync()
      var isAndroid = sys.platform === 'android'
      var isDevtools = sys.platform === 'devtools'

      this.setData({
        ios: !isAndroid,
        innerPaddingRight: 'padding-right: ' + (sys.windowWidth - rect.left) + 'px',
        leftWidth: 'width: ' + (sys.windowWidth - rect.left) + 'px',
        safeAreaTop:
          isDevtools || isAndroid
            ? 'height: calc(var(--height) + ' +
              (sys.safeArea && sys.safeArea.top ? sys.safeArea.top : 0) +
              'px); padding-top: ' +
              (sys.safeArea && sys.safeArea.top ? sys.safeArea.top : 0) +
              'px'
            : '',
      })

      // ✅ 与你旧组件一致：总高 = 胶囊底 + (胶囊顶 - 状态栏高)
      var status = sys.statusBarHeight || 0
      var navHeight = rect.bottom + (rect.top - status)
      this.setData({ placeholderHeight: navHeight })

      // 若页面需要用高度做布局
      this.triggerEvent('ready', { height: navHeight })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _showChange(show: boolean) {
      const animated = this.data.animated
      let displayStyle = ''
      if (animated) {
        displayStyle = `opacity: ${show ? '1' : '0'};transition:opacity 0.5s;`
      } else {
        displayStyle = `display: ${show ? '' : 'none'}`
      }
      this.setData({
        displayStyle,
      })
    },
    back() {
      const data = this.data
      if (data.delta) {
        wx.navigateBack({
          delta: data.delta,
        })
      }
      this.triggerEvent('back', { delta: data.delta }, {})
    },
  },
})
