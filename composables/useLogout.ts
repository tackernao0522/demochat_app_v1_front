import { ref } from "vue";
import { useRouter, useNuxtApp } from "#app";

export const useLogout = () => {
  const error = ref<string | null>(null);
  const router = useRouter();
  const { $axios } = useNuxtApp();

  const logout = async () => {
    error.value = null;

    try {
      const res = await $axios.delete("/auth/sign_out", {
        headers: {
          uid: localStorage.getItem("uid")!,
          "access-token": localStorage.getItem("access-token")!,
          client: localStorage.getItem("client")!,
        },
      });

      if (!res) {
        throw new Error("ログアウトできませんでした");
      }

      console.log("ログアウトしました");
      localStorage.clear();
      router.push({ path: "/" });
    } catch (err) {
      error.value = "ログアウトできませんでした";
      console.error(err);
    }
  };

  return { logout, error };
};
