<template>
  <a-spin :spinning="loading">
    <a-form-model ref="ruleForm" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
      <a-form-model-item ref="name" label="菜单名称" prop="name">
        <a-input
          v-model="form.name"
          @blur="
            () => {
              $refs.name.onFieldBlur()
            }
          "
          :disabled="isLook"
        />
      </a-form-model-item>
      <a-form-model-item label="上级菜单" prop="parentId">
        <a-tree-select
          v-model="form.parentId"
          :tree-data="rootMenu"
          :replace-fields="replaceFields"
          placeholder="请选择上级菜单"
          dropdownClassName="menu-tree-select"
          allow-clear
          :disabled="isLook"
        ></a-tree-select>
      </a-form-model-item>
      <a-form-model-item label="页面路由" prop="url">
        <a-input
          v-model="form.url"
          @blur="
            () => {
              $refs.name.onFieldBlur()
            }
          "
          :disabled="isLook"
        />
      </a-form-model-item>
      <a-form-model-item label="菜单序号" prop="sortNum">
        <a-input-number
          v-model="form.sortNum"
          :disabled="isLook"
          style="width: 100%"
          :min="0"
          :formatter="(value) => (value ? parseInt(value) : 0)"
          :parser="(value) => (value ? parseInt(value) : 0)"
        />
      </a-form-model-item>
      <a-form-model-item label="菜单图标" prop="icon">
        <a-popover title="参考图标，也可以自己填入" trigger="focus" placement="topLeft">
          <template v-slot:content>
            <div class="icon-list-wrapper">
              <a-icon v-for="(item, index) in iconList" :key="index" :type="item" @click="setIconInput(item)" />
            </div>
          </template>
          <a-input v-model="form.icon" :disabled="isLook" />
        </a-popover>
      </a-form-model-item>
      <a-form-model-item label="菜单类型" prop="type">
        <a-radio-group v-model="form.type" @change="menuTypeChange">
          <a-radio :value="1">文件夹</a-radio>
          <a-radio :value="2">菜单</a-radio>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item label="是否显示">
        <a-switch v-model="form.showMenu" :disabled="isLook" />
      </a-form-model-item>
      <a-form-model-item
        v-if="form.type === 2"
        :wrapper-col="{ span: 24 }"
        class="permission-wrapper"
        prop="permissions"
      >
        <div class="permission-header">权限设置 <a-icon v-if="!isLook" type="plus" @click="addPermissionItem" /></div>
        <a-row class="permission-title">
          <a-col v-for="(col, index) in columns" :span="col.span" :key="index">{{ col.title }}</a-col>
        </a-row>
        <a-row
          v-for="(item, index) in form.permissions"
          :key="index"
          class="permission-item"
          :class="{ 'error-item': item.error }"
        >
          <a-col :span="columns[0].span">
            <a-input v-model="item[columns[0].key]" :disabled="isLook" />
          </a-col>
          <a-col :span="columns[1].span">
            <a-input v-model="item[columns[1].key]" :disabled="isLook" />
          </a-col>
          <a-col :span="columns[2].span">
            <a-select v-model="item[columns[2].key]" :disabled="isLook">
              <a-select-option value="2">按钮权限</a-select-option>
              <a-select-option value="1">数据权限</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="columns[3].span">
            <a-select v-model="item[columns[3].key]" :disabled="isLook">
              <a-select-option value="1">左上角</a-select-option>
              <a-select-option value="2">操作栏</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="columns[4].span">
            <a-input v-model="item[columns[4].key]" :disabled="isLook" />
          </a-col>
          <a-col :span="columns[5].span" v-if="!isLook">
            <a-popconfirm placement="topRight" ok-text="确定" cancel-text="取消" @confirm="deleteItem(index)">
              <template v-slot:title> 确定删除该权限？ </template>
              <a>删除</a>
            </a-popconfirm>
          </a-col>
        </a-row>
        <div class="error" v-if="permissionsError">所有字段都该填写</div>
      </a-form-model-item>
      <a-form-model-item :wrapper-col="{ span: 24 }" style="text-align: right">
        <a-button @click="resetForm" v-if="!this.isLook">取消</a-button>
        <a-button
          @click="onSubmit"
          type="primary"
          v-if="!this.isLook"
          :loading="submitLoading"
          style="margin-left: 10px"
        >确定</a-button
        >
      </a-form-model-item>
    </a-form-model>
  </a-spin>
</template>

<script>
import { TreeSelect } from 'ant-design-vue'
import { mapActions, mapState } from 'vuex'
import { menuAdd, menuDetail, menuUpdate } from '@/api/system'
import { bhMessage } from '@/utlis/utli'

export default {
  name: 'MenuOperation',
  components: {
    'a-tree-select': TreeSelect,
  },
  props: {
    // T 查看状态 F 新增或者编辑状态
    isLook: {
      type: Boolean,
      default: false,
    },
    // 默认为空， 表示新增， 不为空表示编辑
    menuId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      loading: true,
      form: {
        icon: '',
        sortNum: 0,
        name: '',
        parentId: 0,
        url: '',
        showMenu: true,
        type: 1,
        permissions: [
          {
            permissionKey: '',
            permissionName: '',
            permissionType: '2',
            position: '1',
            url: '',
          },
        ],
      }, // 初始化表单
      replaceFields: {
        // 上级菜单 组件需要的字段映射对象
        children: 'childMenus',
        title: 'name',
        key: 'id',
        value: 'id',
      },
      confirmLoading: false,
      columns: [
        {
          title: '权限名称',
          span: this.isLook ? 6 : 5,
          key: 'permissionName',
        },
        {
          title: 'URL',
          span: this.isLook ? 6 : 5,
          key: 'url',
        },
        {
          title: '权限类型',
          span: 4,
          key: 'permissionType',
        },
        {
          title: '显示区域',
          span: 4,
          key: 'position',
        },
        {
          title: '标识关键字',
          span: 4,
          key: 'permissionKey',
        },
        {
          title: '操作',
          span: 2,
          key: 'action',
        },
      ],
      permissionsError: false, // 权限列表 校验结果
      iconList: [
        // 选择图标输入框的快速输入图标数据
        'menu-overview',
        'menu-todo',
        'menu-task',
        'menu-setting',
        'menu-personal'
      ],
      submitLoading: false,
    }
  },
  computed: {
    ...mapState({
      menus: (state) => state.allMenus,
      rootMenu: (state) => state.rootMenu,
      rootId: (state) => state.rootId,
    }),
    // 菜单表单的校验规则， this.type === 2 菜单类型，没有icon这个校验
    rules() {
      const iconRules = {
        icon: [{ required: true, message: '请添加菜单图标', trigger: 'change' }],
      }
      const defaultRules = {
        name: [{ required: true, message: '请填写菜单名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
      }
      const expandRules = {
        url: [{ required: true, message: '请填写页面路由', trigger: 'blur' }],
        parentId: [{ required: true, message: '请选择上级菜单', trigger: 'change' }],
        sortNum: [{ required: true, message: '请添加菜单序号', trigger: 'blur' }],
      }
      return this.form.type === 1 ? { ...iconRules, ...defaultRules } : { ...defaultRules, ...expandRules }
    },
  },
  methods: {
    ...mapActions(['GetAllMenuList']),
    onSubmit() {
      if (this.isLook) {
        return this.resetForm()
      }
      // 校验 菜单类型 权限列表是否全部填写
      this.permissionsError = this.validatePermissions()
      // 为了为菜单类型时 能通过检验
      this.$refs.ruleForm.validate(async (valid) => {
        if (valid && !this.permissionsError) {
          this.submitLoading = true
          let result
          if (this.menuId) {
            result = await menuUpdate(this.getSubmitParams())
          } else {
            result = await menuAdd(this.getSubmitParams())
          }
          if (result.code === 200) {
            await this.GetAllMenuList(true)
            bhMessage.success(`${this.menuId ? '编辑' : '添加'}菜单成功`)
            this.resetForm()
          }
          this.submitLoading = false
        }
      })
    },
    // 获取提交的参数列表
    getSubmitParams() {
      const params = JSON.parse(JSON.stringify(this.form))
      // 删除权限列表的错误变量
      params.permissions =
        params.type === 1
          ? []
          : params.permissions.map((item) => {
              delete item.error
              return item
            })
      params.parentId = params.parent ? params.parent : params.parentId
      delete params.parent
      params.showMenu = params.showMenu ? 1 : 0
      // this
      if (this.menuId) {
        delete params['childMenus']
      }
      return params
    },
    resetForm() {
      this.$emit('cancel')
    },
    // 新增一条权限列表项
    addPermissionItem() {
      const item = {
        permissionKey: '',
        permissionName: '',
        permissionType: '2',
        position: '1',
        url: '',
      }
      this.form.permissions.push(item)
    },
    // 删除权限列表项 至少存在一条
    deleteItem(index) {
      if (this.form.permissions.length === 1) {
        return bhMessage.warn('至少存在一条权限')
      }
      this.form.permissions.splice(index, 1)
      this.permissionsError = false
    },
    // 校验权限设置字段的
    validatePermissions() {
      if (this.form.type === 1) return false
      let flag = false
      this.form.permissions.forEach((item) => {
        for (const key in item) {
          if (!item[key] && key !== 'error') {
            this.$set(item, 'error', true)
            flag = true
            return false
          }
          this.$set(item, 'error', false)
        }
      })
      return flag
    },
    setIconInput(icon) {
      this.form.icon = icon
    },
    // 编辑状态的 初始化函数
    async editInit() {
      if (this.menuId) {
        const result = await menuDetail(this.menuId)
        if (result['code'] === 200) {
          this.form = {
            ...this.form,
            ...result.data,
            parent: result.data.parentId === this.rootId ? '' : result.data.parentId,
            type: result.data.type > 2 ? 2 : result.data.type || 2,
            showMenu: result.data.showMenu === 1
          }
        }
      } else {
        this.form.type = 2
      }
      this.loading = false
    },
    // 切换时去除 错误提示
    menuTypeChange() {
      this.form.permissions.forEach((permission) => {
        delete permission.error
      })
      this.permissionsError = false
      this.$refs.ruleForm.clearValidate()
    },
  },
  mounted() {
    this.form.parentId = this.rootId
    if (this.isLook) {
      this.columns.splice(-1, 1)
    }
    this.editInit()
  },
}
</script>

<style lang="less" scoped>
.permission-wrapper {
  border-top: 1px dashed #ddd;
  .ant-row {
    line-height: 32px;
  }
  .permission-header {
    border-bottom: 1px solid #ddd;
    color: #000;
    line-height: 32px;
    padding-left: 15px;
    display: flex;
    align-items: center;
  }
  .permission-title {
    background: rgb(250, 250, 250);
    text-align: center;
    font-weight: bold;
  }
  .permission-item {
    border-bottom: 1px solid #ddd;
    > .ant-col {
      padding: 5px 8px;
    }
    &:nth-child(2n) {
      background-color: #f8f9fa;
    }
    .ant-col-2 {
      text-align: center;
    }
  }
  .anticon-plus {
    color: #1890ff;
    font-size: 18px;
    margin-left: 10px;
    &:hover {
      color: #0071d9;
      cursor: pointer;
    }
  }
  .anticon-delete {
    font-size: 18px;
    &:hover {
      color: #1890ff;
      cursor: pointer;
    }
  }
  .error-item {
    border: 1px solid red;
  }
  .error {
    color: red;
  }
}
.icon-list-wrapper {
  display: flex;
  align-items: center;
  .anticon {
    font-size: 18px;
    margin-right: 10px;
    &:hover {
      color: #1890ff;
      cursor: pointer;
    }
  }
}
.loading {
  height: 350px;
  font-size: 50px;
  text-align: center;
  line-height: 350px;
}
.menu-tree-select {
  max-height: 80vh !important;
}
</style>
