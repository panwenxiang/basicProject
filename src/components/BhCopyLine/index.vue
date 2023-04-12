<template>
  <div class="bh-copy-line">
    <slot />
    <a-tooltip v-if="text">
      <template v-slot:title>
        点击复制
      </template>
      <a-icon type="copy" @click="handleCopy" class="copy-line-icon"/>
    </a-tooltip>
  </div>
</template>

<script>
import {bhMessage, handleCopy} from '@/utlis/utli'

export default {
  name: 'BhCopyLine',
  props: {
    text: {
      type: String,
      default: '',
      required: true
    }
  },
  methods: {
    handleCopy() {
      if (handleCopy(this.text)) {
        bhMessage.success('复制成功')
      }
    }
  }

}
</script>

<style lang="less">
.bh-copy-line{
  display: inline-flex;
  align-items: center;
  .copy-line-icon{
    margin-left: 10px;
  }
}
</style>