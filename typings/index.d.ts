/// <reference path="./types/index.d.ts" />

import { config } from '../miniprogram/utils/config'
import { $http } from '../miniprogram/utils/request'

// 用 declare global 来扩展，而不是重新定义
declare global {
  interface IAppOption {
    globalData: {
      userInfo?: WechatMiniprogram.UserInfo
      config: typeof config
    }
    $http?: typeof $http // 改成可选
    userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback
  }
}

export {}
