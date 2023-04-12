<template>
  <div class="bh-editor-wrapper">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editor"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 250px; overflow-y: hidden;"
      v-model="editorData"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="onCreated"
      @onChange="onChange"
    />
  </div>
</template>

<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import { bhMessage, getItem } from '@/utlis/utli'
import { ACCESS_TOKEN } from '@/store/const'

export default {
  name: 'BhEditor',
  components: { Editor, Toolbar },
  props: {
    placeholder: {
      type: String,
      default: ''
    },
    defaultData: {
      type: String,
      default: ''
    },
    maxLength: {
      type: Number,
      default: 1000
    },
    toolbarKeys: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      editor: null,
      editorData: '',
      editorConfig: {
        placeholder: this.placeholder,
        maxLength: this.maxLength,
        MENU_CONF: {
          codeSelectLang: {
            codeLangs: []
          },
          uploadImage: {
            server: '/api/file/media/uploadImages',
            maxFileSize: 1 * 1024 * 1024,
            fieldName: 'file',
            customInsert(result, insertFn) {
              if (result['code'] === 200) {
                insertFn('/api/file/download/'+result.data, '', result.data)
              } else {
                bhMessage.error(result.message)
              }
            },
            headers: {
              token: getItem(ACCESS_TOKEN)
            }
          },

        },
        hoverbarKeys: {
          image: {
            menuKeys: [
              'editImage',
              'viewImageLink',
              'deleteImage',
            ],
          },
          pre: {
            menuKeys: [
              'enter', 'codeBlock'
            ]
          }
        },
      },
      mode: 'simple', // or 'simple'
    }
  },
  computed: {
    toolbarConfig() {
      return {
        toolbarKeys: this.toolbarKeys.length > 0? this.toolbarKeys : [
          'headerSelect', 'fontSize', 'fontFamily', 'lineHeight' , '|',
          'bold', 'underline', 'italic', 'through', 'color', 'bgColor', 'clearStyle', '|',
          'bulletedList', 'numberedList', 'justifyLeft', 'justifyRight', 'justifyCenter',
          'insertLink', 'uploadImage',
          'insertTable', 'codeBlock', '|', 'undo', 'redo', 'fullScreen'
        ],
      }
    }
  },
  methods: {
    onCreated(editor) {
      this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
      this.$nextTick(() => {
        this.editor.setHtml(this.defaultData)
      })
    },
    /**
     * 获取编辑原始内容
     * @returns {string}
     */
    getData() {
      return this.isEmpty() ? '' : this.editorData
    },
    /**
     * 判断编辑器是否为空
     * @returns {*|boolean}
     */
    isEmpty() {
      return this.editor.isEmpty() || (this.editor.getText().trim().length === 0 && this.editorData.indexOf('<img') < 0)
    },
    /**
     * 获取编辑器文字内容
     * @returns {*|string|string}
     */
    getText() {
      return this.editor ? this.editor.getText() : ''
    },
    /**
     * 编辑器获取焦点
     */
    focus() {
      this.editor && this.editor.focus(true)
    },
    /**
     * change事件
     * @param editor
     */
    onChange(editor) {
      this.$emit('change', editor)
    },
    /**
     * 编辑器内容重置
     */
    resetData() {
      this.editor && this.editor.clear()
    },
  },
  beforeDestroy() {
    const editor = this.editor
    if (editor == null) return
    editor.destroy() // 组件销毁时，及时销毁编辑器
  },
}
</script>

<style lang="less">
.bh-editor-wrapper{
  border: 1px solid #ccc;
  line-height: normal;
  z-index: 99999;
  .w-e-text-container{
    ul{
      list-style: inside;
      padding-inline-start: 25px;
      li{
        list-style: inherit;
      }
    }
    ol{
      display: block;
      list-style-type: decimal;
      padding-inline-start: 40px;
      li{
        display: list-item;
        list-style: inherit;
      }
    }
    h1{
      font-size: 32px;
      font-weight: 700;
    }
    h2{
      font-size: 24px;
      font-weight: 700;
    }
    h3{
      font-size: 18px;
      font-weight: 700;
    }
    h4{
      font-size: 16px;
      font-weight: 700;
    }
    h5{
      font-size: 13px;
      font-weight: 700;
    }
    h1 *, h2 *, h3 * , h4 *, h5 *{
      font-size: inherit;
      font-weight: 700;
    }
    [data-slate-editor] span{
      font-family: inherit;
    }
    *{
      font-family: inherit;
      font-size: inherit;
    }
  }

  [data-menu-key="headerSelect"]+.w-e-select-list{
    span{
      font-size: inherit;
    }
  }

  .w-e-text-container [data-slate-editor] p{
    margin: 8px 0;
  }

  [data-menu-key="codeSelectLang"] + .w-e-select-list{
    width: 175px !important;
  }

  .w-e-text-container [data-slate-editor] img{
    max-width: 300px;
    max-height: 150px;
    vertical-align: text-bottom;
  }
  .w-e-text-container [data-slate-editor] .w-e-image-container{
    display: inline;
  }
}
</style>