import { http } from "@/lib/http";
import type { User } from "@/types";

// No token get/set helpers here -- the httpOnly cookie is managed entirely by
// the browser. This file is only API calls, never storage.

export async function login(username: string, password: string): Promise<User> {
    const response = await http.post<User>("/auth/login", { username, password });
    return response.data;
}

export async function logout(): Promise<void> {
    await http.post("/auth/logout");
}

export async function getCurrentUser(): Promise<User> {
    const response = await http.get<User>("/auth/me");
    return response.data;
}
