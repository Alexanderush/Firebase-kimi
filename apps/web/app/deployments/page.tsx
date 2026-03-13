"use client"

import { useState, useEffect } from "react"
import {
    MessageSquare,
    Smartphone,
    Globe,
    Settings2,
    ExternalLink,
    Copy,
    CheckCircle2,
    Clock,
    ShieldCheck,
    ChevronRight,
    Plus
} from "lucide-react"
import { useSubAccount } from "@/contexts/SubAccountContext"
import ChannelConfigModal from "@/components/deployments/ChannelConfigModal"

interface Channel {
    id: string
    type: "WIDGET" | "WHATSAPP" | "MESSENGER" | "INSTAGRAM"
    config: any
    agentId: string
    agent: { name: string }
}

const CHANNEL_TYPES = [
    {
        id: "WHATSAPP" as const,
        name: "WhatsApp",
        icon: MessageSquare,
        color: "text-green-600",
        bg: "bg-green-50",
        description: "Deploy your agent on WhatsApp Business API"
    },
    {
        id: "MESSENGER" as const,
        name: "Messenger",
        icon: Smartphone,
        color: "text-blue-600",
        bg: "bg-blue-50",
        description: "Connect to Facebook Messenger pages"
    },
    {
        id: "WIDGET" as const,
        name: "Web Widget",
        icon: Globe,
        color: "text-purple-600",
        bg: "bg-purple-50",
        description: "Embed a chat widget on your website"
    },
]

export default function DeploymentsPage() {
    const { activeSubAccount } = useSubAccount()
    const [channels, setChannels] = useState<Channel[]>([])
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState<string | null>(null)
    const [modalData, setModalData] = useState<{ isOpen: boolean, type: "WHATSAPP" | "MESSENGER" | "WIDGET" }>({
        isOpen: false,
        type: "WHATSAPP"
    })

    const fetchChannels = () => {
        if (activeSubAccount) {
            setLoading(true)
            fetch(`/api/channels?subAccountId=${activeSubAccount.id}`)
                .then(res => res.json())
                .then(data => {
                    setChannels(Array.isArray(data) ? data : [])
                    setLoading(false)
                })
        }
    }

    useEffect(() => {
        fetchChannels()
    }, [activeSubAccount])

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(null), 2000)
    }

    const openConfig = (type: "WHATSAPP" | "MESSENGER" | "WIDGET") => {
        setModalData({ isOpen: true, type })
    }

    if (!activeSubAccount) return null

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Deployments</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage how your agents interact with the world.</p>
                </div>
                <div className="flex space-x-3">
                    <div className="bg-white border px-4 py-2 rounded-lg shadow-sm flex items-center">
                        <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-xs font-bold text-gray-600 uppercase">Enterprise Secure</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {CHANNEL_TYPES.map((type) => {
                    const activeChannels = channels.filter(c => c.type === type.id)
                    const Icon = type.icon

                    return (
                        <div key={type.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="p-6 flex-1">
                                <div className={`h-12 w-12 rounded-xl ${type.bg} flex items-center justify-center mb-4`}>
                                    <Icon className={`h-6 w-6 ${type.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{type.name}</h3>
                                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                    {type.description}
                                </p>

                                <div className="space-y-3">
                                    {activeChannels.length > 0 ? (
                                        activeChannels.map(channel => (
                                            <div key={channel.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Agent</p>
                                                        <p className="text-sm font-bold text-gray-900">{channel.agent.name}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => openConfig(type.id)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Settings2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center text-[10px] text-gray-500 bg-white border rounded px-2 py-1.5 mt-2 overflow-hidden">
                                                    <span className="truncate flex-1">.../api/webhooks/{type.id.toLowerCase()}/{channel.agentId}</span>
                                                    <button
                                                        onClick={() => copyToClipboard(`${window.base_url || ''}/api/webhooks/${type.id.toLowerCase()}/${channel.agentId}`, channel.id)}
                                                        className="ml-2 hover:text-blue-600"
                                                    >
                                                        {copied === channel.id ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                                            <p className="text-xs font-bold text-gray-400 uppercase">No Active {type.name}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 border-t">
                                <button
                                    onClick={() => openConfig(type.id)}
                                    className="w-full flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Configure {type.name}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-12 bg-white rounded-3xl p-8 border border-blue-100 shadow-xl shadow-blue-50 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                    <div className="text-center md:text-left mb-6 md:mb-0 max-w-lg">
                        <div className="flex items-center justify-center md:justify-start mb-2">
                            <Globe className="h-5 w-5 mr-2 text-blue-600" />
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Client Connection Links</span>
                        </div>
                        <h2 className="text-2xl font-black mb-2 text-gray-900">Generate Deployment Link</h2>
                        <p className="text-gray-500 font-medium text-sm">Create a secure, 48-hour access link for your clients to connect their own WhatsApp or Messenger accounts to their Agent.</p>
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-end">
                        <select
                            className="mb-4 w-full md:w-64 rounded-xl border-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500 py-3"
                            onChange={(e) => {
                                // Logic to generate link via /api/deployment-links
                                const agentId = e.target.value;
                                if (!agentId) return;

                                fetch("/api/deployment-links", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ agentId })
                                })
                                    .then(res => res.json())
                                    .then(data => {
                                        if (data.url) {
                                            navigator.clipboard.writeText(data.url)
                                            setCopied('link-gen')
                                            setTimeout(() => setCopied(null), 3000)
                                        }
                                    })
                                // Reset select securely
                                e.target.value = "";
                            }}
                        >
                            <option value="">Select Agent to Generate Link...</option>
                            {/* We need to fetch agents, but for now we extract from channels array uniquely */}
                            {Array.from(new Set(channels.map(c => c.agentId))).map(agentId => {
                                const agentName = channels.find(c => c.agentId === agentId)?.agent.name
                                return <option key={agentId} value={agentId}>{agentName}</option>
                            })}
                        </select>

                        {copied === 'link-gen' && (
                            <div className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 animate-in fade-in">
                                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                Link Copied to Clipboard!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ChannelConfigModal
                isOpen={modalData.isOpen}
                onClose={() => setModalData({ ...modalData, isOpen: false })}
                type={modalData.type}
                subAccountId={activeSubAccount.id}
                onSaved={fetchChannels}
            />
        </div>
    )
}

declare global {
    interface Window {
        base_url?: string;
    }
}
