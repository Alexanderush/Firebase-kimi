"use client"

import { useState, useEffect } from "react"
import { useSubAccount } from "@/contexts/SubAccountContext"
import {
    Users,
    Bot,
    MessageSquare,
    Globe,
    TrendingUp,
    Zap,
    ArrowUpRight,
    Activity,
    Clock
} from "lucide-react"
import Link from "next/link"

interface Stats {
    agents: number
    conversations: number
    messages: number
    channels: number
    recentActivity: Array<{
        id: string
        agentName: string
        role: string
        content: string
        createdAt: string
    }>
}

export default function DashboardPage() {
    const { activeSubAccount } = useSubAccount()
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (activeSubAccount) {
            setLoading(true)
            fetch(`/api/analytics?subAccountId=${activeSubAccount.id}`)
                .then(res => res.json())
                .then(data => {
                    setStats(data)
                    setLoading(false)
                })
        }
    }, [activeSubAccount])

    if (!activeSubAccount) return null

    const statCards = [
        { name: "Active Agents", value: stats?.agents || 0, icon: Bot, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Total Conversations", value: stats?.conversations || 0, icon: MessageSquare, color: "text-green-600", bg: "bg-green-50" },
        { name: "Messages Processed", value: stats?.messages || 0, icon: Zap, color: "text-purple-600", bg: "bg-purple-50" },
        { name: "Connected Channels", value: stats?.channels || 0, icon: Globe, color: "text-orange-600", bg: "bg-orange-50" },
    ]

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Analytics Overview</h1>
                    <p className="text-gray-500 mt-2 font-medium">Real-time performance metrics for your AI fleet.</p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        href="/agents/new"
                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex items-center"
                    >
                        Deploy New Agent <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((card) => {
                    const Icon = card.icon
                    return (
                        <div key={card.name} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="p-1 px-2 rounded-lg bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                                    Live
                                </div>
                            </div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{card.name}</h3>
                            <div className="flex items-baseline space-x-2">
                                <p className="text-3xl font-black text-gray-900">{card.value}</p>
                                <span className="text-green-500 text-xs font-bold flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1" /> +0%
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity List */}
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center">
                                <Activity className="h-5 w-5 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                        </div>
                        <Link href="/logs" className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">
                            View All Logs
                        </Link>
                    </div>
                    <div className="p-4 flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="h-10 w-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Fetching Intelligence...</p>
                            </div>
                        ) : stats?.recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="h-16 w-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4">
                                    <MessageSquare className="h-8 w-8 text-gray-200" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 mb-1">Silence is Gold</h3>
                                <p className="text-xs text-gray-400 max-w-[200px]">Your agents are waiting for their first conversation.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {stats?.recentActivity.map((msg) => (
                                    <div key={msg.id} className="p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all group flex items-start space-x-4">
                                        <div className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'USER' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                            <Bot className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="text-sm font-bold text-gray-900 truncate">{msg.agentName}</h4>
                                                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase">
                                                    <Clock className="h-3 w-3 mr-1" /> {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-1">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Chart Placeholder / Extra Info */}
                <div className="bg-blue-600 rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-blue-200">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-4 leading-tight">Scale your agency to the moon.</h3>
                        <p className="text-blue-100 font-medium text-sm leading-relaxed opacity-80">
                            Our Kimi K2.5 engine handles thousands of concurrent sessions across WhatsApp, Messenger, and Web.
                        </p>
                    </div>

                    <div className="relative z-10 mt-8 space-y-4">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">API Health</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Optimal</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-green-400 w-[98%]"></div>
                            </div>
                        </div>
                        <Link
                            href="/settings"
                            className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-50 transition-all flex items-center justify-center shadow-lg"
                        >
                            Configuration <ArrowUpRight className="ml-2 h-3 w-3" />
                        </Link>
                    </div>

                    <div className="absolute -right-20 -bottom-20 h-64 w-64 bg-blue-500 rounded-full opacity-30 blur-3xl"></div>
                    <div className="absolute -left-20 -top-10 h-32 w-32 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
                </div>
            </div>
        </div>
    )
}
