import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky, Stars, Html } from '@react-three/drei';
import { useSimulation } from '../context/SimulationContext';
import { Button, Box, Typography } from '@mui/material';
import * as THREE from 'three';
import './Map3DView.css';

// Colors for better visuals
const COLORS = {
  grid: '#1a3045',
  gridLines: '#2a4055',
  rover: '#60a5fa',
  roverIndicator: '#ffffff',
  roverDetails: '#00b4ff',
  survivor: '#ff5252',
  survivorRescued: '#4ced69',
  terrain: '#203040',
  terrainHighlight: '#304050',
  highlight: '#3a5a70',
  scanner: '#00b4ff',
  gridTexture: '#1a3045',
  gridPattern: '#2a4055',
  scanBeam: '#00b4ff',
  scanArea: 'rgba(0, 180, 255, 0.1)',
  roverBody: '#2a2a2a',
  roverTrim: '#3a3a3a',
  solarPanel: '#1e3a8a',
  sensor: '#333333',
  camera: '#000080',
  wheel: '#1a1a1a',
  wheelRim: '#2a2a2a',
  survivorCritical: '#ff3333',
  survivorStable: '#4ced69',
  survivorInjured: '#ffa726',
  survivorText: '#ffffff',
  survivorBackground: 'rgba(0, 0, 0, 0.8)',
  survivorBorder: 'rgba(255, 255, 255, 0.2)',
  toolbarBackground: 'rgba(26, 48, 69, 0.95)',
  toolbarBorder: 'rgba(255, 255, 255, 0.1)',
  toolbarButton: 'rgba(255, 255, 255, 0.1)',
  toolbarButtonHover: 'rgba(255, 255, 255, 0.2)',
  toolbarButtonActive: 'rgba(96, 165, 250, 0.3)',
  toolbarText: '#ffffff',
  toolbarTextActive: '#60a5fa',
  toolbarIcon: '#ffffff',
  toolbarIconActive: '#60a5fa'
};

// Grid size
const GRID_SIZE = 20;
const CELL_SIZE = 1;

// Rover component
const Rover = ({ position, orientation, isRecharging = false, communicationActive = true }) => {
  const roverRef = useRef();
  
  // Animation
  useFrame(({ clock }) => {
    if (roverRef.current) {
      // Gentle hover animation - slightly more pronounced when recharging
      roverRef.current.position.y = 0.3 + Math.sin(clock.getElapsedTime() * (isRecharging ? 2 : 1.5)) * (isRecharging ? 0.08 : 0.05);
    }
  });

  // Convert Euler orientation (0-360) to radians for Three.js
  const orientationRad = (orientation * Math.PI) / 180;
  
  return (
    <group position={[position.x, 0.3, position.y]}>
      <group ref={roverRef}>
        {/* Main body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.25, 0.9]} />
          <meshStandardMaterial 
            color={COLORS.roverBody}
            metalness={0.8}
            roughness={0.2}
            emissive={COLORS.roverBody}
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Body trim */}
        <mesh position={[0, 0.125, 0]} castShadow>
          <boxGeometry args={[0.72, 0.02, 0.92]} />
          <meshStandardMaterial 
            color={COLORS.roverTrim}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        
        {/* Equipment housing */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.5, 0.15, 0.6]} />
          <meshStandardMaterial 
            color={COLORS.roverDetails}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        
        {/* Solar panels */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.6, 0.05, 0.8]} />
          <meshStandardMaterial 
            color={COLORS.solarPanel}
            metalness={0.9}
            roughness={0.1}
            emissive={COLORS.solarPanel}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Sensor array */}
        <mesh position={[0.35, 0.15, 0]} castShadow>
          <boxGeometry args={[0.2, 0.2, 0.3]} />
          <meshStandardMaterial 
            color={COLORS.sensor}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        
        {/* Camera lens */}
        <mesh position={[0.45, 0.15, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} rotation={[Math.PI/2, 0, 0]} />
          <meshStandardMaterial 
            color={COLORS.camera}
            metalness={0.9}
            roughness={0.1}
            emissive={COLORS.camera}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Wheels */}
        {[
          { x: -0.4, z: -0.5 },
          { x: 0.4, z: -0.5 },
          { x: -0.4, z: 0.5 },
          { x: 0.4, z: 0.5 }
        ].map((pos, i) => (
          <group key={i} position={[pos.x, -0.15, pos.z]}>
            {/* Wheel */}
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} rotation={[Math.PI/2, 0, 0]} />
              <meshStandardMaterial 
                color={COLORS.wheel}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            {/* Wheel rim */}
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.12, 0.1, 16]} rotation={[Math.PI/2, 0, 0]} />
              <meshStandardMaterial 
                color={COLORS.wheelRim}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </group>
        ))}
        
        {/* Status indicator */}
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial 
            color={
              !communicationActive ? "#ff3333" : 
              isRecharging ? "#ffcc00" : 
              "#50ff50"
            }
            emissive={
              !communicationActive ? "#ff3333" : 
              isRecharging ? "#ffcc00" : 
              "#50ff50"
            }
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* Direction indicator */}
        {(communicationActive && !isRecharging) && (
          <mesh 
            position={[
              0.25 * Math.cos(orientationRad), 
              0.15, 
              0.25 * Math.sin(orientationRad)
            ]}
            rotation={[0, orientationRad, 0]}
          >
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshStandardMaterial 
              color={COLORS.roverIndicator} 
              emissive={COLORS.roverIndicator}
              emissiveIntensity={0.3}
            />
          </mesh>
        )}
      </group>
      
      <Html position={[0, 1, 0]} center>
        <div style={{ 
          color: 'white', 
          backgroundColor: 'rgba(0,0,0,0.7)', 
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          Rover {isRecharging ? '(Recharging)' : ''}
          {!communicationActive && ' - Comm Lost'}
        </div>
      </Html>
    </group>
  );
};

// Scanning effect component
const ScanningEffect = ({ position, isScanning }) => {
  const scanRef = useRef();
  const [scanAngle, setScanAngle] = useState(0);
  const [scanRadius, setScanRadius] = useState(0);
  
  useFrame(({ clock }) => {
    if (scanRef.current && isScanning) {
      setScanAngle(prev => (prev + 2) % 360);
      setScanRadius(prev => (prev + 0.05 > 5 ? 0 : prev + 0.05));
      scanRef.current.rotation.y = scanAngle * Math.PI / 180;
    }
  });

  return (
    <group ref={scanRef} position={[position.x, 0.1, position.y]}>
      {/* Scanning beam */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 5]} />
        <meshStandardMaterial 
          color={COLORS.scanBeam}
          transparent
          opacity={0.7}
          emissive={COLORS.scanBeam}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Scanning area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial 
          color={COLORS.scanArea}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Scanning pulse effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[scanRadius, 32]} />
        <meshStandardMaterial 
          color={COLORS.scanBeam}
          transparent
          opacity={0.3 - (scanRadius / 5) * 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Scanning lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh 
          key={i}
          rotation={[-Math.PI / 2, (i * Math.PI) / 4, 0]}
          position={[0, 0.05, 0]}
        >
          <planeGeometry args={[0.1, 5]} />
          <meshStandardMaterial 
            color={COLORS.scanBeam}
            transparent
            opacity={0.3}
            emissive={COLORS.scanBeam}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

// Enhanced Survivor component
const Survivor = ({ survivor }) => {
  const survivorRef = useRef();
  const [isDetected, setIsDetected] = useState(false);
  
  useFrame(({ clock }) => {
    if (survivorRef.current) {
      // Gentle floating animation
      survivorRef.current.position.y = 0.3 + Math.sin(clock.getElapsedTime() * 1.5) * 0.1;
    }
  });

  // Get color based on status
  const getStatusColor = () => {
    switch (survivor.status) {
      case 'critical':
        return COLORS.survivorCritical;
      case 'stable':
        return COLORS.survivorStable;
      case 'injured':
        return COLORS.survivorInjured;
      default:
        return COLORS.survivor;
    }
  };

  // Get status text with icon
  const getStatusText = () => {
    switch (survivor.status) {
      case 'critical':
        return '⚠️ CRITICAL';
      case 'stable':
        return '✅ STABLE';
      case 'injured':
        return '🆘 INJURED';
      default:
        return survivor.status.toUpperCase();
    }
  };

  // Debug log survivor data
  console.log('Rendering survivor:', survivor);

  return (
    <group 
      ref={survivorRef}
      position={[survivor.position.x, 0.3, survivor.position.y]}
    >
      {/* Survivor marker */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={getStatusColor()}
          emissive={getStatusColor()}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Detection pulse effect */}
      {isDetected && (
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial 
            color={getStatusColor()}
            transparent
            opacity={0.3}
            emissive={getStatusColor()}
            emissiveIntensity={0.2}
          />
        </mesh>
      )}
      
      {/* Status indicator */}
      <Html position={[0, 1, 0]} center>
        <div style={{ 
          color: COLORS.survivorText,
          backgroundColor: COLORS.survivorBackground,
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          pointerEvents: 'none',
          border: `1px solid ${COLORS.survivorBorder}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ 
            fontSize: '16px',
            color: getStatusColor(),
            textShadow: '0 0 8px rgba(255,255,255,0.3)'
          }}>
            {survivor.name}
          </div>
          <div style={{ 
            fontSize: '12px',
            opacity: 0.9,
            letterSpacing: '0.5px'
          }}>
            {getStatusText()}
          </div>
        </div>
      </Html>
    </group>
  );
};

// Terrain component with improved grid texture
const Terrain = () => {
  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create grid pattern
    ctx.fillStyle = COLORS.gridTexture;
    ctx.fillRect(0, 0, 512, 512);
    
    ctx.strokeStyle = COLORS.gridPattern;
    ctx.lineWidth = 1;
    
    // Draw grid lines
    for (let i = 0; i <= 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
    
    // Add subtle noise texture
    const imageData = ctx.getImageData(0, 0, 512, 512);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.random() * 10;
      imageData.data[i] += noise;
      imageData.data[i + 1] += noise;
      imageData.data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
      <meshStandardMaterial 
        map={gridTexture}
        roughness={0.8}
        metalness={0.2}
        color={COLORS.terrain}
      />
    </mesh>
  );
};

// Camera controls
const Controls = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set initial camera position
    camera.position.set(10, 12, 18);
    camera.lookAt(10, 0, 10);
  }, [camera]);
  
  return (
    <OrbitControls 
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      target={[GRID_SIZE/2, 0, GRID_SIZE/2]}
      maxPolarAngle={Math.PI / 2 - 0.1}
      minDistance={3}
      maxDistance={30}
    />
  );
};

// Main Map3DView component
const Map3DView = ({ roverPos, roverOrientation, survivors = [], isRecharging = false, communicationActive = true }) => {
  const { isConnected, startSession } = useSimulation();
  const [activeTool, setActiveTool] = useState('move');
  
  // Default rover position for when not connected
  const defaultRoverPosition = { x: 10, y: 10 };
  const defaultRoverOrientation = 0;

  // Use default position when not connected or no position is provided
  const effectiveRoverPos = isConnected && roverPos ? roverPos : defaultRoverPosition;
  const effectiveOrientation = isConnected && roverOrientation !== undefined ? roverOrientation : defaultRoverOrientation;

  // Debug log survivors data
  console.log('Map3DView received survivors:', survivors);

  // Handle Connect button
  const handleConnect = () => {
    startSession();
  };

  // Filter survivors based on communication status
  const validSurvivors = communicationActive ? survivors : [];

  // Debug log valid survivors
  console.log('Valid survivors to display:', validSurvivors);

  // Toolbar buttons configuration
  const toolbarButtons = [
    { id: 'move', icon: '🔄', label: 'Move', tooltip: 'Move rover' },
    { id: 'scan', icon: '🔍', label: 'Scan', tooltip: 'Scan area' },
    { id: 'zoom', icon: '🔎', label: 'Zoom', tooltip: 'Zoom view' },
    { id: 'rotate', icon: '🔄', label: 'Rotate', tooltip: 'Rotate view' },
    { id: 'pan', icon: '✋', label: 'Pan', tooltip: 'Pan view' }
  ];

  return (
    <Box sx={{ 
      flexGrow: 1, 
      borderRadius: 1, 
      overflow: 'hidden', 
      position: 'relative', 
      height: '100%'
    }}>
      {!isConnected ? (
        <Box 
          sx={{ 
            height: '100%', 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(10, 25, 41, 0.9)',
            color: 'white',
            p: 2
          }}
        >
          <Typography variant="h6" align="center">
            Not Connected to Rover
          </Typography>
          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Please start a new session to connect to the rover.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleConnect}
            sx={{ mt: 2 }}
          >
            Start New Session
          </Button>
        </Box>
      ) : (
        <>
          {/* Multitoolbar */}
          <Box
            sx={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: COLORS.toolbarBackground,
              borderRadius: '12px',
              border: `1px solid ${COLORS.toolbarBorder}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000
            }}
          >
            {toolbarButtons.map((button) => (
              <Box
                key={button.id}
                onClick={() => setActiveTool(button.id)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: activeTool === button.id ? COLORS.toolbarButtonActive : COLORS.toolbarButton,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: COLORS.toolbarButtonHover
                  }
                }}
                title={button.tooltip}
              >
                <Typography
                  sx={{
                    fontSize: '20px',
                    color: activeTool === button.id ? COLORS.toolbarIconActive : COLORS.toolbarIcon
                  }}
                >
                  {button.icon}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '12px',
                    color: activeTool === button.id ? COLORS.toolbarTextActive : COLORS.toolbarText,
                    fontWeight: activeTool === button.id ? 'bold' : 'normal'
                  }}
                >
                  {button.label}
                </Typography>
              </Box>
            ))}
          </Box>

          <Canvas shadows gl={{ antialias: true }}>
            {/* Main camera */}
            <PerspectiveCamera makeDefault position={[10, 10, 15]} fov={50} />
            
            {/* Environment & Atmosphere */}
            <Stars radius={100} depth={50} count={3000} factor={4} />
            <Sky sunPosition={[100, 10, 100]} distance={1000} />
            <fog attach="fog" args={['#0a1525', 30, 50]} />
            
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[15, 20, 15]} 
              intensity={1.2} 
              castShadow 
            />
            <pointLight position={[5, 10, 5]} intensity={0.5} color="#bb9955" />
            <pointLight position={[15, 5, 15]} intensity={0.3} color="#5599bb" />
            
            {/* Scene elements */}
            <Terrain />
            
            {/* Rover with status properties */}
            <Rover 
              position={effectiveRoverPos} 
              orientation={effectiveOrientation} 
              isRecharging={isRecharging} 
              communicationActive={communicationActive} 
            />
            
            {/* Scanning effect */}
            <ScanningEffect 
              position={effectiveRoverPos} 
              isScanning={!isRecharging && communicationActive} 
            />
            
            {/* Only show survivors if communication is active */}
            {validSurvivors.map((survivor, index) => (
              <Survivor key={survivor.id || index} survivor={survivor} />
            ))}
            
            {/* Controls */}
            <Controls />
          </Canvas>
        </>
      )}
    </Box>
  );
};

export default Map3DView; 