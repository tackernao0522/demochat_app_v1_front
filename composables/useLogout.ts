import { ref } from "vue";
import { useNuxtApp } from "#app";
import { useCookiesAuth } from "./useCookiesAuth";
import { logger } from "~/utils/logger";

export const useLogout = () => {
  const { $axios } = useNuxtApp();
  const { getAuthData, clearAuthData } = useCookiesAuth();
  const error = ref(null);

  const logout = async () => {
    error.value = null;
    try {
      const authData = getAuthData();
      logger.debug("Logging out with authData:", authData);
      await $axios.delete("/auth/sign_out", {
        headers: {
          "access-token": authData.token,
          client: authData.client,
          uid: authData.uid,
        },
      });
    } catch (err) {
      error.value = err.response ? err.response.data : err.message;
      logger.error("Logout error:", error.value);
    } finally {
      await performClientSideLogout();
    }
  };

  const performClientSideLogout = async () => {
    clearAuthData();
    logger.info("Auth data cleared");

    if (window.$nuxt && window.$nuxt.$cable) {
      window.$nuxt.$cable.disconnect();
      logger.debug("WebSocket disconnected");
    }

    localStorage.clear();
    sessionStorage.clear();
    logger.debug("Local and session storage cleared");

    await new Promise((resolve) => setTimeout(resolve, 500));

    window.location.href = "/";
  };

  return {
    logout,
    error,
  };
};
