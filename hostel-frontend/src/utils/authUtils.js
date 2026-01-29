export const performLogout = () => {
  localStorage.removeItem("user");

  window.location.href = "/login";
};
