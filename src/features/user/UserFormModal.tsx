"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { CreateUserInput, UpdateUserInput } from "./user.api";
import type { Role, User } from "@/types";

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Presence of a user means "editing that user" -- only name, designation,
    // and password are editable, even by an Owner (username and role are
    // fixed at creation and never change afterward). Absence means "creating
    // a new one," which additionally needs username + role.
    user?: User | null;
    onSubmit: (data: CreateUserInput | UpdateUserInput) => Promise<void>;
}

const EMPTY_FORM = {
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    designation: "",
    role: "" as Role | "",
};

export function UserFormModal({ isOpen, onClose, user, onSubmit }: UserFormModalProps) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!user;

    useEffect(() => {
        if (isOpen) {
            setForm({
                ...EMPTY_FORM,
                name: user?.name ?? "",
                designation: user?.designation ?? "",
            });
            setError("");
        }
    }, [isOpen, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEditing && (!form.name || !form.username || !form.password || !form.designation || !form.role)) {
            setError("All fields are required.");
            return;
        }
        if (form.password && form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!isEditing && form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        try {
            if (isEditing) {
                const payload: UpdateUserInput = {
                    name: form.name,
                    designation: form.designation,
                };
                if (form.password) payload.password = form.password;
                await onSubmit(payload);
            } else {
                await onSubmit({
                    name: form.name,
                    username: form.username,
                    password: form.password,
                    designation: form.designation,
                    role: form.role as Role,
                });
            }
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit User" : "Add User"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Name" htmlFor="name">
                    <Input id="name" name="name" value={form.name} onChange={handleChange} autoComplete="off" />
                </FormField>

                {!isEditing && (
                    <FormField label="Username" htmlFor="username">
                        <Input id="username" name="username" value={form.username} onChange={handleChange} autoComplete="off" />
                    </FormField>
                )}

                <FormField label="Designation" htmlFor="designation">
                    <Input id="designation" name="designation" value={form.designation} onChange={handleChange} />
                </FormField>

                {!isEditing && (
                    <FormField label="Role" htmlFor="role">
                        <Select id="role" name="role" value={form.role} onChange={handleChange}>
                            <option value="" disabled>Select a role</option>
                            <option value="OWNER">OWNER</option>
                            <option value="STAFF">STAFF</option>
                            <option value="OUTSIDER">OUTSIDER</option>
                        </Select>
                    </FormField>
                )}

                <FormField
                    label={isEditing ? "New password (leave blank to keep unchanged)" : "Password"}
                    htmlFor="password"
                >
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                    />
                </FormField>

                {(isEditing ? form.password : true) && (
                    <FormField label="Confirm password" htmlFor="confirmPassword">
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                        />
                    </FormField>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        {isEditing ? "Save" : "Add"}
                    </Button>
                </div>

                {/* After the submit button, not before -- stays visible without
                    scrolling back up once the form grows past one screen. */}
                {error && <Alert variant="error">{error}</Alert>}
            </form>
        </Modal>
    );
}
