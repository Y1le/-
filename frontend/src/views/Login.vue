<template>
    <h1>This is Login Page Content</h1>
    <div class="container login-container">
      <h2>用户登录</h2>
  
      <!-- 错误和成功消息，由 Vue 响应式数据控制 -->
      <div v-if="errorMessage" class="message error">
        <p>{{ errorMessage }}</p>
      </div>
      <!-- 假设 logoutMessage 或 successMessage 会从路由查询参数或全局状态中获取 -->
      <div v-if="$route.query.logoutMessage" class="message success">
        <p>{{ $route.query.logoutMessage }}</p>
      </div>
      <div v-if="$route.query.successMessage" class="message success">
        <p>{{ $route.query.successMessage }}</p>
      </div>
  
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名:</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="form-group">
          <label for="password">密码:</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit" class="login-button">登录</button>
      </form>
      <p>没有账号？ <router-link to="/register">立即注册</router-link></p>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useStore } from 'vuex';
  import axiosInstance from '../api/axios'; // 导入配置好的 axios 实例
  
  export default defineComponent({
    name: 'UserLogin', // 修正为多词
    setup() {
      const username = ref('');
      const password = ref('');
      const errorMessage = ref(''); // 用于显示登录错误
      const router = useRouter();
      const route = useRoute(); // 获取当前路由信息，用于读取查询参数
      const store = useStore();
  
      // 检查是否有来自路由的成功/登出消息
      if (route.query.logoutMessage) {
        errorMessage.value = route.query.logoutMessage; // 暂时用errorMessage显示，实际可以有单独的successMessage
      }
      if (route.query.successMessage) {
        errorMessage.value = route.query.successMessage;
      }
  
  
      const handleLogin = async () => {
        errorMessage.value = ''; // 清除之前的错误信息
        try {
          // 直接使用导入的 axiosInstance
          const response = await axiosInstance.post('/auth/login', { // <-- 修改这里
            username: username.value,
            password: password.value,
          });
  
          const token = response.data.token;
          const loggedInUsername = response.data.username || username.value;
  
          // 调用 Vuex action 存储 Token 和用户名
          store.dispatch('loginSuccess', { token, username: loggedInUsername });
  
          router.push('/dashboard'); // 登录成功后跳转到仪表盘
        } catch (err) {
          if (err.response && err.response.data && err.response.data.message) {
            errorMessage.value = err.response.data.message;
          } else {
            errorMessage.value = '登录失败，请检查用户名或密码。';
          }
          console.error('Login error:', err);
        }
      };
  
      return {
        username,
        password,
        errorMessage,
        handleLogin,
      };
    },
  });
  </script>
  
  <style scoped>