// src/main.ts

import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 导入 Vue Router 实例
import store from './store';   // 导入 Vuex store 实例
import axiosInstance from './api/axios'; // 导入配置好的 Axios 实例

const app = createApp(App);

app.use(router);
app.use(store);

app.config.globalProperties.$axios = axiosInstance;

app.mount('#app');