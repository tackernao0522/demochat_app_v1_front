import { ref } from "vue";
import axios from "axios";
import { useCookiesAuth } from "./useCookiesAuth";
import { useRedirect } from "./useRedirect";
import { useRuntimeConfig } from "#app";
import { logger } from "../utils/logger";

export const useAuth = () => {
  const config = useRuntimeConfig();
  const { saveAuthData, getAuthData, clearAuthData } = useCookiesAuth();
  const { redirectToChatroom } = useRedirect();

  const errorMessage = ref("");
  const successMessage = ref("");
  const isLoading = ref(false);

  const api = axios.create({
    baseURL: config.public.apiUrl,
    withCredentials: true,
  });

  const handleAuthResponse = (response: any) => {
    logger.debug("Handling auth response", response);
    if (response.status === 200 && response.data && response.headers) {
      const authHeaders = {
        "access-token": response.headers["access-token"],
        client: response.headers["client"],
        uid: response.headers["uid"],
        expiry: response.headers["expiry"],
      };
      logger.debug("Auth headers to save:", authHeaders);
      saveAuthData(authHeaders, response.data.data);
      successMessage.value =
        "認証に成功しました。チャットルームにリダイレクトします...";
      setTimeout(() => {
        redirectToChatroom();
      }, 100);
    } else {
      logger.error("Invalid auth response", response);
      throw new Error("認証レスポンスが不正です");
    }
  };

  const login = async (email: string, password: string) => {
    logger.info("Attempting login for:", email);
    isLoading.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    try {
      const response = await api.post(
        "/auth/sign_in",
        { email, password },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      handleAuthResponse(response);
    } catch (error: any) {
      logger.error("Login error:", error);
      errorMessage.value =
        error.response?.data?.errors?.[0] || "ログインに失敗しました";
    } finally {
      isLoading.value = false;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    logger.info("Attempting signup for:", email);
    isLoading.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    try {
      const response = await api.post(
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
      logger.debug("Signup response headers:", response.headers);
      handleAuthResponse(response);
    } catch (error: any) {
      logger.error("Signup error:", error);
      errorMessage.value =
        error.response?.data?.errors?.[0] || "サインアップに失敗しました";
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      const authData = getAuthData();
      await api.delete("/auth/sign_out", {
        headers: {
          "access-token": authData.token,
          client: authData.client,
          uid: authData.uid,
        },
      });
      clearAuthData();
      redirectToLogin();
    } catch (error) {
      console.error("Logout error:", error);
      errorMessage.value = "ログアウトに失敗しました";
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
