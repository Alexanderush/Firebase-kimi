"use client"

import { Mail, Calendar, Table, MessageCircle, Hammer } from "lucide-react"
import { useState, useEffect } from "react"

const icons: Record<string, any> = {
    GMAIL: Mail,
    GOOGLE_CALENDAR: Calendar,
    GOOGLE_SHEETS: Table,
    YAHOO_MAIL: Mail,
}

export default function BuilderSidebar() {
    const [tools, setTools] = useState<any[]>([])

    useEffect(() => {
        fetch("/api/tools").then(res => res.json()).then(setTools)
    }, [])

    const onDragStart = (event: React.DragEvent, nodeType: string, toolType: string, label: string) => {
        event.dataTransfer.setData("application/reactflow", nodeType)
        event.dataTransfer.setData("toolType", toolType)
        event.dataTransfer.setData("label", label)
        event.dataTransfer.effectAllowed = "move"
    }

    return (
        <aside className="w-64 border-l bg-white p-4 flex flex-col">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400 font-mono">Toolbox</h3>
            <div className="flex-1 space-y-3 overflow-y-auto">
                {tools.map((tool) => {
                    const Icon = icons[tool.name] || Hammer
                    return (
                        <div
                            key={tool.id}
                            className="flex cursor-grab items-center rounded-lg border bg-gray-50 p-3 hover:bg-gray-100 active:cursor-grabbing hover:border-blue-200 transition-colors group"
                            onDragStart={(event) => onDragStart(event, "tool", tool.name, tool.displayName)}
                            draggable
                        >
                            <Icon className="h-5 w-5 text-gray-400 mr-3 group-hover:text-blue-500 transition-colors" />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{tool.displayName}</span>
                        </div>
                    )
                })}
            </div>
            <div className="mt-6 rounded-lg bg-blue-50 p-4 border border-blue-100">
                <h4 className="text-xs font-bold text-blue-700 uppercase">Pro Tip</h4>
                <p className="text-[11px] text-blue-600 mt-1 leading-relaxed">Drag a tool into the canvas to empower your agent.</p>
            </div>
        </aside>
    )
}
