"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import type { TableColumn } from "@/components/ui/Table";
import { usePagination } from "@/hooks/usePagination";
import { useSort } from "@/hooks/useSort";
import { getStaffPage, updateStaff } from "@/features/staff/staff.api";
import type { StaffListQuery } from "@/features/staff/staff.api";
import { useServices } from "@/context/ServicesContext";
import { calculateAge } from "@/lib/date";
import type { Staff } from "@/types";

export default function StaffTable() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { page, setPage } = usePagination();
    const { sortBy, sortDir, toggleSort } = useSort();
    const { services: availableServices } = useServices();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    // Tracks which row's enable/disable request is in flight, so only that
    // row's button shows a loading state instead of the whole table.
    const [togglingId, setTogglingId] = useState<number | null>(null);

    // Filter state lives in the URL too (same bookmarkable/back-forward
    // reasoning as page and sort) -- kept local here rather than a new
    // shared hook, since a Customer/Order filter's shape (date range, text
    // search, ...) isn't known to look anything like "a list of checked ids" yet.
    const selectedServiceIds = useMemo(() => {
        const raw = searchParams.get("serviceIds");
        return raw ? raw.split(",").map(Number) : [];
    }, [searchParams]);

    const toggleServiceFilter = (serviceId: number) => {
        const params = new URLSearchParams(searchParams.toString());
        const next = selectedServiceIds.includes(serviceId)
            ? selectedServiceIds.filter((id) => id !== serviceId)
            : [...selectedServiceIds, serviceId];
        if (next.length > 0) {
            params.set("serviceIds", next.join(","));
        } else {
            params.delete("serviceIds");
        }
        // Same reasoning as a sort change -- the old page number doesn't
        // mean anything against a differently-filtered result set.
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    // Set by the navbar's "Search Staff" box navigating to /staff?search=...
    // -- read here the same way page/sort/serviceIds are, not passed as a prop.
    const search = searchParams.get("search") ?? undefined;

    const loadStaff = useCallback(() => {
        const query: StaffListQuery = {
            sortBy: sortBy as StaffListQuery["sortBy"],
            sortDir,
            serviceIds: selectedServiceIds,
            search,
        };
        return getStaffPage(page, query).then((result) => {
            setStaff(result.data);
            setTotalPages(result.pagination.totalPages);
        });
    }, [page, sortBy, sortDir, selectedServiceIds, search]);

    useEffect(() => {
        let cancelled = false;
        // Deliberate: flips the loading indicator back on when starting a
        // fresh fetch for a new page (e.g. after clicking "Next"), not a
        // mount-detection smell -- it's a no-op on the very first render,
        // since isLoading already starts true.
        setIsLoading(true);
        loadStaff().then(() => {
            if (!cancelled) setIsLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [loadStaff]);

    const handleToggleStatus = async (s: Staff) => {
        setTogglingId(s.id);
        try {
            await updateStaff(s.id, { status: s.status === "ACTIVE" ? "DISABLED" : "ACTIVE" });
            await loadStaff();
        } finally {
            setTogglingId(null);
        }
    };

    const columns: TableColumn<Staff>[] = [
        { header: "Name", accessor: "name", sortKey: "name" },
        { header: "Place", accessor: "place" },
        { header: "Contact", accessor: "contactNumber" },
        { header: "Age", accessor: (s) => (s.dob ? `${calculateAge(s.dob)}` : "—"), sortKey: "age" },
        { header: "Rating", accessor: (s) => `${s.rating}/10`, sortKey: "rating" },
        {
            header: "Services",
            accessor: (s) =>
                s.services.length > 0
                    ? s.services.map((link) => link.service.abbreviation).join(", ")
                    : "—",
        },
        {
            header: "Status",
            accessor: (s) => (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}
                >
                    {s.status === "ACTIVE" ? "Active" : "Disabled"}
                </span>
            ),
        },
        {
            header: "Actions",
            accessor: (s) => (
                // Row itself navigates to /staff/:id on click -- stop that click
                // from reaching the row for every button in here, so Edit/toggle
                // don't also trigger a navigation on top of their own action.
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/staff/${s.id}`)}
                        aria-label="View"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/staff/${s.id}/edit`)}
                        aria-label="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant={s.status === "ACTIVE" ? "disable" : "enable"}
                        onClick={() => handleToggleStatus(s)}
                        isLoading={togglingId === s.id}
                    >
                        {s.status === "ACTIVE" ? "Disable" : "Enable"}
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="max-w-full mx-auto p-8 bg-white rounded-lg shadow-md">
            <div className="flex items-start justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">All Staff</h2>

                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        SERVICE FILTER
                    </p>
                    <div className="flex flex-wrap justify-end gap-4">
                        {availableServices.map((service) => (
                            <Checkbox
                                key={service.id}
                                id={`filter-service-${service.id}`}
                                label={service.abbreviation}
                                checked={selectedServiceIds.includes(service.id)}
                                onChange={() => toggleServiceFilter(service.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={staff}
                getRowKey={(s) => s.id}
                isLoading={isLoading}
                emptyMessage="No staff registered yet."
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                onRowClick={(s) => router.push(`/staff/${s.id}`)}
                sortBy={sortBy}
                sortDir={sortDir}
                onSortChange={toggleSort}
            />
        </div>
    );
}
