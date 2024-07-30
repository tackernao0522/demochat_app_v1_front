import { ref } from "vue";
import { useNuxtApp, useRouter } from "#app";
import { useCookiesAuth } from "./useCookiesAuth";
import { logger } from "~/utils/logger";

export const useLogout = () => {
  const { $axios } = useNuxtApp();
  const router = useRouter();
  const { getAuthData, clearAuthData } = useCookiesAuth();
  const error = ref(null);

  const logout = async () => {
    error.value = null;
    try {
      const authData = getAuthData();
      logger.debug("Logging out with authData:", authData);
      const response = await $axios.delete("/auth/sign_out", {
        headers: {
          "access-token": authData.token,
          client: authData.client,
          uid: authData.uid,
        },
      });

      if (response.status === 200) {
        clearAuthData();
        logger.info("Logout successful, cookies cleared");
        // WebSocket接続を切断
        if (window.$nuxt && window.$nuxt.$cable) {
          window.$nuxt.$cable.disconnect();
          logger.debug("WebSocket disconnected");
        }
        // ローカルストレージとセッションストレージをクリア
        localStorage.clear();
        sessionStorage.clear();
        logger.debug("Local and session storage cleared");
        // ページをリロードしてから、ログインページにリダイレクト
        window.location.href = "/";
      }
    } catch (err) {
      error.value = err.response ? err.response.data : err.message;
      logger.error("Logout error:", error.value);
      // エラーが発生した場合でも、クライアントサイドのデータをクリアして強制的にログアウト
      clearAuthData();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    }
  };

  return {
    logout,
    error,
  };
};
