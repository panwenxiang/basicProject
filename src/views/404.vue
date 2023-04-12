<template>
  <div class="page-404">
    非常抱歉，你要找的页面不见了
  </div>
</template>

<script>
export default {
  name: 'NoFound',
  methods: {
    back() {
      this.$router.go(-2)
    }
  }
}
</script>

<style scoped>
.page-404{
  padding-top: 150px;
  text-align: center;
  font-size: 20px;
  background: #fafafa;
  height: 100vh;
  color: #4392FD;
}
</style>