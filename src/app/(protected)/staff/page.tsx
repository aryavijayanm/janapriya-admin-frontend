import { Suspense } from "react";
import { RequireRole } from "@/features/auth/RequireRole";
import StaffTable from "@/features/staff/staffTable";

export default function StaffPage() {
    return (
        <RequireRole allowed={["OWNER", "STAFF"]}>
            <Suspense>
                <StaffTable />
            </Suspense>
        </RequireRole>
    );
}
