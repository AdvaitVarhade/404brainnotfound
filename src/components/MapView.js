// src/components/MapView.js
import React, { useState, useRef, useEffect } from 'react';
import './MapView.css'; // Keep your existing CSS file
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import { useRoverData } from '../hooks/useRoverData';
import axios from 'axios';

// Constants for map view interactivity
const INITIAL_VIEWBOX_SIZE = 40; // Initial visible area (+/- 20 from center)
const MIN_ZOOM = 5;
const MAX_ZOOM = 100;
const ZOOM_SENSITIVITY = 0.001;

// Constants for map dimensions and scaling
const MAP_WIDTH = 600;
const MAP_HEIGHT = 400;
const GRID_SIZE = 20;
const CELL_SIZE = MAP_WIDTH / GRID_SIZE;

// Accept props from Dashboard (roverPos, roverOrientation, survivors)
const MapView = ({ roverPos, roverOrientation, survivors }) => {
    const { error, isLoading, isConnected, startSession } = useRoverData();
    const svgRef = useRef(null);
    const [viewBox, setViewBox] = useState({
        x: -INITIAL_VIEWBOX_SIZE / 2,
        y: -INITIAL_VIEWBOX_SIZE / 2,
        width: INITIAL_VIEWBOX_SIZE,
        height: INITIAL_VIEWBOX_SIZE,
    });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    // Default rover position for when not connected
    const defaultRoverPosition = { x: 10, y: 10 };
    const defaultRoverOrientation = 0;

    // Keep animation state for visual effects
    const [scanAngle, setScanAngle] = useState(0);
    const [scanRadius, setScanRadius] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true); // Keep flag to toggle effects

    // Animation frame handling (Simplified: Only runs scan animations now)
    useEffect(() => {
        let animFrameId;
        let lastTimestamp = 0;

        const animate = (timestamp) => {
            if (!isAnimating) {
                lastTimestamp = 0;
                animFrameId = requestAnimationFrame(animate);
                return;
            }
            if (!lastTimestamp) lastTimestamp = timestamp;
            lastTimestamp = timestamp;

            // Scan animation ONLY
            setScanAngle(prev => (prev + 2) % 360);
            setScanRadius(prev => (prev + 0.05 > 5 ? 0 : prev + 0.05));

            animFrameId = requestAnimationFrame(animate);
        };

        animFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animFrameId);
    }, [isAnimating]);

    // Helper function to convert coordinates to pixel positions
    const getPixelPosition = (x, y) => ({
        x: (x + GRID_SIZE / 2) * CELL_SIZE,
        y: (GRID_SIZE / 2 - y) * CELL_SIZE
    });

    // Helper function to draw a grid cell
    const drawGridCell = (x, y, color = '#f0f0f0') => (
        <rect
            key={`${x}-${y}`}
            x={x * CELL_SIZE}
            y={y * CELL_SIZE}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill={color}
            stroke="#ddd"
            strokeWidth="0.5"
        />
    );

    // Generate grid cells
    const gridCells = [];
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            gridCells.push(drawGridCell(x, y));
        }
    }

    // Use default position when not connected or no position is provided
    const effectiveRoverPos = isConnected && roverPos ? roverPos : defaultRoverPosition;
    const effectiveOrientation = isConnected && roverOrientation !== undefined ? roverOrientation : defaultRoverOrientation;

    // Draw rover
    const roverPixelPos = getPixelPosition(effectiveRoverPos.x, effectiveRoverPos.y);
    const roverElement = roverPixelPos ? (
        <g key="rover">
            {/* Rover body */}
            <circle
                cx={roverPixelPos.x}
                cy={roverPixelPos.y}
                r={CELL_SIZE * 0.4}
                fill={isConnected ? "#2196f3" : "#9e9e9e"}
                stroke={isConnected ? "#1976d2" : "#757575"}
                strokeWidth="2"
            />
            {/* Rover direction indicator */}
            <line
                x1={roverPixelPos.x}
                y1={roverPixelPos.y}
                x2={roverPixelPos.x + Math.cos(effectiveOrientation * Math.PI / 180) * CELL_SIZE * 0.3}
                y2={roverPixelPos.y - Math.sin(effectiveOrientation * Math.PI / 180) * CELL_SIZE * 0.3}
                stroke="#fff"
                strokeWidth="2"
            />
        </g>
    ) : null;

    // Draw survivors
    const survivorElements = isConnected && survivors && survivors.length > 0 ? survivors.map((survivor, index) => {
        const survivorPixelPos = getPixelPosition(survivor.location.x, survivor.location.y);
        return (
            <g key={`survivor-${index}`}>
                <circle
                    cx={survivorPixelPos.x}
                    cy={survivorPixelPos.y}
                    r={CELL_SIZE * 0.3}
                    fill="#f44336"
                    stroke="#d32f2f"
                    strokeWidth="2"
                />
                <text
                    x={survivorPixelPos.x}
                    y={survivorPixelPos.y + CELL_SIZE * 0.4}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="12"
                >
                    {survivor.id}
                </text>
            </g>
        );
    }) : [];

    // getSvgCoordinates function
    const getSvgCoordinates = (screenX, screenY) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        
        const svgElement = svgRef.current;
        const point = svgElement.createSVGPoint();
        point.x = screenX;
        point.y = screenY;
        
        const ctm = svgElement.getScreenCTM().inverse();
        const svgPoint = point.matrixTransform(ctm);
        
        return {
            x: svgPoint.x,
            y: svgPoint.y
        };
    };

    // Mouse Event Handlers for Pan & Zoom
    const handleMouseDown = (e) => {
        if (e.button === 0) { // Left mouse button
            setIsPanning(true);
            const point = getSvgCoordinates(e.clientX, e.clientY);
            setPanStart(point);
        }
    };
    
    const handleMouseMove = (e) => {
        if (isPanning && svgRef.current) {
            const point = getSvgCoordinates(e.clientX, e.clientY);
            const dx = point.x - panStart.x;
            const dy = point.y - panStart.y;
            
            setViewBox(prev => ({
                ...prev,
                x: prev.x - dx,
                y: prev.y - dy
            }));
        }
    };
    
    const handleMouseUpOrLeave = () => {
        setIsPanning(false);
    };
    
    const handleWheel = (e) => {
        e.preventDefault();
        
        const wheelDelta = e.deltaY * ZOOM_SENSITIVITY;
        const mousePos = getSvgCoordinates(e.clientX, e.clientY);
        
        setViewBox(prev => {
            const newWidth = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.width * (1 + wheelDelta)));
            const newHeight = newWidth * (prev.height / prev.width);
            
            const widthChange = newWidth - prev.width;
            const heightChange = newHeight - prev.height;
            
            // Adjust viewbox to zoom centered on mouse position
            const newX = prev.x - (mousePos.x - prev.x) * (widthChange / prev.width);
            const newY = prev.y - (mousePos.y - prev.y) * (heightChange / prev.height);
            
            return {
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight
            };
        });
    };

    // Toggle animation button
    const toggleAnimation = () => {
        setIsAnimating(prev => !prev);
    };

    // Set cursor style
    useEffect(() => {
        if (svgRef.current) {
            svgRef.current.style.cursor = isPanning ? 'grabbing' : 'grab';
        }
    }, [isPanning]);

    // Handle Connect button
    const handleConnect = () => {
        startSession();
    };

    // --- Render Logic ---
    // Check if rover data is valid
    const isRoverDataValid = effectiveRoverPos && typeof effectiveRoverPos.x === 'number' && typeof effectiveRoverPos.y === 'number';
    const safeOrientation = effectiveOrientation ?? 0;

    // Calculate rover path
    let roverPath = '';
    if (isRoverDataValid) {
        const roverSize = 0.8; // Size in grid units
        const orientationRad = safeOrientation * Math.PI / 180;
        roverPath = `M ${effectiveRoverPos.x + roverSize / 1.5 * Math.cos(orientationRad)} ${effectiveRoverPos.y + roverSize / 1.5 * Math.sin(orientationRad)} ` +
                    `L ${effectiveRoverPos.x + roverSize / 2 * Math.cos((safeOrientation + 150) * Math.PI / 180)} ${effectiveRoverPos.y + roverSize / 2 * Math.sin((safeOrientation + 150) * Math.PI / 180)} ` +
                    `L ${effectiveRoverPos.x + roverSize / 2 * Math.cos((safeOrientation - 150) * Math.PI / 180)} ${effectiveRoverPos.y + roverSize / 2 * Math.sin((safeOrientation - 150) * Math.PI / 180)} ` +
                    `Z`;
    }

    const viewBoxString = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;

    // getScanLinePath function
    const getScanLinePath = () => {
        if (!isRoverDataValid) return ''; // Don't draw if no rover position
        const scanLineLength = 8;
        const angleRad = scanAngle * Math.PI / 180;
        return `M ${effectiveRoverPos.x} ${effectiveRoverPos.y} L ${effectiveRoverPos.x + scanLineLength * Math.cos(angleRad)} ${effectiveRoverPos.y + scanLineLength * Math.sin(angleRad)}`;
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'error.light' }} className="mapview-error">
                <Typography color="error" variant="h6">
                    {error}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Please check your internet connection and try again.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {!isConnected && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1, textAlign: 'center' }}>
                    <Typography color="warning.dark" variant="body1">
                        Not Connected to Rover
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleConnect}
                        sx={{ mt: 1 }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Connecting...' : 'Connect Now'}
                    </Button>
                </Box>
            )}
            
            <Box sx={{ flexGrow: 1, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                    <button 
                        onClick={toggleAnimation} 
                        style={{ 
                            padding: '4px 8px', 
                            background: isAnimating ? '#fff' : '#f5f5f5',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {isAnimating ? 'Pause' : 'Resume'} Animation
                    </button>
                </Box>
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    onWheel={handleWheel}
                    style={{ background: '#1a1a1a' }}
                >
                    <g>
                        {/* Grid cells */}
                        {gridCells}
                        
                        {/* Rover visualization */}
                        {roverElement}
                        
                        {/* Survivors */}
                        {survivorElements}
                        
                        {/* Scan line animation */}
                        {isAnimating && (
                            <path
                                d={getScanLinePath()}
                                stroke="rgba(33, 150, 243, 0.7)"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                            />
                        )}
                        
                        {/* Scan radius animation */}
                        {isAnimating && isRoverDataValid && (
                            <circle
                                cx={effectiveRoverPos.x}
                                cy={effectiveRoverPos.y}
                                r={scanRadius}
                                fill="none"
                                stroke="rgba(33, 150, 243, 0.3)"
                                strokeWidth="1"
                            />
                        )}
                    </g>
                </svg>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    Position: ({effectiveRoverPos?.x.toFixed(1)}, {effectiveRoverPos?.y.toFixed(1)})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Orientation: {safeOrientation}°
                </Typography>
            </Box>
        </Box>
    );
};

export default MapView;