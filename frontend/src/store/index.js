// src/store/index.js

import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: !!localStorage.getItem('jwtToken'), // 初始认证状态取决于是否存在 Token
    username: localStorage.getItem('username') || null, // 存储用户名
  },
  mutations: {
    setAuthenticated(state, status) {
      state.isAuthenticated = status;
    },
    setUsername(state, username) {
      state.username = username;
    },
  },
  actions: {
    // 登录成功后调用此 action
    loginSuccess({ commit }, { token, username }) {
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('username', username);
      commit('setAuthenticated', true);
      commit('setUsername', username);
    },
    // 登出时调用此 action
    logout({ commit }) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('username');
      commit('setAuthenticated', false);
      commit('setUsername', null);
    },
  },
  getters: {
    // 获取认证状态
    isAuthenticated: state => state.isAuthenticated,
    // 获取用户名
    getUsername: state => state.username,
  },
  modules: {},
});