"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { hasRole } from "@/features/auth/rbac";
import type { Role } from "@/types";

interface RequireRoleProps {
    allowed: Role[];
    children: ReactNode;
}

// Frontend counterpart to the backend's @Roles()/RolesGuard -- UX only, the
// real security boundary is still the backend rejecting the actual API call.
export function RequireRole({ allowed, children }: RequireRoleProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const authorized = hasRole(user, allowed);

    useEffect(() => {
        if (!isLoading && !authorized) {
            router.push("/dashboard");
        }
    }, [isLoading, authorized, router]);

    if (isLoading || !authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return <>{children}</>;
}
