"use client"

import { Handle, Position } from "reactflow"
import { Mail, Calendar, Table, MessageCircle, Settings2, Link as LinkIcon, CheckCircle2 } from "lucide-react"

export default function ToolNode({ data }: { data: any }) {
    const Icon = {
        GMAIL: Mail,
        GOOGLE_CALENDAR: Calendar,
        GOOGLE_SHEETS: Table,
        YAHOO_MAIL: Mail,
    }[data.type as string] || Settings2

    const handleConnect = () => {
        // This will open the OAuth window
        const provider = data.type?.startsWith("GOOGLE") ? "google" : "yahoo"
        window.open(`/api/auth/${provider}/login?subAccountId=${data.subAccountId || ''}&toolId=${data.type}`, '_blank', 'width=600,height=600')
    }

    return (
        <div className={`rounded-lg border-2 bg-white p-3 shadow-lg transition-all ${data.isConnected ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200'}`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-400 border-2 border-white" />

            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-md ${data.isConnected ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <Icon className={`h-5 w-5 ${data.isConnected ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Tool Integration</p>
                    <h4 className="text-sm font-bold text-gray-900">{data.label}</h4>
                </div>
            </div>

            <div className="mt-3">
                {data.isConnected ? (
                    <div className="flex items-center text-[10px] font-bold text-green-600 uppercase">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                    </div>
                ) : (
                    <button
                        onClick={handleConnect}
                        className="flex items-center w-full justify-center px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded hover:bg-blue-100 transition-colors"
                    >
                        <LinkIcon className="h-3 w-3 mr-1" /> Connect API
                    </button>
                )}
            </div>
        </div>
    )
}
