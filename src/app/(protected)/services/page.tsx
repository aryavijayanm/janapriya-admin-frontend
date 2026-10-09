import { RequireRole } from "@/features/auth/RequireRole";
import ServiceTable from "@/features/service/ServiceTable";

export default function ManageServicesPage() {
    return (
        <RequireRole allowed={["OWNER"]}>
            <ServiceTable />
        </RequireRole>
    );
}
