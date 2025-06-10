const API_BASE_URL = 'http://localhost:8081';
// --- JWT Token 管理 ---
function setAuthToken(token) { // <-- 确保这些函数没有被注释
    localStorage.setItem('jwt_token', token);
}

function getAuthToken() { // <-- 确保这些函数没有被注释
    return localStorage.getItem('jwt_token');
}

function removeAuthToken() { // <-- 确保这些函数没有被注释
    localStorage.removeItem('jwt_token');
}

// --- 辅助函数：发送带认证的请求 ---
async function authenticatedFetch(url, options = {}) { // <-- 确保这个函数没有被注释
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
        const errorText = await response.text();
        throw new AuthError('会话已过期或无权限，请重新登录！', response.status, errorText);
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`请求失败: ${response.status} - ${errorText}`);
    }

    return response;
}

// 自定义认证错误类
class AuthError extends Error { // <-- 确保这个类没有被注释
    constructor(message, status, responseText) {
        super(message);
        this.name = 'AuthError';
        this.status = status;
        this.responseText = responseText;
    }
}

// --- 页面跳转和权限检查 ---
async function checkAuthAndRedirect() { // <-- 确保这个函数没有被注释
    // ... 里面的逻辑也要取消注释 ...
}

// 在每个页面加载时执行认证检查
document.addEventListener('DOMContentLoaded', checkAuthAndRedirect);
// --- 登录页面逻辑 (index.html) (取消注释) ---
document.addEventListener('DOMContentLoaded', () => {
    const bookListContainer = document.getElementById('bookListContainer'); // 用于渲染书籍列表的容器
    const searchForm = document.getElementById('bookSearchForm');
    const categoryFilter = document.getElementById('category-filter');
    const availableFilter = document.getElementById('available-filter');
    const filterBtn = document.getElementById('filterBtn'); // 筛选按钮
    const paginationContainer = document.getElementById('paginationContainer'); // 分页容器
    const addBookBtn = document.getElementById('addBookBtn'); // 管理员添加书籍按钮

    // 检查用户角色，显示/隐藏添加书籍按钮
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (currentUser && currentUser.role === 'ROLE_ADMIN') {
        addBookBtn.style.display = 'inline-block';
    }

    if (bookListContainer) {
        let currentPage = 1;
        let currentQuery = '';
        let currentCategory = '';
        let currentAvailability = '';

        // 从URL参数初始化搜索和筛选 (如果从其他页面跳转过来带了参数)
        const urlParams = new URLSearchParams(window.location.search);
        currentQuery = urlParams.get('query') || '';
        currentCategory = urlParams.get('category') || '';
        currentAvailability = urlParams.get('available') || '';

        // 设置搜索框和筛选器的初始值
        if (document.getElementById('searchQueryInput')) {
            document.getElementById('searchQueryInput').value = currentQuery;
        }
        if (document.getElementById('category-filter')) {
            document.getElementById('category-filter').value = currentCategory;
        }
        if (document.getElementById('available-filter')) {
            document.getElementById('available-filter').value = currentAvailability;
        }


        async function fetchBooks(page = 1, query = '', category = '', available = '') {
            let url = `${API_BASE_URL}/books?page=${page}&size=10`;
            if (query) url += `&query=${encodeURIComponent(query)}`;
            if (category) url += `&category=${encodeURIComponent(category)}`;
            if (available) url += `&available=${encodeURIComponent(available)}`;

            try {
                const response = await authenticatedFetch(url);
                const data = await response.json(); // 假设返回的是Page对象
                renderBooks(data.records);
                renderPagination(data.current, data.pages); // data.current是当前页，data.pages是总页数
            } catch (error) {
                console.error('Error fetching books:', error);
                if (error instanceof AuthError) {
                    // AuthError 已在 authenticatedFetch 中处理重定向，这里只打印
                    console.warn('认证错误，已重定向到登录页。');
                } else if (error instanceof SyntaxError) {
                    bookListContainer.innerHTML = '<p>加载书籍失败：服务器响应格式错误。</p>';
                } else {
                    bookListContainer.innerHTML = '<p>加载书籍失败：网络错误或服务器无响应。</p>';
                }
            }
        }

        function renderBooks(books) {
            bookListContainer.innerHTML = ''; // 清空现有内容
            if (books && books.length > 0) {
                const currentUser = JSON.parse(localStorage.getItem('current_user'));
                const isAdmin = currentUser && currentUser.role === 'ROLE_ADMIN';

                books.forEach(book => {
                    const bookItem = `
                        <div class="book-item">
                            <img src="https://via.placeholder.com/120x180?text=Book+Cover" alt="书籍封面">
                            <div class="book-info">
                                <h3><a href="/book_detail.html?id=${book.id}">${book.title}</a></h3>
                                <p>作者：${book.author}</p>
                                <p>ISBN: ${book.isbn}</p>
                                <p class="status ${book.availableCopies > 0 ? 'available' : 'borrowed'}">状态: ${book.availableCopies > 0 ? '可借阅' : '已借出'}</p>
                                <button class="btn-borrow" ${book.availableCopies <= 0 ? 'disabled' : ''} onclick="borrowBook(${book.id})">借阅</button>
                                ${isAdmin ? `
                                    <button class="btn-edit" onclick="editBook(${book.id})">编辑</button>
                                    <button class="btn-delete" onclick="deleteBook(${book.id})">删除</button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                    bookListContainer.insertAdjacentHTML('beforeend', bookItem);
                });
            } else {
                bookListContainer.innerHTML = '<p>没有找到相关书籍。</p>';
            }
        }

        function renderPagination(currentPage, totalPages) {
            paginationContainer.innerHTML = '';
            if (totalPages <= 1) return;

            const createPageLink = (page, text, isActive = false, isDisabled = false) => {
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = text;
                if (isActive) link.classList.add('active');
                if (isDisabled) link.classList.add('disabled');
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!isDisabled && !isActive) {
                        fetchBooks(page, currentQuery, currentCategory, currentAvailability);
                    }
                });
                return link;
            };

            paginationContainer.appendChild(createPageLink(currentPage - 1, '&laquo; 上一页', false, currentPage === 1));

            // 显示页码，例如只显示当前页附近的一些页码
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, currentPage + 2);

            if (startPage > 1) {
                paginationContainer.appendChild(createPageLink(1, 1));
                if (startPage > 2) {
                    const span = document.createElement('span');
                    span.textContent = '...';
                    paginationContainer.appendChild(span);
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                paginationContainer.appendChild(createPageLink(i, i, i === currentPage));
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    const span = document.createElement('span');
                    span.textContent = '...';
                    paginationContainer.appendChild(span);
                }
                paginationContainer.appendChild(createPageLink(totalPages, totalPages));
            }


            paginationContainer.appendChild(createPageLink(currentPage + 1, '下一页 &raquo;', false, currentPage === totalPages));
        }


        // 搜索表单提交
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                currentQuery = searchForm.query.value;
                currentPage = 1; // 搜索时重置到第一页
                fetchBooks(currentPage, currentQuery, currentCategory, currentAvailability);
            });
        }

        // 筛选按钮点击
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                currentCategory = categoryFilter.value;
                currentAvailability = availableFilter.value;
                currentPage = 1; // 筛选时重置到第一页
                fetchBooks(currentPage, currentQuery, currentCategory, currentAvailability);
            });
        }

        // 初始加载书籍
        fetchBooks(currentPage, currentQuery, currentCategory, currentAvailability);
    }
});

async function borrowBook(bookId) {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser) {
        alert('请先登录才能借阅书籍！');
        window.location.href = '/index.html';
        return;
    }

    if (confirm('确定要借阅此书籍吗？')) {
        try {
            // 发送 POST 请求到后端 /borrows 接口
            const response = await authenticatedFetch(`${API_BASE_URL}/borrows`, {
                method: 'POST',
                body: JSON.stringify({ bookId: bookId }) // 只需传递 bookId
            });

            if (response.ok) {
                const message = await response.text(); // 假设后端返回String，如 "书籍借阅成功！"
                alert(message);
                // 借阅成功后，刷新书籍列表以更新书籍状态和可借阅数量
                window.location.reload(); // 简单粗暴的刷新
                // 或者更优雅地只更新当前书籍的状态
                // fetchBooks(currentPage, currentQuery, currentCategory, currentAvailability); // 重新加载当前页书籍
            } else {
                const errorText = await response.text(); // 获取后端返回的错误信息
                alert(`借阅失败: ${errorText}`);
            }
        } catch (error) {
            console.error('借阅请求失败:', error);
            if (error instanceof AuthError) {
                console.warn('认证错误，已重定向到登录页。');
                // AuthError 已经在 authenticatedFetch 内部处理了 alert 和重定向
            } else {
                alert('借阅时发生网络错误或服务器无响应。');
            }
        }
    }
}