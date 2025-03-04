export const formatDateForSQL = (date: string | number | Date) => {
  if (!date) return null;

  const d = new Date(date);

  if (isNaN(d.getTime())) return null; // Check if the date is invalid

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}:${String(
    d.getSeconds()
  ).padStart(2, "0")}`;
};
