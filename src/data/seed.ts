import Papa from 'papaparse';
import { Node, Edge } from '@xyflow/react';

const peopleCSV = `id,name,role
p1,Alice,Frontend Engineer
p2,Bob,Full-Stack Engineer
p3,Carol,Backend Engineer
p4,Dan,Designer
p5,Eva,DevOps Engineer`;

const skillsCSV = `id,name,category
s1,React,Frontend
s2,TypeScript,Frontend
s3,Node.js,Backend
s4,PostgreSQL,Backend
s5,Docker,DevOps
s6,Figma,Design
s7,CSS,Frontend
s8,GraphQL,Backend
s9,CI/CD,DevOps
s10,Next.js,Frontend`;

const connectionsCSV = `person_id,skill_id,proficiency
p1,s1,expert
p1,s2,expert
p1,s10,familiar
p1,s7,familiar
p1,s6,learning
p2,s1,familiar
p2,s3,expert
p2,s2,familiar
p2,s4,learning
p2,s10,expert
p3,s3,expert
p3,s4,expert
p3,s8,expert
p3,s5,familiar
p3,s2,learning
p4,s6,expert
p4,s7,familiar
p4,s1,learning
p5,s5,expert
p5,s9,expert
p5,s3,familiar
p5,s4,familiar`;

export const getSeedData = () => {
  const people = Papa.parse(peopleCSV, { header: true }).data as any[];
  const skills = Papa.parse(skillsCSV, { header: true }).data as any[];
  const connections = Papa.parse(connectionsCSV, { header: true }).data as any[];

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  people.forEach((p, i) => {
    if (!p.id) return;
    nodes.push({
      id: p.id,
      type: 'personNode',
      position: { x: i * 160, y: 100 },
      data: { label: p.name, role: p.role },
    });
  });

  skills.forEach((s, i) => {
    if (!s.id) return;
    nodes.push({
      id: s.id,
      type: 'skillNode',
      position: { x: (i % 5) * 160, y: 350 + Math.floor(i / 5) * 120 },
      data: { label: s.name, category: s.category },
    });
  });

  connections.forEach((c) => {
    if (!c.person_id) return;
    edges.push({
      id: `e-${c.person_id}-${c.skill_id}`,
      source: c.person_id,
      target: c.skill_id,
      label: c.proficiency,
      animated: c.proficiency === 'learning',
      style: { stroke: c.proficiency === 'expert' ? '#16a34a' : '#2563eb', strokeWidth: 2 }
    });
  });

  return { nodes, edges };
};