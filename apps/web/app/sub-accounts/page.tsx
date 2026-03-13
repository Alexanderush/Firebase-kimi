"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, ExternalLink } from "lucide-react"

export default function SubAccountsPage() {
    const [subAccounts, setSubAccounts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [clientEmail, setClientEmail] = useState("")

    useEffect(() => {
        fetchSubAccounts()
    }, [])

    const fetchSubAccounts = async () => {
        const res = await fetch("/api/sub-accounts")
        const data = await res.json()
        setSubAccounts(data)
        setLoading(false)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch("/api/sub-accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, clientEmail }),
        })

        if (res.ok) {
            setShowModal(false)
            setName("")
            setDescription("")
            setClientEmail("")
            fetchSubAccounts()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Sub-Accounts</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                    <Plus className="me-2 h-4 w-4" />
                    Add Sub-Account
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {subAccounts.map((account) => (
                        <div key={account.id} className="relative rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{account.clientEmail || "No email provided"}</p>
                            <p className="mt-4 text-sm text-gray-700 line-clamp-2">{account.description}</p>
                            <div className="mt-6 flex justify-between items-center text-xs text-blue-600">
                                <span>Created {new Date(account.createdAt).toLocaleDateString()}</span>
                                <div className="flex space-x-2">
                                    <button className="p-1 hover:text-blue-800"><ExternalLink className="h-4 w-4" /></button>
                                    <button className="p-1 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {subAccounts.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed rounded-lg">
                            No sub-accounts yet. Create one to get started.
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Sub-Account</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Client Name / Business Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Client Email</label>
                                <input
                                    type="email"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
