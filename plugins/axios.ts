import axios from "axios";
import { defineNuxtPlugin } from "#app";
import { useCookiesAuth } from "../composables/useCookiesAuth";

export default defineNuxtPlugin(() => {
  const { saveAuthData } = useCookiesAuth();

  const api = axios.create({
    baseURL:
      process.env.NODE_ENV === "production"
        ? "https://demochat-api.fly.dev"
        : "http://localhost:3000",
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
