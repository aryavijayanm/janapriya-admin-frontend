"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import * as authApi from "@/features/auth/auth.api";
import type { User } from "@/types";

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        authApi
            .getCurrentUser()
            .then(setUser)
            // A 401 here just means "not logged in" -- the normal, expected
            // case on first visit, not an error to surface anywhere.
            .catch(() => setUser(null))
            .finally(() => setIsLoading(false));
    }, []);

    async function login(username: string, password: string) {
        const loggedInUser = await authApi.login(username, password);
        setUser(loggedInUser);
    }

    async function logout() {
        await authApi.logout();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
