const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0', // 监听所有网络接口
    port: 8080,      // 确保端口与你期望的一致
    client: {
      webSocketURL: 'ws://0.0.0.0:8080/ws', // 显式设置 WebSocket URL
    },
  }
})
