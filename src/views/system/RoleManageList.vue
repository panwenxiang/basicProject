<template>
  <page-header>
    <div class="system-manage-content">
      <a-form-model layout="inline">
        <a-form-model-item>
          <a-input v-model="searchKeyWord" placeholder="请输入角色名称" allow-clear />
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" @click="search()">查询</a-button>
          <a-button style="margin-left: 10px" @click="reset()">重置</a-button>
        </a-form-model-item>
      </a-form-model>
      <!-- 工具栏 -->
      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="addRole">添加角色</a-button>
        <a-popconfirm
          :title="`确定要对选中的${selectedRowKeys.length}个角色批量删除吗?`"
          ok-text="确定"
          cancel-text="取消"
          @confirm="batchOperation('delete')"
        >
          <a-button type="primary">批量删除</a-button>
        </a-popconfirm>
      </div>
      <a-table
        :columns="columns"
        :dataSource="records"
        :rowKey="(row) => row.id"
        :loading="loading"
        :defaultExpandAllRows="true"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        :pagination="false"
        :locale="{ emptyText: '暂无数据' }"
        tableLayout="fixed"
        :class="{ loading: loading || records == null || records.length <= 0 }"
      >
        <template v-slot:description="text">
          <span v-html="text && text.replace(/\n/g, '<br>')"></span>
        </template>
        <template v-slot:action="_, row">
          <a @click="openModal('look', row)">查看</a>
          <a-divider type="vertical" />
          <a @click="openModal('edit', row)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm placement="topRight" ok-text="确定" cancel-text="取消" @confirm="roleDel(row)">
            <template v-slot:title> 此删除不可恢复，确定要删除吗? </template>
            <a>删除</a>
          </a-popconfirm>
        </template>
      </a-table>

      <BhPagination v-model="current" :total="total" :size.sync="size" @change="pageChange" />
    </div>

    <a-modal
      :title="modalTitle"
      v-model="visible"
      width="800px"
      :maskClosable="false"
      :destroyOnClose="true"
      :confirm-loading="modalConfirmLoading"
      @cancel="closeModel"
      @ok="roleOperationOk"
      :wrapClassName="isLook?'RoleManageModal':''"
    >
      <RoleOperation
        ref="RoleOperation"
        :role-info="currentRoleInfo"
        @ok="operationOk"
        :is-look="isLook"
        @cancel="closeModel"
      />
    </a-modal>
  </page-header>
</template>

<script>
import { changeRoleStatus, getRoleList, roleBatchDelete, roleBatchStatus, roleDelete } from '@/api/system'
import RoleOperation from '@/views/system/components/RoleOperation'
import { bhMessage } from '@/utlis/utli'

export default {
  name: 'RoleManage',
  components: {
    RoleOperation,
  },
  data() {
    return {
      searchKeyWord: '', // 搜索输入词
      records: [], // 角色列表
      loading: false,
      selectedRowKeys: [], // table 多选
      columns: [
        {
          title: '角色名称',
          dataIndex: 'roleName',
          key: 'roleName',
        },
        {
          title: '角色说明',
          dataIndex: 'description',
          key: 'description',
          scopedSlots: { customRender: 'description' },
        },
        {
          title: '操作',
          key: 'action',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
        },
      ],
      visible: false,
      modalTitle: '',
      currentRoleInfo: {},
      isLook: false, // 打开弹窗是否是查看状态 T：查看 F:新增/编辑
      current: 1,
      size: 10,
      total: 0,
      modalConfirmLoading: false,
    }
  },
  methods: {
    async getList() {
      const { current, size, searchKeyWord } = this
      this.loading = true
      const result = await getRoleList({
        roleName: searchKeyWord,
        current,
        size,
      })
      this.loading = false
      if (result['code'] === 200) {
        this.total = parseInt(result.data.total, 10)
        this.records = result.data.records
      }
    },
    search() {
      this.selectedRowKeys = [] // 搜索时去掉多选框筛选
      this.getList()
    },
    reset() {
      this.searchKeyWord = ''
      this.current = 1
      this.selectedRowKeys = [] // 搜索时去掉多选框筛选
      this.getList()
    },
    addRole() {
      this.visible = true
      this.modalTitle = '添加角色'
    },
    /**
     * 确认在进行批量操作前 是否有选择中操作项
     * @returns {boolean} T 选中有
     */
    checkSelectedKeys() {
      if (this.selectedRowKeys.length === 0) {
        bhMessage.warn('请选择角色，再进行操作！')
        return false
      }
      return true
    },
    /**
     * 全部批量操作后的处理
     * @param result 接口返回的数据
     * @param key 代表是什么批量操作，delete删除、enable启用，disabled禁用
     * @returns {Promise<void>}
     */
    async handleBatchRequestResult(result, key) {
      if (result.code === 200) {
        bhMessage.success(`批量${key === 'delete' ? '删除' : key === 'enable' ? '启用' : '禁用'}成功`)
        this.current = 1
        await this.getList()
        this.selectedRowKeys = []
      }
    },
    /**
     * 批量操作方法
     * @param key String  delete删除 enable启用  disabled禁用
     * @returns {Promise<void>}
     */
    async batchOperation(key) {
      const requestMap = {
        delete: roleBatchDelete,
        enable: roleBatchStatus,
        disabled: roleBatchStatus,
      }
      if (this.checkSelectedKeys()) {
        const params = {
          ids: this.selectedRowKeys,
        }
        if (key === 'enable' || key === 'disabled') {
          params.status = key === 'enable'
        }
        const result = await requestMap[key](params)
        await this.handleBatchRequestResult(result, key)
      }
    },
    // 角色删除
    async roleDel(row) {
      const result = await roleBatchDelete({
        ids: [row.id]
      })
      if (result['code'] === 200) {
        bhMessage.success('删除成功')
        // 当一页只有一条时，该条删除成功之后，就该回到上一页搜索列表
        if (this.records.length === 1) {
          this.current = this.current - 1 === 0 ? 1 : this.current - 1
        }
        await this.getList()
        this.selectedRowKeys = []
      }
    },
    openModal(type, row) {
      this.currentRoleInfo = row
      this.isLook = type === 'look'
      this.modalTitle = this.isLook ? '查看角色' : '编辑角色'
      this.visible = true
    },
    closeModel() {
      this.visible = false
      this.currentRoleInfo = {}
      this.isLook = false
      this.modalConfirmLoading = false
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    async changeStatus(row) {
      const result = await changeRoleStatus(row.id)
      if (result['code'] === 200) {
        bhMessage.success('操作成功')
        row.status = !row.status
      }
    },
    // 角色操作组件 RoleOperation ok的回调函数
    operationOk() {
      this.selectedRowKeys = [] // 搜索时去掉多选框筛选
      this.getList()
      this.modalConfirmLoading = false
    },
    pageChange() {
      this.selectedRowKeys = []
      this.getList()
    },
    /**
     * 触发角色操作组件 提交
     */
    roleOperationOk() {
      this.$refs.RoleOperation.submit(
        () => {
          // 此函数在组件 操作组件内部是 提交方法中是最后执行的
          this.modalConfirmLoading = false
        },
        (valid) => {
          this.modalConfirmLoading = valid
          this.$set(this, 'modalConfirmLoading', valid)
        }
      )
    },
  },
  async mounted() {
    await this.getList()
  },
}
</script>

<style lang="less" scoped>
@import "system";

</style>
<style lang="less">
.RoleManageModal{
  .ant-modal-footer{
    display: none;
  }
}
</style>
