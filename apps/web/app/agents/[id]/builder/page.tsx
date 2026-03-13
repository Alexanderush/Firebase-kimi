import AgentBuilder from "@/components/builder/AgentBuilder"

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <div className="flex h-screen flex-col overflow-hidden -m-8">
            <div className="flex-1 overflow-hidden relative">
                <AgentBuilder agentId={id} />
            </div>
        </div>
    )
}
