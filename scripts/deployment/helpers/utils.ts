export const getContractNameFromScriptFileName = (filename: string) => {
  return filename.substring(
    filename.lastIndexOf("-") + 1,
    filename.lastIndexOf(".")
  );
};
