"use client"

import { ChevronDown, Check } from "lucide-react"
import { useSubAccount } from "@/contexts/SubAccountContext"
import { useState } from "react"

export default function SubAccountSwitcher() {
    const { activeSubAccount, setActiveSubAccount, subAccounts } = useSubAccount()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-lg border bg-white p-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <span className="truncate">
                    {activeSubAccount ? activeSubAccount.name : "Select Account"}
                </span>
                <ChevronDown className={`ms-2 h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute left-0 mt-2 z-20 w-full rounded-md border bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                            {subAccounts.map((account) => (
                                <button
                                    key={account.id}
                                    onClick={() => {
                                        setActiveSubAccount(account)
                                        setIsOpen(false)
                                    }}
                                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <span className="flex-1 text-left truncate">{account.name}</span>
                                    {activeSubAccount?.id === account.id && (
                                        <Check className="h-4 w-4 text-blue-600" />
                                    )}
                                </button>
                            ))}
                            {subAccounts.length === 0 && (
                                <div className="px-4 py-2 text-sm text-gray-500 italic">No accounts</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
