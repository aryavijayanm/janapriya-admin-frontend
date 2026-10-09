"use client";

import { Menu } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPanel } from "@/features/calendar/CalendarPanel";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
    onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [staffSearch, setStaffSearch] = useState("");
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    // Navigates to the staff list with this search applied -- a fresh
    // search from the navbar (which can be triggered from any page) starts
    // from a clean slate rather than trying to preserve whatever sort/filter/
    // page happened to be set on whatever page the user was previously on.
    const runStaffSearch = () => {
        const trimmed = staffSearch.trim();
        router.push(trimmed ? `/staff?search=${encodeURIComponent(trimmed)}` : "/staff");
    };

    return (
        <header className="h-16 bg-white border-b border-gray-100 px-4 flex items-center justify-between sticky shadow-lg top-0 z-40">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                    aria-label="Toggle Sidebar"
                >
                    <Menu className="h-6 w-6" />
                </button>

                {/* Search Customer */}
                <div className="hidden md:flex relative items-center">
                    <input
                        type="text"
                        placeholder="Search Customer..."
                        className="pl-4 pr-10 py-2 rounded-2xl bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-transparent text-sm w-64"
                    />
                    <div className="absolute right-3">
                        <Icon name="Search" className="h-5 w-5 text-gray-400" />
                    </div>
                </div>

                {/* Search Staff */}
                <div className="hidden md:flex relative items-center">
                    <input
                        type="text"
                        placeholder="Search Staff..."
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") runStaffSearch();
                        }}
                        className="pl-4 pr-10 py-2 rounded-2xl bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-transparent text-sm w-64"
                    />
                    <button
                        type="button"
                        onClick={runStaffSearch}
                        aria-label="Search Staff"
                        className="absolute right-3"
                    >
                        <Icon name="Search" className="h-5 w-5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Right Side Icons & User Info */}
            <div className="flex items-center gap-6">
                {/* Calendar */}
                <button
                    onClick={() => setIsCalendarOpen(true)}
                    className="text-gray-500 hover:text-primary transition-colors"
                >
                    <Icon name="Calendar1" className="h-5 w-5" />
                </button>

                {/* Notifications */}
                <button className="text-gray-500 hover:text-primary transition-colors relative">
                    <Icon name="BellRing" className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-gray-500 mx-1"></div>

                {/* User Info */}
                <div className="flex flex-col items-end mr-2">
                    <span className="text-sm font-bold text-gray-700 leading-tight">{user?.name}</span>
                    <span className="text-xs text-gray-500">{user?.designation || user?.role}</span>
                </div>

                {/* Power Button */}
                <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                    title="Logout"
                >
                    <Icon name="Power" className="h-5 w-5" />
                </button>
            </div>

            <CalendarPanel
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
            />
        </header>
    );
}
