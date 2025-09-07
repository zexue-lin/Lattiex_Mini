// request.ts
interface RequestOptions {
  baseUrl?: string
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  header?: Record<string, string>
}

// 请求拦截器 / 响应拦截器类型
type RequestInterceptor = (options: RequestOptions) => RequestOptions | Promise<RequestOptions>
type ResponseInterceptor<T = any> = (response: T) => T | Promise<T>

class Request {
  baseUrl: string
  header: Record<string, string>
  requestInterceptor?: RequestInterceptor
  responseInterceptor?: ResponseInterceptor

  constructor(options: RequestOptions = {}) {
    this.baseUrl = options.baseUrl || ''
    this.header = options.header || {}
  }

  setRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptor = interceptor
  }

  setResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptor = interceptor
  }

  get(url: string, data: Record<string, any> = {}) {
    return this._request({ url, method: 'GET', data })
  }

  post(url: string, data: Record<string, any> = {}) {
    return this._request({ url, method: 'POST', data })
  }

  put(url: string, data: Record<string, any> = {}) {
    return this._request({ url, method: 'PUT', data })
  }

  delete(url: string, data: Record<string, any> = {}) {
    return this._request({ url, method: 'DELETE', data })
  }

  private async _request(options: RequestOptions) {
    // 合并配置
    let reqOptions: RequestOptions = {
      url: this.baseUrl + (options.url || ''),
      method: options.method || 'GET',
      data: options.data || {},
      header: { ...this.header, ...(options.header || {}) }
    }

    // 请求拦截器
    if (this.requestInterceptor) {
      reqOptions = await this.requestInterceptor(reqOptions)
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: reqOptions.url!,
        method: reqOptions.method!,
        data: reqOptions.data,
        header: reqOptions.header,
        success: async (res) => {
          let result: any = res
          if (this.responseInterceptor) {
            result = await this.responseInterceptor(res)
          }
          resolve(result)
        },
        fail: (err) => reject(err)
      })
    })
  }
}

export const $http = new Request({})
