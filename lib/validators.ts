export const sshPublicKeyValidator = (key?: string): boolean => {
  if (key === undefined || key === '') return true;
  return key.split(/\s/).every((v, index, array) => {
    if (array.length !== 3 || index > 2) return false;
    if (index === 0) return /ssh-rsa/.test(v);
    if (index === 1) return /\w+/.test(v);
    if (index === 2) return /\w+@\w+/.test(v);
    return true;
  });
};
