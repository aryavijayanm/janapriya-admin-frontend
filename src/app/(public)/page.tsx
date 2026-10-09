"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";

export default function Home() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            router.push(user ? "/dashboard" : "/login");
        }
    }, [isLoading, user, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Spinner size="lg" />
        </div>
    );
}
