import router from '../router'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'
import {getItem} from '@/utlis/utli'
import {ACCESS_TOKEN} from '@/store/const'
import { generateCurrentUserMenu, permissionMenuList } from '@/permission/permissionList'

NProgress.configure({ showSpinner: false }) // NProgress Configuration


router.beforeEach(async (to, from, next) => {
  NProgress.start()
  if (!getItem(ACCESS_TOKEN) && to.path !== '/login') {
    NProgress.done()
    return next('/login')
  }
  generateCurrentUserMenu()
  if (permissionMenuList.filter(menu => to.path.indexOf(menu) > -1).length === 0) {
    // 没有对应的路由权限 到404
    next({ path: '/404' })
  } else {
    next()
  }
  NProgress.done()
})