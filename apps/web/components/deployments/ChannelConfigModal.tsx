"use client"

import { useState, useEffect } from "react"
import { X, Shield, Globe, Send, MessageSquare } from "lucide-react"

interface Agent {
    id: string
    name: string
}

interface ChannelConfigModalProps {
    isOpen: boolean
    onClose: () => void
    type: "WHATSAPP" | "MESSENGER" | "WIDGET"
    subAccountId: string
    onSaved: () => void
}

export default function ChannelConfigModal({ isOpen, onClose, type, subAccountId, onSaved }: ChannelConfigModalProps) {
    const [agents, setAgents] = useState<Agent[]>([])
    const [selectedAgentId, setSelectedAgentId] = useState("")
    const [config, setConfig] = useState<any>({
        verifyToken: "",
        phoneNumberId: "",
        accessToken: ""
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetch(`/api/agents?subAccountId=${subAccountId}`)
                .then(res => res.json())
                .then(data => setAgents(Array.isArray(data) ? data : []))
        }
    }, [isOpen, subAccountId])

    const handleSave = async () => {
        if (!selectedAgentId) return
        setSaving(true)

        try {
            const res = await fetch("/api/channels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agentId: selectedAgentId,
                    type,
                    config
                })
            })

            if (res.ok) {
                onSaved()
                onClose()
            }
        } catch (err) {
            console.error("Failed to save channel:", err)
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b">
                    <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Settings className="h-4 w-4 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Configure {type}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="h-4 w-4 text-gray-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Select AI Agent</label>
                        <select
                            value={selectedAgentId}
                            onChange={(e) => setSelectedAgentId(e.target.value)}
                            className="w-full rounded-xl border-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500 py-3"
                        >
                            <option value="">Choose an agent...</option>
                            {agents.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Channel Credentials</label>

                        {type === 'WHATSAPP' && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Phone Number ID"
                                    className="w-full rounded-xl border-gray-200 text-sm py-3"
                                    value={config.phoneNumberId}
                                    onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Verify Token (Your Choice)"
                                    className="w-full rounded-xl border-gray-200 text-sm py-3"
                                    value={config.verifyToken}
                                    onChange={(e) => setConfig({ ...config, verifyToken: e.target.value })}
                                />
                                <textarea
                                    placeholder="Permanent Access Token"
                                    className="w-full rounded-xl border-gray-200 text-sm py-3 h-24"
                                    value={config.accessToken}
                                    onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                                />
                            </>
                        )}

                        {type === 'MESSENGER' && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Page ID"
                                    className="w-full rounded-xl border-gray-200 text-sm py-3"
                                    value={config.pageId}
                                    onChange={(e) => setConfig({ ...config, pageId: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Verify Token"
                                    className="w-full rounded-xl border-gray-200 text-sm py-3"
                                    value={config.verifyToken}
                                    onChange={(e) => setConfig({ ...config, verifyToken: e.target.value })}
                                />
                                <textarea
                                    placeholder="Page Access Token"
                                    className="w-full rounded-xl border-gray-200 text-sm py-3 h-24"
                                    value={config.accessToken}
                                    onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                                />
                            </>
                        )}

                        {type === 'WIDGET' && (
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start">
                                <Globe className="h-5 w-5 text-blue-600 mr-3 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-blue-900">Universal Embedding</p>
                                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">No special credentials needed. Just copy your Webhook URL below into your site's script tag.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t">
                    <button
                        onClick={handleSave}
                        disabled={saving || !selectedAgentId}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
                    >
                        {saving ? "Deploying..." : "Activate Channel"}
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-tighter">
                        <Shield className="h-3 w-3 inline mr-1" /> Enterprise Data Isolation Active
                    </p>
                </div>
            </div>
        </div>
    )
}

function Settings(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}
