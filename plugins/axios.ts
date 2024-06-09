import axios from "axios";
import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin(({ provide }) => {
  // リクエストログ
  axios.interceptors.request.use((config) => {
    console.log(config);
    return config;
  });

  // レスポンスログ
  axios.interceptors.response.use(
    (response) => {
      console.log(response);
      return response;
    },
    (error) => {
      // エラーログ
      console.log(error.response);
      return Promise.reject(error);
    }
  );

  // axiosをnuxtアプリケーションに注入
  provide("axios", axios);
});
