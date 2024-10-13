
export const handleLogout = async () => {
  localStorage.removeItem('userinfo');
  window.location.href = '/';
};
