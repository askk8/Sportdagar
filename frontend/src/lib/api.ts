const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; full_name: string; phone?: string }) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    me: (token: string) => request("/auth/me", {}, token),
    updateMe: (data: Record<string, unknown>, token: string) =>
      request("/auth/me", { method: "PATCH", body: JSON.stringify(data) }, token),
  },

  children: {
    list: (token: string) => request("/children/", {}, token),
    create: (data: Record<string, unknown>, token: string) =>
      request("/children/", { method: "POST", body: JSON.stringify(data) }, token),
    update: (id: string, data: Record<string, unknown>, token: string) =>
      request(`/children/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),
    delete: (id: string, token: string) =>
      request(`/children/${id}`, { method: "DELETE" }, token),
  },

  sessions: {
    list: (params?: Record<string, string>) => {
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      return request(`/sessions/${q}`);
    },
    get: (id: string) => request(`/sessions/${id}`),
    weeks: () => request("/sessions/weeks/"),
    sports: () => request("/sessions/sports/"),
  },

  bookings: {
    list: (token: string) => request("/bookings/", {}, token),
    create: (data: { session_id: string; child_id: string }, token: string) =>
      request("/bookings/", { method: "POST", body: JSON.stringify(data) }, token),
    cancel: (id: string, token: string) =>
      request(`/bookings/${id}`, { method: "DELETE" }, token),
  },

  admin: {
    login: (username: string, password: string) =>
      request("/admin/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
    stats: (token: string) => request("/admin/stats", {}, token),
    weeks: {
      list: (token: string) => request("/admin/weeks", {}, token),
      create: (data: Record<string, unknown>, token: string) =>
        request("/admin/weeks", { method: "POST", body: JSON.stringify(data) }, token),
      update: (id: string, data: Record<string, unknown>, token: string) =>
        request(`/admin/weeks/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),
      delete: (id: string, token: string) =>
        request(`/admin/weeks/${id}`, { method: "DELETE" }, token),
    },
    sessions: {
      list: (token: string, weekId?: string) =>
        request(`/admin/sessions${weekId ? `?sport_week_id=${weekId}` : ""}`, {}, token),
      create: (data: Record<string, unknown>, token: string) =>
        request("/admin/sessions", { method: "POST", body: JSON.stringify(data) }, token),
      update: (id: string, data: Record<string, unknown>, token: string) =>
        request(`/admin/sessions/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),
      delete: (id: string, token: string) =>
        request(`/admin/sessions/${id}`, { method: "DELETE" }, token),
    },
    bookings: {
      list: (token: string, params?: Record<string, string>) => {
        const q = params ? "?" + new URLSearchParams(params).toString() : "";
        return request(`/admin/bookings${q}`, {}, token);
      },
    },
    sports: {
      list: (token: string) => request("/admin/sports", {}, token),
    },
  },
};
