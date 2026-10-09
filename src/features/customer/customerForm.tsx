"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const servicesList = [
    "Patient Care-Male",
    "Patient Care-Female",
    "House Maid",
    "Baby Care",
    "Delivery Care",
];

export default function CustomerForm() {
    const [formData, setFormData] = useState({
        name: "",
        contactNumber1: "",
        contactNumber2: "",
        idProof: "",
        idNumber: "",
        address: "",
        services: [] as string[],
        rate: "",
        email: "",
        remarks: "",
    });

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        if (name === "rate") {
            // Allow only integers
            if (value === "" || /^\d+$/.test(value)) {
                setFormData((prev) => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (service: string) => {
        setFormData((prev) => {
            const services = prev.services.includes(service)
                ? prev.services.filter((s) => s !== service)
                : [...prev.services, service];
            return { ...prev, services };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Data Submitted:", formData);
        // Add submission logic here
    };

    return (
        <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Enter Customer Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <FormField label="Name" htmlFor="name">
                    <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter customer name"
                        required
                    />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Number 1 */}
                    <FormField label="Contact Number" htmlFor="contactNumber1">
                        <Input
                            type="tel"
                            id="contactNumber1"
                            name="contactNumber1"
                            value={formData.contactNumber1}
                            onChange={handleChange}
                            placeholder="Enter contact number"
                            required
                        />
                    </FormField>

                    {/* Contact Number 2 */}
                    <FormField label="Contact Number Alternative" htmlFor="contactNumber2">
                        <Input
                            type="tel"
                            id="contactNumber2"
                            name="contactNumber2"
                            value={formData.contactNumber2}
                            onChange={handleChange}
                            placeholder="Enter alternate contact number"
                        />
                    </FormField>

                    {/* ID Proof */}
                    <FormField label="ID Proof" htmlFor="idProof">
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

                    {/* Rate */}
                    <FormField label="Rate (₹) for 28 days" htmlFor="rate">
                        <Input
                            type="text"
                            id="rate"
                            name="rate"
                            value={formData.rate}
                            onChange={handleChange}
                            placeholder="Enter rate (Integers only)"
                            inputMode="numeric"
                        />
                    </FormField>

                    {/* Email */}
                    <FormField label="Email" htmlFor="email">
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email Address"
                        />
                    </FormField>
                </div>

                {/* Address */}
                <FormField label="Address" htmlFor="address">
                    <TextArea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Enter full address"
                    />
                </FormField>

                {/* Services */}
                <div>
                    <label className="label mb-3 block">Services Required</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {servicesList.map((service) => (
                            <Checkbox
                                key={service}
                                id={`service-${service}`}
                                label={service}
                                checked={formData.services.includes(service)}
                                onChange={() => handleCheckboxChange(service)}
                            />
                        ))}
                    </div>
                </div>

                {/* Remarks */}
                <FormField label="Remarks" htmlFor="remarks">
                    <TextArea
                        id="remarks"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Any additional remarks - include family details, bank details, or any other information about the customer"
                    />
                </FormField>

                {/* Submit Button */}
                <div className="pt-4">
                    <Button type="submit">Submit Customer Details</Button>
                </div>
            </form>
        </div>
    );
}
