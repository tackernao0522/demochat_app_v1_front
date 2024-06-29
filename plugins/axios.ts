import axios from "axios";
import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin(({ provide }) => {
  const config = useRuntimeConfig();

  const api = axios.create({
    baseURL: config.public.apiUrl,
  });

  // リクエストログ
  api.interceptors.request.use((config) => {
    console.log(config);
    return config;
  });

  // レスポンスログ
  api.interceptors.response.use(
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
  provide("axios", api);
});
