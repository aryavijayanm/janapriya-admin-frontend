import { http } from "@/lib/http";
import type { Role, User } from "@/types";

export interface CreateUserInput {
    name: string;
    username: string;
    password: string;
    designation: string;
    role: Role;
}

export interface UpdateUserInput {
    name?: string;
    designation?: string;
    role?: Role;
    is_active?: boolean;
    password?: string;
}

export async function getUsers(): Promise<User[]> {
    const response = await http.get<User[]>("/users");
    return response.data;
}

export async function createUser(data: CreateUserInput): Promise<User> {
    const response = await http.post<User>("/users", data);
    return response.data;
}

export async function updateUser(id: number, data: UpdateUserInput): Promise<User> {
    const response = await http.patch<User>(`/users/${id}`, data);
    return response.data;
}
