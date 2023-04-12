<template>
  <div class="Qr-code-login-page">
    <div class="login-content">
      <span class="project-logo">
        <a-icon type="smile" />
        <span class="project-name">项目名称</span>
      </span>
      <div class="code-wrapper">
        <div class="loginBox" id="wx_reg"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { ACCESS_TOKEN, MENUS } from '@/store/const'
import {clearAllStorage, getItem, isMobile } from '@/utlis/utli'
import WwLogin from '../../public/wwLogin-1.2.4'

export default {
  name: 'LoginOfOrCode',
  data() {
    return {
      redirectUrl: '/loading',
      wxData: {},
    }
  },
  computed: {
    ...mapState(['currentUserMenu'])
  },
  methods: {
    ...mapActions(['GetUserMenuList']),
    async getWxInfo() {
      // 获取该应用的配置信息
      // const result = await getWxCpAppAuthInfo()
      const result = {}
      if (result['code'] === 200) {
        this.wxData = result.data
        // new之后就会生成一个二维码
        new WwLogin({
          'id': 'wx_reg', // 对应上面template中对应元素id
          'appid': this.wxData.corpId,
          'agentid':this.wxData.agentId,
          'redirect_uri': this.wxData.hostname + this.redirectUrl, // 登录成功之后跳转的页面
          'state': this.wxData.state,
          'href': '',
          'lang': 'zh',
        })
      }
    }
  },
  mounted() {
    // 如果已有token，标识用户已是登录状态，则直接进行跳转
    if (getItem(ACCESS_TOKEN)) {
      this.$router.push(this.redirectUrl)
    } else{
      clearAllStorage()
      this.getWxInfo()
    }
  },
  beforeCreate() {
    // 如果存在移动端 则直接跳转到移动端的扫码登录页面
    // if (isMobile()) {
    //   window.location.href = process.env.VUE_APP_MOBILE_DOMAIN + 'login'
    // }
  }
}
</script>

<style lang="less" scoped>
.tempLogin{
  display: flex;
  height: 100vh;
  position: relative;

  .login-content{
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .code-wrapper{
    width: 500px;
    height: 550px;
    background: #FFFFFF;
    box-shadow: 0px 2px 15px 0px rgba(0,0,0,0.1);
    border-radius: 16px;
    border: 1px solid #DDDDDD;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #wx_reg{
    transform: translateY(35px);
    display: inline-block;
    width: 280px;
    :deep(iframe){
      width: 280px;
    }
  }
  .project-logo{
    display: flex;
    align-items: center;
    position: absolute;
    top: 30px;
    left: 40px;
    .bh-icon{
      font-size: 40px;
    }
    span{
      font-size: 20px;
      margin-left: 12px;
      font-weight: 600;
    }
  }
}
</style>