import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { VueAxios } from '@/utlis/request'
import './global.less'
import './ant-design.config'
import BhPagination from '@/components/BhPagination'
import PageHeader from '@/components/PageHeader'
import './permission/permissionOfRouter'
import permissionControl from './permission/permissionOfControl'

Vue.config.productionTip = false
Vue.use(VueAxios)
Vue.component('BhPagination', BhPagination)
Vue.component('PageHeader', PageHeader)
Vue.use(permissionControl)
// 事件总线
// Vue.prototype.$EventBus = new Vue()

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
