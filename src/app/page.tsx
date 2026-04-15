"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Background,
  Controls,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getSeedData } from '@/data/seed';
import { nodeTypes } from '@/components/CustomNodes';

export default function SkillMatrix() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedNodes = localStorage.getItem('matrix-nodes');
    const savedEdges = localStorage.getItem('matrix-edges');

    if (savedNodes && savedEdges && savedNodes !== "[]") {
      setNodes(JSON.parse(savedNodes));
      setEdges(JSON.parse(savedEdges));
    } else {
      const seed = getSeedData();
      setNodes(seed.nodes);
      setEdges(seed.edges);
    }
    setIsLoaded(true);
  }, [setNodes, setEdges]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('matrix-nodes', JSON.stringify(nodes));
      localStorage.setItem('matrix-edges', JSON.stringify(edges));
    }
  }, [nodes, edges, isLoaded]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (event: React.MouseEvent, node: any) => {
    setSelectedNode(node);
  };

  if (!isLoaded) return <div style={{ padding: '2rem' }}>Loading Skill Matrix...</div>;

  return (
    <div className="app-container">
      <div className="graph-area">
        <div className="graph-header">
          <h1>Team Skill Matrix</h1>
          <p>Brown = People | Blue = Skills</p>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#ccc" gap={16} />
          <Controls />
        </ReactFlow>
      </div>

      <div className="side-panel">
        <h2 className="panel-title">Details Panel</h2>
        
        {selectedNode ? (
          <div>
            <h3 className="detail-heading">{selectedNode.data.label}</h3>
            <p className="detail-type">
              Type: {selectedNode.type === 'personNode' ? 'Team Member' : 'Skill'}
            </p>

            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Connected To:</h4>
              <ul className="connections-list">
                {edges
                  .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                  .map((e) => {
                    const otherId = e.source === selectedNode.id ? e.target : e.source;
                    const otherNode = nodes.find((n) => n.id === otherId);
                    return (
                      <li key={e.id}>
                        {otherNode?.data.label || 'Unknown'} <span className="proficiency-label">({e.label})</span>
                      </li>
                    );
                  })}
              </ul>
            </div>
            
            <button 
              className="btn-delete"
              onClick={() => {
                setNodes(nodes.filter(n => n.id !== selectedNode.id));
                setEdges(edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
                setSelectedNode(null);
              }}
            >
              Delete Node
            </button>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Click on a person or a skill to view their details and connections.
          </p>
        )}
      </div>
    </div>
  );
}