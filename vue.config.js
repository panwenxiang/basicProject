const MomentLocalesPlugin = require('moment-locales-webpack-plugin')

module.exports = {
  configureWebpack: {},

  chainWebpack: (config) => {
    config.plugin('moment-locales').use(MomentLocalesPlugin, [{localesToKeep: ['zh-cn']}])
  },

  devServer: {
    port: 7777,
    proxy: {
      '/api': {
        // target: 'http://172.16.0.104:8188/', //雷
        // target: 'http://172.16.0.114:8188/', //杨
        target: 'http://kms-v2.bohancloud.cn/', // test
        ws: false,
        changeOrigin: true,
        pathRewrite: { '^/api': 'api' },
      },
    },
  },

  productionSourceMap: false,
  lintOnSave: undefined,
  transpileDependencies: [],
}
