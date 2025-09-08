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

  get<T = any>(url: string, data: Record<string, any> = {}): Promise<T> {
    return this._request<T>({ url, method: 'GET', data })
  }

  post<T = any>(url: string, data: Record<string, any> = {}): Promise<T> {
    return this._request<T>({ url, method: 'POST', data })
  }

  put<T = any>(url: string, data: Record<string, any> = {}): Promise<T> {
    return this._request<T>({ url, method: 'PUT', data })
  }

  delete<T = any>(url: string, data: Record<string, any> = {}): Promise<T> {
    return this._request<T>({ url, method: 'DELETE', data })
  }

  private async _request<T = any>(options: RequestOptions): Promise<T> {
    // 判断是不是完整的url
    const isAbsolute = options.url?.startsWith('http')

    // 如果是完整的Url，就直接用，不拼接 baseUrl
    // 如果不是完整的Url，就认为是走baseUrl （通常的POST，需要传 method 等）
    let reqUrl = ''
    if (isAbsolute) {
      reqUrl = options.url! // !作用：告诉 TypeScript 编译器：“我知道这个值不会是 null 或 undefined，不要报错”。
    } else {
      reqUrl = this.baseUrl // ✅ 不拼接，而是直接走 baseUrl
    }

    // 合并配置
    let reqOptions: RequestOptions = {
      url: reqUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header: { ...this.header, ...(options.header || {}) },
    }

    // 请求拦截器
    if (this.requestInterceptor) {
      reqOptions = await this.requestInterceptor(reqOptions)
    }

    return new Promise<T>((resolve, reject) => {
      wx.request({
        url: reqOptions.url!,
        method: reqOptions.method!,
        data: reqOptions.data,
        header: reqOptions.header,
        success: async res => {
          let result: any = res
          if (this.responseInterceptor) {
            result = await this.responseInterceptor(res)
          }
          resolve(result as T) // ✅ 返回泛型
        },
        fail: err => reject(err),
      })
    })
  }
}

export const $http = new Request({})
