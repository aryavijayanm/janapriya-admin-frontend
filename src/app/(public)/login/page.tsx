"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { user, isLoading, login } = useAuth();

    // Already have a valid session (e.g. navigated back here manually) --
    // send them straight to the dashboard instead of showing the form again.
    useEffect(() => {
        if (!isLoading && user) {
            router.push("/dashboard");
        }
    }, [isLoading, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            await login(username, password);
            router.push("/dashboard");
        } catch {
            setError("Invalid username or password");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                {/* Logo Section */}
                <div className="flex flex-col items-center">
                    <div className="relative w-72 h-36 mb-2">
                        <Image
                            src="/images/logo.png"
                            alt="Janapriya Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Form Section */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <Alert variant="error">{error}</Alert>}

                    <div className="space-y-4">
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Icon name="UserRound" className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={username}
                                    autoComplete="off"
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all text-black"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Icon name="Lock" className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all text-black"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <Icon name={showPassword ? "Eye" : "EyeOff"} className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex items-center justify-end">
                        <Link
                            href="/forgot-password"
                            className="text-sm font-medium text-primary hover:text-pink-600 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            className="w-full rounded-xl py-3 shadow-md shadow-pink-200"
                        >
                            Login
                        </Button>
                    </div>
                </form>
            </div >
        </div >
    );
}
