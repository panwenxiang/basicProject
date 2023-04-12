import Axios from 'axios'
import { bhMessage, removeItem } from '@/utlis/utli'
import { ACCESS_TOKEN } from '@/store/const'

const VueAxios = {
  vm: {},
  install(Vue, instance) {
    if (this.installed) {
      return
    }
    this.installed = true

    if (!instance) {
      // eslint-disable-next-line no-console
      console.error('You have to install axios')
      return
    }

    Vue.axios = instance

    Object.defineProperties(Vue.prototype, {
      axios: {
        get: function get() {
          return instance
        },
      },
      $http: {
        get: function get() {
          return instance
        },
      },
    })
  },
}

const request = Axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 20000,
})

//异常处理器
const errorhandler = (error) => {
  const { response = {} } = error
  const data = response['data'] || {}
  if ([403,503].includes(data['code'])) {
    bhMessage.error(data.message)
  }
  return Promise.resolve(error)
}

// 检查当前请求的接口路径 是否需要token
const checkUrlNoNeedToken = (path) => {
  const noUseTokenPathList = ['login',]
  const flag = noUseTokenPathList.find(item => {
    return path.indexOf(item) > -1
  })
  return !!flag
}

//请求拦截器
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('access-token')
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (token && !checkUrlNoNeedToken(config.url)) {
    config.headers['token'] = token
  } else {
    delete config.headers.token
  }
  return config
}, errorhandler)

//响应拦截器
request.interceptors.response.use((response) => {
  if (response.data.code === 10002) {
    bhMessage.error(response.data.message || 'error')
    removeItem(ACCESS_TOKEN)
    window.location.href = '/login'
  }else if ((response.data.code < 200 || response.data.code > 299) && response.data.code !== 23030) {
    // 对接口的错误信息 统一进行提示 非200的状态码 都提示
    bhMessage.error(response.data.message || 'error')
  }
  return response.data
}, errorhandler)

const installer = {
  vm: {},
  install(Vue) {
    Vue.use(VueAxios, request)
  },
}

export default request

export { installer as VueAxios, request as axios }
