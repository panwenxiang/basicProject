export default {
  data(){
    return {
      tableData: [],
      total: 0,
      modalInfo: {},
      selectedRowKeys: [],
      queryForm: {
        current: 1,
        size: 10,
        keyword: ''
      },
    }
  },
  methods: {
    search() {
      this.queryForm.current = 1
      this.selectedRowKeys = []
      this.getList()
    },
    reset() {
      this.queryForm.keyword = ''
      this.search()
    },
    pageChange(page, size) {
      this.selectedRowKeys = []
      this.queryForm.current = page
      this.queryForm.size = size
      this.getList()
    },
    keyDown(e) {
      if (e.keyCode === 13) {
        this.search()
      }
    },
  },
  created() {
    this.getList() // 获取列表
  },
  mounted() {
    window.addEventListener('keydown', this.keyDown)
  },
  beforeRouteLeave(to, form, next) {
    window.removeEventListener('keydown', this.keyDown)
    next()
  }
}