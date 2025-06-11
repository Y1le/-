<template>
  <div id="app">
    <!-- 这里将渲染当前路由匹配到的组件（例如 Login.vue, Dashboard.vue, BookList.vue） -->
    <router-view/>
  </div>
</template>

<script>
import { defineComponent } from 'vue'; // 导入 defineComponent

export default defineComponent({ // 使用 defineComponent 包装组件定义
  name: 'App', // 根组件通常可以保持单词命名，但为了 ESLint 规则，可以改为 'AppRoot'
  // components: { // 移除 HelloWorld 组件的导入和注册
  //   HelloWorld
  // }
});
</script>

<style>
/* 全局样式 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  /* 移除 text-align: center; 和 margin-top: 60px; 让子组件自己控制布局 */
  /* text-align: center; */
  /* margin-top: 60px; */
}

/* 可以添加一些基本的全局样式，例如 body 的 margin */
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>