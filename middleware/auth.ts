import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useNuxtApp } from "#app";
import { useLocalStorage } from "../composables/useLocalStorage";

export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log("requireAuthが呼ばれています!");

  if (process.server) {
    console.log("SSR: requireAuthが呼ばれています!");
    return;
  }

  const { isAuthenticated, getAuthData } = useLocalStorage();

  if (!isAuthenticated()) {
    console.log("認証情報が不足しています。");
    return navigateTo("/");
  }

  const { $axios } = useNuxtApp();
  const { token, client, uid } = getAuthData();

  try {
    const response = await $axios.get("/auth/validate_token", {
      headers: {
        "access-token": token,
        client: client,
        uid: uid,
      },
    });

    if (response.status === 200) {
      console.log("セッションは有効です。");
      return;
    } else {
      console.log("セッションが無効です。");
      return navigateTo("/");
    }
  } catch (error) {
    console.error("セッション確認中にエラーが発生しました:", error);
    return navigateTo("/");
  }
});
