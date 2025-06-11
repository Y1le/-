
import axios from 'axios';
import router from '@/router'; 

// 1. 创建 Axios 实例
const instance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL, // 从环境变量获取后端地址
  timeout: 5000, // 请求超时时间，单位毫秒 (5秒)
  headers: {
    'Content-Type': 'application/json', // 默认请求头，发送 JSON 数据
  },
});

// 2. 请求拦截器：在发送请求前添加 JWT Token
instance.interceptors.request.use(
  config => {
    // 从 localStorage 获取存储的 JWT Token
    const token = localStorage.getItem('jwtToken');

    // 如果 Token 存在，则在请求头中添加 Authorization 字段
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // 处理请求错误
    return Promise.reject(error);
  }
);

// 3. 响应拦截器：处理响应数据和错误，特别是 Token 过期
instance.interceptors.response.use(
  response => {
    // 对成功的响应数据做些什么
    return response;
  },
  error => {
    // 对响应错误做些什么
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401: // 未认证 (Unauthorized) - Token 过期或无效
          console.error('认证失败：Token 过期或无效。', data.message || '');
          // 清除本地存储的 Token
          localStorage.removeItem('jwtToken');
          // 重定向到登录页面
          // 确保你的 router 实例已经正确导入
          if (router) {
            router.push('/login');
          } else {
            // 如果 router 还没有被完全初始化，或者你不想依赖 router 实例
            // 可以直接刷新页面，让用户重新登录
            // window.location.href = '/login';
          }
          break;
        case 403: // 禁止访问 (Forbidden) - 没有权限
          console.error('权限不足：您没有访问该资源的权限。', data.message || '');
          // 可以跳转到无权限提示页面，或者返回上一页
          // router.push('/403');
          break;
        case 404: // 未找到 (Not Found)
          console.error('请求资源未找到。', data.message || '');
          break;
        case 500: // 服务器内部错误
          console.error('服务器内部错误。', data.message || '');
          break;
        default:
          console.error(`请求错误：${status} - ${data.message || '未知错误'}`);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误：服务器没有响应。', error.message);
    } else {
      // 在设置请求时发生了一些事情，触发了一个错误
      console.error('请求配置错误：', error.message);
    }
    return Promise.reject(error); // 继续抛出错误，让组件层可以捕获并处理
  }
);

export default instance;