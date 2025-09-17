// utils/post-login.ts
import { store } from "../store/store"
import { buildUrl } from "./util"

export function redirectAfterLogin() {
  const info = store.redirectInfo
  // 未记录：给个默认（比如回首页，并恢复 tabbar）
  if (!info) {
    store.updateActiveTabBarIndex(0)
    wx.switchTab({ url: "/pages/home/home" })
    return
  }

  // 优先：如果来源页还在堆栈里，用 navigateBack 回去（保留原页面状态）
  const pages = getCurrentPages()
  const targetIndex = pages.findIndex(p => ("/" + (p as any).route) === info.url)
  if (info.openType === "back" && targetIndex !== -1) {
    const delta = pages.length - 1 - targetIndex
    if (delta > 0) {
      wx.navigateBack({ delta })
      store.setRedirectInfo(null)
      return
    }
  }

  // 兜底：按记录的 openType + url + params 打开
  const fullUrl = buildUrl(info.url, info.params)

  switch (info.openType) {
    case "switchTab":
      if (typeof info.tabIndex === "number") {
        store.updateActiveTabBarIndex(info.tabIndex)
      }
      wx.switchTab({ url: fullUrl })
      break
    case "redirectTo":
      wx.redirectTo({ url: fullUrl })
      break
    case "reLaunch":
      wx.reLaunch({ url: fullUrl })
      break
    default:
      // navigateTo 或未知，就用 redirectTo，避免多压一层栈
      wx.redirectTo({ url: fullUrl })
      break
  }

  store.setRedirectInfo(null)
}
