"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/features/auth/RequireRole";
import StaffDetails from "@/features/staff/staffDetails";

export default function StaffDetailsPage() {
    const params = useParams<{ staffId: string }>();

    return (
        <RequireRole allowed={["OWNER", "STAFF"]}>
            <StaffDetails staffId={Number(params.staffId)} />
        </RequireRole>
    );
}
