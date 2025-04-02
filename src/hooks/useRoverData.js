// src/hooks/useRoverData.js
import { useState, useEffect } from 'react';
import roverService from '../services/roverService';

// --- API Configuration ---
// Now using local server endpoints
const POLLING_INTERVAL_MS = 2500; // How often to fetch data

export const useRoverData = () => {
    const [roverStatus, setRoverStatus] = useState(null);
    const [sensorData, setSensorData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    const startSession = async () => {
        console.log('[useRoverData] startSession called');
        setIsLoading(true);
        setError(null); // Clear previous errors
        setIsConnected(false); // Reset connection status
        setSessionId(null); // Clear previous session ID
        
        try {
            const response = await roverService.startSession();
            console.log('[useRoverData] roverService.startSession responded:', response);
            
            // Check if the response indicates an error occurred in the service
            if (response && response.error) {
                console.error('[useRoverData] Session start failed in service:', response.errorMessage);
                setError(`Connection failed: ${response.errorMessage}`);
                setIsConnected(false);
            } else if (response && response.session_id) {
                console.log('[useRoverData] Session started successfully. Session ID:', response.session_id);
                setSessionId(response.session_id);
                setIsConnected(true);
                setError(null); // Clear error on success
                
                // Immediately fetch initial data
                await fetchRoverData();
            } else {
                // Handle unexpected response format
                console.error('[useRoverData] Unexpected response format from roverService.startSession:', response);
                setError('Connection failed: Unexpected response from server.');
                setIsConnected(false);
                setSessionId(null);
            }
            
            return response; 

        } catch (hookError) {
            console.error('[useRoverData] Error during startSession execution:', hookError);
            setError('Connection failed: An unexpected error occurred.');
            setIsConnected(false);
            setSessionId(null);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRoverData = async () => {
        if (!isConnected) {
            console.log('Not connected to rover, skipping data fetch');
            return;
        }

        try {
            console.log('Fetching rover data...');
            const [statusResponse, sensorResponse] = await Promise.all([
                roverService.getRoverStatus(),
                roverService.getSensorData()
            ]);

            console.log('Rover status:', statusResponse);
            console.log('Sensor data:', sensorResponse);

            // Process status response and handle different formats
            if (statusResponse) {
                const processedStatus = {
                    ...statusResponse,
                    x: statusResponse.position?.x ?? statusResponse.x ?? 0,
                    y: statusResponse.position?.y ?? statusResponse.y ?? 0,
                    battery: statusResponse.battery ?? 100,
                    status: statusResponse.status ?? 'idle',
                    orientation: statusResponse.orientation ?? 0
                };
                
                // Only update if data has changed
                if (JSON.stringify(processedStatus) !== JSON.stringify(roverStatus)) {
                    setRoverStatus(processedStatus);
                }
            }

            // Process sensor data and ensure survivors array exists
            if (sensorResponse) {
                const processedSensorData = {
                    ...sensorResponse,
                    survivors: sensorResponse.survivors ?? []
                };
                
                // Only update if data has changed
                if (JSON.stringify(processedSensorData) !== JSON.stringify(sensorData)) {
                    setSensorData(processedSensorData);
                }
            }
            
            setError(null);
        } catch (error) {
            console.error('Error fetching rover data:', error);
            setError('Failed to fetch rover data. Please check your connection.');
        }
    };

    const moveRover = async (direction) => {
        if (!isConnected) {
            setError('Not connected to rover. Please start a new session.');
            return;
        }

        try {
            setError(null);
            console.log(`Moving rover in direction: ${direction}`);
            const response = await roverService.moveRover(direction);
            console.log('Move response:', response);
            
            // Immediately fetch updated data after movement
            await fetchRoverData();
        } catch (error) {
            console.error('Error moving rover:', error);
            setError('Failed to move rover. Please try again.');
        }
    };

    const stopRover = async () => {
        if (!isConnected) {
            setError('Not connected to rover. Please start a new session.');
            return;
        }

        try {
            setError(null);
            console.log('Stopping rover');
            const response = await roverService.stopRover();
            console.log('Stop response:', response);
            
            // Immediately fetch updated data after stopping
            await fetchRoverData();
        } catch (error) {
            console.error('Error stopping rover:', error);
            setError('Failed to stop rover. Please try again.');
        }
    };

    useEffect(() => {
        let intervalId;
        
        if (isConnected) {
            console.log('Starting data polling');
            // Initial fetch already happens in startSession
            intervalId = setInterval(fetchRoverData, POLLING_INTERVAL_MS);
        }

        return () => {
            if (intervalId) {
                console.log('Cleaning up polling interval');
                clearInterval(intervalId);
            }
        };
    }, [isConnected]);

    return {
        roverStatus,
        sensorData,
        error,
        isLoading,
        isConnected,
        sessionId,
        startSession,
        moveRover,
        stopRover,
        fetchRoverData
    };
};