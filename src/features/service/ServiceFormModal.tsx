"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { Service } from "@/types";

interface ServiceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Presence of a service means "editing that service"; absence means "creating a new one" --
    // one modal, two thin modes, instead of two near-identical components.
    service?: Service | null;
    onSubmit: (name: string, abbreviation: string) => Promise<void>;
}

export function ServiceFormModal({ isOpen, onClose, service, onSubmit }: ServiceFormModalProps) {
    const [name, setName] = useState("");
    const [abbreviation, setAbbreviation] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!service;

    // Reset the fields to match whichever service (or none) is being edited,
    // each time the modal opens.
    useEffect(() => {
        if (isOpen) {
            setName(service?.name ?? "");
            setAbbreviation(service?.abbreviation ?? "");
            setError("");
        }
    }, [isOpen, service]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Service name is required.");
            return;
        }
        if (!abbreviation.trim()) {
            setError("Abbreviation is required.");
            return;
        }
        setIsSubmitting(true);
        setError("");
        try {
            await onSubmit(name.trim(), abbreviation.trim());
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Service" : "Add Service"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Service name" htmlFor="service-name">
                    <Input
                        id="service-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Baby Care"
                        autoFocus
                    />
                </FormField>
                <FormField label="Abbreviation" htmlFor="service-abbreviation">
                    <Input
                        id="service-abbreviation"
                        value={abbreviation}
                        onChange={(e) => setAbbreviation(e.target.value)}
                        placeholder="e.g. BC"
                    />
                </FormField>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        {isEditing ? "Save" : "Add"}
                    </Button>
                </div>

                {/* After the submit button, not before -- consistent with the
                    same convention across every form in this project. */}
                {error && <Alert variant="error">{error}</Alert>}
            </form>
        </Modal>
    );
}
