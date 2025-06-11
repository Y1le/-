<template>
    <div class="container book-detail-container">
      <h2>书籍详情</h2>
      <p v-if="loading">加载中...</p>
      <p v-if="error" class="error-message">{{ error }}</p>
  
      <div v-if="book" class="book-details-card">
        <img :src="book.coverUrl || 'https://via.placeholder.com/200x300?text=Book+Cover'" alt="书籍封面" class="detail-book-cover">
        <div class="detail-info">
          <h3>{{ book.title }}</h3>
          <p><strong>作者:</strong> {{ book.author }}</p>
          <p><strong>ISBN:</strong> {{ book.isbn }}</p>
          <p><strong>出版社:</strong> {{ book.publisher }}</p>
          <p><strong>出版年份:</strong> {{ book.publicationYear }}</p>
          <p><strong>总库存:</strong> {{ book.totalCopies }}</p>
          <p><strong>可借阅数量:</strong> {{ book.availableCopies }}</p>
          <p><strong>描述:</strong> {{ book.description || '暂无描述' }}</p>
          <p class="status" :class="{ 'available': book.availableCopies > 0, 'borrowed': book.availableCopies <= 0 }">
            状态: {{ book.availableCopies > 0 ? '可借阅' : '已借出' }}
          </p>
          <button v-if="book.availableCopies > 0" @click="borrowBook(book.id)" class="btn-borrow">借阅此书</button>
          <button v-if="isAdmin" @click="editBook(book.id)" class="btn-edit">编辑此书</button>
          <button v-if="isAdmin" @click="deleteBook(book.id)" class="btn-delete">删除此书</button>
        </div>
      </div>
      <p v-else-if="!loading && !error">未找到该书籍。</p>
  
      <router-link to="/books" class="back-link">返回图书列表</router-link>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axiosInstance from '../api/axios';
  
  export default defineComponent({
    name: 'BookDetail', // 多词组件名
    setup() {
      const route = useRoute();
      const router = useRouter();
      const book = ref(null);
      const loading = ref(true);
      const error = ref('');
  
      const bookId = route.params.id; // 从路由参数获取书籍ID
  
      const isAdmin = computed(() => {
        const user = JSON.parse(localStorage.getItem('current_user'));
        return user && user.role === 'ROLE_ADMIN';
      });
  
      const fetchBookDetail = async () => {
        loading.value = true;
        error.value = '';
        try {
          const response = await axiosInstance.get(`/books/${bookId}`); // 假设后端获取书籍详情API是 /books/{id}
          book.value = response.data;
        } catch (err) {
          error.value = '获取书籍详情失败。';
          console.error('Fetch book detail error:', err);
        } finally {
          loading.value = false;
        }
      };
  
      const borrowBook = async (id) => {
        // 借阅逻辑与 BookList.vue 中的 borrowBook 类似
        const currentUser = JSON.parse(localStorage.getItem('current_user'));
        if (!currentUser) {
          alert('请先登录才能借阅书籍！');
          router.push('/login');
          return;
        }
  
        if (confirm('确定要借阅此书籍吗？')) {
          try {
            const response = await axiosInstance.post('/borrows', { bookId: id });
            alert(response.data.message || '借阅成功！');
            fetchBookDetail(); // 刷新详情以更新状态
          } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message ? err.response.data.message : '借阅失败！';
            alert(msg);
            console.error('Borrow book error:', err);
          }
        }
      };
  
      const editBook = (id) => {
        alert(`编辑书籍 ID: ${id}`);
        router.push(`/edit-book/${id}`); // 跳转到编辑页面
      };
  
      const deleteBook = async (id) => {
        if (confirm('确定要删除此书籍吗？此操作不可逆！')) {
          try {
            const response = await axiosInstance.delete(`/books/${id}`);
            alert(response.data.message || '书籍删除成功！');
            router.push('/books'); // 删除成功后返回图书列表
          } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message ? err.response.data.message : '删除失败！';
            alert(msg);
            console.error('Delete book error:', err);
          }
        }
      };
  
      onMounted(() => {
        fetchBookDetail();
      });
  
      return {
        book,
        loading,
        error,
        isAdmin,
        borrowBook,
        editBook,
        deleteBook,
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
  .book-details-card {
    display: flex;
    gap: 30px;
    align-items: flex-start;
    margin-top: 20px;
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 5px rgba(0,0,0,0.05);
  }
  .detail-book-cover {
    width: 200px;
    height: 300px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .detail-info {
    text-align: left;
    flex-grow: 1;
  }
  .detail-info h3 {
    margin-top: 0;
    color: #333;
    font-size: 1.8em;
    margin-bottom: 10px;
  }
  .detail-info p {
    margin: 8px 0;
    color: #555;
    line-height: 1.5;
  }
  .detail-info strong {
    color: #333;
  }
  .status {
    font-weight: bold;
    padding: 5px 10px;
    border-radius: 4px;
    display: inline-block;
    margin-top: 10px;
  }
  .status.available {
    background-color: #d4edda;
    color: #155724;
  }
  .status.borrowed {
    background-color: #f8d7da;
    color: #721c24;
  }
  .btn-borrow, .btn-edit, .btn-delete {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    color: white;
    margin-top: 15px;
    margin-right: 10px;
  }
  .btn-borrow { background-color: #28a745; }
  .btn-borrow:hover { background-color: #218838; }
  .btn-edit { background-color: #ffc107; color: #333;}
  .btn-edit:hover { background-color: #e0a800; }
  .btn-delete { background-color: #dc3545; }
  .btn-delete:hover { background-color: #c82333; }
  .error-message {
    color: red;
    margin-top: 10px;
  }
  .back-link {
    display: inline-block;
    margin-top: 30px;
    padding: 10px 15px;
    background-color: #6c757d;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }
  .back-link:hover {
    background-color: #5a6268;
  }
  </style>