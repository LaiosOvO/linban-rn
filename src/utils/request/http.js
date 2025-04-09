import axios from 'axios';
import codeMsg from './errorMsg.js';
import {store} from '../../stores/index.js';
import {clearUserStore} from '../../stores/store-slice/userStore.js';
import {requestBaseConfig} from '../../stores/store-slice/baseConfigStore.js';
import {setErrorMsg} from '../../stores/store-slice/errorMsgStore.js';

const BASE_URL = "http://8.130.186.54:3000/"

// 创建axios实例
console.log('BASE_URL ',BASE_URL);

const instance = axios.create({
  baseURL: BASE_URL || '',
  timeout: 18000,
});

console.log(instance.baseURL)

// 添加请求拦截器
instance.interceptors.request.use(
  function (config) {
    console.log('请求配置：', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers
    });

    const userToken = store.getState().userStore.userToken;
    if (userToken) {
      config.headers.Authorization = 'Bearer ' + userToken; // 让每个请求携带自定义token
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

//添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    if (response.data.code === 200) {
      return response.data;
    } else {
      console.log(response.data);
      return Promise.resolve(response.data);
    }
  },

  function (error) {
    console.log(error);
    console.log('错误详情：', {
      message: error.message,
      code: error.code,
      response: error.response,
      config: error.config,
    });

    let {message} = error;
    if (message === 'Network Error') {
      message = '网络连接异常';
    } else if (message.includes('timeout')) {
      message = '网络请求超时';
    } else if (message.includes('Request failed with status code')) {
      const errcode = message.substr(message.length - 3);

      if (errcode === '401') {
        message = codeMsg[errcode];
        store.dispatch(clearUserStore());
      } else if (errcode === '404') {
        message = codeMsg[errcode];
        store.dispatch(requestBaseConfig());
      } else {
        message = error.response.data.message || codeMsg[errcode];
      }
    }
    error.message = message;
    store.dispatch(setErrorMsg(message));
    return Promise.reject(error);
  },
);

export default instance;
