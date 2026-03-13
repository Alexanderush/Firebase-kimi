"use client"

import { useState, useEffect, use } from "react"
import { ShieldCheck, MessageSquare, Smartphone, Globe, AlertCircle, CheckCircle2 } from "lucide-react"

export default function DeployClientPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [linkData, setLinkData] = useState<any>(null)
    const [selectedType, setSelectedType] = useState<"WHATSAPP" | "MESSENGER" | "WIDGET">("WHATSAPP")
    const [config, setConfig] = useState<any>({ phoneNumberId: "", accessToken: "", verifyToken: "", pageId: "" })
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        fetch(`/api/deploy/${token}/channels`)
            .then(res => {
                if (!res.ok) throw new Error(res.status === 410 ? "Link Expired" : "Invalid Link")
                return res.json()
            })
            .then(data => {
                setLinkData(data)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [token])

    const handleSave = async () => {
        setSaving(true)
        setError(null)
        try {
            const res = await fetch(`/api/deploy/${token}/channels`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: selectedType, config })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to save")
            }

            setSuccess(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>

    if (error && !linkData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-500">{error === "Link Expired" ? "This 48-hour deployment link has expired." : "This link is invalid or malformed."}</p>
                    <p className="text-sm text-gray-400 mt-6">Please contact your agency for a new link.</p>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border">
                    <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6 animate-in zoom-in" />
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Connected Successfully!</h1>
                    <p className="text-gray-500">Your AI agent is now actively listening on {selectedType}. You can close this window safely.</p>
                </div>
            </div>
        )
    }

    const { agent } = linkData

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header info */}
                <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-bold text-sm mb-6">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Secure Connection Portal
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{agent.name}</h1>
                    <p className="text-gray-500 mt-3 text-lg">Powered by {agent.subAccount?.user?.agencyName || agent.subAccount?.name || 'Your Agency'}</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="border-b p-6 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900">Select deployment channel</h2>
                        <div className="flex gap-4 mt-4">
                            {[
                                { id: "WHATSAPP", icon: MessageSquare, label: "WhatsApp" },
                                { id: "MESSENGER", icon: Smartphone, label: "Messenger" },
                                { id: "WIDGET", icon: Globe, label: "Web Widget" },
                            ].map(opt => {
                                const active = selectedType === opt.id
                                const Icon = opt.icon
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => { setSelectedType(opt.id as any); setConfig({ phoneNumberId: "", accessToken: "", verifyToken: "", pageId: "" }) }}
                                        className={`flex-1 py-4 px-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${active ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-300'}`}
                                    >
                                        <Icon className="h-6 w-6" />
                                        <span className="text-xs font-bold uppercase tracking-wider">{opt.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-start">
                                <AlertCircle className="h-5 w-5 mr-3 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Connect your {selectedType} Account</label>

                            {selectedType === 'WHATSAPP' && (
                                <>
                                    <input type="text" placeholder="Phone Number ID" className="w-full rounded-xl border-gray-200 py-3" value={config.phoneNumberId} onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })} />
                                    <input type="text" placeholder="Verify Token (Used in Meta Portal)" className="w-full rounded-xl border-gray-200 py-3" value={config.verifyToken} onChange={(e) => setConfig({ ...config, verifyToken: e.target.value })} />
                                    <textarea placeholder="Permanent Access Token" className="w-full rounded-xl border-gray-200 py-3 h-24" value={config.accessToken} onChange={(e) => setConfig({ ...config, accessToken: e.target.value })} />
                                </>
                            )}

                            {selectedType === 'MESSENGER' && (
                                <>
                                    <input type="text" placeholder="Facebook Page ID" className="w-full rounded-xl border-gray-200 py-3" value={config.pageId} onChange={(e) => setConfig({ ...config, pageId: e.target.value })} />
                                    <input type="text" placeholder="Verify Token (Used in Meta Portal)" className="w-full rounded-xl border-gray-200 py-3" value={config.verifyToken} onChange={(e) => setConfig({ ...config, verifyToken: e.target.value })} />
                                    <textarea placeholder="Page Access Token" className="w-full rounded-xl border-gray-200 py-3 h-24" value={config.accessToken} onChange={(e) => setConfig({ ...config, accessToken: e.target.value })} />
                                </>
                            )}

                            {selectedType === 'WIDGET' && (
                                <div className="text-sm text-gray-600 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                    <h3 className="font-bold text-blue-900 mb-2">Embed Code Instructions</h3>
                                    <p className="mb-4 text-blue-800/80">Paste this script code into the <code>&lt;head&gt;</code> of your website to display the chat widget.</p>
                                    <pre className="bg-white p-4 rounded-xl text-xs overflow-x-auto border border-blue-100 text-gray-700">
                                        {`<script src="https://example.com/widget.js" data-agent-id="${agent.id}"></script>`}
                                    </pre>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98] disabled:bg-gray-400 disabled:shadow-none mt-8"
                        >
                            {saving ? "Connecting..." : "Securely Connect Channel"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
