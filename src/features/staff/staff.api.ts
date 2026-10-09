import { http } from "@/lib/http";
import type { PaginatedResult, Staff, StaffStatus } from "@/types";

export interface CreateStaffInput {
    name: string;
    place: string;
    contactNumber: string;
    dob?: string;
    guardianName?: string;
    relationshipWithGuardian?: string;
    guardianContactNumber?: string;
    verifiedAddress?: string;
    idProof?: string;
    idNumber?: string;
    bankAccountDetails?: string;
    rating?: number;
    remarks?: string;
    serviceIds?: number[];
}

// Same fields as create, but all optional -- editing one field shouldn't
// require resending every other one. Plus `status`, which only makes
// sense on update (a new staff member is always created ACTIVE).
export interface UpdateStaffInput extends Partial<CreateStaffInput> {
    status?: StaffStatus;
}

export async function createStaff(data: CreateStaffInput): Promise<Staff> {
    const response = await http.post<Staff>("/staff", data);
    return response.data;
}

export interface StaffListQuery {
    sortBy?: "name" | "age" | "rating";
    sortDir?: "asc" | "desc";
    // Staff who can perform ANY of these services -- backend does the
    // actual filtering, this is just what gets sent.
    serviceIds?: number[];
    // Free text, matched against several fields server-side -- see
    // StaffService.findPaginated for exactly which ones.
    search?: string;
}

export async function getStaffPage(page: number, query?: StaffListQuery): Promise<PaginatedResult<Staff>> {
    const response = await http.get<PaginatedResult<Staff>>("/staff", {
        params: {
            page,
            sortBy: query?.sortBy,
            sortDir: query?.sortDir,
            // Comma-joined, matching FindStaffDto's parsing -- and omitted
            // entirely (not an empty string) when nothing is selected.
            serviceIds: query?.serviceIds && query.serviceIds.length > 0
                ? query.serviceIds.join(",")
                : undefined,
            search: query?.search || undefined,
        },
    });
    return response.data;
}

export async function getStaffById(id: number): Promise<Staff> {
    const response = await http.get<Staff>(`/staff/${id}`);
    return response.data;
}

export async function updateStaff(id: number, data: UpdateStaffInput): Promise<Staff> {
    const response = await http.patch<Staff>(`/staff/${id}`, data);
    return response.data;
}
