<template>
  <page-header>
    <a-card :bordered="false" class="system-manage-content">
      <!-- 搜索部分 -->
      <div class="table-page-search-wrapper">
        <a-form-model layout="inline">
          <a-row :gutter="48" class="row-search">
            <a-col :md="6" :sm="24">
              <a-form-model-item label="">
                <a-input v-model="queryParam.keyword" placeholder="任意关键词" allow-clear />
              </a-form-model-item>
            </a-col>
            <a-col :md="1" :sm="1" style="padding-left: 0px">
              <template>
                <a-tooltip>
                  <template slot="title">
                    可匹配：模块标题，方法名称，	请求方式，	操作人员，	请求URL，	请求参数
                  </template>
                  <a-icon type="info-circle" />
                </a-tooltip>
              </template>
            </a-col>
            <a-col :md="6" :sm="10" style="width: 200px">
              <a-select style="max-width: 150px" v-model="queryParam.status">
                <a-select-option value="">请选择</a-select-option>
                <a-select-option value="0">
                  正常
                </a-select-option>
                <a-select-option value="1" >
                  异常
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :md="6" :sm="10" style="width: 200px">
              <a-input v-model="queryParam.operIp" placeholder="主机地址" allow-clear />
            </a-col>
            <a-col :md="6" :sm="24">
              <a-form-model-item label="">
                <a-range-picker v-model="dateArr" @change="onDateChange" />
              </a-form-model-item>
            </a-col>
            <a-col :md="6" :sm="24" style="width: 200px">
              <span class="table-page-search-submitButtons" :style="{ float: 'right', overflow: 'hidden' }">
                <a-button type="primary" @click="search()">查询</a-button>
                <a-button style="margin-left: 8px" @click="reset()">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form-model>
        <a-form-model layout="inline">
          <a-form-model-item label="删除日期">
            <a-select style="max-width: 150px" v-model="deleteType">
              <a-select-option value="">请选择</a-select-option>
              <a-select-option v-for="item in Object.entries(deleteTypeMap)" :key="item[0]" :value="item[0]">
                {{ item[1] }}
              </a-select-option>
            </a-select>
            <a-popconfirm
              :visible="popVisible"
              :title="`确定删除${deleteTypeMap[deleteType]}的所有日志吗？`"
              ok-text="确定删除"
              cancel-text="取消"
              @visibleChange="handleVisibleChange"
              @cancel="deleteCancel"
              @confirm="deleteConfirm"
            >
              <a-button type="primary" style="margin-left:  20px; transform: translateY(-1px)">删除</a-button>
            </a-popconfirm>
          </a-form-model-item>
        </a-form-model>
      </div>
      <!-- 表格数据-->
      <bh-table
        :page-config="queryParam"
        :columns="columns"
        :dataSource="tableData"
        rowKey="operId"
        :spinning="loading"
        @pageChange="handlePageChange">
        <template v-slot:serial="{ index }">
          {{ index + 1 + (queryParam.current - 1) * queryParam.size }}
        </template>
        <template v-slot:status="{ text }">
          <span :style="{color:text === 0 ? '#333' : 'red'}">{{ text === 0 ? '正常' : '异常' }}</span>
        </template>
        <template v-slot:action="{ scope }">
          <a @click="viewDetail(scope)">查看</a>
        </template>
      </bh-table>
    </a-card>
    <a-modal
      title="日志详情"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
      footer=""
      width="1200px"
    >
      <div class="row" style="line-height: 40px">
        <a-row>
          <a-col :span="4">
            日志主键 :
          </a-col>
          <a-col :span="16">
            {{ detailData.operId }}
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4">
            模块标题 :
          </a-col>
          <a-col :span="16">
            {{ detailData.title }}
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4">
            业务类型 :
          </a-col>
          <a-col :span="16">
            {{ businessType[detailData.businessType] }}
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4">
            方法名称 :
          </a-col>
          <a-col :span="16">
            {{ detailData.method }}
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4">
            操作类别 :
          </a-col>
          <a-col :span="16">
            {{ operatorType[detailData.operatorType] }}
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4">
            操作人员 :
          </a-col>
          <a-col :span="10">
            {{ detailData.operName }}
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4">
            请求方法 :
          </a-col>
          <a-col :span="16">
            {{ detailData.requestMethod }}
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4">
            请求URL :
          </a-col>
          <a-col :span="16">
            {{ detailData.operUrl }}
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4">
            主机地址 :
          </a-col>
          <a-col :span="16">
            {{ detailData.operIp }}
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4">
            操作地点 :
          </a-col>
          <a-col :span="16">
            {{ detailData.operLocation }}
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4">
            请求参数 :
          </a-col>
          <a-col :span="16">
            {{ detailData.operParam }}
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4">
            返回参数 :
          </a-col>
          <a-col :span="16">
            <div class="response-content" :style="{height:collapse ? 'auto' : '200px',overflow: 'hidden'}">
              {{ detailData.jsonResult && detailData.jsonResult.replace('\\') }}
            </div>
            <a-button style="position:absolute;top: 0;right: -56px" @click="collapseControl">展开</a-button>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4">
            操作状态 :
          </a-col>
          <a-col :span="16">
            {{ detailData.status == 0 ? '正常':'异常' }}
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4">
            错误信息 :
          </a-col>
          <a-col :span="16">
            {{ detailData.errorMsg }}
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4">
            操作时间 :
          </a-col>
          <a-col :span="16">
            {{ detailData.operTime }}
          </a-col>
        </a-row>
      </div>

      <!--      {{ detailData }}-->

    </a-modal>
  </page-header>
</template>

<script>
import {getOperateLogsList, operateLogsDelete, operLogGetById} from '@/api/system'
import { bhMessage } from '@/utlis/utli'
import BhTable from '@/components/BhTable'
import BhEditor from '@/components/BhEditor'

export default {
  name: 'OperationList',
  components: { BhTable, BhEditor },
  data() {
    return {
      operatorType:{
        0: '其他',
        1: '后台用户',
        2: '企业微信用户',
      },
      businessType:{
        0: '未知',
        1: '新增',
        2: '修改',
        3: '删除',
        4: '查询'
      },
      collapse:false,
      columns: [
        {
          title: '序号',
          scopedSlots: {customRender: 'serial'},
        },
        {
          title: '模块标题',
          dataIndex: 'title'
        },
        {
          title: '访问时间',
          dataIndex: 'operTime',
        },
        {
          title: '请求用户',
          dataIndex: 'operName',
        },
        {
          title: '来源IP',
          dataIndex: 'operIp',
        },
        {
          title: '请求完整URL',
          dataIndex: 'operUrl',
        },
        {
          title: '请求方法',
          dataIndex: 'requestMethod'
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '操作',
          scopedSlots: {customRender: 'action'},
        },
      ],
      popVisible: false,
      deleteType: '',
      deleteTypeMap: {
        day: '一天前',
        week: '一周前',
        month: '一月前',
      }, // deleteType 1,2,3 => 一天前 一周前 一个月前
      // 查询参数
      queryParam: {
        current: 1,
        size: 10,
        keyword: '',
        startTime: '',
        endTime: '',
        status:'',
        operIp:'',
        total: 0
      },
      dateArr: [], // 时间
      // 表格数据
      tableData: [],
      pagination: {},
      loading: false,
      ModalText: 'Content of the modal',
      visible: false,
      confirmLoading: false,
      detailData: {},
    }
  },
  methods: {
    collapseControl(){
      this.collapse = !this.collapse
    },
    handleOk(e) {
      this.ModalText = 'The modal will be closed after two seconds'
      this.confirmLoading = true
      setTimeout(() => {
        this.visible = false
        this.confirmLoading = false
      }, 2000)
    },
    handleCancel(e) {
      console.log('Clicked cancel button')
      this.visible = false
      this.collapse = false
    },
    /**
     * 获取操作日志列表
     */

    getList() {
      this.loading = true
      getOperateLogsList(this.queryParam).then((res) => {
        this.loading = false
        this.tableData = res.data.records
        this.queryParam.total = parseInt(res.data.total, 10)
      })
    },
    viewDetail(item) {
      operLogGetById(item['operId']).then((response) => {
        this.detailData = response
      })
      this.visible = true
    },
    /**
     * 页码改变的回调
     */
    handlePageChange({current, size}) {
      this.loading = true
      this.queryParam.current = current
      this.queryParam.size = size
      this.getList()
    },
    /**
     * 时间选择 回调方法
     * @param date 完成的时间
     * @param dateString 根据format 转义后的时间字符串
     */
    onDateChange(date, dateString) {
      this.dateArr = dateString
      this.queryParam.startTime = dateString[0]
      this.queryParam.endTime = dateString[1]
    },
    // 搜索
    search() {
      this.queryParam.current = 1
      this.getList()
    },
    // 重置
    reset() {
      this.queryParam.keyword = ''
      this.queryParam.current = 1
      this.queryParam.operatorName = ''
      this.queryParam.operatorIp = ''
      this.dateArr = []
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
      this.queryParam.status = ''
      this.queryParam.operIp = ''
      this.getList()
    },
    async deleteConfirm() {
      if (this.deleteType !== '') {
        const result = await operateLogsDelete(this.deleteType)
        if (result['code'] === 200) {
          this.queryParam.current = 1
          this.deleteType = ''
          this.getList()
          bhMessage.success('删除成功')
        }
        this.popVisible = false
      }
    },
    deleteCancel() {
      this.popVisible = false
    },
    /**
     * 删除确认弹窗的显隐控制 回调
     * @param visible
     */
    handleVisibleChange(visible) {
      if (this.deleteType === '') {
        bhMessage.warn('请选择删除日期')
      }
      if (visible && this.deleteType !== '') {
        this.popVisible = visible
      }
    },
    submit(data) {
      console.log(data)
    }
  },
  mounted() {
    this.getList()
  },
}
</script>

<style lang="less" scoped>
/deep/ .table-page-search-submitButtons {
  float: left !important;
}
.ant-row.ant-form-item{
  width: 100%;
  display: flex;
  /deep/.ant-col.ant-form-item-control-wrapper{
    width: 100%;
  }
}
.table-page-search-wrapper{
  .ant-form.ant-form-inline{
    margin-bottom: 10px;
  }
  .row-search{
    &>.ant-col{
      height: 40px;
      line-height: 40px;
    }
  }
}
.ant-col.ant-col-4{
  text-align: right;
  padding-right: 40px;
}
</style>
