<template>
    <div class="container register-container">
      <h2>用户注册</h2>
  
      <div v-if="errorMessage" class="message error">
        <p>{{ errorMessage }}</p>
      </div>
      <div v-if="successMessage" class="message success">
        <p>{{ successMessage }}</p>
      </div>
  
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">用户名:</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="form-group">
          <label for="password">密码:</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认密码:</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required />
        </div>
        <button type="submit" class="register-button">注册</button>
      </form>
      <p>已有账号？ <router-link to="/login">立即登录</router-link></p>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import axiosInstance from '../api/axios'; // 导入配置好的 axios 实例
  
  export default defineComponent({
    name: 'UserRegister', // 多词组件名
    setup() {
      const username = ref('');
      const password = ref('');
      const confirmPassword = ref('');
      const errorMessage = ref('');
      const successMessage = ref('');
      const router = useRouter();
  
      const handleRegister = async () => {
        errorMessage.value = '';
        successMessage.value = '';
  
        if (password.value !== confirmPassword.value) {
          errorMessage.value = '两次输入的密码不一致！';
          return;
        }
  
        try {
          const response = await axiosInstance.post('/auth/register', { // 假设后端注册API是 /auth/register
            username: username.value,
            password: password.value,
          });
  
          successMessage.value = response.data.message || '注册成功！请登录。';
          // 注册成功后，可以考虑自动跳转到登录页
          setTimeout(() => {
            router.push({ path: '/login', query: { successMessage: successMessage.value } });
          }, 2000); // 2秒后跳转
        } catch (err) {
          if (err.response && err.response.data && err.response.data.message) {
            errorMessage.value = err.response.data.message;
          } else {
            errorMessage.value = '注册失败，请稍后再试。';
          }
          console.error('Register error:', err);
        }
      };
  
      return {
        username,
        password,
        confirmPassword,
        errorMessage,
        successMessage,
        handleRegister,
      };
    },
  });
  </script>
  
  <style scoped>
  /* 样式与 Login.vue 类似，可以提取为通用样式或在此处定义 */
  .container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  .form-group {
    margin-bottom: 15px;
    text-align: left;
  }
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  .form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }
  .register-button {
    width: 100%;
    padding: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  .register-button:hover {
    background-color: #218838;
  }
  .message {
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 4px;
    font-weight: bold;
  }
  .message.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  .message.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  </style>