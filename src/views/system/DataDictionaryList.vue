<template>
  <page-header>
    <a-card :bordered="false" class="system-manage-content">
      <a-form-model>
        <a-row :gutter="48">
          <a-col :md="6" :sm="24" style="padding-right: 5px;">
            <a-form-model-item>
              <a-input v-model="searchForm.keyword" placeholder="关键词" allow-clear/>
            </a-form-model-item>
          </a-col>
          <a-col :md="1" :sm="1" style="padding-left: 0;height: 20px;top: 12px">
            <template>
              <a-tooltip>
                <template slot="title">
                  可匹配：字典项名称，字典项类型，字典项排序，字典项备注
                </template>
                <a-icon type="info-circle"/>
              </a-tooltip>
            </template>
          </a-col>
          <a-col :md="6" :sm="24">
            <a-form-model-item>
              <a-button type="primary" @click="search()">查询</a-button>
              <a-button style="margin-left: 10px" @click="reset()">重置</a-button>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>

      <!-- 工具栏 -->
      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="dictTypeAdd" style="margin-right: 15px">添加字典项</a-button>
        <a-popconfirm title="确定批量删除选中的数据字典项吗？" ok-text="确定" cancel-text="取消" @confirm="dictTypeBatchDel">
          <a-button type="primary">批量删除</a-button>
        </a-popconfirm>
      </div>
      <div class="data-dictionary-main">
        <bh-table :page-config="page" :columns="columns" :dataSource="records" rowKey="id" :table-config="{rowSelection:rowSelection}" @pageChange="pageChange">
          <template v-slot:serial="{index}">
            {{ index + 1 + (page.current - 1) * page.size }}
          </template>
          <template v-slot:remark="{text}">
            <span v-html="text && text.replace(/\n/g, '<br>')"></span>
          </template>
          <template v-slot:action="{scope}">
            <span class=""></span>
            <a @click="editDictionaryType(scope)">编辑</a>
            <a-divider type="vertical"/>
            <a @click="showValueList(scope)">列表</a>
            <a-divider type="vertical"/>
            <a-popconfirm
              title="确定要删除该数据字典项吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="deleteDict(scope)"
            >
              <a>删除</a>
            </a-popconfirm>
          </template>
        </bh-table>
      </div>
    </a-card>

    <a-modal
      :title="modalTitle"
      v-model="modalVisible"
      :width="`${modalWidth}px`"
      :maskClosable="false"
      :destroyOnClose="true"
      :confirm-loading="modalConfirmLoading"
      @ok="modalOkFn"
      @cancel="modelHide"
    >
      <component ref="modalContent" :is="modalComponentName" :info="modalComponentInfo"/>
    </a-modal>
  </page-header>
</template>

<script>
import DictionaryValue from '@/views/system/components/DictionaryValueList'
import DictionaryType from '@/views/system/components/DictionaryType'
import {dictTypeDeleteBatch, dictTypeList} from '@/api/system'
import {bhMessage, replaceLineFeed} from '@/utlis/utli'
import BhTable from '@/components/BhTable'

export default {
  name: 'DataDictionaryVue',
  components: {
    DictionaryValue,
    DictionaryType,
    BhTable
  },
  data() {
    return {
      page: {
        current: 1,
        total: 0,
        size: 10,
      },
      searchForm: {
        keyword: '',
        typeName: '',
        type: '',
        typeCode: ''
      },
      columns: [
        {
          title: '序号',
          width: 80,
          scopedSlots: {customRender: 'serial'},
        },
        {
          title: '名称',
          dataIndex: 'dictName',
          width: 300
        },
        {
          title: '类型',
          dataIndex: 'dictType',
          scopedSlots: {customRender: 'dictType'},
          sorter: true
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: 300,
          scopedSlots: {customRender: 'remark'},
        },
        {
          title: '操作',
          scopedSlots: {customRender: 'action'},
        },
      ],
      records: [],
      loading: false,
      modalTitle: '',
      modalWidth: 600,
      modalVisible: false,
      modalComponentName: '',
      modalComponentInfo: {}, // modal component 传入的info变量
      typeMap: {
        1: '系统字典',
        2: '业务字典',
      },
      labelCol: {span: 6},
      wrapperCol: {span: 17},
      selectedRowKeys: [], // 列表多选 数组
      modalConfirmLoading: false,
    }
  },
  computed: {
    rowSelection() {
      return {
        onChange: this.onSelectChange,
      }
    },
  },
  methods: {
    replaceLineFeed,
    /**
     * 获取 table 列表数据
     * @returns {Promise<void>}
     */
    async getList() {
      const {page, searchForm} = this
      this.loading = true
      const result = await dictTypeList({
        current: page.current,
        size: page.size,
        ...searchForm,
      })
      this.loading = false
      if (result['code'] === 200) {
        this.records = result.data.records
        page.total = parseInt(result.data.total, 10)
      }
    },
    /**
     * 搜索函数
     */
    search() {
      this.page.current = 1
      this.getList()
    },
    /**
     * 重置函数
     */
    reset() {
      this.page.current = 1
      this.searchForm.keyword = ''
      this.searchForm.typeName = ''
      this.searchForm.typeCode = ''
      this.searchForm.type = ''
      this.selectedRowKeys = []
      this.getList()
    },
    /**
     * 页码组件 回调函数
     * @param page 页码
     */
    pageChange(page) {
      this.page.current = page.current
      this.selectedRowKeys = []
      this.getList()
    },
    /**
     * 关闭弹窗
     */
    modelHide() {
      this.modalVisible = false
    },
    /**
     * 展示 字典项的键值列表
     * @param record
     */
    showValueList(record) {
      this.modalWidth = 850
      this.modalComponentInfo = record
      this.modalComponentName = 'DictionaryValue'
      this.modalTitle = `键值列表（${record.dictType}）`
      this.modalVisible = true
    },
    /**
     * 字典项添加 点击方法
     */
    dictTypeAdd() {
      this.dictionaryTypeAction()
    },
    /**
     * 字典项编辑 点击方法
     * @param record 编辑的字典项数据
     */
    editDictionaryType(record) {
      this.dictionaryTypeAction(record)
    },
    /**
     * 数据字典项 的添加或者编辑 公共操作函数
     * @param record 要操作的项数据，如果为{}则代表添加，不是空对象 代表编辑
     */
    dictionaryTypeAction(record = {}) {
      this.modalWidth = 600
      this.modalTitle = `${record.id ? '编辑' : '添加'}字典项`
      this.modalComponentInfo = record
      this.modalComponentName = 'DictionaryType'
      this.modalVisible = true
    },
    /**
     * 点击弹窗的确定按钮的 只有添加编辑 字典项有值
     */
    modalOkFn() {
      if (typeof this.$refs.modalContent.submit === 'function') {
        this.$refs.modalContent.submit(
            (result) => {
              if (result.code === 200 && this.modalComponentName === 'DictionaryType') {
                this.modelHide()
                bhMessage.success(`${this.modalComponentInfo.id ? '编辑' : '新增'}成功`)
                this.getList()
              }
              this.modalConfirmLoading = false
            },
            (valid) => {
              this.modalConfirmLoading = valid
            }
        )
      }
      this.modalVisible = false
    },
    /**
     * 删除单项字典函数
     * @param record 当前操作项的数据
     * @returns {Promise<void>}
     */
    deleteDict(record) {
      this.doDictDel([record.id])
    },
    /**
     * 列表多选回调函数
     * @param selectedRowKeys 多选中的 id数组
     */
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    /**
     * 批量删除多条记录
     */
    dictTypeBatchDel() {
      this.doDictDel(this.selectedRowKeys, () => {
        this.selectedRowKeys = []
      })
    },
    /**
     * 发送删除请求
     */
    async doDictDel(data, callback) {
      if (data.length === 0) {
        return bhMessage.warn('至少选择一项')
      }
      const result = await dictTypeDeleteBatch(data)
      if (result['code'] === 200) {
        bhMessage.success('删除成功')
        if (this.records.length === data.length && this.page.current !== 1) {
          this.page.current -= 1
        }
        await this.getList()
        if (typeof callback === 'function') {
          callback()
        }
      }
    },
  },
  mounted() {
    this.getList()
  },
}
</script>

<style lang="less" scoped>
.data-dictionary-main {
  margin-top: 10px;
}
</style>
