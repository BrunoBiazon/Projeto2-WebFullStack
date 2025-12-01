import express from "express";
import fetch from "node-fetch";
import Food from "../models/Food.js";
import { authMiddleware } from "../config/authMiddleware.js";
import Cache from "../config/cache.js";
import FoodPostValidator from "../config/FoodPostValidator.js";

const router = express.Router();

const inMemory = new Map();
function memoryGet(key) { return inMemory.has(key) ? JSON.parse(inMemory.get(key)) : null; }
function memorySet(key, value) { inMemory.set(key, JSON.stringify(value)); }
const cache = Cache || { get: memoryGet, set: memorySet };

function normalizeIncoming(body = {}) {
  const nome = body.nome || body.title || body.name || (body.product_name ? String(body.product_name) : "") || "";

  const calorias =
    body.calorias ??
    body.calories ??
    (body.nutriments && (body.nutriments["energy-kcal_100g"] ?? body.nutriments["energy-kcal"])) ??
    undefined;

  const carboidratos =
    body.carboidratos ??
    body.carbohydrate ??
    body.carbohydrates ??
    (body.nutriments && (body.nutriments["carbohydrates_100g"] ?? body.nutriments["carbohydrates"])) ??
    undefined;

  const proteina =
    body.proteina ??
    body.protein ??
    body.proteins ??
    (body.nutriments && (body.nutriments["proteins_100g"] ?? body.nutriments["proteins"])) ??
    undefined;

  const gordura =
    body.gordura ??
    body.fat ??
    body.fats ??
    (body.nutriments && (body.nutriments["fat_100g"] ?? body.nutriments["fat"])) ??
    undefined;

  const nutriments = body.nutriments || {
    carbohydrates: carboidratos,
    protein: proteina,
    fat: gordura,
    "energy-kcal": calorias,
  };

  return {
    title: String(nome || "").trim(),
    name: String(nome || "").trim(),
    nome: String(nome || "").trim(),
    calories: calorias != null ? Number(calorias) : undefined,
    calorias: calorias != null ? Number(calorias) : undefined,
    carbohydrates: carboidratos != null ? Number(carboidratos) : undefined,
    carboidratos: carboidratos != null ? Number(carboidratos) : undefined,
    protein: proteina != null ? Number(proteina) : undefined,
    proteina: proteina != null ? Number(proteina) : undefined,
    fat: gordura != null ? Number(gordura) : undefined,
    gordura: gordura != null ? Number(gordura) : undefined,
    nutriments,
    source: body.source || body.fonte || "manual",
    owner: body.owner || body.userId || undefined,
  };
}

async function tryFetchFirstSuccess(urls = [], timeoutMsPerRequest = 12000) {
  if (!Array.isArray(urls) || urls.length === 0) throw new Error("nenhuma URL fornecida");

  const controllers = new Array(urls.length);
  let settled = false;

  return new Promise((resolve, reject) => {
    const errors = [];
    let pending = urls.length;

    urls.forEach((url, idx) => {
      const controller = new AbortController();
      controllers[idx] = controller;
      const id = setTimeout(() => {
        try { controller.abort(); } catch (e) {}
      }, timeoutMsPerRequest);

      (async () => {
        try {
          console.log(`[fetch parallel] tentando ${url} (timeout ${timeoutMsPerRequest}ms)`);
          const resp = await fetch(url, {
            signal: controller.signal,
            headers: {
              "User-Agent": "Projeto2-WebFullStack/1.0 (+https://github.com/BrunoBiazon)"
            },
          });

          clearTimeout(id);

          if (settled) {
            return;
          }

          if (resp && resp.ok) {
            settled = true;
            controllers.forEach((c, i) => { try { if (i !== idx && c) c.abort(); } catch (e) {} });
            console.log(`[fetch parallel] sucesso de ${url} status=${resp.status}`);
            return resolve(resp);
          } else {
            let bodyPreview = "";
            try {
              const txt = await resp.text().catch(()=>"");
              bodyPreview = txt ? txt.slice(0,300) : "";
            } catch(e) {}
            const err = new Error(`HTTP ${resp ? resp.status : "??"} de ${url} - preview: ${bodyPreview}`);
            err.status = resp ? resp.status : undefined;
            err.url = url;
            errors.push(err);
            console.warn("[fetch parallel] resposta não OK de", url, "status", resp && resp.status);
          }
        } catch (err) {
          errors.push(err);
          console.warn("[fetch parallel] erro ao acessar", url, "| name:", err?.name, "| message:", err?.message);
        } finally {
          pending -= 1;
          if (!settled && pending === 0) {
            const last = errors.length ? errors[errors.length - 1] : new Error("Todas as tentativas falharam");
            const agg = new Error(last.message || "Todas as tentativas falharam");
            agg.details = errors;
            return reject(agg);
          }
        }
      })();
    });
  });
}

router.get("/", authMiddleware, async (req, res) => {
  const qRaw = (req.query.query || "").trim();
  const q = qRaw.toLowerCase();
  if (!q) return res.status(400).json({ error: "Query vazia" });

  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
  const page = Math.max(1, parseInt(req.query.page) || 1);

  console.log(`[GET] busca por qRaw="${qRaw}", q="${q}", page=${page}, limit=${limit}`);

  try {
    // busca no DB
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // protecao
    const regex = new RegExp(escaped, "i");

    let localFoods = [];
    try {
      localFoods = await Food.find({ $or: [{ name: regex }, { nome: regex }, { title: regex }] })
        .limit(200)
        .lean();
      console.log(`[GET] DB retornou ${localFoods.length} itens`);
    } catch (dbErr) {
      console.warn("[GET] erro ao consultar DB (regex):", dbErr && dbErr.message);
      localFoods = [];
    }

    const localMapped = (localFoods || []).map((f) => ({
      source: f.source || "local",
      id: f._id ? String(f._id) : undefined,
      name: String(f.name || f.nome || f.title || "").trim(),
      calories: f.calories != null ? Number(f.calories) : null,
      nutriments: {
        carbohydrates: f.carbohydrates != null ? Number(f.carbohydrates) : undefined,
        protein: f.protein != null ? Number(f.protein) : undefined,
        fat: f.fat != null ? Number(f.fat) : undefined,
        "energy-kcal": f.calories != null ? Number(f.calories) : undefined,
      },
      owner: f.owner,
      _origin: "local",
    }));

    // tentativa cache
    let cachedApiResult = null;
    try {
      cachedApiResult = await cache.get(`search:${q}`);
      if (cachedApiResult && Array.isArray(cachedApiResult.data)) {
        console.log(`[GET] encontrado cache para search:${q} -> ${cachedApiResult.data.length} items`);
      } else {
        cachedApiResult = null;
      }
    } catch (cacheErr) {
      console.warn("[GET] erro ao ler cache:", cacheErr && cacheErr.message);
      cachedApiResult = null;
    }
    const offHttps = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(qRaw)}&search_simple=1&action=process&json=1&page_size=${limit}&page=${page}`;
    const offHttp  = `http://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(qRaw)}&search_simple=1&action=process&json=1&page_size=${limit}&page=${page}`;
    const allOrigins = `https://api.allorigins.win/raw?url=${encodeURIComponent(offHttps)}`;
    const apiUrls = [offHttps, allOrigins, offHttp];

    const WAIT_MS = 4000;  
    const BG_TIMEOUT_MS = 30000; 

    let apiProducts = [];

    if (cachedApiResult) {
      apiProducts = Array.isArray(cachedApiResult.data) ? cachedApiResult.data : [];
      (async () => {
        try {
          const respBg = await tryFetchFirstSuccess(apiUrls, BG_TIMEOUT_MS);
          if (respBg && respBg.ok) {
            const jsonBg = await respBg.json().catch(() => null);
            const productsBg = Array.isArray(jsonBg?.products) ? jsonBg.products : [];
            const mappedBg = (productsBg || []).map(p => ({
              source: "api",
              id: p.code ? String(p.code) : undefined,
              name: String(p.product_name || p.name || p.generic_name || "").trim(),
              calories:
                p.nutriments?.["energy-kcal"] ??
                p.nutriments?.["energy-kcal_100g"] ??
                p.nutriments?.["energy_100g"] ??
                null,
              nutriments: p.nutriments || {},
              _origin: "api",
            }));
            const resultBg = { data: mappedBg, items: mappedBg, total: mappedBg.length, page, limit, meta: { total: mappedBg.length, page, limit } };
            try { await cache.set(`search:${q}`, resultBg); console.log("[OFF bg-refresh] cache atualizado para", `search:${q}`); } catch(e){console.warn("[OFF bg-refresh] falha ao setar cache:", e && e.message)}
          }
        } catch (e) {
          console.warn("[OFF bg-refresh] erro:", e && (e.message || e));
        }
      })();
    } else {
      try {
        const fastPromise = (async () => {
          try {
            const resp = await tryFetchFirstSuccess(apiUrls, WAIT_MS);
            return resp;
          } catch (e) {
          
            return null;
          }
        })();

        const respFast = await fastPromise;
        if (respFast && respFast.ok) {
          const jsonFast = await respFast.json().catch(() => null);
          apiProducts = Array.isArray(jsonFast?.products) ? jsonFast.products : [];
          console.log(`[OFF fast] obteve ${apiProducts.length} produtos dentro de ${WAIT_MS}ms`);
          const mappedFast = (apiProducts || []).map(p => ({
            source: "api",
            id: p.code ? String(p.code) : undefined,
            name: String(p.product_name || p.name || p.generic_name || "").trim(),
            calories:
              p.nutriments?.["energy-kcal"] ??
              p.nutriments?.["energy-kcal_100g"] ??
              p.nutriments?.["energy_100g"] ??
              null,
            nutriments: p.nutriments || {},
            _origin: "api",
          }));
          const resultFast = { data: mappedFast, items: mappedFast, total: mappedFast.length, page, limit, meta: { total: mappedFast.length, page, limit } };
          try { await cache.set(`search:${q}`, resultFast); } catch(e){/* ignore */ }
        } else {
          console.log(`[OFF fast] sem resposta rápida em ${WAIT_MS}ms — responder com DB e rodar fetch longo em background`);
          (async () => {
            try {
              const respBg = await tryFetchFirstSuccess(apiUrls, BG_TIMEOUT_MS);
              if (respBg && respBg.ok) {
                const jsonBg = await respBg.json().catch(() => null);
                const productsBg = Array.isArray(jsonBg?.products) ? jsonBg.products : [];
                const mappedBg = (productsBg || []).map(p => ({
                  source: "api",
                  id: p.code ? String(p.code) : undefined,
                  name: String(p.product_name || p.name || p.generic_name || "").trim(),
                  calories:
                    p.nutriments?.["energy-kcal"] ??
                    p.nutriments?.["energy-kcal_100g"] ??
                    p.nutriments?.["energy_100g"] ??
                    null,
                  nutriments: p.nutriments || {},
                  _origin: "api",
                }));
                const resultBg = { data: mappedBg, items: mappedBg, total: mappedBg.length, page, limit, meta: { total: mappedBg.length, page, limit } };
                try { await cache.set(`search:${q}`, resultBg); console.log("[OFF bg] cache atualizado para", `search:${q}`); } catch(e){console.warn("[OFF bg] falha ao setar cache:", e && e.message)}
              } else {
                console.warn("[OFF bg] resposta não OK ou vazia");
              }
            } catch (bgErr) {
              console.warn("[OFF bg] erro na busca em background:", bgErr && (bgErr.message || bgErr));
            }
          })();
        }
      } catch (errFast) {
        console.warn("[OFF] erro inesperado na tentativa rápida:", errFast && errFast.message);
      }
    }

    const apiMapped = (apiProducts || []).map((p) => ({
      source: "api",
      id: p.code ? String(p.code) : undefined,
      name: String(p.product_name || p.name || p.generic_name || "").trim(),
      calories:
        p.nutriments?.["energy-kcal"] ??
        p.nutriments?.["energy-kcal_100g"] ??
        p.nutriments?.["energy_100g"] ??
        null,
      nutriments: p.nutriments || {},
      _origin: "api",
    }));
    const normalizeName = (s = "") =>
      String(s).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const seen = new Set();
    const combined = [];

    for (const it of localMapped) {
      const key = normalizeName(it.name || it.id || "");
      if (!key) continue;
      if (!seen.has(key)) {
        combined.push(it);
        seen.add(key);
      }
    }

    for (const it of apiMapped) {
      const key = normalizeName(it.name || it.id || "");
      if (!key) continue;
      if (!seen.has(key)) {
        combined.push(it);
        seen.add(key);
      }
    }

    const result = {
      data: combined,
      items: combined,
      total: combined.length,
      page,
      limit,
      meta: { total: combined.length, page, limit },
    };

    try { await cache.set(`search:${q}`, result); } catch (e) { /* ignore */ }

    console.log(`[GET] FINAL: DB=${localMapped.length} API=${apiMapped.length} TOTAL=${combined.length}`);
    return res.json(result);
  } catch (err) {
    console.error("[GET] ERRO INTERNO:", err && (err.stack || err));
    return res.status(500).json({ error: "Erro ao buscar alimentos" });
  }
});

// post
router.post("/", authMiddleware, async (req, res) => {
  try {
    const norm = normalizeIncoming(req.body);

    const validator = await FoodPostValidator.getInstance();
    const validation = await validator.validate({
      title: norm.title,
      name: norm.name,
      nome: norm.nome,
      calories: norm.calories,
      calorias: norm.calorias,
      nutriments: norm.nutriments,
    });

    const isValid = (validation.valid ?? validation.valido) === true;
    if (!isValid) {
      const errs = validation.errors || validation.erros || [];
      console.log("[foods POST] validation failed:", errs);
      return res.status(400).json({ errors: errs });
    }

    const doc = {
      name: norm.name || norm.title || norm.nome,
      calories: Number(norm.calories) || 0,
      carbohydrates: Number(norm.carbohydrates) || 0,
      protein: Number(norm.protein) || 0,
      fat: Number(norm.fat) || 0,
      source: norm.source || "manual",
      owner: norm.owner,
    };

    const created = await Food.create(doc);

    try { cache.setFood(created); } catch (e) { /* ignore */ }

    return res.status(201).json(created);
  } catch (err) {
    console.error("[foods POST] erro inesperado:", err && (err.stack || err));

    if (err && err.name === "ValidationError") {
      const details = Object.values(err.errors || {}).map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json({ errors: details });
    }
    if (err && (err.code === 11000 || err.codeName === "DuplicateKey")) {
      return res.status(400).json({ error: "Dado duplicado (violação de índice único)." });
    }

    return res.status(500).json({
      error: "Erro ao inserir alimento",
      details: process.env.NODE_ENV === "production" ? undefined : (err.message || String(err)),
      stack: process.env.NODE_ENV === "production" ? undefined : (err.stack || "")
    });
  }
});

export default router;
