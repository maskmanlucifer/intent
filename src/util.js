export const getTodaysDate = () => {
  const today = new Date();
  return today.toLocaleDateString("en-US", { day: "numeric", month: "short" });
};
