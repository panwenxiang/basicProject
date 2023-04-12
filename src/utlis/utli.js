import { message } from 'ant-design-vue'
import moment from 'moment'

const regStr = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  ip: /^((?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(?:(\/([0-9]+)))?)$/,
  telephone: /^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/,
  mobile: /^1[3|4|5|7|8|9][0-9]{9}$/,
  userName: /^[a-zA-Z\d@_]+$/
}

/**
 * 校验字符串是够满足邮箱格式
 * @param type 选择正则的类型 email ip telephone mobile
 * @param str 传入的字符串
 */

export function regValidate (type, str) {
  if (typeof str !== 'string' || !regStr[type]) return false
  const checkStr = new RegExp(regStr[type])
  return checkStr.test(str)
}

/**
 * 系统自定义全局使用提示 三种类型 success error warn
 * @param options 如果是string 则覆盖description 如果是对象则 覆盖全全配置
 * */
export const bhMessage = {
  success(options) {
    this._fn('success', options)
  },
  error(options) {
    this._fn('error', options)
  },
  warn(options) {
    this._fn('warn', options)
  },
  _fn(type = 'success', options) {
    const typeMap = {
      success: message.success,
      error: message.error,
      warn: message.warning,
    }
    const fn = typeMap[type] || typeMap['success']
    let defaultOptions = {
      message: '提示',
      description: '',
      duration: 1.5,
    }
    if (typeof options === 'string') {
      defaultOptions = options
    } else if (typeof options === 'object') {
      defaultOptions = {
        ...defaultOptions,
        ...options,
      }
    }
    return fn(defaultOptions)
  },
}

/**
 * 替换 文本框中换行符 为 br标签
 * @param str
 * @returns {string|*}
 */
export function replaceLineFeed(str) {
  if (typeof str === 'string') {
    return str.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')
  }
  return str
}

/**
 * 时间字符串格式化
 * @param date 时间字符串、date类型
 * @param format  要格式化的样式
 * @returns {string|*}
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (date) {
    return moment(date).format(format)
  }
  return date
}

/**
 * 页面滚动到顶部，最左侧
 */
export function pageScrollTop() {
  document.querySelector('.basic-layout-right-content.ant-layout').scrollTo(0,0)
}

/**
 * LocalStorage 获取对应key的值
 * @param key 要获取的key, string
 * @returns {string|any}
 */
export function getItem(key) {
  const value = localStorage.getItem(key)
  const isFormat = /^[\[\{]/.test(value)
  if (isFormat) {
    return value ? JSON.parse(value) : {}
  }
  return value
}

/**
 * LocalStorage存储值
 * @param key
 * @param value
 */
export function setItem(key, value) {
  localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value)
}

/**
 * LocalStorage删除某个key
 * @param key
 */
export function removeItem(key) {
  localStorage.removeItem(key)
}

/**
 * 清除 LocalStorage
 */
export function clearAllStorage() {
  localStorage.clear()
}

/**
 * 复制内容到剪切板
 * */
export function handleCopy (data) {
  try {
    const oInput = document.createElement('input')
    oInput.value = data
    document.body.appendChild(oInput)
    oInput.select()
    document.execCommand('Copy')
    oInput.remove()
    return true
  }catch (e) {
    return false
  }
}

/**
 * 判断一个变量是否是 数组
 * @param arr 变量
 * @returns {boolean}
 */
export function isArray (arr) {
  return typeof arr === 'object' && arr instanceof Array
}

/**
 * 导出文件
 * @param data 二进制流
 * @param fileName 文件名
 * @param type 文件类型 excel
 */
export function exportFile(data, fileName, type ) {
  if (data) {
    const typeMap = {
      excel: 'application/vnd.ms-excel'
    }
    const blob = new window.Blob([data], {
      type: typeMap[type]
    })
    const downUrl = window.URL.createObjectURL(blob)

    const a = window.document.createElement('a')
    a.href = downUrl
    a.download = fileName
    a.click()
    setTimeout(() => {
      window.URL.revokeObjectURL(downUrl)
    }, 1000)
  }
}

/**
 * 判断是不是企业微信浏览器
 */

export function isWxBrowser() {
  const { userAgent } = window.navigator
  return userAgent.includes('wxwork')
}

/**
 * 判断是不是移动端
 * @returns {boolean}
 */
export function isMobile() {
  const userAgent = navigator.userAgent.toLowerCase()
  return /ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(userAgent)
}

/**
 * 传入要裁剪的字符串 以及 要裁剪的长度，中文汉字站两位，其他长度为一位
 * @param str
 * @param len
 * @returns {{str: string, overLength: boolean}|*} 裁剪后的结果
 */
export function subStrEllipsis(str, len) {
  if (typeof str !== 'string' || len === 0) {
    return {
      overLength: false,
      str
    }
  }
  let count = 0
  let subStr = ''
  for (const chart of str){
    count += /[\u4E00-\u9FA5]/.test(chart) ? 2 :1
    subStr += chart
    if (count + 2 > len) {
      return {
        overLength: true,
        str: subStr + '...'
      }
    }
  }
  return {
    overLength: false,
    str
  }
}