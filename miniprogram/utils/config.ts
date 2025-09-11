// utils/config.ts

// 定义环境枚举
export enum Env {
  PROD = "prod",
  DEV = "dev",
}

// 正式环境配置
const prodConfig = {
  baseUrl: "https://zhenda.wdzhengda.com/api.html",
  api_url_domain: "https://zhenda.wdzhengda.com",
  api_url_platform_config: "https://zhenda.wdzhengda.com/api/common/jshopconf",
  api_url_articleURL: "https://zhenda.wdzhengda.com/h5/article?id=",
};

// 测试环境配置
const devConfig = {
  baseUrl: "http://110.41.54.76:25411/api.html",
  api_url_domain: "http://110.41.54.76:25411",
  api_url_platform_config: "http://110.41.54.76:25411/api/common/jshopconf",
  api_url_articleURL: "http://110.41.54.76:25411/h5/article?id=",
};

// 当前使用的环境（切换只改这里）
export const currentEnv = Env.PROD;
// export const currentEnv = Env.DEV

// 最终导出配置
export const config = currentEnv === Env.PROD ? prodConfig : devConfig;
