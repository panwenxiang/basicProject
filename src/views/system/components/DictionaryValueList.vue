<template>
  <div class="dictionary-value-list">
    <a-form-model layout="inline">
      <a-form-model-item>
        <a-button type="primary" @click="valueModalShow()">新增</a-button>
      </a-form-model-item>
    </a-form-model>
    <a-table
      :columns="columns"
      :dataSource="records"
      :rowKey="(row) => row.id"
      :loading="loading"
      :defaultExpandAllRows="true"
      :pagination="false"
      :locale="{ emptyText: '暂无数据' }"
      tableLayout="fixed"
      class="auto-width"
      size="small"
      :scroll="tableScroll"
    >
      <template v-slot:serial="test, record, index">
        {{ index + 1 }}
      </template>
      <template v-slot:remark="text">
        <span v-html="replaceLineFeed(text)"></span>
      </template>
      <template v-slot:action="text, record">
        <a @click="valueModalShow(record)">编辑</a>
        <a-divider type="vertical" />
        <a-popconfirm title="确定删除该数据字典值吗？" ok-text="确定" cancel-text="取消" @confirm="deleteValue(record)">
          <a>删除</a>
        </a-popconfirm>
      </template>
    </a-table>
    <a-modal
      :title="modalTitle"
      :visible="visible"
      @cancel="modalCancel"
      @ok="modalOk"
      :confirm-loading="modalConfirmLoading"
    >
      <a-form-model ref="modalForm" :model="valueForm" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-model-item label="字典类型">
          <a-input :value="info.dictType" disabled />
        </a-form-model-item>
        <a-form-model-item prop="dictLabel" label="字典项名称">
          <a-input v-model="valueForm.dictLabel" />
        </a-form-model-item>
        <a-form-model-item prop="dictValue" label="字典项值">
          <a-input v-model="valueForm.dictValue" />
        </a-form-model-item>
        <a-form-model-item label="序号">
          <a-input v-model="valueForm.sortNum" />
        </a-form-model-item>
        <a-form-model-item prop="remark" label="备注">
          <a-input type="textarea" v-model="valueForm.remark" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
// 编辑某一个数字字典的具体列表
import { dictAdd, dictDeleteBatch, dictList, dictUpdate } from '@/api/system'
import { bhMessage, replaceLineFeed } from '@/utlis/utli'
import cloneDeep from 'lodash.clonedeep'

export default {
  name: 'DictionaryValueList',
  props: {
    info: {
      type: Object,
      default() {
        return {}
      },
      required: true,
    },
  },
  data() {
    return {
      searchForm: {
        dictName: '',
        remark: '',
      },
      columns: [
        {
          title: '名称',
          dataIndex: 'dictLabel',
        },
        {
          title: '键值',
          dataIndex: 'dictValue',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          scopedSlots: { customRender: 'remark' },
        },
        {
          title: '操作',
          width: 110,
          scopedSlots: { customRender: 'action' },
        },
      ],
      records: [],
      loading: false,
      visible: false,
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
      valueForm: {
        dictLabel: '',
        dictValue: '',
        remark: '',
        sortNum: 0
      },
      rules: {
        dictLabel: [{ required: true, message: '请输入字典项名称', trigger: 'blur' }],
        dictValue: [{ required: true, message: '请输入键值', trigger: 'blur' }],
        // remark: [{ required: true, message: '请输入描述信息', trigger: 'blur' }],
      },
      modalTitle: '',
      tableScroll: { y: 450 },
      selectedRowKeys: [],
      modalConfirmLoading: false,
    }
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange,
      }
    },
  },
  methods: {
    replaceLineFeed,
    /**
     * 获取该字典项 对应的键值对列表
     */
    async getList() {
      this.loading = true
      const result = await dictList(this.info.dictType)
      console.log(12333)
      this.loading = false
      if (result['code'] === 200) {
        this.records = result.data.records
      }
    },
    /**
     * 搜索函数
     */
    search() {
      this.getList()
    },
    /**
     * 重置函数
     */
    reset() {
      this.searchForm.dictName = ''
      this.searchForm.remark = ''
      this.selectedRowKeys = []
      this.getList()
    },
    /**
     * 弹窗显示： 编辑、添加 单项数据
     * @param record 该条要操作的键值记录
     */
    valueModalShow(record) {
      this.modalTitle = `${record ? '编辑' : '新增'}字典项`
      this.valueForm = cloneDeep(record || {})
      this.visible = true
    },
    /**
     * 弹窗取消按钮 点击函数
     */
    modalCancel() {
      this.visible = false
      this.valueForm = {
        ...this.valueForm,
        dictName: '',
        dictValue: '',
        remark: '',
        sortNum: '',
      }
      this.$refs.modalForm.clearValidate()
    },
    /**
     * 弹窗确定按钮 点击函数
     */
    modalOk() {
      this.$refs.modalForm.validate(async (valid) => {
        this.modalConfirmLoading = valid
        if (valid) {
          // 根据valueForm的id判断当前是新增 还是编辑
          let result

          if (this.valueForm.id) {
            result = await dictUpdate({
              id: this.valueForm.id,
              dictType: this.info.dictType,
              dictLabel: this.valueForm.dictLabel,
              dictValue: this.valueForm.dictValue,
              remark: this.valueForm.remark,
              sortNum: this.valueForm.sortNum,
            })
          } else {
            console.log(this.valueForm)
            result = await dictAdd({
              ...this.valueForm,
              dictType: this.info.dictType,
            })
          }
          if (result['code'] === 200) {
            this.modalCancel()
            await this.getList()
          }
          this.modalConfirmLoading = false
        }
      })
    },
    /**
     * 删除单项字典值
     * @param record 当前操作项的数据
     * @returns {Promise<void>}
     */
    deleteValue(record) {
      this.doValueDel(record.id)
    },
    /**
     * 列表多选回调
     * @param selectedRowKeys 多选中的 id数组
     */
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    /**
     * 批量删除多条记录
     */
    valueBatchDel() {
      if (this.selectedRowKeys.length === 0) {
        return bhMessage.warn('至少选择一项进行操作！')
      }
      this.doValueDel(this.selectedRowKeys, () => {
        this.selectedRowKeys = []
      })
    },
    /**
     * 发送删除请求
     */
    async doValueDel(data, callback) {
      const result = await dictDeleteBatch(data)
      if (result['code'] === 200) {
        bhMessage.success('删除成功')
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
.dictionary-value-list {
  .ant-table-wrapper {
    margin-top: 10px;
  }
}
.pagination-info {
  padding-top: 15px;
  padding-bottom: 0;
}
.auto-width.ant-table-wrapper ::v-deep .ant-table-scroll .ant-table-body {
  overflow-y: auto !important;
}
</style>
