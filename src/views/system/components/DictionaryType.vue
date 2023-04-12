<template>
  <a-form-model ref="form" :model="form" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-form-model-item prop="dictName" label="字典名称">
      <a-input v-model="form.dictName" />
    </a-form-model-item>
    <a-form-model-item prop="dictType" label="字典类型">
      <a-input v-model="form.dictType" />
    </a-form-model-item>
    <a-form-model-item prop="sortNum" label="序号">
      <a-input v-model="form.sortNum" />
    </a-form-model-item>
    <a-form-model-item prop="remark" label="备注">
      <a-input type="textarea" v-model="form.remark" />
    </a-form-model-item>
  </a-form-model>
</template>

<script>
import { dictTypeAdd, dictTypeUpdate } from '@/api/system'

export default {
  name: 'DictionaryTypeVue',
  props: {
    info: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      type: 'add', // add 添加   edit 编辑
      form: {
        dictName: '',
        dictType: '',
        sortNum:'',
        remark: '',
      },
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
    }
  },
  computed: {
    rules() {
      const rules = {
        dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
        dictType: [{ required: true, message: '请输入字典编码', trigger: 'blur' }],
      }
      return rules
    },
  },
  methods: {
    /**
     * 新增、编辑字典表单的提交函数
     * @param callback 回调函数，提交表单成功之后的处理函数
     * @param validate 校验结构回调函数
     */
    submit(callback, validate) {
      this.$refs.form.validate(async (valid) => {
        if (typeof validate === 'function') {
          validate(valid)
        }
        if (valid) {
          let result
          if (this.type === 'add') {
            result = await dictTypeAdd(this.form)
          } else {
            result = await dictTypeUpdate(this.form)
          }
          if (typeof callback === 'function') {
            callback(result)
          }
        }
      })
    },
    /**
     * 切换类型时去掉校验
     */
    changeType() {
      this.$refs.form.clearValidate()
    },
  },
  mounted() {
    this.type = this.info.id === undefined ? 'add' : 'edit'
    this.form = { ...this.form, ...this.info }
  },
}
</script>

<style lang="less" scoped></style>
