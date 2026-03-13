"use client"

import { Bot } from "lucide-react"
import { Handle, Position } from "reactflow"

export default function AgentNode({ data }: any) {
    return (
        <div className="flex w-48 flex-col items-center rounded-lg border-2 border-blue-500 bg-white p-4 shadow-lg">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Bot className="h-6 w-6" />
            </div>
            <div className="text-center font-bold text-gray-900">{data.label}</div>
            <div className="mt-1 text-xs text-gray-500">Main Agent</div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
        </div>
    )
}
