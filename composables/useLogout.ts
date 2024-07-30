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
    logger.info("Logout process started");
    try {
      const authData = getAuthData();
      logger.debug("Logging out with authData:", authData);

      if (!authData.token || !authData.client || !authData.uid) {
        logger.warn("Incomplete auth data, proceeding with logout");
        clearAuthData();
        window.location.href = "/";
        return;
      }

      await $axios.delete("/auth/sign_out", {
        headers: {
          "access-token": authData.token,
          client: authData.client,
          uid: authData.uid,
        },
      });

      logger.info("Logout API call successful");
    } catch (err) {
      logger.error("Logout error:", err);
      error.value = err.response ? err.response.data : err.message;
    } finally {
      clearAuthData();
      logger.info("Auth data cleared, redirecting to home");
      window.location.href = "/";
    }
  };

  return {
    logout,
    error,
  };
};
