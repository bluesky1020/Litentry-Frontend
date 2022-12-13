const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

export const authUser = async (payload) => {
  const response = await fetch(`${API_URL}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response.text();
}

export const checkSession = async (payload) => {
  const response = await fetch(`${API_URL}/checkSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response.text();
}

export const getSecret = async (address, hash) => {
  const response = await fetch(`${API_URL}/secret/${address}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": hash
    }
  });
  return response.text();
}