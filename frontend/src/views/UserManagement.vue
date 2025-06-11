<template>
    <div class="container user-management-container">
      <h2>用户管理</h2>
      <p v-if="loading">加载中...</p>
      <p v-if="error" class="error-message">{{ error }}</p>
  
      <div class="user-list" v-if="users.length">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>角色</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.role }}</td>
              <td>
                <button @click="editUser(user.id)" class="btn-edit">编辑</button>
                <button @click="deleteUser(user.id)" class="btn-delete">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else-if="!loading && !error">暂无用户数据。</p>
  
      <router-link to="/dashboard" class="back-link">返回仪表盘</router-link>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted } from 'vue';
  import axiosInstance from '../api/axios'; // 导入配置好的 axios 实例
  import { useRouter } from 'vue-router';
  
  export default defineComponent({
    name: 'UserManagement', // 多词组件名
    setup() {
      const users = ref([]);
      const loading = ref(true);
      const error = ref('');
      const router = useRouter();
  
      const fetchUsers = async () => {
        loading.value = true;
        error.value = '';
        try {
          const response = await axiosInstance.get('/admin/users'); // 假设后端获取用户列表API是 /admin/users
          users.value = response.data;
        } catch (err) {
          error.value = '获取用户列表失败。';
          console.error('Fetch users error:', err);
        } finally {
          loading.value = false;
        }
      };
  
      const editUser = (userId) => {
        alert(`编辑用户 ID: ${userId}`);
        // 实际会跳转到编辑用户页面或弹出模态框
        router.push(`/edit-user/${userId}`);
      };
  
      const deleteUser = async (userId) => {
        if (confirm(`确定要删除用户 ID: ${userId} 吗？此操作不可逆！`)) {
          try {
            const response = await axiosInstance.delete(`/admin/users/${userId}`); // 假设后端删除用户API是 /admin/users/{id}
            alert(response.data.message || '用户删除成功！');
            fetchUsers(); // 刷新列表
          } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message ? err.response.data.message : '删除失败！';
            alert(msg);
            console.error('Delete user error:', err);
          }
        }
      };
  
      onMounted(() => {
        fetchUsers();
      });
  
      return {
        users,
        loading,
        error,
        fetchUsers,
        editUser,
        deleteUser,
      };
    },
  });
  </script>
  
  <style scoped>
  .container {
    max-width: 800px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  .user-list table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  .user-list th, .user-list td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
  }
  .user-list th {
    background-color: #f2f2f2;
  }
  .user-list button {
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    color: white;
    margin-right: 5px;
  }
  .btn-edit {
    background-color: #ffc107;
    color: #333;
  }
  .btn-delete {
    background-color: #dc3545;
  }
  .error-message {
    color: red;
    margin-top: 10px;
  }
  .back-link {
    display: inline-block;
    margin-top: 20px;
    padding: 10px 15px;
    background-color: #6c757d;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }
  </style>