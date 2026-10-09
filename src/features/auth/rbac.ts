import type { Role, User } from "@/types";

export function hasRole(user: User | null, allowed: Role[]): boolean {
    return !!user && allowed.includes(user.role);
}
