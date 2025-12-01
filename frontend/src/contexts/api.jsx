const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal, ...options });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function buildHeaders(extra = {}) {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

// fecth para n travar a UI

async function fetchWithTimeoutSignal(url, opts = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal, ...opts });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

const mockResults = (q, limit = 10) => { // mock para nao travar
  const sample = [
    { name: `${q} (mock1)`, calories: 123, nutriments: {}, code: "m1" },
    { name: `${q} (mock2)`, calories: 250, nutriments: {}, code: "m2" },
  ];
  return { data: sample.slice(0, limit), total: sample.length, page: 1 };
};

// Busca alimetos
export async function searchFood(query, { limit = 20, page = 1 } = {}) {
  if (!query || !String(query).trim()) {
    return { data: [], items: [], total: 0, page, limit };
  }

  const token = localStorage.getItem("token");
  if (!token) throw new Error("UNAUTHORIZED");

  const q = String(query).trim();
  const url = `${BACKEND}/foods?query=${encodeURIComponent(q)}&limit=${limit}&page=${page}`;

  const TIMEOUT_MS = 12000; // timeout para resposta do backend 12 segunods
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      let errMsg = `HTTP ${res.status}`;
      try {
        const j = JSON.parse(txt || "{}");
        errMsg = j.error || j.message || errMsg;
      } catch {}
      const e = new Error(errMsg);
      e.status = res.status;
      throw e;
    }

    const txt = await res.text();
    let json = null;
    try {
      json = JSON.parse(txt || "{}");
    } catch {
      json = null;
    }

    const items = Array.isArray(json?.items)
      ? json.items
      : Array.isArray(json?.data)
      ? json.data
      : [];

    const result = {
      data: items,
      items: items,
      total: json?.total ?? json?.meta?.total ?? items.length,
      page: json?.page ?? json?.meta?.page ?? page,
      limit: json?.limit ?? json?.meta?.limit ?? limit,
      meta: json?.meta ?? { total: json?.total ?? items.length, page: json?.page ?? page, limit: json?.limit ?? limit },
      source: "backend",
    };

    return result;
  } catch (err) {
    clearTimeout(id);
    if (err && err.name === "AbortError") throw new Error("timeout");

    // retorno mock para n travar
    console.warn("[SEARCH] erro ao consultar backend:", err);
    return mockResults(q, limit);
  }
}

// Post login

export async function loginUser({ username, password }) {
  const url = `${BACKEND}/auth/login`;

  const res = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ username, password }),
    },
    10000
  );

  const json = await res.json();

  if (!res.ok) throw new Error(json.error || json.message);

  localStorage.setItem("token", json.token);
  return json;
}

// Post Registro

export async function registerUser({ username, password, email }) {
  const url = `${BACKEND}/auth/register`;

  const res = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ username, password, email }),
    },
    10000
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.message);

  return json;
}

// PostFood

export async function postFood(food = {}) {
  const url = `${BACKEND}/foods`;

  const res = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(food),
    },
    10000
  );

  const txt = await res.text();
  let json;
  try {
    json = JSON.parse(txt);
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(json?.error || json?.message || "Erro ao inserir alimento");
  }

  return json;
}
