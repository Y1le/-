<template>
    <div class="container dashboard-container">
      <h2>欢迎，{{ username }}！</h2>
      <p>这是您的主仪表盘。</p>
  
      <button @click="fetchCurrentUser" class="action-button">获取当前用户信息</button>
      <div v-if="currentUserInfo" class="card user-info-card">
        <h3>您的用户信息：</h3>
        <table class="info-table">
            <tbody>
                <tr>
                    <th>用户名</th> 
                    <td>{{ currentUserInfo.username }}</td>
                </tr>
                <tr>
                    <th>角色</th>
                    <td>{{ currentUserInfo.role }}</td>
                </tr>
                <tr>
                    <th>权限</th>
                    <td>
                    <span v-for="authority in currentUserInfo.authorities" :key="authority.authority" style="margin-right: 10px;">
                        {{ authority.authority }}
                    </span>
                    </td>
                </tr>
            </tbody>
          
        </table>
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
  
      <nav class="dashboard-nav">
        <router-link to="/books" class="nav-link">查看图书列表</router-link>
        <!-- 根据角色显示管理链接 -->
        <router-link v-if="isAdmin" to="/user-management" class="nav-link">用户管理</router-link>
        <router-link v-if="isAdmin" to="/borrow-management" class="nav-link">借阅管理</router-link>
        <button @click="handleLogout" class="logout-button">登出</button>
      </nav>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useStore } from 'vuex';
  
  export default defineComponent({
    name: 'AppDashboard', 
    setup() {
      const router = useRouter();
      const store = useStore();
      const currentUserInfo = ref(null);
      const error = ref('');
  
      const username = computed(() => store.getters.getUsername);
      const isAdmin = computed(() => {
        const user = JSON.parse(localStorage.getItem('current_user'));
        return user && user.role === 'ROLE_ADMIN';
      });
  
  
      const fetchCurrentUser = async () => {
        error.value = '';
        try {
          const response = await store.state.app.config.globalProperties.$axios.get('/me'); // 访问后端受保护的 /me 接口
          currentUserInfo.value = response.data;
          // 存储完整用户信息到 localStorage，方便其他组件访问角色
          localStorage.setItem('current_user', JSON.stringify(response.data));
        } catch (err) {
          error.value = '获取用户信息失败。';
          console.error('Fetch current user error:', err);
        }
      };
  
      const handleLogout = () => {
        store.dispatch('logout'); // 调用 Vuex action 清除 Token
        router.push({ path: '/login', query: { logoutMessage: '您已退出登录！' } }); // 重定向到登录页并带消息
      };
  
      return {
        username,
        currentUserInfo,
        error,
        isAdmin,
        fetchCurrentUser,
        handleLogout,
      };
    },
  });
  </script>
  
  <style scoped>
  /* 你的 CSS 样式，从原 HTML 内部样式中提取并粘贴到这里 */
  body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
  .container { max-width: 800px; margin: 0 auto; }
  .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  .nav { background: #007bff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
  .nav a { color: white; text-decoration: none; margin-right: 20px; padding: 8px 15px; border-radius: 4px; }
  .nav a:hover { background: rgba(255,255,255,0.2); }
  .info-table { width: 100%; border-collapse: collapse; margin-top: 15px;}
  .info-table th, .info-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
  .info-table th { background-color: #f8f9fa; font-weight: bold; }
  
  /* Dashboard specific styles */
  .dashboard-container {
    text-align: center;
  }
  .action-button {
    padding: 10px 20px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 20px;
  }
  .action-button:hover {
    background-color: #218838;
  }
  .dashboard-nav {
    margin-top: 30px;
  }
  .nav-link {
    display: inline-block;
    padding: 10px 15px;
    margin: 0 10px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }
  .nav-link:hover {
    background-color: #0056b3;
  }
  .logout-button {
    padding: 10px 15px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  .logout-button:hover {
    background-color: #c82333;
  }
  .error-message {
    color: red;
    margin-top: 10px;
  }
  .user-info-card {
    margin-top: 20px;
  }
  </style>