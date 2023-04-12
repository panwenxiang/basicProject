<template>
  <div>
    <a-skeleton v-for="i in length" :key="i" active />
  </div>
</template>

<script>
export default {
  name: 'BhLoading',
  props: {
    length: {
      type: Number,
      default: 4
    }
  }
}
</script>