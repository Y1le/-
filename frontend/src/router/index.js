

import { createRouter, createWebHistory } from 'vue-router';
import UserLogin from '../views/Login.vue';
// import AppDashboard from '../views/Dashboard.vue'; // 修正后的组件名
// import BookListing from '../views/BookList.vue'; // 修正后的组件名
// import UserRegister from '../views/Register.vue'; // 新增
// import UserManagement from '../views/UserManagement.vue'; // 新增
// import BorrowManagement from '../views/BorrowManagement.vue'; // 新增
// import BookDetail from '../views/BookDetail.vue'; // 新增
// import AddBook from '../views/AddBook.vue'; // 新增
// import EditBook from '../views/EditBook.vue'; // 新增
// import axiosInstance from '../api/axios';

const routes = [{
    path: '/',
},
  {
    path: '/login',
    name: 'UserLogin',
    component: UserLogin,
    meta: { requiresAuth: false },
  },
//   {
//     path: '/dashboard',
//     name: 'AppDashboard',
//     component: AppDashboard,
//     meta: { requiresAuth: true },
//   },
//   {
//     path: '/books',
//     name: 'BookListing',
//     component: BookListing,
//     meta: { requiresAuth: true },
//   },
//   {
//     path: '/register', // 新增注册路由
//     name: 'UserRegister',
//     component: UserRegister,
//     meta: { requiresAuth: false },
//   },
//   {
//     path: '/user-management', // 新增用户管理路由
//     name: 'UserManagement',
//     component: UserManagement,
//     meta: { requiresAuth: true, roles: ['ROLE_ADMIN'] }, // 假设只有管理员能访问
//   },
//   {
//     path: '/borrow-management', // 新增借阅管理路由
//     name: 'BorrowManagement',
//     component: BorrowManagement,
//     meta: { requiresAuth: true, roles: ['ROLE_ADMIN'] },
//   },
//   {
//     path: '/book-detail/:id', // 新增书籍详情路由，带动态参数
//     name: 'BookDetail',
//     component: BookDetail,
//     meta: { requiresAuth: true },
//   },
//   {
//     path: '/add-book', // 新增添加书籍路由
//     name: 'AddBook',
//     component: AddBook,
//     meta: { requiresAuth: true, roles: ['ROLE_ADMIN'] },
//   },
//   {
//     path: '/edit-book/:id', // 新增编辑书籍路由，带动态参数
//     name: 'EditBook',
//     component: EditBook,
//     meta: { requiresAuth: true, roles: ['ROLE_ADMIN'] },
//   },
//   // 重定向到登录页，或者你可以设置一个默认的首页
  {
    path: '/',
    redirect: '/login',
  },
//   // 捕获所有未匹配的路由，重定向到登录页或 404 页
//   {
//     path: '/:pathMatch(.*)*',
//     redirect: '/login',
//   },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
  });
  
  // 路由守卫
//   router.beforeEach(async (to, from, next) => {
//     const requiresAuth = to.meta.requiresAuth;
//     const requiredRoles = to.meta.roles;
//     let isAuthenticated = localStorage.getItem('jwtToken'); // 使用 let 因为可能修改
  
//     let currentUser = null;
//     let userRole = null;
  
//     if (isAuthenticated) {
//       try {
//         currentUser = JSON.parse(localStorage.getItem('current_user'));
//         if (!currentUser) {
//           // 如果 localStorage 中没有用户信息，或者需要刷新，则通过 API 获取
//           const response = await axiosInstance.get('/me'); // <-- 这里需要 axiosInstance
//           currentUser = response.data;
//           localStorage.setItem('current_user', JSON.stringify(currentUser));
//         }
//         userRole = currentUser ? currentUser.role : null;
//       } catch (error) {
//         console.error('获取用户角色失败或Token无效:', error);
//         localStorage.removeItem('jwtToken');
//         localStorage.removeItem('username');
//         localStorage.removeItem('current_user');
//         isAuthenticated = false; // 标记为未认证，触发重定向
//       }
//     }
  
//     if (requiresAuth && !isAuthenticated) {
//       next('/login');
//     } else if (!requiresAuth && isAuthenticated && to.path === '/login') {
//       next('/dashboard');
//     } else if (requiresAuth && isAuthenticated && requiredRoles && !requiredRoles.includes(userRole)) {
//       alert('您没有权限访问此页面！');
//       next('/dashboard');
//     } else {
//       next();
//     }
//   });

export default router;