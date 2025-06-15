export const getHashConfig = () => {
  return {
    algorithm: import.meta.env.REACT_APP_HASH_ALGORITHM,
    signerKey: import.meta.env.REACT_APP_HASH_SIGNER_KEY,
    saltSeparator: import.meta.env.REACT_APP_HASH_SALT_SEPARATOR,
    rounds: parseInt(import.meta.env.REACT_APP_HASH_ROUNDS, 10),
    memoryCost: parseInt(import.meta.env.REACT_APP_HASH_MEM_COST, 10),
  };
};
