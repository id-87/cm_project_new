import { Handle, Position } from '@xyflow/react';
import { User, Lightbulb } from 'lucide-react';

export const PersonNode = ({ data }: any) => {
  return (
    <div className="custom-node node-person">
      <Handle type="source" position={Position.Bottom} style={{ background: '#f59e0b', width: '12px' }} />
      <User size={16} />
      <div>
        <div className="node-label">{data.label}</div>
        <div className="node-subtext">{data.role}</div>
      </div>
    </div>
  );
};

export const SkillNode = ({ data }: any) => {
  return (
    <div className="custom-node node-skill">
      <Handle type="target" position={Position.Top} style={{ background: '#60a5fa', width: '12px' }} />
      <Lightbulb size={16} />
      <div>
        <div className="node-label">{data.label}</div>
        <div className="node-subtext">{data.category}</div>
      </div>
    </div>
  );
};

export const nodeTypes = {
  personNode: PersonNode,
  skillNode: SkillNode,
};