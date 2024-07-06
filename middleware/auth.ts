import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useCookiesAuth } from "~/composables/useCookiesAuth";

export default defineNuxtRouteMiddleware((to) => {
  // サーバーサイドではミドルウェアの処理をスキップ
  if (process.server) {
    return;
  }

  const { isAuthenticated } = useCookiesAuth();

  // 認証が必要なページへのアクセスをチェック
  if (to.meta.requiresAuth && !isAuthenticated()) {
    // 認証されていない場合、ホームページにリダイレクト
    return navigateTo("/");
  }

  // 既に認証されているユーザーがホームページにアクセスしようとした場合、
  // チャットルームにリダイレクト
  if (to.path === "/" && isAuthenticated()) {
    return navigateTo("/chatroom");
  }
});
