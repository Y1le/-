<template>
    <div class="container form-container">
      <h2>编辑书籍</h2>
  
      <p v-if="loading">加载书籍信息...</p>
      <div v-if="errorMessage" class="message error">
        <p>{{ errorMessage }}</p>
      </div>
      <div v-if="successMessage" class="message success">
        <p>{{ successMessage }}</p>
      </div>
  
      <form @submit.prevent="handleEditBook" v-if="book">
        <div class="form-group">
          <label for="title">书名:</label>
          <input type="text" id="title" v-model="book.title" required />
        </div>
        <div class="form-group">
          <label for="author">作者:</label>
          <input type="text" id="author" v-model="book.author" required />
        </div>
        <div class="form-group">
          <label for="isbn">ISBN:</label>
          <input type="text" id="isbn" v-model="book.isbn" required />
        </div>
        <div class="form-group">
          <label for="publisher">出版社:</label>
          <input type="text" id="publisher" v-model="book.publisher" />
        </div>
        <div class="form-group">
          <label for="publicationYear">出版年份:</label>
          <input type="number" id="publicationYear" v-model="book.publicationYear" />
        </div>
        <div class="form-group">
          <label for="totalCopies">总库存:</label>
          <input type="number" id="totalCopies" v-model="book.totalCopies" required min="1" />
        </div>
        <div class="form-group">
          <label for="description">描述:</label>
          <textarea id="description" v-model="book.description"></textarea>
        </div>
        <button type="submit" class="submit-button">保存修改</button>
      </form>
      <p v-else-if="!loading && !errorMessage">未找到要编辑的书籍。</p>
  
      <router-link :to="`/book-detail/${bookId}`" class="back-link">返回书籍详情</router-link>
      <router-link to="/books" class="back-link" style="margin-left: 10px;">返回图书列表</router-link>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import axiosInstance from '../api/axios';
  
  export default defineComponent({
    name: 'EditBook', // 多词组件名
    setup() {
      const route = useRoute();
      const book = ref(null); // 用于存储书籍数据
      const loading = ref(true);
      const errorMessage = ref('');
      const successMessage = ref('');
  
      const bookId = route.params.id; // 从路由参数获取书籍ID
  
      const fetchBookDetail = async () => {
        loading.value = true;
        errorMessage.value = '';
        try {
          const response = await axiosInstance.get(`/books/${bookId}`);
          book.value = response.data;
        } catch (err) {
          errorMessage.value = '加载书籍信息失败。';
          console.error('Fetch book detail error:', err);
        } finally {
          loading.value = false;
        }
      };
  
      const handleEditBook = async () => {
        errorMessage.value = '';
        successMessage.value = '';
        try {
          const response = await axiosInstance.put(`/books/${bookId}`, book.value); // 假设后端编辑书籍API是 PUT /books/{id}
          successMessage.value = response.data.message || '书籍信息更新成功！';
          // 可以选择跳转回详情页或列表页
          // router.push(`/book-detail/${bookId}`);
        } catch (err) {
          if (err.response && err.response.data && err.response.data.message) {
            errorMessage.value = err.response.data.message;
          } else {
            errorMessage.value = '更新书籍信息失败，请稍后再试。';
          }
          console.error('Edit book error:', err);
        }
      };
  
      onMounted(() => {
        if (bookId) {
          fetchBookDetail();
        } else {
          errorMessage.value = '未提供书籍ID，无法编辑。';
          loading.value = false;
        }
      });
  
      return {
        book,
        loading,
        errorMessage,
        successMessage,
        bookId,
        handleEditBook,
      };
    },
  });
  </script>
  
  <style scoped>
  /* 样式与 AddBook.vue 类似，可以共享 */
  .form-container {
    max-width: 600px;
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
  .form-group input[type="text"],
  .form-group input[type="number"],
  .form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }
  .form-group textarea {
    min-height: 80px;
    resize: vertical;
  }
  .submit-button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  .submit-button:hover {
    background-color: #0056b3;
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