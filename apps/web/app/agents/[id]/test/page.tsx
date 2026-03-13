"use client"

import { useState, useRef, useEffect, use } from "react"
import { Bot, User, Send, ChevronLeft, Trash2 } from "lucide-react"
import Link from "next/link"

export default function AgentTestPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [messages, setMessages] = useState<any[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [agent, setAgent] = useState<any>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetch(`/api/agents/${id}`).then(res => res.json()).then(setAgent)
    }, [id])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMsg = { role: "user", content: input }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setLoading(true)

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agentId: id,
                    messages: [...messages, userMsg],
                }),
            })

            if (!res.ok) throw new Error("Failed to get response")

            const data = await res.json()
            setMessages(prev => [...prev, {
                role: "assistant",
                content: data.content
            }])
        } catch (err: any) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: `Error: ${err.message}. Please verify your NVIDIA_API_KEY in the .env file.`
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto border rounded-xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center space-x-3">
                    <Link href="/agents" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{agent?.name || "Loading..."}</h2>
                        <div className="flex items-center text-[10px] text-green-600 font-bold uppercase tracking-wider">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 me-1.5 animate-pulse" />
                            Live Preview
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setMessages([])}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Clear Chat"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[80%] space-x-3 ${m.role === 'USER' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'USER' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-600'}`}>
                                {m.role === 'USER' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>
                            <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${m.role === 'USER' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-50 text-gray-900 border border-gray-100 rounded-tl-none'}`}>
                                {m.content}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex max-w-[80%] space-x-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-blue-600 shrink-0">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3 flex space-x-1.5 items-center border border-gray-100">
                                <span className="h-1.5 w-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="h-1.5 w-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="h-1.5 w-1.5 bg-blue-300 rounded-full animate-bounce" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-gray-50 border-t">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        className="w-full rounded-full border-gray-300 pr-24 py-3 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                        placeholder="Talk to your agent..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-xs uppercase hover:bg-blue-700 transition-all flex items-center shadow-md disabled:bg-blue-300"
                    >
                        Send <Send className="ms-2 h-3.5 w-3.5" />
                    </button>
                </div>
                <p className="text-[10px] text-center text-gray-400 mt-3 uppercase tracking-tighter">
                    Testing Sandbox • Powered by Kimi K2.5
                </p>
            </form>
        </div>
    )
}
