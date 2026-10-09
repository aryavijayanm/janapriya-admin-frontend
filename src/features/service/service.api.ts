import { http } from "@/lib/http";
import type { Service } from "@/types";

// Active-only -- what most consumers (customer/staff forms, ServicesContext) want.
export async function getServices(): Promise<Service[]> {
    const response = await http.get<Service[]>("/services");
    return response.data;
}

// Includes inactive services too -- for the management page only.
export async function getAllServicesForManagement(): Promise<Service[]> {
    const response = await http.get<Service[]>("/services/all");
    return response.data;
}

export async function createService(name: string, abbreviation: string): Promise<Service> {
    const response = await http.post<Service>("/services", { name, abbreviation });
    return response.data;
}

export async function updateService(
    id: number,
    data: { name?: string; abbreviation?: string; is_active?: boolean },
): Promise<Service> {
    const response = await http.patch<Service>(`/services/${id}`, data);
    return response.data;
}
