<template>
  <a-form-model ref="ruleForm" :model="form" :rules="rules">
    <a-form-model-item label="角色名称" prop="roleName">
      <a-input
        :disabled="isLook"
        v-model="form.roleName"
        type="text"
        autocomplete="off"
        placeholder="请输入唯一的角色名称"
      />
    </a-form-model-item>
    <a-form-model-item label="角色说明">
      <a-input
        :disabled="isLook"
        v-model="form.description"
        type="textarea"
        rows="3"
        :placeholder="isLook ? '' : '请输入角色说明，便于记忆'"
      />
    </a-form-model-item>
    <div class="menu-select-box-title">
      选择权限: <span class="permission-tip">（至少选择一个权限，菜单项才会在左侧菜单栏上显示）</span>
    </div>
    <div class="menu-select-box" :class="{ 'select-box-error': errorTextVisible }">
      <a-tree
        v-if="treeData.length > 0"
        :disabled="isLook"
        @check="
          () => {
            this.errorTextVisible = false
          }
        "
        checkable
        :auto-expand-parent="false"
        :tree-data="treeData"
        :defaultExpandAll="true"
        :selectedKeys="[]"
        v-model="defaultCheckedKeys"
      >
        <template v-slot:title="row">
          {{ row.title }}
          <template v-if="row.permissions && row.permissions.length > 0">
            <a-select
              :disabled="isLook"
              v-model="permissionSelectedList[row.id]"
              mode="multiple"
              class="select-permission"
              :placeholder="isLook ? '' : '权限选择'"
            >
              <a-select-option v-for="item in row.permissions" :key="item['permissionId']">{{
                item.permissionName
              }}</a-select-option>
            </a-select>
          </template>
        </template>
      </a-tree>
    </div>
    <div class="errorText" v-show="errorTextVisible">{{ errorText }}</div>
  </a-form-model>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { Tree } from 'ant-design-vue'
import { roleAdd, roleAssign, rolePermission, roleUpdate } from '@/api/system'
import { bhMessage } from '@/utlis/utli'

export default {
  name: 'RoleOperationVue',
  components: {
    'a-tree': Tree,
  },
  props: {
    isLook: {
      type: Boolean,
      default: false,
    },
    roleInfo: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  computed: {
    ...mapState({
      menus: (state) => state.allMenus,
    }),
  },
  data() {
    return {
      form: {
        roleName: '',
        status: true,
        description: '',
      },
      defaultCheckedKeys: [],
      treeData: [],
      errorText: '请选择页面权限',
      rules: {
        roleName: [{ required: true, validator: this.validatePass, trigger: 'blur' }],
      },
      errorTextVisible: false,
      // slot-scope的数据不能修改，利用该变量 permissionSelectedList 作为中介, 菜单Id: [] 对应的权限列表。在初始化菜单数据的时候 添加值
      permissionSelectedList: {},
    }
  },
  methods: {
    ...mapActions(['GetAllMenuList']),
    // 处理 store中的 user.allMenus 全部数据，生成适合权限树级组件的数据格式
    initMenuList(list) {
      if (list && list instanceof Array && list.length > 0) {
        list.forEach((item) => {
          item.title = item.name || ''
          item.key = item.id || ''
          if (item['childMenus']) {
            item.children = item['childMenus']
            this.initMenuList(item['childMenus'])
          } else {
            item.children = []
          }
          if (item.permissions && item.permissions.length > 0) {
            const permissionIds = item.permissions.map((p) => p['permissionId'])
            // 新增的时候 把全部权限都展示 给用户去删减，查看或者编辑的时候 只展示已有的权限
            this.$set(this.permissionSelectedList, `${item.id}`, permissionIds)
            item.selectedPermission = this.permissionSelectedList[`${item.id}`]
          }
        })
        return list
      } else {
        return []
      }
    },
    /**
     * 新增、编辑字典表单的提交函数
     * @param callback 回调函数，提交表单成功之后的处理函数
     * @param validate 校验结构回调函数
     */
    submit(callback, validate) {
      let permissionIds = []
      this.defaultCheckedKeys.forEach((checkedItem) => {
        const arr = this.permissionSelectedList[checkedItem] || []
        permissionIds = [...permissionIds, ...arr]
      })
      this.$refs.ruleForm.validate(async (valid) => {
        if (permissionIds.length === 0) {
          this.errorTextVisible = true
          return
        }
        if (typeof validate === 'function') {
          validate(valid)
        }
        if (valid) {
          await this.roleAddOrUpdate(permissionIds)
          if (typeof callback === 'function') {
            callback()
          }
        }
      })
    },
    /**
     * 为新增或者编辑后的角色分配权限
     * @param roleId 角色Id
     * @param permissionIds 权限ID
     * @returns {Promise<void>}
     */
    async roleAssign(roleId, permissionIds) {
      const result = await roleAssign({
        roleId,
        permissionIds,
      })
      if (result['code'] === 200) {
        bhMessage.success('操作成功')
        this.$emit('ok')
        this.onCloseCt()
      }
    },
    /**
     * 新增或者编辑角色的提交函数 在submit函数中调用，校验通过后
     * @param permissionIds 选择的权限Id数组,给分配权限接口使用
     * @returns {Promise<AxiosResponse<any>>}
     */
    async roleAddOrUpdate(permissionIds) {
      let result = {}
      const isEdit = !!this.roleInfo.id
      const param = JSON.parse(JSON.stringify(this.form))
      param.status = param.status ? 1 : 0
      if (isEdit) {
        result = await roleUpdate(param)
      } else {
        result = await roleAdd(param)
      }
      if (result.code === 200) {
        await this.roleAssign(isEdit ? this.roleInfo.id : result.data, permissionIds)
      }
      return result
    },
    onCloseCt() {
      this.$refs.ruleForm.clearValidate()
      this.$emit('cancel')
    },
    // 验证
    validatePass(_, value, callback) {
      if (value === '') {
        callback(new Error('请输入角色名称'))
        return
      }
      if (value.length >= 65) {
        callback(new Error('最大长度64个字符，允许中文、英文字母、数字或特殊符号'))
      }
      callback()
    },
    // 初始化编辑，获取编辑角色的数据，并赋值
    async initEdit() {
      this.form = { ...this.form, ...this.roleInfo }
      const result = await rolePermission(this.roleInfo.id)
      if (result['code'] === 200) {
        result.data &&
          result.data.forEach((item) => {
            this.defaultCheckedKeys.push(item.id)
            this.permissionSelectedList[item.id] =
              item.permissions instanceof Array ? item.permissions.map((p) => p['permissionId']) : []
          })
      }
    },
  },
  async mounted() {
    await this.GetAllMenuList()
    // 处理参数数据
    this.treeData = this.initMenuList(JSON.parse(JSON.stringify(this.menus)))
    if (this.roleInfo.id) {
      await this.initEdit()
    }
  },
}
</script>

<style lang="less" scoped>
.menu-select-box-title {
  margin-bottom: 10px;
  color: #000000;
  &:before {
    display: inline-block;
    margin-right: 4px;
    color: red;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
    content: '*';
  }
}
.errorText {
  margin-bottom: 20px;
  color: red;
  height: 20px;
}
.menu-select-box {
  width: 100%;
  height: 250px;
  overflow-x: auto;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  padding: 10px;
  /deep/.ant-tree li .ant-tree-node-content-wrapper:hover {
    background: #ffffff;
  }
  /deep/.ant-tree li .ant-tree-node-content-wrapper {
    height: auto;
    min-height: 24px;
  }
  /deep/.ant-tree li[role='treeitem'] {
    padding: 8px 0;
  }
  .select-permission {
    min-width: 120px;
    margin-left: 20px;
  }
  &.select-box-error {
    border-color: red;
  }

  /deep/ .ant-tree-node-content-wrapper {
    max-width: 650px;
  }
  /deep/li[role='treeitem'] span.ant-tree-title {
    display: flex;
  }
}
.submitBtn {
  text-align: right;
}
.permission-tip {
  color: red;
  font-size: 12px;
}
</style>
