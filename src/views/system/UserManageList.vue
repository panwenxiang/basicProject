<template>
  <page-header>
    <div class="system-manage-content">
      <!-- 搜索部分 -->
      <div class="table-page-search-wrapper">
        <a-form-model layout="inline">
          <a-row :gutter="48">
            <a-col :xl="7" :sm="8">
              <a-form-model-item>
                <a-input v-model="queryParam.keyword" placeholder="用户名、手机号、邮箱" allow-clear/>
              </a-form-model-item>
            </a-col>
            <a-col :xl="7" :sm="8">
              <a-form-model-item>
                <a-button type="primary" @click="search()">查询</a-button>
                <a-button style="margin-left: 8px" @click="reset()">重置</a-button>
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-form-model>
      </div>
      <!-- 工具栏 -->
      <div class="table-operator">
        <a-button v-if="$auth(UserPermission.ADD)" type="primary" icon="plus" @click="handleEdit({}, 'add')">添加用户</a-button>
        <a-button v-if="$auth(UserPermission.ROLE_ASSIGN)" type="primary" @click="rolesSelect">批量分配角色</a-button>
        <a-popconfirm
          v-if="$auth(UserPermission.DELETE)"
          :title="`确定要对选中的${selectedRowKeys.length}个用户批量删除吗?`"
          ok-text="确定"
          cancel-text="取消"
          @confirm="userBatchStatus('delete')"
        >
          <a-button type="primary">批量删除</a-button>
        </a-popconfirm>
      </div>
      <!-- 表格数据-->
      <bh-table
        :page-config="queryParam"
        :columns="columns"
        :dataSource="tableData"
        rowKey="userId"
        :table-config="{ rowSelection:rowSelection }"
        :spinning="loading"
        @pageChange="handlePageChange">
        <template v-slot:enabled="{scope}">
          <a-switch
            v-model="scope.enabled"
            :active-value="true"
            :inactive-value="false"
            @change="onChangeStatus(scope)"
          />
        </template>

        <!-- 操作  -->
        <template v-slot:action="{scope}" >
          <div style="width: 250px">
            <a @click="handleRole(scope)" v-if="$auth(UserPermission.ROLE_ASSIGN)">角色选择</a>
            <a-divider type="vertical" />
            <a @click="handleEdit(scope, '')">查看</a>
            <a-divider type="vertical" />
            <a @click="handleEdit(scope, 'edit')" v-if="$auth(UserPermission.UPDATE)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm v-if="$auth(UserPermission.DELETE)" placement="topRight" ok-text="确定" cancel-text="取消" @confirm="deleteUser(scope)">
              <template v-slot:title> 此删除不可恢复，确定要删除吗? </template>
              <a>删除</a>
            </a-popconfirm>
          </div>
        </template>
      </bh-table>
    </div>
    <!-- 新增/编辑/查看 -->
    <edit-form
      ref="userEditForm"
      :visible="editVisible"
      :loading="editConfirmLoading"
      :type="type"
      @cancel="handleEditCancel"
      @ok="handleEditOk"
    />
    <!-- 角色列表组件 -->
    <roles-form
      ref="roleModal"
      :visible="roleVisible"
      :loading="roleConfirmLoading"
      @cancel="handleRoleCancel"
      @ok="handleRoleOk"
    />
  </page-header>
</template>

<script>
import {
  getUserList,
  addUser,
  updateUser,
  setBatchRole,
  changeUserStatus,
  userBatchStatus,
  userBatchDelete,
} from '@/api/system'
import RolesForm from './components/RolesForm'
import EditForm from './components/UserEditForm'
import {bhMessage} from '@/utlis/utli'
import {UserPermission} from '@/permission/permissionKeyNameMap'
import BhTable from '@/components/BhTable'

export default {
  name: 'UserManageList',
  components: {
    RolesForm,
    EditForm,
    BhTable
  },
  data() {
    return {
      UserPermission,
      visible: false,
      confirmLoading: false,
      // 角色选择 model
      roleVisible: false,
      roleConfirmLoading: false,
      
      // 编辑/详情 model
      editVisible: false,
      editConfirmLoading: false,
      type: '', // edit编辑，空为查看
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {
        keyword: '',
        current: 1,
        size: 10,
        companyId: '',
        total: 0
      },
      // 表格数据
      tableData: [],
      loading: false,
      selectedRowKeys: [],
      selectedRows: [],
      resetLoadingUserId: 0, // 正在做用户重置的账号
      linkVisible: false,
      saveSearchCompanyKey: '',
      columns: [
        {
          title: '用户名',
          dataIndex: 'userName',
          key: 'userName',
        },
        {
          title: '昵称',
          dataIndex: 'nickName',
          key: 'nickName',
        },
        {
          title: '手机号',
          dataIndex: 'mobile',
          key: 'mobile',
        },
        {
          title: '邮箱',
          dataIndex: 'email',
          key: 'email',
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '200px',
          scopedSlots: { customRender: 'action' },
        },
      ]
    }
  },
  mounted() {
    this.getList() // 获取用户管理列表
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange,
      }
    }
  },
  methods: {
    // 获取用户管理列表
    getList() {
      this.loading = true
      const queryParam = { ...this.queryParam }
      delete queryParam.total
      getUserList(queryParam).then((res) => {
        this.loading = false
        this.tableData = res.data.records
        this.queryParam.total = parseInt(res.data.total, 10)
      })
    },
    // 搜索
    search() {
      this.queryParam.current = 1
      this.getList()
    },
    // 重置
    reset() {
      this.queryParam.current = 1
      this.queryParam.keyword = ''
      this.selectedRowKeys = []
      this.getList()
    },
    // 分页
    handlePageChange({ current, size }) {
      this.selectedRowKeys = []
      this.queryParam.current = current
      this.queryParam.size = size
      this.getList()
    },
    // 单个角色选择
    handleRole(record) {
      this.roleVisible = true
      this.roleConfirmLoading = true
      const ids = [record.userId]
      this.$refs.roleModal.getRoleList('one', ids)
      setTimeout(() => {
        this.roleConfirmLoading = false
      }, 500)
    },
    /**
     * 设置用户角色组件 roles-form 的确定函数
     * @param form 回调返回的表单
     */
    handleRoleOk(form) {
      this.roleConfirmLoading = true
      setBatchRole(form)
        .then((result) => {
          if (result['code'] === 200) {
            bhMessage.success('编辑角色成功')
            this.roleVisible = false
            this.roleConfirmLoading = false
            this.selectedRowKeys = []
            this.selectedRows = []
            this.getList()
          }
        })
        .catch(() => {
          this.roleConfirmLoading = false
        })
    },
    // 关闭角色选择弹窗
    handleRoleCancel() {
      this.roleVisible = false
    },
    // 编辑/详情
    handleEdit(record, type) {
      this.editVisible = true
      this.type = type
      this.$refs.userEditForm.getRoleList() // 获取角色列表
      if (type !== 'add') {
        // 新增时不需要查询详情
        this.$refs.userEditForm.getDetail(record.userId)// 查询详情
      }
    },
    checkSelectedKeys() {
      if (this.selectedRowKeys.length === 0) {
        bhMessage.warn('请先选择用户，再进行操作！')
        return false
      }
      return true
    },
    async userBatchRequestResult(result, key) {
      if (result.code === 200) {
        bhMessage.success(`批量${key === 'delete' ? '删除' : key === 'enable' ? '启用' : '禁用'}成功`)
        this.current = 1
        await this.getList()
        this.selectedRowKeys = []
      }
    },
    async userBatchStatus(key) {
      const requestMap = {
        delete: userBatchDelete,
        enable: userBatchStatus,
        disabled: userBatchStatus,
      }
      if (this.checkSelectedKeys()) {
        const params =  this.selectedRowKeys
        if (key === 'enable' || key === 'disabled') {
          params.status = key === 'enable'
        }
        const result = await requestMap[key](params)
        await this.userBatchRequestResult(result, key)
      }
    },
    async deleteUser(row) {
      const result = await userBatchDelete([row.userId])
      if (result['code'] === 200) {
        bhMessage.success('删除成功')
        // 当一页只有一条时，该条删除成功之后，就该回到上一页搜索列表
       // this.queryParam.current = 1
        if (this.tableData.length === this.selectedRowKeys.length && this.queryParam.current !== 1){
          this.queryParam.current -= 1
        }
        await this.getList()
        this.selectedRowKeys = []
      }
    },
    /**
     * 操作用户组件的 确定回调，根据this.type来确定 当前组件对应 是编辑 还是 新增
     * @param form 组件返回的表单数据
     */
    handleEditOk(form) {
      this.editConfirmLoading = true
      switch (this.type) {
        case '':
          this.handleEditCancel()
          break
        case 'add':
          this.addUser(form)
          break
        case 'edit':
          this.updateUser(form)
          break
      }
    },
    /**
     * 操作用户组件 的添加用户操作
     * @param form
     */
    addUser(form) {
      addUser(form).then((result) => {
        if (result['code'] === 200) {
          bhMessage.success(result['message'])
          this.handleEditCancel()
          this.queryParam.current = 1
          this.getList()
        }
        this.editConfirmLoading = false
      })
    },
    // 修改用户信息
    updateUser(form) {
      const params = {
        address: '',
        alias: '',
        avatar: '',
        email: '',
        enabled: false,
        gender: 0,
        mobile: '',
        name: '',
        nickName: '',
        password: '',
        position: '',
        roleIds: [],
        telephone: '',
        userId: 0,
        userName: '',
      }
      // 提交参数需要和后端要求的完全一致，所以选择这种根据参数对象 去逐一拿值
      Object.keys(params).forEach((key) => {
        params[key] = form[key]
      })
      updateUser(params)
        .then((res) => {
          if (res['code'] === 200) {
            bhMessage.success('编辑成功')
            this.getList()
            this.handleEditCancel()
          }
          this.editConfirmLoading = false
        })
        .catch(() => {
          this.handleEditCancel()
        })
    },
    // 关闭编辑
    handleEditCancel() {
      this.editVisible = false
      this.editConfirmLoading = false
      this.type = ''
      this.userId = ''
      this.$refs.userEditForm.resetForm()
    },
    // 表格多选 change函数
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    // 更新用户状态
    onChangeStatus(record) {
      changeUserStatus(record.userId).then((result) => {
        // 操作失败的话，刷新列表，告知用户禁用失败
        if (result['code'] !== 200) {
          this.getList()
        } else {
          bhMessage.success('操作成功')
        }
      })
    },
    // 批量设置用户的角色
    rolesSelect() {
      if (this.selectedRows.length === 0) {
        bhMessage.warn('请先选择用户')
        return
      }
      this.roleVisible = true // 打开角色弹窗
      let ids = []
      ids = this.selectedRows.map((v) => v.userId)
      this.$refs.roleModal.getRoleList('', ids)
    },
  },
}
</script>
<style lang="less" scoped>
@import "system";
.email-text-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.email-is-enabled,
.email-is-no-enabled {
  color: #999;
  border: 1px solid;
  padding: 0 2px;
  display: inline-block;
  font-size: 12px;
  border-radius: 3px;
  margin-left: 20px;
}
.form-item{
  width: 30%;max-width: 300px;
  /deep/.ant-col.ant-form-item-control-wrapper{
    width: 100%;
  }
}
.system-manage-content div.table-operator{
  padding-top: 0;
}
</style>
