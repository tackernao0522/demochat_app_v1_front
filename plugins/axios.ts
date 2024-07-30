import axios from "axios";
import { defineNuxtPlugin, useRuntimeConfig } from "#app";
import { useCookiesAuth } from "../composables/useCookiesAuth";

export default defineNuxtPlugin(() => {
  const { saveAuthData, getAuthData } = useCookiesAuth();
  const config = useRuntimeConfig();

  const api = axios.create({
    baseURL: config.public.apiUrl,
    withCredentials: true,
  });

  api.interceptors.request.use(
    (config) => {
      const authData = getAuthData();
      if (authData.token) {
        config.headers["access-token"] = authData.token;
        config.headers["client"] = authData.client;
        config.headers["uid"] = authData.uid;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => {
      const token = response.headers["access-token"];
      const client = response.headers["client"];
      const uid = response.headers["uid"];
      const expiry = response.headers["expiry"];

      if (token && client && uid && expiry) {
        const currentAuthData = getAuthData();
        saveAuthData(
          {
            "access-token": token,
            client,
            uid,
            expiry,
          },
          currentAuthData.user
        );
      }
      return response;
    },
    (error) => {
      console.error("Axios error:", error);
      // エラーメッセージをユーザーに表示するロジックを追加する場合はここに実装
      return Promise.reject(error);
    }
  );

  return {
    provide: {
      axios: api,
    },
  };
});
