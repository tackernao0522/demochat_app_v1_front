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
    console.log("Handling auth response", response);
    if (response.status === 200 && response.data && response.headers) {
      const authHeaders = {
        "access-token": response.headers["access-token"],
        client: response.headers["client"],
        uid: response.headers["uid"],
        expiry: response.headers["expiry"],
      };
      saveAuthData(authHeaders, response.data.data);
      successMessage.value =
        "認証に成功しました。チャットルームにリダイレクトします...";
      setTimeout(() => {
        redirectToChatroom();
      }, 100);
    } else {
      console.error("Invalid auth response", response);
      throw new Error("認証レスポンスが不正です");
    }
  };

  const login = async (email: string, password: string) => {
    console.log("Attempting login for:", email);
    isLoading.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    try {
      const response = await $axios.post(
        "/auth/sign_in",
        { email, password },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      handleAuthResponse(response);
    } catch (error: any) {
      console.error("Login error:", error);
      errorMessage.value =
        error.response?.data?.errors?.[0] || "ログインに失敗しました";
    } finally {
      isLoading.value = false;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    console.log("Attempting signup for:", email);
    isLoading.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    try {
      const response = await $axios.post(
        "/auth",
        { email, password, name },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      handleAuthResponse(response);
    } catch (error: any) {
      console.error("Signup error:", error);
      errorMessage.value =
        error.response?.data?.errors?.[0] || "サインアップに失敗しました";
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
        withCredentials: true,
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
