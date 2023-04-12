import Vue from 'vue'
import 'ant-design-vue/dist/antd.css'

import {
  ConfigProvider,
  Layout,
  Input,
  Button,
  Switch,
  Radio,
  Checkbox,
  Select,
  Card,
  FormModel,
  Row,
  Col,
  Modal,
  Table,
  Tabs,
  Icon,
  Popover,
  Spin,
  Menu,
  Tooltip,
  DatePicker,
  PageHeader,
  Pagination,
  Divider,
  message,
  notification,
  Collapse,
  Popconfirm,
  Dropdown,
  Empty,
  TimePicker,
  Skeleton,
  Tree,
  TreeSelect,
  Upload
} from 'ant-design-vue'

Vue.use(ConfigProvider)
Vue.use(Layout)
Vue.use(Input)
Vue.use(Button)
Vue.use(Switch)
Vue.use(Radio)
Vue.use(Checkbox)
Vue.use(Select)
Vue.use(Card)
Vue.use(FormModel)
Vue.use(Row)
Vue.use(Col)
Vue.use(Modal)
Vue.use(Table)
Vue.use(Tabs)
Vue.use(Icon)
Vue.use(Popover)
Vue.use(Spin)
Vue.use(Menu)
Vue.use(Tooltip)
Vue.use(DatePicker)
Vue.use(PageHeader)
Vue.use(Pagination)
Vue.use(Collapse)
Vue.use(Empty)
Vue.use(Divider)
Vue.use(Popconfirm)
Vue.use(Dropdown)
Vue.use(TimePicker)
Vue.use(Skeleton)
Vue.use(Tree)
Vue.use(TreeSelect)
Vue.use(Upload)

Vue.prototype.$confirm = Modal.confirm
Vue.prototype.$message = message
Vue.prototype.$notification = notification
Vue.prototype.$info = Modal.info
Vue.prototype.$success = Modal.success
Vue.prototype.$error = Modal.error
Vue.prototype.$warning = Modal.warning
