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

  return {
    provide: {
      axios: api,
    },
  };
});
