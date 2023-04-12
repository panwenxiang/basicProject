<template>
  <a-modal
    title="角色选择"
    :width="640"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="loading"
    ok-text="确认"
    cancel-text="取消"
    @ok="ok"
    @cancel="cancel"
  >
    <a-spin :spinning="loading">
      <div :style="{ borderBottom: '1px solid #E9E9E9', padding: '10px 0' }">
        <a-checkbox :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange">全选</a-checkbox>
      </div>
      <br />
      <a-checkbox-group v-model="form.roleIds" :options="roles" @change="onChange" />
    </a-spin>
  </a-modal>
</template>

<script>
import { getRoleList, getRole } from '@/api/system'
import { bhMessage } from '@/utlis/utli'

export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    loading: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      form: {
        userIds: [],
        roleIds: [],
      },
      indeterminate: false,
      checkAll: false,
      roles: [],
    }
  },
  methods: {
    // 获取全部角色列表
    async getRoleList(type, ids) {
      this.form.userIds = ids
      this.indeterminate = false
      this.checkAll = false
      const result = await getRoleList({ size: 100 })
      // console.log('获取角色列表--', res)
      if (result.code === 200) {
        const arr = result.data.records
        this.roles = arr.map((v) => {
          return {
            label: `${v.roleName}${v.status ? '' : '（已禁用）'}`,
            value: v.id,
          }
        })
      }

      if (type === 'one') {
        // 单个用户进行角色分配
        this.getMyRoleList(this.form.userIds[0])
      }
    },
    // 获取当前用户全部角色列表
    getMyRoleList(userId) {
      getRole({ userId }).then((res) => {
        // console.log('获取当前用户全部角色列表--', res)
        const isNull = !res.data && typeof res.data !== 'undefined' && res.data !== 0
        // console.log('是否为null--', isNull)
        const arr = !isNull ? res.data : []
        if (arr.length !== 0) {
          this.form.roleIds = arr.map((v) => v.id)
          this.indeterminate = this.roles.length !== this.form.roleIds.length
          this.checkAll = this.roles.length === this.form.roleIds.length
        }
      })
    },
    onChange(checkedList) {
      this.indeterminate = !!checkedList.length && checkedList.length < this.roles.length
      this.checkAll = checkedList.length === this.roles.length
    },
    onCheckAllChange(e) {
      Object.assign(this, {
        indeterminate: false,
        checkAll: e.target.checked,
      })
      const allCheckedRoles = e.target.checked ? this.roles : []
      this.form.roleIds = allCheckedRoles.map((v) => v.value)
    },
    ok() {
      if (this.form.roleIds.length !== 0) {
        this.$emit('ok', this.form)
        this.form.userIds = []
        this.form.roleIds = []
      } else {
        bhMessage.warn('请先选择分配角色')
      }
    },
    cancel() {
      this.form.userIds = []
      this.form.roleIds = []
      this.$emit('cancel')
    },
  },
}
</script>
