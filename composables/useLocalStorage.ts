export const useLocalStorage = () => {
  const saveAuthData = (headers: AuthHeaders, data: AuthData) => {
    window.localStorage.setItem("access-token", headers["access-token"]);
    window.localStorage.setItem("client", headers.client);
    window.localStorage.setItem("uid", headers.uid);
    window.localStorage.setItem("name", data.name); // ここを確認
    window.localStorage.setItem("user", JSON.stringify(data)); // これも必要かどうか確認
  };

  const getAuthData = () => {
    return {
      token: window.localStorage.getItem("access-token"),
      client: window.localStorage.getItem("client"),
      uid: window.localStorage.getItem("uid"),
      name: window.localStorage.getItem("name"), // ここを確認
      user: JSON.parse(window.localStorage.getItem("user") || "{}"),
    };
  };

  const isAuthenticated = () => {
    const { token, client, uid } = getAuthData();
    return token && client && uid;
  };

  return { saveAuthData, getAuthData, isAuthenticated };
};
