const API_BASE_URL = 'http://localhost:8081';

// --- JWT Token 管理 ---
function setAuthToken(token) {
    localStorage.setItem('jwt_token', token);
}

function getAuthToken() {
    return localStorage.getItem('jwt_token');
}

function removeAuthToken() {
    localStorage.removeItem('jwt_token');
}

// --- 辅助函数：发送带认证的请求 ---
async function authenticatedFetch(url, options = {}) {
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
        // 抛出自定义认证错误，由调用者捕获并处理重定向
        throw new AuthError('会话已过期或无权限，请重新登录！', response.status, errorText);
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`请求失败: ${response.status} - ${errorText}`);
    }

    return response;
}

// 自定义认证错误类
class AuthError extends Error {
    constructor(message, status, responseText) {
        super(message);
        this.name = 'AuthError';
        this.status = status;
        this.responseText = responseText;
    }
}

// --- 页面跳转和权限检查 ---
async function checkAuthAndRedirect() {
    const path = window.location.pathname;
    const token = getAuthToken();

    // 定义不需要认证就可以访问的公共页面路径
    const publicPaths = [
        '/',
        '/index.html',
        '/register.html',
        '/css/',
        '/js/',
        '/favicon.ico',
        '/user_dashboard.html',
        '/admin_dashboard.html',
        '/book_list.html',
        '/book_detail.html',
        '/user_borrows.html'
    ];

    // 检查当前路径是否是公共路径之一
    let isPublicPath = false;
    for (const p of publicPaths) {
        if (path === p || path.startsWith(p + '/')) {
            isPublicPath = true;
            break;
        }
    }
    // 特别处理 .html 文件，确保它们被视为公共路径，如果它们是静态页面
    // 这一段可以根据你的实际需求调整。如果 publicPaths 已经包含了所有公共的 .html 文件，可以简化。
    if (path.endsWith('.html') && !isPublicPath) { // 只有当它不是公共路径时才进行额外检查
        const htmlFileName = path.substring(path.lastIndexOf('/'));
        if (publicPaths.includes(htmlFileName)) {
            isPublicPath = true;
        }
    }

    // 如果在登录页或注册页，且已登录，则直接跳转到对应仪表盘
    if (token && (path === '/' || path === '/index.html' || path === '/register.html')) {
        try {
            const userResponse = await authenticatedFetch(`${API_BASE_URL}/user/me`);
            if (userResponse.ok) {
                const user = await userResponse.json();
                localStorage.setItem('current_user', JSON.stringify(user));
                if (user.role === 'ROLE_ADMIN') {
                    window.location.href = '/admin_dashboard.html';
                } else {
                    window.location.href = '/user_dashboard.html';
                }
                return; // 成功重定向后立即返回
            } else {
                // Token无效，但不是401/403，可能是其他服务器问题
                console.error('获取用户信息失败（非认证问题）:', userResponse.status, await userResponse.text());
                removeAuthToken();
                // 不在这里重定向，让下面的 !token 逻辑处理
                return;
            }
        } catch (error) {
            console.error('认证检查失败:', error);
            removeAuthToken();
            // 不在这里重定向，让下面的 !token 逻辑处理
            return;
        }
    }

    // 如果没有Token且不在公共页面，则重定向到登录页
    if (!token && !isPublicPath) {
        window.location.href = '/index.html';
        return;
    }

    // 如果有Token，但不在登录页/注册页，检查权限
    if (token && !isPublicPath) {
        try {
            const userResponse = await authenticatedFetch(`${API_BASE_URL}/user/me`);
            if (userResponse.ok) {
                const user = await userResponse.json();
                localStorage.setItem('current_user', JSON.stringify(user));

                // 根据角色判断页面访问权限
                if (path.includes('admin_') || path.includes('user_management') || path.includes('borrow_management')) {
                    if (user.role !== 'ROLE_ADMIN') {
                        alert('您没有权限访问此页面！');
                        window.location.href = '/user_dashboard.html'; // 无权限跳转到用户仪表盘
                    }
                } else if (path.includes('user_dashboard') || path.includes('user_borrows') || path.includes('book_list') || path.includes('book_detail')) {
                    // 这些页面对所有认证用户开放（普通用户和管理员）
                    if (user.role !== 'ROLE_USER' && user.role !== 'ROLE_ADMIN') {
                        alert('您没有权限访问此页面！');
                        window.location.href = '/index.html'; // 无权限跳转到登录页
                    }
                }
            } else {
                console.error('获取用户信息失败（非认证问题）:', userResponse.status, await userResponse.text());
                removeAuthToken();
                window.location.href = '/index.html';
            }
        } catch (error) {
            console.error('认证检查失败:', error);
            removeAuthToken();
            window.location.href = '/index.html';
        }
    }
}

// --- 退出登录逻辑 ---
function logout() {
    removeAuthToken();
    localStorage.removeItem('current_user'); // 清除存储的用户信息
    alert('您已退出登录！');
    window.location.href = '/index.html'; // 重定向到登录页
}

// 在每个页面加载时执行认证检查
document.addEventListener('DOMContentLoaded', checkAuthAndRedirect);

// --- 全局 DOMContentLoaded 事件监听器 ---
document.addEventListener('DOMContentLoaded', () => {
    // 登录表单逻辑 (主要用于 index.html)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => response.text());
                    const errorMessage = errorData.message || errorData || '登录失败！';
                    alert(errorMessage);
                    if (response.status === 401 || response.status === 403) {
                        removeAuthToken();
                        window.location.href = '/index.html'; // 登录失败或认证问题，重定向到登录页
                    }
                    return;
                }

                const data = await response.json();
                setAuthToken(data.token);
                alert(data.message || '登录成功！');

                // 登录成功后，刷新页面以触发 checkAuthAndRedirect 进行角色判断和跳转
                window.location.reload();

            } catch (error) {
                console.error('登录请求处理失败:', error);
                if (error instanceof AuthError) {
                    alert(error.message);
                } else {
                    alert('网络错误或服务器无响应，请稍后再试。');
                }
            }
        });
    }

    // 注册链接处理 (主要用于 index.html)
    const registerLink = document.querySelector('.register-link a');
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            // e.preventDefault(); // 如果 HTML 中已经有 href="/register.html"，这行可以删除
            window.location.href = '/register.html';
        });
    }

    // 退出登录按钮绑定 (在所有页面中)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // --- 书籍列表相关逻辑 (适用于 user_dashboard.html, admin_dashboard.html, book_list.html 等) ---
    const bookListContainer = document.getElementById('bookListContainer');
    const searchForm = document.getElementById('bookSearchForm');
    const categoryFilter = document.getElementById('category-filter');
    const availableFilter = document.getElementById('available-filter');
    const filterBtn = document.getElementById('filterBtn');
    const paginationContainer = document.getElementById('paginationContainer');
    const addBookBtn = document.getElementById('addBookBtn');

    // 只有当页面存在 bookListContainer 时才执行书籍列表的加载和渲染逻辑
    if (bookListContainer) {
        // 检查用户角色，显示/隐藏添加书籍按钮
        const currentUser = JSON.parse(localStorage.getItem('current_user'));
        if (currentUser && currentUser.role === 'ROLE_ADMIN') {
            if (addBookBtn) { // 确保元素存在
                addBookBtn.style.display = 'inline-block';
            }
        }

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

// --- 借阅书籍逻辑 (全局可用，因为在 onclick 中调用) ---
async function borrowBook(bookId) {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser) {
        alert('请先登录才能借阅书籍！');
        window.location.href = '/index.html';
        return;
    }

    if (confirm('确定要借阅此书籍吗？')) {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/borrows`, {
                method: 'POST',
                body: JSON.stringify({ bookId: bookId })
            });

            if (response.ok) {
                const message = await response.text();
                alert(message);
                // 借阅成功后，刷新页面以更新书籍状态和可借阅数量
                window.location.reload();
            } else {
                const errorText = await response.text();
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

// --- 编辑书籍逻辑 (管理员专用，全局可用) ---
function editBook(bookId) {
    // 实际的编辑逻辑，通常会跳转到编辑页面或弹出编辑模态框
    alert(`编辑书籍 ID: ${bookId}`);
    window.location.href = `/edit_book.html?id=${bookId}`; // 示例跳转
}

// --- 删除书籍逻辑 (管理员专用，全局可用) ---
async function deleteBook(bookId) {
    if (confirm('确定要删除此书籍吗？此操作不可逆！')) {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/books/${bookId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('书籍删除成功！');
                window.location.reload(); // 刷新页面以更新列表
            } else {
                const errorText = await response.text();
                alert(`删除失败: ${errorText}`);
            }
        } catch (error) {
            console.error('删除书籍请求失败:', error);
            if (error instanceof AuthError) {
                console.warn('认证错误，已重定向到登录页。');
            } else {
                alert('删除书籍时发生网络错误或服务器无响应。');
            }
        }
    }
}