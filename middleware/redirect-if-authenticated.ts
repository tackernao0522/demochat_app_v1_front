import { defineNuxtRouteMiddleware } from "nuxt/app";
import { useLocalStorage } from "../composables/useLocalStorage";
import { useRedirect } from "../composables/useRedirect";

export default defineNuxtRouteMiddleware(() => {
  console.log("redirectIfAuthenticatedが呼ばれています!");

  if (process.server) {
    return;
  }

  const { getAuthData } = useLocalStorage();
  const { token, client, uid } = getAuthData();
  const { redirectToChatroom } = useRedirect();

  if (token && client && uid) {
    console.log("既にログインしています。");
    redirectToChatroom();
  }
});
