"use client";
import SidebarContent from "@/components/dashboard/Sidebar";
import { Drawer } from "antd";
import Header from "@/components/dashboard/Header";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DashboardLayout = ({ children }) => {
	const router = useRouter();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<div className="flex h-screen bg-blue-50/30 overflow-hidden font-sans">
			<aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm z-10 shrink-0">
				<SidebarContent />
			</aside>

			<div className="flex-1 flex flex-col h-full overflow-hidden relative">
				<Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

				<main className="flex-1 overflow-y-auto p-4 md:p-8">
					<div className="max-w-7xl mx-auto h-full">{children}</div>
				</main>
			</div>

			<Drawer
				placement="left"
				onClose={() => setMobileMenuOpen(false)}
				open={mobileMenuOpen}
				styles={{ body: { padding: 0 } }}
				size={260}
				className="md:hidden"
			>
				<SidebarContent />
			</Drawer>
		</div>
	);
};

export default DashboardLayout;
