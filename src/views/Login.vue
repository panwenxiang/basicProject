<template>
  <div class="login-page">
    <div class="login-content">
      <div class="login-content-left">
        <div class="project-wrapper">
          <h3>某 某 某</h3>
          <p>管理系统</p>
        </div>
      </div>
      <div class="login-content-right">
        <h3>登 录</h3>
        <a-form-model ref="ruleForm" :model="form" :rules="rules" @submit="submitForm">
          <a-form-model-item label="账号" prop="userName">
            <a-input v-model="form.userName" autocomplete="off" />
          </a-form-model-item>
          <a-form-model-item label="密码" prop="password">
            <a-input-password v-model="form.password" type="password" autocomplete="off" />
          </a-form-model-item>
          <a-form-model-item class="login-button-wrapper">
            <a-button
              size="large"
              type="primary"
              htmlType="submit"
              class="login-button"
              :loading="loginBtn"
              :disabled="loginBtn"
            >登录</a-button>
          </a-form-model-item>
        </a-form-model>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { ACCESS_TOKEN, MENUS } from '@/store/const'
import {clearAllStorage, getItem, setItem} from '@/utlis/utli'
import {login} from '@/api/user'

export default {
  name: 'LoginPage',
  data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      form: {
        userName: '',
        password: ''
      },
      rules: {
        userName: [
          { required: true, message: '请填写账号名', trigger: 'change' }
        ],
        password: [
          { required: true, message: '请填写密码', trigger: 'change' }
        ],
      },
      loginBtn: false
    }
  },
  computed: {
    ...mapState(['currentUserMenu'])
  },
  watch: {
    currentUserMenu() {
      this.$router.push(this.getFirstPage())
    }
  },
  methods: {
    ...mapActions(['GetUserMenuList', 'GetCurrentUserInfo']),
    /**
     * 根据当前登录用户对应的菜单权限 获取展示的首页
     * @returns {string|*}
     */
    getFirstPage() {
      if (this.currentUserMenu.length === 0) {
        return '/403'
      }
      for (let i = 0; i<this.currentUserMenu.length; i++) {
        if (this.currentUserMenu[i].url && this.currentUserMenu[i].showMenu == 1) {
          return this.currentUserMenu[i].url
        } else if (this.currentUserMenu[i]['childMenus']) {
          return this.currentUserMenu[i]['childMenus'][0].url
        }
      }
    },
    // 提交登录表单
    submitForm(e) {
      e.preventDefault()
      this.$refs.ruleForm.validate(async (valid) => {
        if (valid) {
          this.loginBtn = true
          const result = await login(this.form)
          if (result['code'] === 200) {
            setItem(ACCESS_TOKEN, result['data'].token)
            await this.GetCurrentUserInfo()
          }
          this.loginBtn = false
        }
      })

    }
  },
  mounted() {
    // 如果存有token则，直接跳转到系统页面
    if (getItem(ACCESS_TOKEN) && this.currentUserMenu.length > 0) {
      this.$router.push(this.getFirstPage())
    } else{
      clearAllStorage()
    }
  }

}
</script>

<style lang="less" scoped>
.login-page{
  display: flex;
  height: 100vh;
  position: relative;
  background-image: -webkit-linear-gradient(right bottom, #5E9BC2, #C4FFFF, #35779C, #003757, #001C39);
  .login-content{
    width: 800px;
    height: 100vh;
    max-height: 500px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    .login-content-left{
      width: 40%;
      flex-shrink: 0;
      height: 100%;
      color: #ffffff;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      h3{
        color: inherit;
        font-size: 40px;
        font-weight: 600;
        margin-bottom: 10px;
      }
      p{
        margin: 0;
        font-size: 28px;
      }
      .project-wrapper{
        transform: translateY(-50px);
      }
    }
    .login-content-right{
      flex-grow: 1;
      background: #ffffff;
      height: 100%;
      box-shadow: rgba(0,0,0,0.08) 0px 4px 6px 0px,rgba(0,0,0,0.05) 0px 0px 0px 1px;
      border-radius: 10px;
      padding: 30px;
      position: relative;
      h3{
        font-size: 32px;
        font-weight: bold;
        color: #999;
        text-align: center;
        margin-bottom: 60px;
      }
    }
  }

  /deep/ .ant-input{
    border: none;
    padding-top: 25px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ddd;
    background: #fff !important;
    outline: none;
    letter-spacing: 3px;
    color:#4392FD;
    font-weight: bold;
    font-size: 20px;
    letter-spacing: 5px;
    &:focus{
      box-shadow: none;
    }
  }
  /deep/ .ant-form-item-label{
    label{
      font-size: 16px;
    }
  }
  .login-button-wrapper{
    text-align: center;
    position: absolute;
    width: calc(100% - 60px);
    bottom: 40px;
    left: 30px;
  }
  .login-button{
    width: 285px;
  }
}
</style>