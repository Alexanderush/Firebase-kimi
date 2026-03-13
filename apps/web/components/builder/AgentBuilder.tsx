"use client"

import React, { useState, useCallback, useEffect } from "react"
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    Connection,
    Edge,
    Node,
    applyEdgeChanges,
    applyNodeChanges,
    NodeChange,
    EdgeChange
} from "reactflow"
import "reactflow/dist/style.css"

import AgentNode from "../../components/builder/AgentNode"
import ToolNode from "../../components/builder/ToolNode"
import BuilderSidebar from "./BuilderSidebar"

const nodeTypes = {
    agent: AgentNode,
    tool: ToolNode,
}

let id = 0
const getId = () => `dndnode_${id++}`

export default function AgentBuilder({ agentId }: { agentId: string }) {
    const [nodes, setNodes] = useState<Node[]>([])
    const [edges, setEdges] = useState<Edge[]>([])
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
    const [subAccountId, setSubAccountId] = useState<string | null>(null)

    useEffect(() => {
        const fetchAgent = async () => {
            const res = await fetch(`/api/agents/${agentId}`)
            if (res.ok) {
                const data = await res.json()
                setSubAccountId(data.subAccountId)

                // Fetch existing connections for this sub-account
                const connRes = await fetch(`/api/sub-accounts/${data.subAccountId}/connections`)
                const connections = connRes.ok ? await connRes.json() : []
                const connectedToolNames = connections.map((c: any) => c.tool.name)

                if (data.canvasState) {
                    // Sync connection status to nodes
                    const syncedNodes = (data.canvasState.nodes || []).map((n: any) => {
                        if (n.type === "tool") {
                            return {
                                ...n,
                                data: {
                                    ...n.data,
                                    isConnected: connectedToolNames.includes(n.data.type),
                                    subAccountId: data.subAccountId
                                }
                            }
                        }
                        return {
                            ...n,
                            data: {
                                ...n.data,
                                subAccountId: data.subAccountId
                            }
                        }
                    })
                    setNodes(syncedNodes)
                    setEdges(data.canvasState.edges || [])
                } else {
                    setNodes([
                        {
                            id: "agent-1",
                            type: "agent",
                            position: { x: 250, y: 150 },
                            data: { label: data.name, subAccountId: data.subAccountId },
                        },
                    ])
                }
            }
        }
        fetchAgent()
    }, [agentId])

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    )

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    )

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    )

    const onDragOver = useCallback((event: any) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
    }, [])

    const onDrop = useCallback(
        (event: any) => {
            event.preventDefault()

            const type = event.dataTransfer.getData("application/reactflow")
            const toolType = event.dataTransfer.getData("toolType")
            const label = event.dataTransfer.getData("label")

            if (typeof type === "undefined" || !type) {
                return
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            })

            const newNode = {
                id: getId(),
                type,
                position,
                data: { label, type: toolType, isConnected: false, subAccountId },
            }

            setNodes((nds) => nds.concat(newNode))
        },
        [reactFlowInstance, subAccountId]
    )

    const saveCanvas = async () => {
        await fetch(`/api/agents/${agentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ canvasState: { nodes, edges } }),
        })
    }

    return (
        <div className="flex h-full w-full">
            <div className="relative flex-1 bg-gray-50">
                <div className="absolute left-6 top-6 z-10 flex space-x-2">
                    <button onClick={saveCanvas} className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-xl hover:bg-blue-700 transition-all uppercase tracking-wider">
                        Save Work
                    </button>
                </div>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background color="#cbd5e1" variant={undefined as any} />
                    <Controls />
                </ReactFlow>
            </div>
            <BuilderSidebar />
        </div>
    )
}
