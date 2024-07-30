import { ref } from "vue";
import { useNuxtApp } from "#app";
import { useCookiesAuth } from "./useCookiesAuth";
import { useRedirect } from "./useRedirect";
import { logger } from "~/utils/logger";

export const useLogout = () => {
  const { $axios } = useNuxtApp();
  const { getAuthData, clearAuthData } = useCookiesAuth();
  const { redirectToHome } = useRedirect();
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
        await redirectToHome();
        return;
      }

      const response = await $axios.delete("/auth/sign_out", {
        headers: {
          "access-token": authData.token,
          client: authData.client,
          uid: authData.uid,
        },
      });

      logger.debug("Logout API response:", response);

      if (response.status === 200) {
        clearAuthData();
        logger.info("Logout successful, cookies cleared");
        await redirectToHome();
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (err) {
      logger.error("Logout error:", err);
      error.value = err.response ? err.response.data : err.message;
      clearAuthData();
      await redirectToHome();
    }
  };

  return {
    logout,
    error,
  };
};
