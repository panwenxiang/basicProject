<template>
  <div class="pagination-info task-list-pagination-wrapper">
    <a-pagination
      v-if="total > 0"
      v-model="current"
      :total="total"
      :defaultPageSize="size"
      :locale="{
        jump_to: '跳至',
        items_per_page: ' / 每页',
      }"
      show-size-changer
      show-quick-jumper
      :size="model"
      :show-total="() => `共 ${total} 条，每页${size}条`"
      @change="change"
      @showSizeChange="showSizeChange"
    />
  </div>
</template>

<script>
export default {
  name: 'BhPagination',
  props: {
    // 当前页数
    value: {
      type: Number,
      default: 1,
    },
    total: {
      type: Number,
      default: 0,
    },
    size: {
      type: Number,
      default: 10,
    },
    // 空字符串代表常规类型 small 代表是迷你模式
    model: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      current: 1,
    }
  },
  watch: {
    value(newValue) {
      this.current = newValue
    },
  },
  methods: {
    // 页码改变的回调
    change(page) {
      this.$emit('input', page)
      this.$emit('change', page, this.size)
    },
    // pageSize 变化的回调 改变每页数目后回到第一页
    showSizeChange(page, size) {
      this.$emit('input', 1)
      this.$emit('update:size', size)
      this.$emit('change', 1, size)
      // vue异步更新 如果这里在政治界this.current 有时候可能不会置1
      this.$nextTick(() => {
        this.current = 1
      })
    },
  },
  mounted() {
    this.current = this.value
  },
}
</script>

<style>
.pagination-info {
  background: #fff;
  font-size: 14px;
  padding: 20px 0;
  color: #888;
  text-align: center;
}
</style>
