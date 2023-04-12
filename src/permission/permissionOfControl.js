import { permissionKeyList } from './permissionList'
/**
 * v-if="$auth(对应的权限配置名)"
 * 创建一个自定义插件
 */
export default {
  install (Vue) {
    if (!Vue.prototype.$auth) {
      Object.defineProperty(Vue.prototype, '$auth', {
        get () {
          return function (permission) {
            return permissionKeyList[permission]
          }
        }
      })
    }
  }
}
