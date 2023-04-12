import {MENUS} from '../store/const'
import {getItem, isArray} from '@/utlis/utli'

let permissionKeyList = {} // 当前用户对应的权限列表
let permissionMenuList = [] // 当前用户对应的权限列表
const noPermissionCheckList = ['/404', '/403', '/login', '/company/register', '/company/edit'] // 不需要校验权限的页面，只要登录就可以访问

/**
 * 生成权限菜单列表, 以及权限标识关键字列表
 * 第一次调用 是在获取当前用户菜单的方法里面
 */
export function generateCurrentUserMenu () {
  permissionKeyList = {}
  const menus = getItem(MENUS)
  doGenerateList(menus)
  permissionMenuList = [...permissionMenuList, ...noPermissionCheckList]
}

function doGenerateList (menus) {
  if (isArray(menus)) {
    menus.forEach(menu => {
      if (menu['url'] && menu['url'] !== '/' && menu.showMenu == 1) {
        permissionMenuList.push(menu['url'])
      }
      if (isArray(menu['permissions'])) {
        menu['permissions'].forEach(permission => {
          permissionKeyList[permission.permissionKey] = permission
        })
      }
      if (isArray(menu['childMenus'])) {
        doGenerateList(menu['childMenus'])
      }
    })
  }
}

export {
  permissionKeyList,
  permissionMenuList
}
