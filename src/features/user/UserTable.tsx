"use client";

import { useEffect, useState } from "react";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { UserFormModal } from "@/features/user/UserFormModal";
import { createUser, getUsers, updateUser } from "@/features/user/user.api";
import type { CreateUserInput, UpdateUserInput } from "@/features/user/user.api";
import type { User } from "@/types";

export default function UserTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleToggleActive = async (user: User) => {
        await updateUser(user.id, { is_active: !user.is_active });
        await loadUsers();
    };

    const handleAdd = () => {
        setEditingUser(null);
        setModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleFormSubmit = async (data: CreateUserInput | UpdateUserInput) => {
        if (editingUser) {
            await updateUser(editingUser.id, data as UpdateUserInput);
        } else {
            await createUser(data as CreateUserInput);
        }
        await loadUsers();
    };

    const columns: TableColumn<User>[] = [
        { header: "Name", accessor: "name" },
        { header: "Username", accessor: "username" },
        { header: "Designation", accessor: (u) => u.designation ?? "—" },
        { header: "Role", accessor: "role" },
        {
            header: "Status",
            accessor: (user) => (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.is_active ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}
                >
                    {user.is_active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            header: "Actions",
            accessor: (user) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={user.is_active ? "disable" : "enable"}
                        onClick={() => handleToggleActive(user)}
                    >
                        {user.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(user)}>
                        Edit
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Users</h2>
                {isLoading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : (
                    <>
                        <Table
                            columns={columns}
                            data={users}
                            getRowKey={(u) => u.id}
                            emptyMessage="No users yet."
                        />
                        <div className="mt-4">
                            <Button onClick={handleAdd}>+ Add User</Button>
                        </div>
                    </>
                )}
            </div>
            <UserFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                user={editingUser}
                onSubmit={handleFormSubmit}
            />
        </>
    );
}
