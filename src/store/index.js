import Vue from 'vue'
import Vuex from 'vuex'
import {dictList, getAllMenuList} from '@/api/system'
import { getUserInfo, getUserMenuList } from '@/api/user'
import {MENUS, USER_TYPE} from './const'
import { getItem, isArray, setItem } from '@/utlis/utli'
import {generateCurrentUserMenu} from '@/permission/permissionList'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentUser: {}, // 当前的用户数据
    allMenus: [], // 全部菜单
    rootMenu: [], // 含根节点的 全部菜单
    currentUserMenu: [], // 当前用户菜单权限
    rootId: '', // 菜单根节点id
  },
  mutations: {
    setCurrentUser(state, data) {
      state.currentUser = data
    },
    setAllMenus (state, list) {
      state.allMenus = list
    },
    setRootMenu (state, data) {
      state.rootMenu = data
    },
    setRootId (state, id) {
      state.rootId = id
    },
    setCurrentUsrMenu(state, list) {
      // 除了系统用户，其他用户校验是否有关联企业信息 再显示组织架构
      state.currentUserMenu = list
    },
    resetUserInfo(state) {
      state.currentUserMenu = []
      state.currentUser = {}
    }
  },
  actions: {
    GetAllMenuList ({ state, commit }, isUpdate = false) {
      return new Promise(async (resolve) => {
        if (state.allMenus.length === 0 || isUpdate) {
          const result = await getAllMenuList()
          if (result['code'] === 200) {
            const { childMenus, id } = result['data'][0]
            commit('setAllMenus', childMenus)
            commit('setRootMenu', result['data'])
            commit('setRootId', id)
          }
          return resolve(result)
        }
        resolve()
      })
    },
    GetUserMenuList ({ state, commit }, isUpdate = false) {
      return new Promise(async (resolve) => {
        if (state.currentUserMenu.length === 0 || isUpdate) {
          let result
          if (getItem(MENUS)) {
            const menu = getItem(MENUS)
            commit('setCurrentUsrMenu', menu)
            setItem(MENUS, menu)
            generateCurrentUserMenu()
            result = {code: 200}
          } else {
            result = await getUserMenuList()
            if (result['code'] === 200) {
              const { childMenus } = result['data'][0]
              commit('setCurrentUsrMenu', childMenus)
              setItem(MENUS, childMenus)
              generateCurrentUserMenu()
            }
          }
          return resolve(result)
        }
        resolve()
      })
    },
    GetCurrentUserInfo({ commit, state, dispatch }) {
      return new Promise(async (resolve) => {
        const result = await getUserInfo()
        if (result['code'] === 200) {
          commit('setCurrentUser', result.data)
          dispatch('GetUserMenuList', true)
          resolve()
        }
      })
    },
  },
})
