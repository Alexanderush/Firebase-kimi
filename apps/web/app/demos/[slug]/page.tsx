import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Bot, Shield, Send, Globe, MessageSquare, Smartphone } from "lucide-react"
import Script from "next/script"

export default async function PublicDemoPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const demo = await prisma.demoLink.findUnique({
        where: { slug },
        include: {
            agent: {
                include: {
                    subAccount: {
                        select: { name: true }
                    }
                }
            },
        },
    })

    if (!demo) notFound()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">

                {/* Left Side: Branding & Info */}
                <div className="bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="h-14 w-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                            <Bot className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-black mb-4 leading-tight">{demo.title || demo.agent.name}</h1>
                        <p className="text-blue-100 text-lg font-medium leading-relaxed opacity-90">
                            {demo.description || "Welcome to our AI assistant demo. Experience the future of customer interaction powered by Kimi K2.5."}
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                        <div className="flex items-center space-x-3 mb-4">
                            <Shield className="h-4 w-4 text-blue-200" />
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-100">Enterprise Ready</span>
                        </div>
                        <p className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter">
                            Provided by {demo.agent.subAccount.name} • Internal Sandbox
                        </p>
                    </div>

                    {/* Decorations */}
                    <div className="absolute -right-20 -bottom-20 h-64 w-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute -left-20 -top-20 h-64 w-64 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
                </div>

                {/* Right Side: Direct Interaction or Preview */}
                <div className="p-8 flex flex-col items-center justify-center bg-gray-50/50">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-100 mb-4 animate-pulse">
                            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Live Experience</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Try it out!</h2>
                        <p className="text-sm text-gray-500 mt-2">Chat with the agent on the right or use the widget.</p>
                    </div>

                    <div className="w-full max-w-sm bg-white rounded-3xl border border-gray-200 shadow-xl p-6 relative">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Demo Channel</p>
                                <p className="text-sm font-bold text-gray-900">Interactive Chat</p>
                            </div>
                        </div>

                        <div className="h-48 flex items-center justify-center text-center p-4">
                            <p className="text-xs text-gray-400 font-medium italic">
                                The public demo link allows clients to experience the agent's intelligence directly.
                                Click the widget in the corner to start!
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Integrate on your site</p>
                        <div className="flex space-x-2">
                            <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <Globe className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <Smartphone className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Powered by Kimi AI Agency Builder • Stage 5 Final Demo
            </p>

            {/* Inject the real widget for this agent */}
            <Script
                src="/widget.js"
                data-agent-id={demo.agentId}
                data-base-url="" // Use current origin
            />
        </div>
    )
}
