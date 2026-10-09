import { RequireRole } from "@/features/auth/RequireRole";
import UserTable from "@/features/user/UserTable";

export default function ManageUsersPage() {
    return (
        <RequireRole allowed={["OWNER"]}>
            <UserTable />
        </RequireRole>
    );
}
