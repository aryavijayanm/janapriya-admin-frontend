export type Role = "OWNER" | "STAFF" | "OUTSIDER";

export interface User {
    id: number;
    username: string;
    name: string;
    role: Role;
    designation: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    last_login_at: string | null;
}

// Matches the backend's global ResponseInterceptor shape exactly -- every
// endpoint's response reuses this one generic instead of a bespoke shape.
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export interface Service {
    id: number;
    name: string;
    abbreviation: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type StaffStatus = "ACTIVE" | "DISABLED" | "DELETED";

export interface Staff {
    id: number;
    name: string;
    place: string;
    contactNumber: string;
    dob: string | null;
    guardianName: string | null;
    relationshipWithGuardian: string | null;
    guardianContactNumber: string | null;
    verifiedAddress: string | null;
    idProof: string | null;
    idNumber: string | null;
    bankAccountDetails: string | null;
    rating: number;
    remarks: string | null;
    status: StaffStatus;
    created_at: string;
    updated_at: string;
    services: { service: Service }[];
}

// Matches the standardized paginated response shape every list endpoint
// returns -- reused by any future paginated list (Customer, Order, ...).
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
