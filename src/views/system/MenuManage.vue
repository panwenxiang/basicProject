<template>
  <page-header>
    <div class="system-manage-content">
      <!-- 工具栏 -->
      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="openModal('add')">新建菜单</a-button>
      </div>
      <a-table
        :rowKey="(row) => row.id"
        :columns="columns"
        :data-source="allMenus"
        :pagination="false"
        childrenColumnName="childMenus"
        :expanded-row-keys.sync="expandedRowKeys"
      >
        <template v-slot:showMenu="showMenu">
          <span>{{ showMenu === 1 ? '显示' : '隐藏' }}</span>
        </template>
        <template v-slot:action="_, row">
          <a @click="openModal('look', row)">查看</a>
          <a-divider type="vertical" />
          <a @click="openModal('edit', row)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm placement="topRight" ok-text="确定" cancel-text="取消" @confirm="menuDel(row)">
            <template v-slot:title> 此删除不可恢复，确定要删除吗? </template>
            <a>删除</a>
          </a-popconfirm>
        </template>
      </a-table>
    </div>
    <!--  弹框  -->
    <a-modal
      :title="title"
      :visible="visible"
      :maskClosable="false"
      wrapClassName="menu-operation-modal"
      width="800px"
      :footer="null"
      :destroyOnClose="true"
      @cancel="() => (this.visible = false)"
    >
      <menu-operation :is-look="isLook" :menu-id="currentMenuId" @cancel="() => (this.visible = false)" />
    </a-modal>
  </page-header>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import MenuOperation from './components/MenuOperation'
import { menuDelete } from '@/api/system'
import { bhMessage } from '@/utlis/utli'

export default {
  name: 'MenuManage',
  components: {
    MenuOperation,
  },
  data() {
    return {
      columns: [
        {
          title: '菜单名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '页面路由',
          dataIndex: 'url',
          key: 'url',
        },
        {
          title: '菜单序号',
          dataIndex: 'sortNum',
          key: 'sortNum',
        },
        {
          title: '菜单显示',
          dataIndex: 'showMenu',
          key: 'showMenu',
          scopedSlots: { customRender: 'showMenu' },
        },
        {
          title: '操作',
          key: '_panel',
          dataIndex: '_panel',
          scopedSlots: { customRender: 'action' },
        },
      ],
      list: [],
      expandedRowKeys: [],
      visible: false,
      title: '',
      currentMenuId: '',
      isLook: false, // 菜单编辑组件 是编辑还是新增
    }
  },
  computed: {
    ...mapState({
      allMenus: (state) => state.allMenus
    })
  },
  methods: {
    ...mapActions(['GetAllMenuList']),
    openModal(type, row = {}) {
      const titleType = {
        add: '新建',
        edit: '编辑',
        look: '查看',
      }
      this.title = `${titleType[type] || ''}菜单`
      this.currentMenuId = row.id || ''
      this.isLook = type === 'look'
      this.visible = true
    },
    async menuDel(row) {
      const result = await menuDelete(row.id)
      if (result['code'] === 200) {
        await this.GetAllMenuList(true)
        bhMessage.success('删除成功')
      }
    },
  },
  async mounted() {
    await this.GetAllMenuList()
  },
}
</script>

<style lang="less">
@import "system";
.menu-operation-modal .ant-modal-body{
  padding-bottom: 5px;
}
.system-manage-content .table-operator{
  padding-top: 0;
}
</style>
