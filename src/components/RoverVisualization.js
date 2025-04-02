import React, { useRef, useState, useEffect } from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import TerrainStatus from './TerrainStatus';

// Improved rover model with better details
const RoverModel = () => {
  return (
    <group>
      {/* Rover body - more detailed with beveled edges */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[2, 0.5, 1.5]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.7} />
      </mesh>
      
      {/* Solar panel on top */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.8, 0.05, 1.3]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Sensor array front */}
      <mesh position={[1.1, 0.35, 0]}>
        <boxGeometry args={[0.2, 0.3, 0.8]} />
        <meshStandardMaterial color="#333333" roughness={0.4} metalness={0.6} />
      </mesh>
      
      {/* Camera lens */}
      <mesh position={[1.21, 0.4, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[1.24, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#000080" roughness={0.1} metalness={0.9} />
      </mesh>
      
      {/* Antenna */}
      <mesh position={[0, 0.8, 0.5]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.01, 0.6, 8]} />
        <meshStandardMaterial color="#888888" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 1.1, 0.55]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ff0000" roughness={0.3} emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Wheels with treads */}
      {[
        [-0.8, -0.15, 0.7], // front left
        [0.8, -0.15, 0.7],  // front right
        [-0.8, -0.15, -0.7], // back left
        [0.8, -0.15, -0.7]   // back right
      ].map((position, index) => (
        <group key={index} position={position}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 24]} />
            <meshStandardMaterial color="#333" roughness={0.8} metalness={0.2} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.4, 0.08, 8, 24]} />
            <meshStandardMaterial color="#222" roughness={0.9} />
          </mesh>
        </group>
      ))}
      
      {/* Robotic arm base */}
      <mesh position={[0, 0.5, -0.7]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#444444" roughness={0.5} metalness={0.8} />
      </mesh>
      
      {/* Robotic arm segments */}
      <mesh position={[0, 0.65, -0.7]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#555555" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0.15, 0.8, -0.7]}>
        <boxGeometry args={[0.4, 0.1, 0.08]} />
        <meshStandardMaterial color="#555555" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0.35, 0.75, -0.7]}>
        <boxGeometry args={[0.1, 0.2, 0.07]} />
        <meshStandardMaterial color="#555555" roughness={0.4} metalness={0.7} />
      </mesh>
      
      {/* Claw */}
      <mesh position={[0.35, 0.6, -0.7]}>
        <boxGeometry args={[0.05, 0.1, 0.15]} />
        <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.8} />
      </mesh>
      
      {/* Lights */}
      <pointLight position={[1.1, 0.3, 0]} intensity={0.5} distance={2} color="#ffffff" />
      <mesh position={[1.1, 0.3, 0.3]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[1.1, 0.3, -0.3]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

// Improved scene settings
const RoverScene = ({ roll, pitch, yaw }) => {
  const orbitalControlsRef = useRef();
  
  useFrame(() => {
    if (orbitalControlsRef.current) {
      orbitalControlsRef.current.update();
    }
  });
  
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [3, 3, 4], fov: 50 }}>
      <color attach="background" args={['#111']} />
      <hemisphereLight intensity={0.2} groundColor="black" />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={1}
        castShadow
      />
      <directionalLight
        position={[-10, 10, -5]}
        intensity={0.5}
        castShadow
      />
      
      {/* Environment and reflections */}
      <Environment preset="city" />
      
      {/* Grid for visual reference */}
      <gridHelper position={[0, -0.55, 0]} args={[10, 10, `#444444`, `#222222`]} />
      
      {/* The rover with orientation */}
      <group rotation={[pitch, yaw, roll]}>
        <RoverModel />
      </group>
      
      {/* Controls */}
      <OrbitControls 
        ref={orbitalControlsRef} 
        minDistance={3} 
        maxDistance={10}
        enablePan={false}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}; 