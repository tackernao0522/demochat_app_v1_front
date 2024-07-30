import { ref } from "vue";
import { useNuxtApp } from "#app";
import { useCookiesAuth } from "./useCookiesAuth";
import { useRedirect } from "./useRedirect";
import { logger } from "~/utils/logger";

export const useLogout = () => {
  const { $axios } = useNuxtApp();
  const { getAuthData, clearAuthData } = useCookiesAuth();
  const { redirectToLogin } = useRedirect();
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
        await redirectToLogin();
      }
    } catch (err) {
      error.value = err.response ? err.response.data : err.message;
      logger.error("Logout error:", error.value);
    }
  };

  return {
    logout,
    error,
  };
};
