<template>
    <div class="container form-container">
      <h2>添加新书籍</h2>
  
      <div v-if="errorMessage" class="message error">
        <p>{{ errorMessage }}</p>
      </div>
      <div v-if="successMessage" class="message success">
        <p>{{ successMessage }}</p>
      </div>
  
      <form @submit.prevent="handleAddBook">
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
        <button type="submit" class="submit-button">添加书籍</button>
      </form>
  
      <router-link to="/books" class="back-link">返回图书列表</router-link>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref } from 'vue';
//   import { useRouter } from 'vue-router';
  import axiosInstance from '../api/axios';
  
  export default defineComponent({
    name: 'AddBook', // 多词组件名
    setup() {
    //   const router = useRouter();
      const book = ref({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        publicationYear: null,
        totalCopies: 1,
        description: '',
      });
      const errorMessage = ref('');
      const successMessage = ref('');
  
      const handleAddBook = async () => {
        errorMessage.value = '';
        successMessage.value = '';
        try {
          const response = await axiosInstance.post('/books', book.value); // 假设后端添加书籍API是 POST /books
          successMessage.value = response.data.message || '书籍添加成功！';
          // 添加成功后可以清空表单或跳转
          book.value = { // 清空表单
            title: '', author: '', isbn: '', publisher: '',
            publicationYear: null, totalCopies: 1, description: '',
          };
          // 或者跳转到图书列表
          // router.push('/books');
        } catch (err) {
          if (err.response && err.response.data && err.response.data.message) {
            errorMessage.value = err.response.data.message;
          } else {
            errorMessage.value = '添加书籍失败，请稍后再试。';
          }
          console.error('Add book error:', err);
        }
      };
  
      return {
        book,
        errorMessage,
        successMessage,
        handleAddBook,
      };
    },
  });
  </script>
  
  <style scoped>
  /* 通用表单样式，可以与 Login.vue, Register.vue 共享 */
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