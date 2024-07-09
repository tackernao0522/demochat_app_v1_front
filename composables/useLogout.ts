import { ref } from "vue";
import { useNuxtApp, useRouter } from "#app";
import { useCookiesAuth } from "./useCookiesAuth";

export const useLogout = () => {
  const { $axios, $config } = useNuxtApp();
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
        data: {
          uid: authData.uid,
        },
      });

      console.log("Logout response:", response);

      if (response.status === 200) {
        clearAuthData();
        console.log("Logout successful, cookies cleared");

        // 環境に応じたドメインの設定
        const domain =
          $config.public.nodeEnv === "development"
            ? "localhost"
            : "demochat-api.fly.dev";
        const vercelDomain =
          $config.public.nodeEnv === "development"
            ? "localhost"
            : "front-sigma-three.vercel.app";

        // クッキーの削除
        document.cookie = `access-token=; Max-Age=0; path=/; domain=${domain}; secure; SameSite=None`;
        document.cookie = `client=; Max-Age=0; path=/; domain=${domain}; secure; SameSite=None`;
        document.cookie = `uid=; Max-Age=0; path=/; domain=${domain}; secure; SameSite=None`;

        // 他のドメインに対するクッキー削除（本番環境のみ）
        if ($config.public.nodeEnv !== "development") {
          document.cookie = `access-token=; Max-Age=0; path=/; domain=${vercelDomain}; secure; SameSite=None`;
          document.cookie = `client=; Max-Age=0; path=/; domain=${vercelDomain}; secure; SameSite=None`;
          document.cookie = `uid=; Max-Age=0; path=/; domain=${vercelDomain}; secure; SameSite=None`;
        }

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
