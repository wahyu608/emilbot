export function formatResponse(data) {
  if (typeof data === "object") {
    return "Data:\n" + JSON.stringify(data, null, 2);
  }
  return data;
}
