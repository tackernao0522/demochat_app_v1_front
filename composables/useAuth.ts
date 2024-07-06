import { ref } from "vue";
import { useNuxtApp } from "#app";
import { useCookiesAuth } from "./useCookiesAuth";
import { useRedirect } from "./useRedirect";

export const useAuth = () => {
  const { $axios } = useNuxtApp();
  const { saveAuthData, getAuthData } = useCookiesAuth();
  const { redirectToChatroom } = useRedirect();

  const errorMessage = ref("");
  const successMessage = ref("");
  const isLoading = ref(false);

  const handleAuthResponse = (response: any) => {
    console.log("Handling auth response");
    if (response.status === 200 && response.data && response.headers) {
      saveAuthData(response.headers, response.data.data);
      successMessage.value =
        "認証に成功しました。チャットルームにリダイレクトします...";
      setTimeout(() => {
        redirectToChatroom();
      }, 100);
    } else {
      console.error("Invalid auth response");
      throw new Error("認証レスポンスが不正です");
    }
  };

  const login = async (email: string, password: string) => {
    console.log("Attempting login for:", email);
    isLoading.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    try {
      const response = await $axios.post("/auth/sign_in", { email, password });
      handleAuthResponse(response);
    } catch (error: any) {
      console.error("Login error:", error);
      errorMessage.value =
        error.response?.data?.errors?.[0] || "ログインに失敗しました";
      console.error("ログインエラー:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    isLoading.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    try {
      const response = await $axios.post("/auth", { email, password, name });
      handleAuthResponse(response);
    } catch (error: any) {
      errorMessage.value =
        error.response?.data?.errors?.[0] || "サインアップに失敗しました";
      console.error("サインアップエラー:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    try {
      const authData = getAuthData();
      await $axios.delete("/auth/sign_out", {
        headers: {
          "access-token": authData.token,
          client: authData.client,
          uid: authData.uid,
        },
      });
      // ログアウト後にCookieをクリア
      saveAuthData({}, null);
      successMessage.value = "ログアウトしました";
    } catch (error: any) {
      errorMessage.value = "ログアウトに失敗しました";
      console.error("ログアウトエラー:", error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    login,
    signup,
    logout,
    errorMessage,
    successMessage,
    isLoading,
  };
};
