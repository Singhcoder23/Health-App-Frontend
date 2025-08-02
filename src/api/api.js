export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");
  return fetch(process.env.REACT_APP_API_URL + url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    },
  });
}
