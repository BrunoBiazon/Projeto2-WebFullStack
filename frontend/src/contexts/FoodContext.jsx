import React, { createContext, useReducer } from "react";

export const FoodContext = createContext();

const initialState = {
  query: "",
  foods: [],
  loading: false,
  error: null,
  page: 1,
  total: 0,
  source: null // back ou api
};

function normalizePayloadToItems(payload) {
  if (!payload && payload !== 0) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object") {
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.data)) return payload.data;
    const arrField = Object.values(payload).find(v => Array.isArray(v));
    if (Array.isArray(arrField)) return arrField;
  }
  return [];
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_QUERY":
      return { ...state, query: action.payload };
    case "SEARCH_START":
      return { ...state, loading: true, error: null, source: null };
    case "SEARCH_SUCCESS": {
      const payload = action.payload ?? {};
      const items = normalizePayloadToItems(payload);
      const meta = payload.meta ?? { total: payload.total ?? items.length, page: payload.page ?? 1, limit: payload.limit ?? items.length };
      const source = payload.source ?? (payload.data || payload.items ? "backend" : null);

      return {
        ...state,
        loading: false,
        error: null,
        foods: items,
        total: meta.total ?? items.length,
        page: meta.page ?? 1,
        source: source ?? null
      };
    }
    case "SEARCH_ERROR":
      return { ...state, loading: false, error: action.payload, foods: [] };
    case "SEARCH_CLEAR":
      return { ...state, loading: false, error: null, foods: [], total: 0, page: 1, source: null };
    default:
      return state;
  }
}

export function FoodProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <FoodContext.Provider value={{ state, dispatch }}>
      {children}
    </FoodContext.Provider>
  );
}
