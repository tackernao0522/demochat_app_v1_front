import axios from "axios";
import { defineNuxtPlugin } from "#app";
import DOMPurify from "dompurify";

export default defineNuxtPlugin(({ provide, $config }) => {
  const api = axios.create({
    baseURL: $config.public.baseURL,
  });

  // リクエストログ
  api.interceptors.request.use((config) => {
    console.log(config);
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  // レスポンスログ
  api.interceptors.response.use(
    (response) => {
      console.log(response);
      return response;
    },
    async (error) => {
      // エラーログ
      console.log(error.response);

      if (error.response.status === 401) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          try {
            const response = await axios.post(
              `${$config.public.baseURL}/auth/refresh`,
              { token: refreshToken }
            );
            localStorage.setItem("access_token", response.data.access_token);
            error.config.headers["Authorization"] =
              `Bearer ${response.data.access_token}`;
            return axios(error.config);
          } catch (refreshError) {
            console.log(refreshError.response);
          }
        }
      }

      return Promise.reject(error);
    }
  );

  // ユーザー入力のサニタイズ
  const sanitizeInput = (input) => DOMPurify.sanitize(input);

  // axiosをnuxtアプリケーションに注入
  provide("axios", api);
  provide("sanitizeInput", sanitizeInput);
});
