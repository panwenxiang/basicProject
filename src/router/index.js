import Vue from 'vue'
import VueRouter from 'vue-router'
import BasicLayout from '@/layout/BasicLayout'
Vue.use(VueRouter)

const RouteView = {
  name: 'RouteView',
  render: (h) => h('router-view'),
}

// 配置配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: BasicLayout,
    redirect: '/login',
    children: [
      {
        path: '/system',
        name: 'system',
        component: RouteView,
        redirect: '/system/user',
        children: [
          {
            path: '/system/user',
            name: 'system_user',
            component: () => import('@/views/system/UserManageList'),
            meta: { title: '用户管理' },
          },
          {
            path: '/system/role',
            name: 'system_role',
            component: () => import('@/views/system/RoleManageList'),
            meta: { title: '角色管理' },
          },
          {
            path: '/system/operateLogs',
            name: 'system_operateLogs',
            component: () => import('@/views/system/OperationLogList'),
            meta: { title: '操作日志' },
          },
          {
            path: '/system/menu',
            name: 'system_menu',
            component: () => import('@/views/system/MenuManage'),
            meta: { title: '菜单管理' },
          },
          {
            path: '/system/dictionary',
            name: 'system_dictionary',
            component: () => import('@/views/system/DataDictionaryList'),
            meta: { title: '数据字典' },
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login'),
    meta: { title: '登录' },
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/403'),
    meta: { title: '没有权限' },
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404'),
    meta: { title: '404 Not Found' },
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
