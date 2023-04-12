<template>
  <a-layout class="basic-layout">
    <a-layout-header class="header">
      <div class="header-left">
        <span class="project-name">{{ ProjectName }}</span>
      </div>
      <div class="header-right">
        <span class="right-user-info">
          <span class="user-name">{{ currentUser.nickName || currentUser.userName }}</span>
          <span v-if="!currentUser.avatar" class="no-avatar-default">{{ imgText }}</span>
          <img v-else :src="currentUser.avatar" alt="图片" class="avatar">
        </span>
        <a-dropdown placement="bottomRight">
          <a-icon type="menu" class="setting-icon"/>
          <template v-slot:overlay>
            <a-menu class="ant-pro-drop-down menu" :selected-keys="[]">
              <a-menu-item key="guid">
                <bh-copy-line :text="currentUser.userName">用户名: {{ currentUser.userName }}</bh-copy-line>
              </a-menu-item>
              <a-menu-item key="edit" @click="changePassword">
                <a-icon type="edit" />修改密码
              </a-menu-item>
              <a-menu-item key="logout" @click="handleLogout">
                <a-icon type="logout" />退出登录
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

      </div>
    </a-layout-header>
    <a-layout>
      <template v-if="currentUser.userId">
        <a-layout-sider class="basic-layout-menu" v-model="menuCollapsed">
          <a-menu mode="inline" v-model="selectedKeys" :openKeys.sync="openKeys">
            <template v-for="menuItem in userMenuList" v-if="menuItem['showMenu'] != 0">
              <a-sub-menu v-if="menuItem['childMenus']" :key="menuItem.id">
                <span slot="title">
                  <span>{{ menuItem.name }}</span>
                </span>
                <a-menu-item v-for="subMenu in menuItem['childMenus']" :key="subMenu.id" v-if="menuItem['showMenu'] != 0">
                  <router-link :to="subMenu.url">
                    {{ subMenu.name }}
                  </router-link>
                </a-menu-item>
              </a-sub-menu>
              <a-menu-item v-else :key="menuItem.id">
                <router-link :to="menuItem.url">
                  <span>{{ menuItem.name }}</span>
                </router-link>
              </a-menu-item>
            </template>
          </a-menu>
        </a-layout-sider>
        <a-layout class="basic-layout-right-content">
          <a-layout-content>
            <router-view></router-view>
          </a-layout-content>
        </a-layout>
      </template>
      <bh-loading v-else/>
    </a-layout>

    <!--    修改密码弹框-->
    <a-modal
      title="修改密码"
      :width="640"
      :maskClosable="false"
      :visible="passwordVisible"
      :confirmLoading="submitLoading"
      ok-text="确认"
      cancel-text="取消"
      @ok="changePasswordSubmit"
      @cancel="changePasswordCancel"
    >
      <a-spin :spinning="loading">
        <a-form-model
          ref="passwordForm"
          :model="passwordForm"
          :rules="rules"
          v-bind="formLayout">
          <a-form-model-item label="原始密码" prop="oldPassword">
            <a-input-password v-model="passwordForm.oldPassword" placeholder="请输入原始密码" allow-clear/>
          </a-form-model-item>
          <a-form-model-item label="新的密码" prop="newPassword">
            <a-input-password v-model="passwordForm.newPassword" placeholder="请输入新的密码" allow-clear/>
          </a-form-model-item>
          <a-form-model-item label="再次确认" prop="confirmPassword">
            <a-input-password v-model="passwordForm.confirmPassword" placeholder="再次确认新密码" allow-clear/>
          </a-form-model-item>
        </a-form-model>
      </a-spin>
    </a-modal>
  </a-layout>
</template>

<script>
import {mapActions, mapMutations, mapState} from 'vuex'
import {EditPwd, Logout, userEmailDelete, userEmailList} from '@/api/user'
import {bhMessage} from '@/utlis/utli'
import BhLoading from '@/components/BhLoading'
import BhCopyLine from '@/components/BhCopyLine'

export default {
  name: 'BasicLayout',
  components: {BhLoading, BhCopyLine},
  data() {
    return {
      ProjectName: '管理系统',
      menuCollapsed: false,
      selectedKeys: [],
      openKeys: [],
      passwordVisible: false,
      submitLoading: false,
      loading: false,
      passwordForm: {
        newPassword: '',
        oldPassword: '',
        confirmPassword: ''
      },
      rules: {
        oldPassword: [{ required: true, message: '请输入原始密码', trigger: 'change' }],
        newPassword: [
          { required: true, message: '请输入新的密码', trigger: 'change' },
          { validator: this.checkOldNew, trigger: 'change' },
        ],
        confirmPassword: [
            { required: true, message: '请再次输入新的密码', trigger: 'change' },
            { validator: this.checkConfirm, trigger: 'change' },
        ],
      },
      formLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 17 }
        }
      },
    }
  },
  computed: {
    ...mapState({
      userMenuList: (state) => state.currentUserMenu,
      currentUser: (state) => state.currentUser,
    }),
    imgText() {
      const name = this.currentUser.nickName || this.currentUser.userName
      return (name || '').substring(0,1)
    },
  },
  methods: {
    ...mapActions(['GetUserMenuList', 'GetCurrentUserInfo']),
    ...mapMutations(['resetUserInfo']),
    checkConfirm(rule, value, callback) {
      if (value !== this.passwordForm.newPassword) {
        return callback(new Error('两次输入的密码不一致'))
      }
      callback()
    },
    checkOldNew(rule, value, callback) {
      if (this.passwordForm.oldPassword === this.passwordForm.newPassword) {
        return callback(new Error('不能与现使用的密码一致'))
      }
      callback()
    },
    menuVisible() {
      this.menuCollapsed = !this.menuCollapsed
    },
    /**
     * 根据菜单项生成对应的图标，如果是在selectedKey内的就高亮图标 否则就普通显示
     * @param menuItem
     * @returns {string|*}
     */


    /**
     * 根据url 初始化左侧menu 对应需要打开的菜单项， 以及当前显示的菜单key
     */
    initMenuSelectedKey() {
      const { path } = this.$route
      this.userMenuList.forEach(menuItem => {
        if (menuItem.url === path) {
          this.selectedKeys = [menuItem.id]
        } else if (menuItem['childMenus']) {
          menuItem['childMenus'].forEach(item => {
            if (item.url === path) {
              this.selectedKeys = [item.id]
              this.openKeys = [menuItem.id]
            }
          })
        }
      })
    },
    handleLogout() {
      this.$confirm({
        title: '确定退出登录？',
        okText: '确定',
        cancelText: '取消',
        class: 'confirm-box',
        centered: true,
        icon: () => <a-icon type="question-circle" theme="filled" />,
        onOk: () => {
          return new Promise(async (resolve, reject) => {
            await Logout()
            this.resetUserInfo()
            localStorage.clear()
            resolve()
            window.location.href = '/login'
          })
        },
      })
    },
    changePasswordSubmit() {
      this.$refs.passwordForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          const { newPassword, oldPassword } = this.passwordForm
          EditPwd({newPassword, oldPassword }).then((result) => {
            if (result['code'] === 200) {
              bhMessage.success('密码修改成功，下次登录请使用新密码')
              this.changePasswordCancel()
            }
            this.submitLoading = false
          })
        }
      })
    },
    changePasswordCancel() {
      this.passwordVisible = false
      this.$nextTick(() => {
        this.passwordForm.oldPassword = ''
        this.passwordForm.newPassword = ''
        this.passwordForm.comfirmPassword = ''
      })
    },
    changePassword() {
      this.passwordVisible = true
    },
  },
  watch: {
    $route() {
      this.initMenuSelectedKey()
    },
  },
  async created() {
    await this.GetCurrentUserInfo()
    await this.GetUserMenuList()
    this.$nextTick(() => {
      this.initMenuSelectedKey()
    })
  },
}
</script>

<style lang="less" scoped>
.header.ant-layout-header {
  height: 48px;
  line-height: 48px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .header-left, .header-right{
    display: inline-flex;
    align-items: center;
  }
  .header-left{
    .project-name{
      font-size: 16px;
      color: #ffffff;
      margin-left: 8px;
    }
    .menu-action{
      padding: 0 12px;
      cursor: pointer;
    }
  }
  .header-right .user-name{
    font-size: 16px;
    color: #ffffff;
    margin-right: 8px;
  }
  .header-right > img, .header-right  .no-avatar-default{
    width: 34px;
    height: 34px;
    border-radius: 50%;
  }
  .header-right  .no-avatar-default{
    background: #999999;
    color: #ffffff;
    font-size: 18px;
    font-weight: bold;
    line-height: 27px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
.ant-layout.basic-layout {
  height: 100%;
}

.logo {
  font-size: 32px;
}
/* 左侧菜单设置 start */
.basic-layout-menu{
  width: 200px;
  background: #ffffff;
  .ant-menu.ant-menu-root:not(.ant-menu-sub){
    padding-top: 8px;
    height: 100%;
    border-right: 0;
  }
  .ant-menu-item.ant-menu-item-selected{
    background: #F1FFFE;
    span{
    }
    &:after{
    }
  }
  .ant-menu-item-selected > a{
    color: #333333;
  }
  .ant-menu-item > a:hover{
    color:  #333333;
  }
  .ant-menu-submenu-title:hover{
  }
  .bh-icon{
    font-size: 16px;
  }
}
/* 左侧菜单设置 end   */

.basic-layout-right-content{
  padding: 0 16px 16px;
  background: #fafafa;
}

.ant-layout-sider-collapsed{

}
.right-user-info{
  display: inline-flex;
  align-items: center;
}
.avatar{
  width: 34px;
  height: 34px;
  border-radius: 50%;
}

.company-register-btn{
  background: #f0a732;
  border-color: #f0a732;
  font-weight: 600;
  letter-spacing: 4px;
  margin-left: 32px;
  &:hover, &:focus{
    background: #fca00c;
    border-color: #fca00c;
  }
}
.setting-icon{
  font-size: 22px;
  color: #ffffff;
  margin-left: 12px;
}
.email-link-company{
  position: relative;
  .anticon{
    margin-left: 2px;
    &:hover{
      color: #4392FD;
      cursor: pointer;
    }
  }
  &:hover{
    .anticon{
      display: inline-block;
    }
  }
}
</style>
<style lang="less">
/* 左侧菜单设置 start */
.basic-layout-menu{
  .ant-menu-submenu-inline{
    > .ant-menu-submenu-title:hover .ant-menu-submenu-arrow{
      &::before, &::after{
      }
    }
  }
  .ant-menu-submenu-arrow{
    transition: none !important;
    &::before, &::after{
      transition: none !important;
    }
  }
  .ant-menu-submenu-selected .ant-menu-submenu-title{
    span{
    }
    .ant-menu-submenu-arrow{
      &::before, &::after{
      }
    }
  }
  .ant-menu-item:active, .ant-menu-submenu-title:active{
    background: #F1FFFE;
  }
  .ant-menu-submenu-title{
    &:hover{
    }
  }
  ul.ant-menu-inline.ant-menu.ant-menu-sub{
    > li >a{
      position: relative;
      padding-left: 9px;
      left: -3px;
      color: #333333;
      //&::after{
      //  content: '';
      //  width: 4px;
      //  height: 4px;
      //  background: #333333;
      //  border-radius: 50%;
      //  display: inline-block;
      //  position: absolute;
      //  left: 0;
      //  top: 50%;
      //  transform: translateY(-50%);
      //}
    }
  }
}
/* 左侧菜单设置 end   */

.ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected{
  background: #F1FFFE !important;
  a{
    color: inherit;
  }
}
.ant-menu:not(.ant-menu-horizontal) .ant-menu-item{
  a:hover{
  }
}

.anticon-question-circle{
  font-size: 22px;
}
</style>