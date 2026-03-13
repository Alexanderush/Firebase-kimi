"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface SubAccount {
    id: string
    name: string
    // Add other fields as needed
}

interface SubAccountContextType {
    activeSubAccount: SubAccount | null
    setActiveSubAccount: (account: SubAccount | null) => void
    subAccounts: SubAccount[]
    refreshSubAccounts: () => Promise<void>
}

const SubAccountContext = createContext<SubAccountContextType | undefined>(undefined)

export function SubAccountProvider({ children }: { children: React.ReactNode }) {
    const [activeSubAccount, setActiveSubAccount] = useState<SubAccount | null>(null)
    const [subAccounts, setSubAccounts] = useState<SubAccount[]>([])

    const refreshSubAccounts = async () => {
        try {
            const res = await fetch("/api/sub-accounts")
            if (res.ok) {
                const data = await res.json()
                setSubAccounts(data)

                // Auto-select first one if none selected and data exists
                if (!activeSubAccount && data.length > 0) {
                    const saved = localStorage.getItem("activeSubAccountId")
                    const found = data.find((a: any) => a.id === saved)
                    setActiveSubAccount(found || data[0])
                }
            }
        } catch (error) {
            console.error("Failed to fetch sub-accounts", error)
        }
    }

    useEffect(() => {
        refreshSubAccounts()
    }, [])

    useEffect(() => {
        if (activeSubAccount) {
            localStorage.setItem("activeSubAccountId", activeSubAccount.id)
        }
    }, [activeSubAccount])

    return (
        <SubAccountContext.Provider
            value={{
                activeSubAccount,
                setActiveSubAccount,
                subAccounts,
                refreshSubAccounts
            }}
        >
            {children}
        </SubAccountContext.Provider>
    )
}

export function useSubAccount() {
    const context = useContext(SubAccountContext)
    if (context === undefined) {
        throw new Error("useSubAccount must be used within a SubAccountProvider")
    }
    return context
}
