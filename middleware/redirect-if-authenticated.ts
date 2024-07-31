import { defineNuxtRouteMiddleware } from "nuxt/app";
import { useCookies } from "vue3-cookies";
import { useRedirect } from "../composables/useRedirect";

const redirectIfAuthenticated = defineNuxtRouteMiddleware(() => {
  console.log("redirectIfAuthenticatedが呼ばれています!");

  if (process.server) {
    return;
  }

  const { cookies } = useCookies();
  const { redirectToChatroom } = useRedirect();

  const token = cookies.get("access-token");
  const client = cookies.get("client");
  const uid = cookies.get("uid");

  if (token && client && uid) {
    console.log("既にログインしています。");
    redirectToChatroom();
  }
});

export default redirectIfAuthenticated;
