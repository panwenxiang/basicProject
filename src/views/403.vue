<template>
  <div class="page-403">
    非常抱歉，你没有该权限哦
  </div>
</template>

<script>
export default {
  name: 'NoPermission',
  methods: {
    back() {
      this.$router.go(-2)
    }
  }
}
</script>

<style scoped>
.page-403{
  padding-top: 150px;
  text-align: center;
  font-size: 20px;
  background: #fafafa;
  height: 100vh;
  color: #4392FD;
}
</style>