import Link from "next/link"
import { LayoutDashboard, Users, MessageSquare, Bot, Share2, Settings } from "lucide-react"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Sub-Accounts", href: "/sub-accounts" },
    { icon: Bot, label: "Agents", href: "/agents" },
    { icon: MessageSquare, label: "Deployments", href: "/deployments" },
    { icon: Share2, label: "Demos", href: "/demos" },
    { icon: Settings, label: "Settings", href: "/settings" },
]

import SubAccountSwitcher from "./SubAccountSwitcher"

export default function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white transition-transform">
            <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
                <div className="mb-4 flex items-center px-4 pt-4">
                    <span className="text-2xl font-bold text-blue-600 leading-none">Kimi.ai</span>
                </div>

                <div className="px-3 mb-6 mt-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2 block">
                        Active Client
                    </label>
                    <SubAccountSwitcher />
                </div>

                <ul className="space-y-2 font-medium">
                    {sidebarItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className="group flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100"
                            >
                                <item.icon className="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                <span className="ms-3">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="mt-auto border-t pt-4">
                    <div className="flex items-center px-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">AD</span>
                        </div>
                        <div className="ms-3">
                            <p className="text-sm font-medium text-gray-900">Agency Admin</p>
                            <p className="text-xs text-gray-500">Free Plan</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
