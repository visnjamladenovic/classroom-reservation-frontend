const API_BASE = "http://localhost:5248/api";

export async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
}

export const getToken = () => localStorage.getItem("accessToken");
export const getRole = () => localStorage.getItem("role");
export const getEmail = () => localStorage.getItem("email");

export const setAuth = (data) => {
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("role", data.role);
  localStorage.setItem("email", data.email);
};

export const clearAuth = () => {
  ["accessToken", "refreshToken", "role", "email"].forEach((k) =>
    localStorage.removeItem(k)
  );
};