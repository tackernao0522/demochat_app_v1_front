import { ref } from "vue";
import { useNuxtApp, useRouter } from "#app";
import { useCookiesAuth } from "./useCookiesAuth";

export const useLogout = () => {
  const { $axios } = useNuxtApp();
  const router = useRouter();
  const { getAuthData, clearAuthData } = useCookiesAuth();
  const error = ref(null);

  const logout = async () => {
    error.value = null;
    try {
      const authData = getAuthData();
      console.log("Logging out with authData:", authData);
      const response = await $axios.delete("/auth/sign_out", {
        headers: {
          "access-token": authData.token,
          client: authData.client,
          uid: authData.uid,
        },
      });

      if (response.status === 200) {
        clearAuthData();
        console.log("Logout successful, cookies cleared");
        router.push("/");
      }
    } catch (err) {
      error.value = err.response ? err.response.data : err.message;
      console.error("Logout error:", error.value);
    }
  };

  return {
    logout,
    error,
  };
};
