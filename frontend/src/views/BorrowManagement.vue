<template>
    <div class="container borrow-management-container">
      <h2>借阅管理</h2>
      <p v-if="loading">加载中...</p>
      <p v-if="error" class="error-message">{{ error }}</p>
  
      <div class="borrow-list" v-if="borrows.length">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>书籍名称</th>
              <th>借阅用户</th>
              <th>借阅日期</th>
              <th>归还日期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="borrow in borrows" :key="borrow.id">
              <td>{{ borrow.id }}</td>
              <td>{{ borrow.bookTitle }}</td>
              <td>{{ borrow.username }}</td>
              <td>{{ formatDate(borrow.borrowDate) }}</td>
              <td>{{ borrow.returnDate ? formatDate(borrow.returnDate) : '未归还' }}</td>
              <td>
                <span :class="{'status-returned': borrow.returned, 'status-pending': !borrow.returned}">
                  {{ borrow.returned ? '已归还' : '待归还' }}
                </span>
              </td>
              <td>
                <button v-if="!borrow.returned" @click="returnBook(borrow.id)" class="btn-return">归还</button>
                <button @click="deleteBorrow(borrow.id)" class="btn-delete">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else-if="!loading && !error">暂无借阅记录。</p>
  
      <router-link to="/dashboard" class="back-link">返回仪表盘</router-link>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted } from 'vue';
  import axiosInstance from '../api/axios';
//   import { useRouter } from 'vue-router';
  
  export default defineComponent({
    name: 'BorrowManagement', // 多词组件名
    setup() {
      const borrows = ref([]);
      const loading = ref(true);
      const error = ref('');
    //   const router = useRouter();
  
      const fetchBorrows = async () => {
        loading.value = true;
        error.value = '';
        try {
          const response = await axiosInstance.get('/admin/borrows'); // 假设后端获取所有借阅记录API是 /admin/borrows
          borrows.value = response.data;
        } catch (err) {
          error.value = '获取借阅记录失败。';
          console.error('Fetch borrows error:', err);
        } finally {
          loading.value = false;
        }
      };
  
      const returnBook = async (borrowId) => {
        if (confirm(`确定要将 ID 为 ${borrowId} 的书籍标记为已归还吗？`)) {
          try {
            const response = await axiosInstance.put(`/admin/borrows/${borrowId}/return`); // 假设后端归还API是 PUT /admin/borrows/{id}/return
            alert(response.data.message || '书籍已成功归还！');
            fetchBorrows(); // 刷新列表
          } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message ? err.response.data.message : '归还失败！';
            alert(msg);
            console.error('Return book error:', err);
          }
        }
      };
  
      const deleteBorrow = async (borrowId) => {
        if (confirm(`确定要删除 ID 为 ${borrowId} 的借阅记录吗？`)) {
          try {
            const response = await axiosInstance.delete(`/admin/borrows/${borrowId}`); // 假设后端删除借阅记录API是 DELETE /admin/borrows/{id}
            alert(response.data.message || '借阅记录删除成功！');
            fetchBorrows(); // 刷新列表
          } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message ? err.response.data.message : '删除失败！';
            alert(msg);
            console.error('Delete borrow error:', err);
          }
        }
      };
  
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(); // 或者根据需要格式化为 'YYYY-MM-DD'
      };
  
      onMounted(() => {
        fetchBorrows();
      });
  
      return {
        borrows,
        loading,
        error,
        fetchBorrows,
        returnBook,
        deleteBorrow,
        formatDate,
      };
    },
  });
  </script>
  
  <style scoped>
  .container {
    max-width: 1000px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  .borrow-list table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  .borrow-list th, .borrow-list td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
  }
  .borrow-list th {
    background-color: #f2f2f2;
  }
  .borrow-list button {
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    color: white;
    margin-right: 5px;
  }
  .btn-return {
    background-color: #28a745;
  }
  .btn-delete {
    background-color: #dc3545;
  }
  .status-returned {
    color: #28a745;
    font-weight: bold;
  }
  .status-pending {
    color: #ffc107;
    font-weight: bold;
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