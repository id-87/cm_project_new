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


  const [activeTab, setActiveTab] = useState<'details' | 'add'>('details');
  const [addType, setAddType] = useState<'person' | 'skill' | 'connection'>('person');

  
  const [formData, setFormData] = useState({
    name: '',
    roleCategory: '',
    personId: '',
    skillId: '',
    proficiency: 'familiar'
  });

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
    setActiveTab('details');
  };



  const handleDeleteNode = () => {
    if (!selectedNode) return;
    setNodes(nodes.filter(n => n.id !== selectedNode.id));
    setEdges(edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  };

  const handleUpdateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;
    
    const updatedName = (e.target as any).nodeName.value;
    const updatedSub = (e.target as any).nodeSub.value;

    setNodes(nodes.map(n => {
      if (n.id === selectedNode.id) {
        return {
          ...n,
          data: {
            ...n.data,
            label: updatedName,
            ...(n.type === 'personNode' ? { role: updatedSub } : { category: updatedSub })
          }
        };
      }
      return n;
    }));
    
    
    setSelectedNode({
       ...selectedNode,
       data: {
          ...selectedNode.data,
          label: updatedName,
          ...(selectedNode.type === 'personNode' ? { role: updatedSub } : { category: updatedSub })
       }
    });
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges(edges.filter(e => e.id !== edgeId));
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `new-${Date.now()}`;

    if (addType === 'person') {
      setNodes([...nodes, {
        id,
        type: 'personNode',
        position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
        data: { label: formData.name, role: formData.roleCategory }
      }]);
    } else if (addType === 'skill') {
      setNodes([...nodes, {
        id,
        type: 'skillNode',
        position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 400 },
        data: { label: formData.name, category: formData.roleCategory }
      }]);
    } else if (addType === 'connection') {
      if (!formData.personId || !formData.skillId) return alert("Select both a person and a skill.");
      setEdges([...edges, {
        id: `e-${formData.personId}-${formData.skillId}-${Date.now()}`,
        source: formData.personId,
        target: formData.skillId,
        label: formData.proficiency,
        animated: formData.proficiency === 'learning',
        style: { stroke: formData.proficiency === 'expert' ? '#16a34a' : '#2563eb', strokeWidth: 2 }
      }]);
    }
    
    setFormData({ name: '', roleCategory: '', personId: '', skillId: '', proficiency: 'familiar' });
    alert(`${addType} added successfully!`);
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
        <div className="tabs">
          <button className={`tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details</button>
          <button className={`tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>Add New</button>
        </div>
        
        {activeTab === 'details' ? (
          <div className="panel-content">
            {selectedNode ? (
              <div>
                <form onSubmit={handleUpdateNode} className="edit-form">
                  <h3 className="form-title">Edit Node</h3>
                  <label>Name</label>
                  <input type="text" name="nodeName" defaultValue={selectedNode.data.label} required />
                  
                  <label>{selectedNode.type === 'personNode' ? 'Role' : 'Category'}</label>
                  <input type="text" name="nodeSub" defaultValue={selectedNode.type === 'personNode' ? selectedNode.data.role : selectedNode.data.category} required />
                  
                  <button type="submit" className="btn-primary">Save Changes</button>
                </form>

                <div className="connections-wrapper">
                  <h4 style={{ marginBottom: '0.5rem', marginTop: '1.5rem' }}>Connections:</h4>
                  {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length === 0 && (
                    <p className="text-muted">No connections found.</p>
                  )}
                  <ul className="connections-list">
                    {edges
                      .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map((e) => {
                        const otherId = e.source === selectedNode.id ? e.target : e.source;
                        const otherNode = nodes.find((n) => n.id === otherId);
                        return (
                          <li key={e.id} className="connection-item">
                            <span>
                              <strong>{otherNode?.data.label || 'Unknown'}</strong> <span className="proficiency-label">({e.label})</span>
                            </span>
                            <button onClick={() => handleDeleteEdge(e.id)} className="btn-icon-delete" title="Remove Connection">✕</button>
                          </li>
                        );
                      })}
                  </ul>
                </div>
                
                <button className="btn-delete" onClick={handleDeleteNode}>Delete Entire Node</button>
              </div>
            ) : (
              <p className="text-muted text-center mt-4">Select a node on the graph to view and edit details.</p>
            )}
          </div>
        ) : (
          <div className="panel-content">
            <div className="radio-group">
              <label><input type="radio" checked={addType === 'person'} onChange={() => setAddType('person')} /> Person</label>
              <label><input type="radio" checked={addType === 'skill'} onChange={() => setAddType('skill')} /> Skill</label>
              <label><input type="radio" checked={addType === 'connection'} onChange={() => setAddType('connection')} /> Edge</label>
            </div>

            <form onSubmit={handleAddNew} className="edit-form mt-4">
              {addType === 'person' && (
                <>
                  <label>Person Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Alice" />
                  <label>Role</label>
                  <input type="text" value={formData.roleCategory} onChange={e => setFormData({...formData, roleCategory: e.target.value})} placeholder="e.g. Frontend Dev" />
                </>
              )}

              {addType === 'skill' && (
                <>
                  <label>Skill Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. React" />
                  <label>Category</label>
                  <input type="text" value={formData.roleCategory} onChange={e => setFormData({...formData, roleCategory: e.target.value})} placeholder="e.g. Frontend" />
                </>
              )}

              {addType === 'connection' && (
                <>
                  <label>Person</label>
                  <select value={formData.personId} onChange={e => setFormData({...formData, personId: e.target.value})} required>
                    <option value="">Select Person...</option>
                    {nodes.filter(n => n.type === 'personNode').map(n => <option key={n.id} value={n.id}>{n.data.label}</option>)}
                  </select>

                  <label>Skill</label>
                  <select value={formData.skillId} onChange={e => setFormData({...formData, skillId: e.target.value})} required>
                    <option value="">Select Skill...</option>
                    {nodes.filter(n => n.type === 'skillNode').map(n => <option key={n.id} value={n.id}>{n.data.label}</option>)}
                  </select>

                  <label>Proficiency</label>
                  <select value={formData.proficiency} onChange={e => setFormData({...formData, proficiency: e.target.value})}>
                    <option value="learning">Learning</option>
                    <option value="familiar">Familiar</option>
                    <option value="expert">Expert</option>
                  </select>
                </>
              )}
              
              <button type="submit" className="btn-primary mt-2">Add {addType.charAt(0).toUpperCase() + addType.slice(1)}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}