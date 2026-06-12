import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
import { BONES, REGIONS } from '../data/bonesData';

export default function BoneLabels({ visible, explodeFactor }) {
  if (!visible) return null;
  
  return (
    <group>
      {BONES.map(bone => {
        const region = REGIONS[bone.region.toUpperCase()];
        const labelPos = [
          bone.position[0] + bone.labelOffset[0],
          bone.position[1] + bone.labelOffset[1],
          bone.position[2] + bone.labelOffset[2],
        ];
        
        return (
          <group key={bone.id} position={labelPos}>
            <Html
              position={[0, 0, 0]}
              center
              distanceFactor={10}
              zIndexRange={[100, 0]}
              style={{ pointerEvents: 'none' }}
            >
              <div className="bone-label" style={{ borderColor: region?.color }}>
                <div className="label-line" style={{ backgroundColor: region?.color }} />
                <div className="label-content">
                  <span className="label-name" style={{ color: region?.color }}>
                    {bone.name}
                  </span>
                  <span className="label-name-en">{bone.nameEn}</span>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
