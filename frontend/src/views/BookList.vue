<template>
    <div class="container booklist-container">
      <h2>图书列表</h2>
  
      <div class="search-filter-section">
        <form @submit.prevent="handleSearch" class="search-form">
          <input type="text" v-model="searchQuery" placeholder="搜索书名、作者或ISBN..." />
          <button type="submit">搜索</button>
        </form>
  
        <div class="filter-group">
          <label for="category-filter">分类:</label>
          <select id="category-filter" v-model="selectedCategory">
            <option value="">所有分类</option>
            <!-- 假设分类数据从后端获取或预定义 -->
            <option value="Fiction">小说</option>
            <option value="Science">科学</option>
            <option value="History">历史</option>
            <!-- ... 更多分类 -->
          </select>
  
          <label for="available-filter">状态:</label>
          <select id="available-filter" v-model="selectedAvailability">
            <option value="">所有状态</option>
            <option value="true">可借阅</option>
            <option value="false">已借出</option>
          </select>
          <button @click="handleFilter">筛选</button>
        </div>
      </div>
  
      <p v-if="loading">加载中...</p>
      <p v-if="error" class="error-message">{{ error }}</p>
  
      <div class="book-grid" v-if="books.length">
        <div v-for="book in books" :key="book.id" class="book-item">
          <img src="https://via.placeholder.com/120x180?text=Book+Cover" alt="书籍封面" class="book-cover">
          <div class="book-info">
            <h3><router-link :to="`/book-detail/${book.id}`">{{ book.title }}</router-link></h3>
            <p>作者：{{ book.author }}</p>
            <p>ISBN: {{ book.isbn }}</p>
            <p class="status" :class="{ 'available': book.availableCopies > 0, 'borrowed': book.availableCopies <= 0 }">
              状态: {{ book.availableCopies > 0 ? '可借阅' : '已借出' }}
            </p>
            <div class="book-actions">
              <button class="btn-borrow" :disabled="book.availableCopies <= 0" @click="borrowBook(book.id)">借阅</button>
              <template v-if="isAdmin">
                <button class="btn-edit" @click="editBook(book.id)">编辑</button>
                <button class="btn-delete" @click="deleteBook(book.id)">删除</button>
              </template>
            </div>
          </div>
        </div>
      </div>
      <p v-else-if="!loading && !error">没有找到相关书籍。</p>
  
      <div class="pagination-container" v-if="totalPages > 1">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">&laquo; 上一页</button>
        <span v-for="page in paginationPages" :key="page">
          <template v-if="page === '...'"><span class="ellipsis">...</span></template>
          <template v-else>
            <button @click="changePage(page)" :class="{ 'active': page === currentPage }">{{ page }}</button>
          </template>
        </span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">下一页 &raquo;</button>
      </div>
  
      <router-link to="/dashboard" class="back-link">返回仪表盘</router-link>
      <button v-if="isAdmin" @click="addBook" class="add-book-button">添加书籍</button>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import axiosInstance from '../api/axios';
  
  export default defineComponent({
    name: 'BookListing', // 修正为多词
    setup() {
      const router = useRouter();
      const books = ref([]);
      const loading = ref(true);
      const error = ref('');
      const searchQuery = ref('');
      const selectedCategory = ref('');
      const selectedAvailability = ref('');
      const currentPage = ref(1);
      const totalPages = ref(1);
  
      const isAdmin = computed(() => {
        const user = JSON.parse(localStorage.getItem('current_user'));
        return user && user.role === 'ROLE_ADMIN';
      });
  
      // 计算分页按钮显示的页码
      const paginationPages = computed(() => {
        const pages = [];
        const maxPagesToShow = 5; // 最多显示5个页码按钮
        let startPage = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages.value, startPage + maxPagesToShow - 1);
  
        if (endPage - startPage + 1 < maxPagesToShow) {
          startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
  
        if (startPage > 1) {
          pages.push(1);
          if (startPage > 2) pages.push('...');
        }
  
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
  
        if (endPage < totalPages.value) {
          if (endPage < totalPages.value - 1) pages.push('...');
          pages.push(totalPages.value);
        }
        return pages;
      });
  
      const fetchBooks = async () => {
        loading.value = true;
        error.value = '';
        let url = `/books?page=${currentPage.value}&size=10`; // 后端分页从1开始
        if (searchQuery.value) url += `&query=${encodeURIComponent(searchQuery.value)}`;
        if (selectedCategory.value) url += `&category=${encodeURIComponent(selectedCategory.value)}`;
        if (selectedAvailability.value !== '') url += `&available=${encodeURIComponent(selectedAvailability.value)}`;
  
        try {
          const response = await axiosInstance.get(url);
          // 假设后端返回的 Page 对象结构为 { records: [], current: 1, pages: 10, total: 100 }
          books.value = response.data.records;
          currentPage.value = response.data.current;
          totalPages.value = response.data.pages;
        } catch (err) {
          error.value = '获取图书列表失败。';
          console.error('Fetch books error:', err);
        } finally {
          loading.value = false;
        }
      };
  
      const handleSearch = () => {
        currentPage.value = 1; // 搜索时重置到第一页
        fetchBooks();
      };
  
      const handleFilter = () => {
        currentPage.value = 1; // 筛选时重置到第一页
        fetchBooks();
      };
  
      const changePage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
          currentPage.value = page;
          fetchBooks();
        }
      };
  
      const borrowBook = async (bookId) => {
        const currentUser = JSON.parse(localStorage.getItem('current_user'));
        if (!currentUser) {
          alert('请先登录才能借阅书籍！');
          router.push('/login');
          return;
        }
  
        if (confirm('确定要借阅此书籍吗？')) {
          try {
            const response = await axiosInstance.post('/borrows', { bookId: bookId });
            alert(response.data.message || '借阅成功！'); // 假设后端返回 message 字段
            fetchBooks(); // 刷新列表以更新状态
          } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message ? err.response.data.message : '借阅失败！';
            alert(msg);
            console.error('Borrow book error:', err);
          }
        }
      };
  
      const editBook = (bookId) => {
        // 实际的编辑逻辑，通常会跳转到编辑页面或弹出编辑模态框
        alert(`编辑书籍 ID: ${bookId}`);
        router.push(`/edit-book/${bookId}`); // 示例跳转
      };
  
      const deleteBook = async (bookId) => {
        if (confirm('确定要删除此书籍吗？此操作不可逆！')) {
          try {
            const response = await axiosInstance.delete(`/books/${bookId}`);
            alert(response.data.message || '书籍删除成功！');
            fetchBooks(); // 刷新列表
          } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message ? err.response.data.message : '删除失败！';
            alert(msg);
            console.error('Delete book error:', err);
          }
        }
      };
  
      const addBook = () => {
        router.push('/add-book'); // 示例跳转到添加书籍页面
      };
  
      // 组件挂载时自动获取图书列表
      onMounted(() => {
        fetchBooks();
      });
  
      return {
        books,
        loading,
        error,
        searchQuery,
        selectedCategory,
        selectedAvailability,
        currentPage,
        totalPages,
        isAdmin,
        paginationPages,
        handleSearch,
        handleFilter,
        changePage,
        borrowBook,
        editBook,
        deleteBook,
        addBook,
      };
    },
  });
  </script>
  
  <style scoped>
  /* 你的 CSS 样式，从原 style.css 和 HTML 内部样式中提取并粘贴到这里 */
  .container {
    max-width: 900px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  .search-filter-section {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 20px;
    justify-content: center;
    align-items: center;
  }
  
  .search-form {
    display: flex;
    gap: 10px;
  }
  
  .search-form input[type="text"] {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    flex-grow: 1;
  }
  
  .search-form button {
    padding: 8px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .search-form button:hover {
    background-color: #0056b3;
  }
  
  .filter-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .filter-group label {
    font-weight: bold;
  }
  
  .filter-group select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .filter-group button {
    padding: 8px 15px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .filter-group button:hover {
    background-color: #5a6268;
  }
  
  .book-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  
  .book-item {
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 15px;
    text-align: left;
    box-shadow: 0 1px 5px rgba(0,0,0,0.05);
    display: flex;
    gap: 15px;
    align-items: flex-start;
  }
  
  .book-cover {
    width: 100px;
    height: 150px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .book-info {
    flex-grow: 1;
  }
  
  .book-info h3 {
    margin-top: 0;
    margin-bottom: 5px;
    color: #333;
  }
  
  .book-info h3 a {
    text-decoration: none;
    color: #007bff;
  }
  
  .book-info h3 a:hover {
    text-decoration: underline;
  }
  
  .book-info p {
    margin: 5px 0;
    color: #666;
    font-size: 0.9em;
  }
  
  .status {
    font-weight: bold;
    padding: 3px 8px;
    border-radius: 4px;
    display: inline-block;
    margin-top: 5px;
  }
  
  .status.available {
    background-color: #d4edda;
    color: #155724;
  }
  
  .status.borrowed {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .book-actions {
    margin-top: 10px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .book-actions button {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85em;
    color: white;
  }
  
  .btn-borrow {
    background-color: #28a745;
  }
  .btn-borrow:hover:not(:disabled) {
    background-color: #218838;
  }
  .btn-borrow:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .btn-edit {
    background-color: #ffc107;
    color: #333;
  }
  .btn-edit:hover {
    background-color: #e0a800;
  }
  
  .btn-delete {
    background-color: #dc3545;
  }
  .btn-delete:hover {
    background-color: #c82333;
  }
  
  .pagination-container {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }
  
  .pagination-container button {
    padding: 8px 12px;
    border: 1px solid #007bff;
    background-color: white;
    color: #007bff;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .pagination-container button.active {
    background-color: #007bff;
    color: white;
  }
  
  .pagination-container button:disabled {
    border-color: #cccccc;
    color: #cccccc;
    cursor: not-allowed;
    background-color: #f0f0f0;
  }
  
  .pagination-container .ellipsis {
    padding: 8px 0;
    color: #666;
  }
  
  .back-link {
    display: inline-block;
    margin-top: 30px;
    padding: 10px 15px;
    background-color: #6c757d;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    margin-right: 15px;
  }
  .back-link:hover {
    background-color: #5a6268;
  }
  
  .add-book-button {
    padding: 10px 15px;
    background-color: #17a2b8;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .add-book-button:hover {
    background-color: #138496;
  }
  </style>