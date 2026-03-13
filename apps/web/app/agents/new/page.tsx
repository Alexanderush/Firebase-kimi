"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSubAccount } from "@/contexts/SubAccountContext"
import { Bot, Save } from "lucide-react"

export default function NewAgentPage() {
    const { activeSubAccount } = useSubAccount()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeSubAccount) return

        setLoading(true)
        const res = await fetch("/api/agents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                description,
                systemPrompt,
                subAccountId: activeSubAccount.id,
            }),
        })

        if (res.ok) {
            const data = await res.json()
            router.push(`/agents/${data.id}/builder`)
        } else {
            setLoading(false)
        }
    }

    if (!activeSubAccount) {
        return <div className="p-8 text-center">Please select a sub-account first.</div>
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New AI Agent</h1>
                <p className="text-sm text-gray-500 mt-1">Configure the base identity of your new assistant.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl border shadow-sm">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border-2 border-blue-100 shadow-inner">
                        <Bot className="h-10 w-10" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Agent Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., Customer Support Bot"
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 bg-gray-50"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Description</label>
                        <input
                            type="text"
                            placeholder="What does this agent do?"
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 bg-gray-50"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">System Prompt (Instructions)</label>
                        <textarea
                            required
                            rows={5}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 bg-gray-50"
                            placeholder="Explain how the agent should behave..."
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                        />
                        <p className="mt-2 text-[11px] text-gray-400">This defines the core personality and rules for the AI.</p>
                    </div>
                </div>

                <div className="pt-6 border-t flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-lg hover:bg-blue-700 disabled:bg-blue-300 transition-all uppercase tracking-wide"
                    >
                        <Save className="h-4 w-4 me-2" />
                        {loading ? "Creating..." : "Create & Open Builder"}
                    </button>
                </div>
            </form>
        </div>
    )
}
