import apiClient from "./apiClient";
import { useAuthStore } from "../stores/authStore";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "analyst" | "admin";
  };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const useMock = import.meta.env.VITE_USE_MOCK === "true";
  if (useMock) {
    // Simulated auth for demo
    return {
      token: "mock-jwt-token-aethon-sih2026",
      user: { id: "u1", email: payload.email, name: "SOC Analyst", role: "analyst" },
    };
  }
  const res = await apiClient.post<LoginResponse>("/api/auth/login", payload);
  return res.data;
}

export function logout() {
  useAuthStore.getState().clearAuth();
}
