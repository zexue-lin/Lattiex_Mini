export const formatTime = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day].map(formatNumber).join("/") + " " + [hour, minute, second].map(formatNumber).join(":");
};

const formatNumber = (n: number) => {
  const s = n.toString();
  return s[1] ? s : "0" + s;
};

// 获取当前页
export function getCurrentPageInfo(): { url: string; params: Record<string, any> } {
  const pages = getCurrentPages();
  const curr = pages[pages.length - 1];
  // @ts-ignore
  const route = "/" + curr.route;
  // @ts-ignore
  const options = curr.options || {};
  return { url: route, params: options };
}

//构造回跳
export function buildUrl(url: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) return url;
  const qs = Object.keys(params)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
  return `${url}?${qs}`;
}
