import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useCookiesAuth } from "~/composables/useCookiesAuth";

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated } = useCookiesAuth();

  const authenticated = await isAuthenticated();

  if (to.meta.requiresAuth && !authenticated) {
    return navigateTo("/");
  }

  if (to.path === "/" && authenticated) {
    return navigateTo("/chatroom");
  }
});
