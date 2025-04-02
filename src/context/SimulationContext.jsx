import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { simulationService } from '../services/simulationService';

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
    const [sessionId, setSessionId] = useState(null);
    const [roverStatus, setRoverStatus] = useState(null);
    const [sensorData, setSensorData] = useState(null);
    const [fleetStatus, setFleetStatus] = useState(null);
    const [disasterData, setDisasterData] = useState(null);
    const [survivors, setSurvivors] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [batteryLevel, setBatteryLevel] = useState(70);
    const [isRecharging, setIsRecharging] = useState(false);
    const [communicationLost, setCommunicationLost] = useState(false);
    const [eventLog, setEventLog] = useState([]);
    
    // Add event to log with timestamp
    const addEventToLog = useCallback((event) => {
        const timestamp = new Date().toLocaleTimeString();
        setEventLog(prevLog => [
            { id: Date.now(), timestamp, message: event },
            ...prevLog.slice(0, 99) // Keep last 100 events
        ]);
    }, []);

    // Start session
    const startSession = useCallback(async () => {
        try {
            const result = await simulationService.startSession();
            setSessionId(result.sessionId);
            setIsConnected(true);
            setBatteryLevel(70);
            setIsRecharging(false);
            setCommunicationLost(false);
            setSurvivors([]);
            addEventToLog('Session started. Connected to rover.');
        } catch (error) {
            addEventToLog(`Failed to start session: ${error.message}`);
        }
    }, [addEventToLog]);

    // Stop session
    const stopSession = useCallback(async () => {
        if (sessionId) {
            await simulationService.stopSession();
            setSessionId(null);
            setIsConnected(false);
            addEventToLog('Session stopped. Disconnected from rover.');
        }
    }, [sessionId, addEventToLog]);

    // Poll for updates
    useEffect(() => {
        let interval;
        
        if (isConnected) {
            // Poll every 5 seconds
            interval = setInterval(async () => {
                try {
                    // Get rover status
                    const status = await simulationService.getRoverStatus();
                    setRoverStatus(status);
                    
                    // Track battery level changes
                    if (batteryLevel !== status.batteryLevel) {
                        setBatteryLevel(status.batteryLevel);
                        
                        // Log significant battery events
                        if (status.batteryLevel <= 5 && batteryLevel > 5) {
                            addEventToLog(`Warning: Battery critically low (${status.batteryLevel.toFixed(1)}%). Starting recharge.`);
                        } else if (status.batteryLevel >= 80 && batteryLevel < 80 && status.isRecharging) {
                            addEventToLog(`Battery reached ${status.batteryLevel.toFixed(1)}%. Recharging complete.`);
                        } else if (status.batteryLevel < 10 && batteryLevel >= 10) {
                            addEventToLog(`Warning: Battery below 10% (${status.batteryLevel.toFixed(1)}%). Communication may be lost.`);
                        }
                    }
                    
                    // Track recharging state changes
                    if (isRecharging !== status.isRecharging) {
                        setIsRecharging(status.isRecharging);
                        if (status.isRecharging) {
                            addEventToLog(`Rover entered recharging mode. Operations paused.`);
                        } else {
                            addEventToLog(`Rover exited recharging mode. Operations resumed.`);
                        }
                    }
                    
                    // Track communication state changes
                    if (communicationLost !== !status.communicationActive) {
                        setCommunicationLost(!status.communicationActive);
                        if (!status.communicationActive) {
                            addEventToLog(`Communication lost with rover. Battery level: ${status.batteryLevel.toFixed(1)}%`);
                        } else {
                            addEventToLog(`Communication re-established with rover.`);
                        }
                    }
                    
                    // Only get sensor data, fleet status and disaster data if communication is active
                    if (status.communicationActive) {
                        // Get sensor data
                        const sensorResult = await simulationService.getSensorData();
                        setSensorData(sensorResult);
                        
                        console.log('Current survivors state:', survivors);
                        console.log('Sensor data survivors:', sensorResult.survivors);
                        
                        // Check for newly detected survivors
                        if (sensorResult.survivors && sensorResult.survivors.length > 0) {
                            // Find new survivors (not already in our state)
                            const knownSurvivorIds = survivors.map(s => s.id);
                            console.log('Known survivor IDs:', knownSurvivorIds);
                            
                            const newSurvivors = sensorResult.survivors.filter(
                                s => !knownSurvivorIds.includes(s.id)
                            );
                            
                            console.log('New survivors detected:', newSurvivors);
                            
                            // Log new survivors and update state
                            if (newSurvivors.length > 0) {
                                newSurvivors.forEach(survivor => {
                                    addEventToLog(`Survivor detected: ${survivor.name} at position (${survivor.position.x.toFixed(1)}, ${survivor.position.y.toFixed(1)})`);
                                });
                                
                                setSurvivors(prevSurvivors => {
                                    console.log('Previous survivors:', prevSurvivors);
                                    const updated = [...prevSurvivors, ...newSurvivors];
                                    console.log('Updated survivors:', updated);
                                    return updated;
                                });
                            }
                        }
                        
                        // Get fleet status
                        const fleetResult = await simulationService.getFleetStatus();
                        setFleetStatus(fleetResult);
                        
                        // Get disaster data
                        const disasterResult = await simulationService.getDisasterData();
                        setDisasterData(disasterResult);
                    }
                } catch (error) {
                    addEventToLog(`Error polling for updates: ${error.message}`);
                }
            }, 5000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isConnected, addEventToLog, batteryLevel, isRecharging, communicationLost]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (sessionId) {
                simulationService.stopSession();
            }
        };
    }, [sessionId]);

    // Function to check for survivors after movement
    const checkForSurvivorsAfterMovement = useCallback(async () => {
        if (!isConnected || communicationLost) return;
        
        try {
            // Get sensor data to check for survivors
            const sensorResult = await simulationService.getSensorData();
            setSensorData(sensorResult);
            
            console.log('Checking for survivors after movement');
            console.log('Current survivors state:', survivors);
            console.log('Sensor data survivors:', sensorResult.survivors);
            
            // Check for newly detected survivors
            if (sensorResult.survivors && sensorResult.survivors.length > 0) {
                // Find new survivors (not already in our state)
                const currentSurvivors = survivors || [];
                const knownSurvivorIds = currentSurvivors.map(s => s.id);
                
                const newSurvivors = sensorResult.survivors.filter(
                    s => !knownSurvivorIds.includes(s.id)
                );
                
                // Log new survivors and update state
                if (newSurvivors.length > 0) {
                    newSurvivors.forEach(survivor => {
                        addEventToLog(`Survivor detected: ${survivor.name} at position (${survivor.position.x.toFixed(1)}, ${survivor.position.y.toFixed(1)})`);
                    });
                    
                    setSurvivors(prevSurvivors => [...prevSurvivors, ...newSurvivors]);
                }
            }
        } catch (error) {
            console.error('Error checking for survivors after movement:', error);
        }
    }, [isConnected, communicationLost, survivors, addEventToLog, setSensorData]);

    // Move rover
    const moveRover = useCallback(async (direction, targetOrientation) => {
        if (!isConnected || communicationLost || isRecharging) {
            // Don't try to move if not connected or communication lost or recharging
            const reason = !isConnected ? 'not connected' : 
                           communicationLost ? 'communication lost' :
                           'recharging in progress';
            addEventToLog(`Cannot move rover: ${reason}`);
            return;
        }
        
        try {
            // If it's a directional command, pass both parameters
            let result;
            if (direction === 'directional' && targetOrientation !== undefined) {
                result = await simulationService.moveRover(direction, targetOrientation);
                // Log the actual movement direction based on orientation
                const directionNames = {
                    0: 'north',
                    90: 'east',
                    180: 'south',
                    270: 'west'
                };
                if (result.status === 'success') {
                    addEventToLog(`Moving rover ${directionNames[targetOrientation] || 'in direction ' + targetOrientation}`);
                    
                    // Check for survivors immediately after successful movement
                    checkForSurvivorsAfterMovement();
                } else {
                    addEventToLog(`Failed to move rover: ${result.message}`);
                }
            } else {
                // Traditional direction command
                result = await simulationService.moveRover(direction);
                if (result.status === 'success') {
                    addEventToLog(`Moving rover ${direction}`);
                    
                    // Check for survivors immediately after successful movement
                    checkForSurvivorsAfterMovement();
                } else {
                    addEventToLog(`Failed to move rover: ${result.message}`);
                }
            }
        } catch (error) {
            addEventToLog(`Error moving rover: ${error.message}`);
        }
    }, [isConnected, communicationLost, isRecharging, addEventToLog, checkForSurvivorsAfterMovement]);
    
    // Stop rover
    const stopRover = useCallback(async () => {
        if (!isConnected || communicationLost) {
            // Don't try to stop if not connected or communication lost
            addEventToLog(`Cannot stop rover: ${!isConnected ? 'not connected' : 'communication lost'}`);
            return;
        }
        
        try {
            const result = await simulationService.stopRover();
            if (result.status === 'success') {
                addEventToLog('Rover stopped');
            } else {
                addEventToLog(`Failed to stop rover: ${result.message}`);
            }
        } catch (error) {
            addEventToLog(`Error stopping rover: ${error.message}`);
        }
    }, [isConnected, communicationLost, addEventToLog]);

    const contextValue = {
        sessionId,
        roverStatus,
        sensorData,
        fleetStatus,
        disasterData,
        survivors,
        isConnected,
        batteryLevel,
        isRecharging,
        communicationLost,
        eventLog,
        startSession,
        stopSession,
        moveRover,
        stopRover
    };

    return (
        <SimulationContext.Provider value={contextValue}>
            {children}
        </SimulationContext.Provider>
    );
};

export const useSimulation = () => {
    const context = useContext(SimulationContext);
    if (!context) {
        throw new Error('useSimulation must be used within a SimulationProvider');
    }
    return context;
}; 