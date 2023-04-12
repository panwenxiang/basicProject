<template>
  <div class="loading-page">
    <div v-if="getTokenFail">
      {{ error }}
      <a-button type="primary" @click="$router.push('/login')">回到登录页</a-button>
    </div>
    <a-icon v-else type="loading" style="font-size: 60px;"/>
  </div>
</template>

<script>
import { getOauth2Url, getToken } from '@/api/user'
import { ACCESS_TOKEN, MENUS } from '@/store/const'
import { getItem, isWxBrowser, removeItem, setItem } from '@/utlis/utli'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'LoadingComponent',
  data() {
    return {
      getTokenFail: false,
      error: ''
    }
  },
  computed: {
    ...mapState(['currentUserMenu']),
  },
  methods: {
    ...mapActions(['GetUserMenuList']),
    getFirstPage() {
      if (this.currentUserMenu.length === 0) {
        return '/overview'
      }
      for (let i = 0; i<this.currentUserMenu.length; i++) {
        if (this.currentUserMenu[i].url) {
          return this.currentUserMenu[i].url
        } else if (this.currentUserMenu[i]['childMenus']) {
          return this.currentUserMenu[i]['childMenus'][0].url
        }
      }
    },
    getTokenData() {
      const { code, state } = this.$route.query
      getToken({code, state}).then(async (res) => {
        if (res['code'] === 200) {
          setItem(ACCESS_TOKEN, res.data.token)
          await this.GetUserMenuList()
          // 用户直接点击企业微信的消息进入详情页，在permission.js前置路由守卫
          // 中判断：没有access_token并且不在loding和login，会记录那个详情页的url
          // todo 成功登录后的逻辑
        } else {
          this.getTokenFail = true
          this.error = res.message
        }
      }).catch((result) => {
        this.error = result ? result.message : '登录授权失败'
        this.getTokenFail = true
      })
    },
    getOauth2UrlData() {
      getOauth2Url('pc').then(result => {
        if (result['code'] === 200) {
          window.location.href = result.data
        } else {
          this.getTokenFail = true
        }
      }, () => {
        this.getTokenFail = true
      })
    }
  },
  mounted() {
    if (getItem(ACCESS_TOKEN)) {
      this.$router.push('/') // todo 登录状态下跳转的页面
    } else {
      const { code, state } = this.$route.query
      removeItem(MENUS)
      removeItem(ACCESS_TOKEN)
      // 从重定向页面回来 链接上带有code state
      if (code && state) {
        this.getTokenData()
      } else if (!isWxBrowser()){
        //  pc浏览器端
        this.$router.push('/login')
      }else {
        this.getOauth2UrlData()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.loading-page{
  text-align: center;
  padding-top: 300px;
}
</style>