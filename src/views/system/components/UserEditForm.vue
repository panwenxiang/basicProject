<template>
  <a-modal
    :title="`${!type ? '查看' : type === 'edit' ? '编辑' : '添加'}用户`"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    :maskClosable="false"
    ok-text="确认"
    cancel-text="取消"
    :wrapClassName="!type ? 'view-user-modal-editForm' : ''"
    @ok="submit"
    @cancel="cancel"
  >
    <a-spin :spinning="loading">
      <a-form-model ref="ruleForm" :model="form" :rules="rules" v-bind="formLayout">
        <a-form-model-item label="用户名" prop="userName">
          <a-input v-model="form.userName" autocomplete="off" :disabled="editDisabled" allow-clear />
        </a-form-model-item>
        <a-form-model-item label="昵称">
          <a-input v-model="form.nickName" autocomplete="off" :disabled="disabled" allow-clear />
        </a-form-model-item>
        <a-form-model-item label="密码" prop="password">
          <a-input-password
            v-model="form.password"
            placeholder="密码"
            :disabled="editDisabled"
            allow-clear
          />
        </a-form-model-item>
        <a-form-model-item label="手机号" prop="mobile">
          <a-input v-model="form.mobile" autocomplete="off" :disabled="disabled" allow-clear />
        </a-form-model-item>
        <template>
          <a-form-model-item label="关联角色" prop="roleIds">
            <a-checkbox-group :options="roles" :disabled="disabled" v-model="form.roleIds" @change="onChangeRole">
              <template v-slot:label="value">{{ value }}</template>
            </a-checkbox-group>
          </a-form-model-item>
          <a-form-model-item label="用户状态" prop="enabled">
            <a-switch v-model="form.enabled" :disabled="disabled" />
          </a-form-model-item>
        </template>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import { getRoleList, getUserInfo } from '@/api/system'
import { regValidate } from '@/utlis/utli'
import {mapState} from 'vuex'
import {UserPermission} from '@/permission/permissionKeyNameMap'

export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    loading: {
      type: Boolean,
      default: () => false,
    },
    // edit编辑，add为新增，空为查看
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      form: {
        avatar: '',
        enabled: true,
        userName: '',
        mobile: '',
        companyId: '',
        roleIds: [],
        email: '',
        password: '',
        telephone: '',
        gender: 0,
        userCompanyList: [],
      },
      formLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 17 },
        },
      },
      roles: [], // 角色列表
    }
  },
  computed: {
    ...mapState({
      currentUser: (state) => state.currentUser,
    }),
    editDisabled() {
      return this.type !== 'add' || this.disabled
    },
    disabled() {
      return !this.type
    },
    rules() {
      // 验证用户名
      const checkNickname = (rule, value, callback) => {
        if (!value || !regValidate('userName', value) || value.length < 2) {
          callback(new Error('用户名至少两位字符， 只能大小写字母、数字、以及_@'))
        } else {
          callback()
        }
      }
      // 验证手机号
      const checkMobile = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入手机号'))
        } else if (!regValidate('telephone', value)) {
          callback(new Error('请输入正确格式的手机号'))
        } else {
          callback()
        }
      }
      // 验证用户状态
      const checkEnabled = (rule, value, callback) => {
        callback()
      }
      const checkRoleIds = (rule, value, callback) => {
        if (this.form.roleIds.length === 0) {
          return callback(new Error('请选择关联角色'))
        }
        callback()
      }
      return {
        companyId: [{ required: true, message: '请选择关联公司信息', trigger: 'change' }],
        userName: [{ required: true, validator: checkNickname, trigger: 'change' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        mobile: [{ required: true, validator: checkMobile, trigger: 'blur' }],
        roleIds: [{ required: true, validator: checkRoleIds, trigger: 'change' }],
        enabled: [{ required: true, validator: checkEnabled, trigger: 'blur' }],
      }
    },
  },
  methods: {
    // 获取角色列表
    getRoleList() {
      getRoleList({ size: 100 }).then((result) => {
        if (result['code'] === 200) {
          const arr = result.data.records
          this.roles = arr.map((v) => {
            return {
              label: `${v.roleName}${v.status ? '' : '（已禁用）'}`,
              value: v.id,
            }
          })
        }
      })
    },
    // 获取用户详情
    getDetail(id) {
      getUserInfo(id).then((res) => {
        const obj = res.data
        this.form = obj
        this.form.enabled = this.form.enabled === 1
        if (obj.roles && obj.roles.length !== 0) {
          this.form.roleIds = obj.roles.map((v) => v.id)
        } else {
          this.form.roleIds = []
        }
      })
    },
    getSubmitParams() {
      const params = {
        ...this.form,
        enabled: this.form.enabled ? 1 : 0
      }
      delete params.companyId
      return params
    },
    submit() {
      if (!this.type) {
        this.$emit('ok', {})
        return false
      }
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.$emit('ok', this.getSubmitParams())
          this.form.enabled = true
        } else {
          return false
        }
      })
    },
    cancel() {
      this.resetForm()
      this.$emit('cancel')
    },
    resetForm() {
      this.$refs.ruleForm.resetFields()
      this.form = {
        enabled: true,
        roleIds: []
      }
    },
    // 勾选角色
    onChangeRole(keys) {
      // 手动去除错误提示
      if (keys.length > 0) {
        this.$refs.ruleForm.clearValidate('roleIds')
      }
      this.$forceUpdate()
    },
  },
}
</script>

<style lang="less" scoped>
.btn-wrapper {
  text-align: center;
  margin-top: 10px;
  .btn-color-green {
    margin-right: 25px;
  }
}
</style>
<style lang="less">
.view-user-modal-editForm {
  .ant-modal-footer {
    display: none;
  }
}
</style>
