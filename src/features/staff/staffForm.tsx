"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useServices } from "@/context/ServicesContext";
import { createStaff, updateStaff } from "@/features/staff/staff.api";
import { toDateInputValue } from "@/lib/date";
import type { Staff } from "@/types";

const INITIAL_FORM_DATA = {
    name: "",
    place: "",
    contactNumber: "",
    dob: "",
    guardianName: "",
    relationshipWithGuardian: "",
    guardianContactNumber: "",
    verifiedAddress: "",
    idProof: "",
    idNumber: "",
    bankAccountDetails: "",
    // Stores service IDs, not names -- matches the StaffService join
    // table design (staffId + serviceId), and stays correct even if a
    // service is renamed later.
    services: [] as number[],
    rating: 5,
    remarks: "",
};

// Builds the form's initial state from an existing staff record -- used
// only in edit mode. Reverses the two transforms create applies: the "+91"
// prefix is stripped back off contactNumber (the fixed prefix is shown
// separately and re-added at submit time), and dob goes through the same
// Kerala-timezone-aware formatter as everywhere else dates are displayed.
function formDataFromStaff(staff: Staff): typeof INITIAL_FORM_DATA {
    return {
        name: staff.name,
        place: staff.place,
        contactNumber: staff.contactNumber.replace(/^\+91/, ""),
        dob: staff.dob ? toDateInputValue(staff.dob) : "",
        guardianName: staff.guardianName ?? "",
        relationshipWithGuardian: staff.relationshipWithGuardian ?? "",
        guardianContactNumber: staff.guardianContactNumber ?? "",
        verifiedAddress: staff.verifiedAddress ?? "",
        idProof: staff.idProof ?? "",
        idNumber: staff.idNumber ?? "",
        bankAccountDetails: staff.bankAccountDetails ?? "",
        services: staff.services.map((link) => link.service.id),
        rating: staff.rating,
        remarks: staff.remarks ?? "",
    };
}

interface StaffFormProps {
    // Presence means "editing this staff member"; absence means "registering
    // a new one" -- one form, two thin modes, same as ServiceFormModal.
    staff?: Staff;
}

export default function StaffForm({ staff }: StaffFormProps) {
    const router = useRouter();
    const { services: availableServices, isLoading: servicesLoading } = useServices();
    const isEditing = !!staff;

    const [formData, setFormData] = useState(
        staff ? formDataFromStaff(staff) : INITIAL_FORM_DATA,
    );
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // So a navigation triggered elsewhere (e.g. the user clicking away)
    // doesn't leave a stray redirect firing after this component is gone.
    const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        return () => {
            if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
        };
    }, []);

    const ratingLabels: { [key: number]: string } = {
        1: "Terrible",
        2: "Very Bad",
        3: "Bad",
        4: "Below Average",
        5: "Average",
        6: "Above Average",
        7: "Good",
        8: "Very Good",
        9: "Excellent",
        10: "Outstanding",
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        if (name === "contactNumber") {
            // Digits only -- the +91 prefix is fixed/shown separately, this
            // field only ever holds the remaining number.
            if (value === "" || /^\d+$/.test(value)) {
                setFormData((prev) => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (serviceId: number) => {
        setFormData((prev) => {
            const services = prev.services.includes(serviceId)
                ? prev.services.filter((id) => id !== serviceId)
                : [...prev.services, serviceId];
            return { ...prev, services };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Combine into the full E.164-style number only at submit time --
        // the stored/sent value is the complete "+91XXXXXXXXXX" string.
        const payload = { ...formData, contactNumber: `+91${formData.contactNumber}` };

        setError("");
        setSuccess(false);
        setIsSubmitting(true);
        try {
            const data = {
                name: payload.name,
                place: payload.place,
                contactNumber: payload.contactNumber,
                dob: payload.dob || undefined,
                guardianName: payload.guardianName || undefined,
                relationshipWithGuardian: payload.relationshipWithGuardian || undefined,
                guardianContactNumber: payload.guardianContactNumber || undefined,
                verifiedAddress: payload.verifiedAddress || undefined,
                idProof: payload.idProof || undefined,
                idNumber: payload.idNumber || undefined,
                bankAccountDetails: payload.bankAccountDetails || undefined,
                rating: payload.rating,
                remarks: payload.remarks || undefined,
                serviceIds: payload.services,
            };

            const result = staff ? await updateStaff(staff.id, data) : await createStaff(data);
            setSuccess(true);
            // Give the user a moment to see the success message before
            // leaving -- then land on that staff member's details page,
            // whether this was a create or an edit.
            redirectTimerRef.current = setTimeout(() => {
                router.push(`/staff/${result.id}`);
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {isEditing ? "Edit Staff Details" : "Enter Staff Details"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <FormField label="Name" htmlFor="name">
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter staff name"
                            required
                        />
                    </FormField>

                    {/* Place */}
                    <FormField label="Place" htmlFor="place">
                        <Input
                            type="text"
                            id="place"
                            name="place"
                            value={formData.place}
                            onChange={handleChange}
                            placeholder="Enter place"
                            required
                        />
                    </FormField>

                    {/* Contact Number */}
                    <FormField label="Contact Number" htmlFor="contactNumber">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm pointer-events-none">
                                +91
                            </span>
                            <Input
                                type="tel"
                                id="contactNumber"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder="Enter contact number"
                                required
                                maxLength={10}
                                className="pl-12"
                            />
                        </div>
                    </FormField>

                    {/* DOB */}
                    <FormField label="Date of Birth" htmlFor="dob">
                        <Input
                            type="date"
                            id="dob"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                        />
                    </FormField>

                    {/* Guardian Name */}
                    <FormField label="Guardian Name" htmlFor="guardianName">
                        <Input
                            type="text"
                            id="guardianName"
                            name="guardianName"
                            value={formData.guardianName}
                            onChange={handleChange}
                            placeholder="Enter guardian name"
                        />
                    </FormField>

                    {/* Relationship with Guardian */}
                    <FormField label="Relationship with Guardian" htmlFor="relationshipWithGuardian">
                        <Input
                            type="text"
                            id="relationshipWithGuardian"
                            name="relationshipWithGuardian"
                            value={formData.relationshipWithGuardian}
                            onChange={handleChange}
                            placeholder="e.g., Father, Husband, Friend, Sister"
                        />
                    </FormField>

                    {/* Guardian Contact Number */}
                    <FormField label="Guardian Contact Number" htmlFor="guardianContactNumber">
                        <Input
                            type="tel"
                            id="guardianContactNumber"
                            name="guardianContactNumber"
                            value={formData.guardianContactNumber}
                            onChange={handleChange}
                            placeholder="Enter guardian contact number"
                        />
                    </FormField>

                    {/* ID Proof */}
                    <FormField label="ID Proof Type" htmlFor="idProof">
                        <Input
                            type="text"
                            id="idProof"
                            name="idProof"
                            value={formData.idProof}
                            onChange={handleChange}
                            placeholder="e.g., Aadhar, Voter ID"
                        />
                    </FormField>

                    {/* ID Number */}
                    <FormField label="ID Number" htmlFor="idNumber">
                        <Input
                            type="text"
                            id="idNumber"
                            name="idNumber"
                            value={formData.idNumber}
                            onChange={handleChange}
                            placeholder="Enter ID number"
                        />
                    </FormField>
                </div>

                {/* Services */}
                <div>
                    <label className="label mb-3 block">Services Can Provide</label>
                    {servicesLoading ? (
                        <p className="text-sm text-gray-500">Loading services...</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {availableServices.map((service) => (
                                <Checkbox
                                    key={service.id}
                                    id={`service-${service.id}`}
                                    label={service.name}
                                    checked={formData.services.includes(service.id)}
                                    onChange={() => handleCheckboxChange(service.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Verified Address */}
                <FormField label="Verified Address" htmlFor="verifiedAddress">
                    <TextArea
                        id="verifiedAddress"
                        name="verifiedAddress"
                        value={formData.verifiedAddress}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Enter verified permanent address- check with ID proof"
                        required
                    />
                </FormField>

                {/* Rating -- kept inline as-is, no existing primitive covers this yet */}
                <div>
                    <label className="label mb-3 block">Staff Rating</label>
                    <div className="flex flex-col space-y-2">
                        <div className="flex flex-wrap gap-4">
                            {[...Array(10)].map((_, index) => {
                                const starValue = index + 1;
                                return (
                                    <div
                                        key={starValue}
                                        className="flex flex-col items-center cursor-pointer group"
                                        onClick={() =>
                                            setFormData((prev) => ({ ...prev, rating: starValue }))
                                        }
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors duration-200 ${starValue <= formData.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300 group-hover:text-yellow-200"
                                                }`}
                                        />
                                        <span className="text-[10px] text-gray-500 mt-1 font-medium">
                                            {ratingLabels[starValue]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Selected Rating:{" "}
                            <span className="font-semibold text-gray-800">
                                {formData.rating > 0 ? `${formData.rating}/10` : "Not rated"}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Given Accounts */}
                <FormField label="Given Accounts" htmlFor="bankAccountDetails">
                    <TextArea
                        id="bankAccountDetails"
                        name="bankAccountDetails"
                        value={formData.bankAccountDetails}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Bank account details to pay their salary."
                    />
                </FormField>

                {/* Remarks */}
                <FormField label="Remarks" htmlFor="remarks">
                    <TextArea
                        id="remarks"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Any additional remarks - Include family details and their name, job, relatives, etc."
                    />
                </FormField>

                {/* Submit Button */}
                <div className="pt-4">
                    <Button type="submit" isLoading={isSubmitting}>
                        {isEditing ? "Save Changes" : "Register Staff"}
                    </Button>
                </div>

                {/* Error/success feedback goes right after the submit button --
                    on a long form, placing it at the top means the user can't
                    see it without scrolling back up after clicking submit. */}
                {error && <Alert variant="error">{error}</Alert>}
                {success && (
                    <Alert variant="success">
                        {isEditing ? "Staff updated successfully." : "Staff registered successfully."}
                    </Alert>
                )}
            </form>
        </div>
    );
}
