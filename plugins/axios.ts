import axios from "axios";
import { defineNuxtPlugin, useRuntimeConfig } from "#app";
import { useCookiesAuth } from "../composables/useCookiesAuth";

export default defineNuxtPlugin(() => {
  const { saveAuthData } = useCookiesAuth();
  const config = useRuntimeConfig();

  const api = axios.create({
    baseURL: config.public.apiUrl,
    withCredentials: true,
  });

  api.interceptors.response.use(
    (response) => {
      console.log(response);
      return response;
    },
    (error) => {
      console.log(error.response);
      return Promise.reject(error);
    }
  );

  return {
    provide: {
      axios: api,
    },
  };
});
