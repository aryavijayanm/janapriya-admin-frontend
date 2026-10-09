"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Briefcase,
    Cake,
    Hash,
    Heart,
    IdCard,
    Landmark,
    MapPin,
    Pencil,
    Phone,
    Power,
    StickyNote,
    Star,
    Trash2,
    User,
    Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { getStaffById, updateStaff } from "@/features/staff/staff.api";
import { calculateAge } from "@/lib/date";
import type { Staff } from "@/types";

interface StaffDetailsProps {
    staffId: number;
}

// Icon + label + value, stacked -- the small building block every section
// below is made of, so a reader can scan by icon shape as much as by label.
function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number | null }) {
    return (
        <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                <p className="text-sm text-gray-900 mt-0.5">{value ?? "—"}</p>
            </div>
        </div>
    );
}

// A titled, visually separated block -- the "division" the design calls
// for, instead of one long undifferentiated list of fields.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">{title}</h3>
            {children}
        </div>
    );
}

export default function StaffDetails({ staffId }: StaffDetailsProps) {
    const router = useRouter();
    const [staff, setStaff] = useState<Staff | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    useEffect(() => {
        let cancelled = false;
        getStaffById(staffId)
            .then((data) => {
                if (!cancelled) setStaff(data);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load staff details.");
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [staffId]);

    const handleToggleStatus = async () => {
        if (!staff) return;
        setIsToggling(true);
        try {
            const updated = await updateStaff(staff.id, {
                status: staff.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
            });
            setStaff(updated);
        } finally {
            setIsToggling(false);
        }
    };

    const handleDelete = async () => {
        if (!staff) return;
        setIsDeleting(true);
        try {
            // Soft delete -- the row stays (see StaffService.findOne's comment
            // on why), it just stops showing up in the staff list.
            await updateStaff(staff.id, { status: "DELETED" });
            router.push("/staff");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !staff) {
        return (
            <div className="max-w-3xl mx-auto p-8">
                <Alert variant="error">{error || "Staff not found."}</Alert>
            </div>
        );
    }

    const isDeleted = staff.status === "DELETED";

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-8">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-2xl font-bold text-gray-800">{staff.name}</h2>
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${staff.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : staff.status === "DISABLED"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-600"
                        }`}
                >
                    {staff.status === "ACTIVE" ? "Active" : staff.status === "DISABLED" ? "Disabled" : "Deleted"}
                </span>
            </div>

            <div className="space-y-6">
                {/* Row 1 -- two columns: personal stats, and guardian/ID info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Section title="Personal">
                        <div className="space-y-4">
                            <InfoRow icon={MapPin} label="Place" value={staff.place} />
                            <InfoRow icon={Phone} label="Contact Number" value={staff.contactNumber} />
                            <InfoRow
                                icon={Cake}
                                label="Age"
                                value={staff.dob ? `${calculateAge(staff.dob)} years` : null}
                            />
                            <InfoRow icon={Star} label="Rating" value={`${staff.rating}/10`} />
                        </div>
                    </Section>

                    <Section title="Guardian & ID">
                        <div className="space-y-4">
                            <InfoRow icon={User} label="Guardian Name" value={staff.guardianName} />
                            <InfoRow icon={Heart} label="Relationship" value={staff.relationshipWithGuardian} />
                            <InfoRow icon={IdCard} label="ID Proof Type" value={staff.idProof} />
                            <InfoRow icon={Hash} label="ID Number" value={staff.idNumber} />
                        </div>
                    </Section>
                </div>

                {/* Row 2 -- services, comma-separated as specified */}
                <Section title="Services Offered">
                    <InfoRow
                        icon={Briefcase}
                        label="Services"
                        value={
                            staff.services.length > 0
                                ? staff.services.map((link) => link.service.name).join(", ")
                                : null
                        }
                    />
                </Section>

                {/* Row 3 -- longer free-text fields, grouped together */}
                <Section title="Other Details">
                    <div className="space-y-4">
                        <InfoRow icon={MapPin} label="Verified Address" value={staff.verifiedAddress} />
                        <InfoRow icon={Landmark} label="Given Accounts" value={staff.bankAccountDetails} />
                        <InfoRow icon={StickyNote} label="Remarks" value={staff.remarks} />
                    </div>
                </Section>
            </div>

            {/* Actions -- bottom of the page, not the header */}
            <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
                <Button variant="success" onClick={() => router.push(`/staff/${staff.id}/edit`)}>
                    <Pencil className="w-4 h-4" />
                    Edit
                </Button>
                <Button
                    variant="danger"
                    onClick={() => setDeleteModalOpen(true)}
                    disabled={isDeleted}
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </Button>
                <Button
                    variant={staff.status === "ACTIVE" ? "disable" : "enable"}
                    onClick={handleToggleStatus}
                    isLoading={isToggling}
                    disabled={isDeleted}
                >
                    <Power className="w-4 h-4" />
                    {staff.status === "ACTIVE" ? "Disable" : "Enable"}
                </Button>
                <Button variant="secondary" disabled title="Coming soon">
                    <Wallet className="w-4 h-4" />
                    View Account
                </Button>
            </div>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Staff"
                size="sm"
            >
                <p className="text-sm text-gray-600">
                    Are you sure you want to delete <span className="font-semibold">{staff.name}</span>?
                    This removes them from the staff list.
                </p>
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
                        Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
