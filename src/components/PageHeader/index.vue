<template>
  <div>
    <div class="basic-layout-right-title-wrapper">
      <div class="basic-layout-right-title">
        {{ pageTitle || title }}
        <slot name="titleExtra"></slot>
      </div>
      <div class="page-header-right">
        <slot name="right"></slot>
      </div>
    </div>
    <div class="page-content">
      <slot />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'PageHeader',
  props: {
    // 格式 [{title: '名字', router: '跳转的链接'}]
    breadcrumb: {
      type: Array,
      default() {
        return null
      },
      validator(val) {
        if (!(val instanceof Array)) {
          return false
        }
        return val.filter(item => {
          // 判断 数组的每一项是不是都是对象 而且 对象里面都含有title这个必需的 字段
          return typeof item !== 'object' || item.title === undefined
        }).length === 0
      }
    },
    router: {
      type: String,
      default: ''
    },
    // 如果为true 则页面自己控制跳转
    isControlBack: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return{
      titleMap: {} // url对应的Title
    }
  },
  computed: {
    ...mapState({
      userMenuList: (state) => state.currentUserMenu
    }),
    pageTitle() {
      return this.titleMap[this.getKeyByPath(this.$route.path)]
    }
  },
  watch: {
    userMenuList() {
      this.initMenuSelectedKey()
    },
  },
  methods: {
    /**
     * 根据url 初始化左侧menu 对应需要打开的菜单项， 以及当前显示的菜单key
     */
    initMenuSelectedKey() {
      this.userMenuList.forEach(menuItem => {
        this.addUrlToTitleMap(menuItem)
        if (menuItem['childMenus']) {
          menuItem['childMenus'].forEach(item => {
            this.addUrlToTitleMap(item)
          })
        }
      })
    },
    /**
     * 通过 url为key name为value 存储下来url对应的名字
     * @param menuItem
     */
    addUrlToTitleMap (menuItem) {
      const { getKeyByPath } = this
      if (menuItem.url) {
        this.$set(this.titleMap, getKeyByPath(menuItem.url), menuItem.name)
      }
    },

    /**
     * 根据url 生成对应 path1_path2 用下横线连接的key
     * @param path
     * @returns {string}
     */
    getKeyByPath(path) {
      if (typeof path === 'string') {
        return path.replace('/', '').replace('/', '_')
      }
      return ''
    },
    back() {
      if (this.isControlBack) {
        this.$emit('backAfter')
      } else {
        if (this.router) {
          this.$router.push(this.router)
        } else {
          if (history.length === 1) {
            this.$router.push('/task/list')
          } else {
            this.$router.back()
          }
        }
        this.$emit('backAfter')
      }
    }
  },
  mounted() {
    this.initMenuSelectedKey()
  }
}
</script>
<style lang="less" scoped>
.basic-right-back-btn{
  color: #9a9da7;
  display: inline-flex;
  align-items: center;
  &:hover{
    cursor: pointer;
    .anticon{
    }
  }
  .bh-icon{
    transform: rotate(90deg);
  }
  &::after{
    content: '';
    display: inline-block;
    width: 0;
    height: 14px;
    margin: 0 8px;
    border-right: 1px solid #999;
  }
}
.basic-layout-right-breadcrumb{
  display: flex;
  align-items: center;
  height: 52px;
  line-height: 52px;
  .ant-breadcrumb{
    color: #333333;
    & > span:last-child{
      color: inherit;
    }
  }
}
.basic-layout-right-title-wrapper{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.basic-layout-right-title{
  font-weight: 500;
  font-size: 24px;
  height: 65px;
  line-height: 65px;
}
.page-content{
  padding-bottom: 8px;
}
.basic-layout-right-breadcrumb{
  .ant-breadcrumb{
    :v-deep(.ant-breadcrumb-link) {
      color: #666666;
    }
    a{
      color: #333333;
      &:hover{
      }
    }
    /deep/.ant-breadcrumb-separator{
      color: #333333;
    }
  }
}
</style>