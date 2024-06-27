import { defineNuxtRouteMiddleware } from "nuxt/app";
import { useLocalStorage } from "../composables/useLocalStorage";
import { useRedirect } from "../composables/useRedirect";

export default defineNuxtRouteMiddleware(() => {
  console.log("redirectIfAuthenticatedが呼ばれています!");

  if (process.server) {
    return;
  }

  const { isAuthenticated } = useLocalStorage();
  const { redirectToChatroom } = useRedirect();

  if (isAuthenticated()) {
    console.log("既にログインしています。");
    redirectToChatroom();
  }
});
