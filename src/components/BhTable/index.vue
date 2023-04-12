<template>
  <div class="table-main">
    <a-spin :spinning="spinning" :delay="delayTime">
      <div class="table-body">
        <a-table
          :columns="columns"
          :dataSource="dataSource"
          :locale="defaultTableConfig.locale"
          :pagination="false"
          :rowKey="rowKey"
          :rowSelection="defaultTableConfig.rowSelection"
          :childrenColumnName="defaultTableConfig.childrenColumnName"
          :scroll="defaultTableConfig.scroll"
          @change="sort"
        >
          <template v-for="item in dynamicSlot" :slot="item" slot-scope="text, scope, index">
            <slot :name="item" :scope="scope" :index="index" :text="text"></slot>
          </template>
        </a-table>
      </div>
      <bh-pagination
        v-if="pageConfig.total"
        :value="pageConfig['current']"
        :size="pageConfig['size']"
        :total="pageConfig['total']"
        @change="changePage">
      </bh-pagination>
    </a-spin>
  </div>
</template>

<script>
import BhPagination from '@/components/BhPagination'

export default {
  name: 'BhTable',
  components: {
    BhPagination
  },
  props: {
    spinning: {
      type: Boolean,
      default: false,
    },
    pageConfig: {
      type: Object,
      default() {
        return {
          total: 0,
          current: 1,
          size: 10
        }
      },
    },
    tableConfig: {
      type: Object,
      default() {
        return {}
      }
    },
    rowKey: {
      type: String,
      default: 'id',
    },
    columns: {
      type: Array,
      default() {
        return []
      },
    },
    dataSource: {
      type: Array,
      default() {
        return []
      },
    },
    delayTime: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      dynamicSlot: [],
      defaultTableConfig: {
        rowSelection: null,
        childrenColumnName: '',
        locale: {emptyText: '暂无数据'},
        scroll: {scrollToFirstRowOnChange: true}
      }
    }
  },
  beforeMount() {
  },
  mounted() {
    this.defaultTableConfig = Object.assign(this.defaultTableConfig, this.tableConfig)
    this.dynamicSlot = Object.keys(this.$scopedSlots)
  },
  methods: {
    // 改变页码
    changePage(current, size) {
      const page = {
        current,
        size,
      }
      this.$emit('pageChange', page)
    },

    sort(pagination, filters, sorter) {
      console.log(pagination, filters, sorter)
      this.$emit('sort', sorter)
    }
  },
}
</script>

<style scoped lang="less">
.table-main {
  padding: 18px 0 12px 0;
}

.page-body {
  margin-top: 16px;
  text-align: end;
}
</style>
