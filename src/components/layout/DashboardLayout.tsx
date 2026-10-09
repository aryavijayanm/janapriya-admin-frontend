"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div
                className={`inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:relative overflow-hidden ${sidebarOpen ? "translate-x-0 w-56" : "-translate-x-full lg:translate-x-0 lg:w-20"
                    }`}
            >
                <Sidebar isOpen={sidebarOpen} />
            </div>

            {/* Main Content */}
            <div className="relative flex-1 bg-gray-200 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
                <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
