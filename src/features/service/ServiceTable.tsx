"use client";

import { useEffect, useState } from "react";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { ServiceFormModal } from "@/features/service/ServiceFormModal";
import {
    createService,
    getAllServicesForManagement,
    updateService,
} from "@/features/service/service.api";
import { useServices } from "@/context/ServicesContext";
import type { Service } from "@/types";

export default function ServiceTable() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const { refetch: refetchActiveServices } = useServices();

    const loadServices = async () => {
        setIsLoading(true);
        try {
            const data = await getAllServicesForManagement();
            setServices(data);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    const handleToggleActive = async (service: Service) => {
        await updateService(service.id, { is_active: !service.is_active });
        await loadServices();
        refetchActiveServices();
    };

    const handleAdd = () => {
        setEditingService(null);
        setModalOpen(true);
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setModalOpen(true);
    };

    const handleFormSubmit = async (name: string, abbreviation: string) => {
        if (editingService) {
            await updateService(editingService.id, { name, abbreviation });
        } else {
            await createService(name, abbreviation);
        }
        await loadServices();
        refetchActiveServices();
    };

    const columns: TableColumn<Service>[] = [
        { header: "Name", accessor: "name" },
        { header: "Abbreviation", accessor: "abbreviation" },
        {
            header: "Status",
            accessor: (service) => (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${service.is_active ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}
                >
                    {service.is_active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            header: "Actions",
            accessor: (service) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={service.is_active ? "disable" : "enable"}
                        onClick={() => handleToggleActive(service)}
                    >
                        {service.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(service)}>
                        Edit
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Services</h2>
                {isLoading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : (
                    <>
                        <Table
                            columns={columns}
                            data={services}
                            getRowKey={(s) => s.id}
                            emptyMessage="No services yet."
                        />
                        <div className="mt-4">
                            <Button onClick={handleAdd}>+ Add Service</Button>
                        </div>
                    </>
                )}
            </div>
            <ServiceFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                service={editingService}
                onSubmit={handleFormSubmit}
            />
        </>
    );
}
