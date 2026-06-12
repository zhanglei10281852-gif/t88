import React from 'react';

export default function Scene({ autoRotate, autoRotateSpeed = 0.5 }) {
  return (
    <>
      <ambientLight intensity={0.4} color="#ffffff" />
      
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
        color="#88ccff"
      />
      
      <directionalLight
        position={[0, -5, 0]}
        intensity={0.2}
        color="#ffddaa"
      />
      
      <pointLight
        position={[0, 3, 5]}
        intensity={0.3}
        color="#ffffff"
      />
      
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -6.5, 0]} 
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
      
      <gridHelper 
        args={[20, 20, '#444444', '#333333']} 
        position={[0, -6.5, 0]}
      />
    </>
  );
}
