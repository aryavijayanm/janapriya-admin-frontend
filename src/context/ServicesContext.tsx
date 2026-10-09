"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { getServices } from "@/features/service/service.api";
import { useAuth } from "./AuthContext";
import type { Service } from "@/types";

interface ServicesContextValue {
    services: Service[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const ServicesContext = createContext<ServicesContextValue | undefined>(undefined);

export function ServicesProvider({ children }: { children: ReactNode }) {
    // GET /services requires being logged in -- fetching unconditionally would
    // 401 on the public /login page itself (AuthProvider wraps the whole app),
    // which isn't exempted from the axios interceptor's redirect-on-401 logic.
    // Only fetch once we actually know a user is logged in.
    const { user } = useAuth();

    // Defaults to [] (never undefined) so a consumer that forgets to check
    // isLoading still can't crash mapping over it.
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchServices = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getServices();
            setServices(data);
        } catch {
            setError("Could not load services.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchServices();
        } else {
            setIsLoading(false);
        }
    }, [user, fetchServices]);

    return (
        <ServicesContext.Provider value={{ services, isLoading, error, refetch: fetchServices }}>
            {children}
        </ServicesContext.Provider>
    );
}

export function useServices(): ServicesContextValue {
    const context = useContext(ServicesContext);
    if (!context) {
        throw new Error("useServices must be used within a ServicesProvider");
    }
    return context;
}
