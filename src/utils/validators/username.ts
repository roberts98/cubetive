export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return (
    username.length >= 3 &&
    username.length <= 30 &&
    usernameRegex.test(username)
  );
};
