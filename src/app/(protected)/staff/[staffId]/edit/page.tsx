"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RequireRole } from "@/features/auth/RequireRole";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import StaffForm from "@/features/staff/staffForm";
import { getStaffById } from "@/features/staff/staff.api";
import type { Staff } from "@/types";

export default function EditStaffPage() {
    const params = useParams<{ staffId: string }>();
    const staffId = Number(params.staffId);

    const [staff, setStaff] = useState<Staff | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        getStaffById(staffId)
            .then((data) => {
                if (!cancelled) setStaff(data);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load staff details.");
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [staffId]);

    return (
        <RequireRole allowed={["OWNER", "STAFF"]}>
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Spinner size="lg" />
                </div>
            ) : error || !staff ? (
                <div className="max-w-3xl mx-auto p-8">
                    <Alert variant="error">{error || "Staff not found."}</Alert>
                </div>
            ) : (
                <div className="container mx-auto">
                    <StaffForm staff={staff} />
                </div>
            )}
        </RequireRole>
    );
}
