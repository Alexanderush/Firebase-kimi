"use client"

import { Plus, Bot, MessageSquare, ExternalLink } from "lucide-react"
import { useSubAccount } from "@/contexts/SubAccountContext"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function AgentsPage() {
    const { activeSubAccount } = useSubAccount()
    const [agents, setAgents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (activeSubAccount) {
            fetchAgents()
        }
    }, [activeSubAccount])

    const fetchAgents = async () => {
        setLoading(true)
        const res = await fetch(`/api/agents?subAccountId=${activeSubAccount?.id}`)
        if (res.ok) {
            const data = await res.json()
            setAgents(data)
        }
        setLoading(false)
    }

    if (!activeSubAccount) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                <Bot className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">No Sub-Account Selected</h2>
                <p className="text-gray-500 mt-2 max-w-xs">Please select a sub-account from the sidebar to manage agents.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
                    <p className="text-sm text-gray-500">Managing agents for {activeSubAccount.name}</p>
                </div>
                <Link
                    href="/agents/new"
                    className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                    <Plus className="me-2 h-4 w-4" />
                    Create New Agent
                </Link>
            </div>

            {loading ? (
                <p>Loading agents...</p>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {agents.map((agent) => (
                        <div key={agent.id} className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Bot className="h-6 w-6" />
                                </div>
                                <span className={`text-[10px] font-bold uppercase py-1 px-2 rounded-full ${agent.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {agent.status || 'Draft'}
                                </span>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">{agent.name}</h3>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{agent.description || "No description provided."}</p>

                            <div className="mt-6 flex items-center space-x-4">
                                <Link href={`/agents/${agent.id}/builder`} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center">
                                    <ExternalLink className="h-3 w-3 me-1" /> Open Builder
                                </Link>
                                <Link href={`/agents/${agent.id}/test`} className="text-xs font-semibold text-gray-600 hover:text-gray-800 flex items-center">
                                    <MessageSquare className="h-3 w-3 me-1" /> Test
                                </Link>
                            </div>
                        </div>
                    ))}
                    {agents.length === 0 && (
                        <div className="col-span-full py-16 text-center text-gray-500 border-2 border-dashed rounded-lg">
                            <Bot className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-lg font-medium">No agents found</p>
                            <p className="text-sm mt-1">Create your first AI agent for this client.</p>
                            <Link href="/agents/new" className="mt-4 inline-block text-blue-600 font-semibold hover:underline">
                                Build an agent now &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
