export const getHashConfig = () => {
  return {
    algorithm: process.env.REACT_APP_HASH_ALGORITHM,
    signerKey: process.env.REACT_APP_HASH_SIGNER_KEY,
    saltSeparator: process.env.REACT_APP_HASH_SALT_SEPARATOR,
    rounds: parseInt(process.env.REACT_APP_HASH_ROUNDS, 10),
    memoryCost: parseInt(process.env.REACT_APP_HASH_MEM_COST, 10),
  };
};
