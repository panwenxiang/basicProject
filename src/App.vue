<template>
  <a-config-provider :locale="locale">
    <div id="App">
      <router-view />
    </div>
  </a-config-provider>
</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
export default {
  data () {
    return {
      locale: zhCN
    }
  }
}
</script>

<style lang="less">
#App {
  height: 100%;
  color: #333333;
  min-width: 1200px;
}
</style>
