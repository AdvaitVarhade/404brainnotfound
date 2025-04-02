import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { useSimulation } from '../context/SimulationContext';
import './RoverSimulation.css';

const RoverSimulation = () => {
    const {
        roverStatus,
        sensorData,
        fleetStatus,
        disasterData,
        survivors,
        isConnected,
        batteryLevel,
        isRecharging,
        communicationLost,
        moveRover,
        stopRover,
        startSession
    } = useSimulation();

    // Get rover orientation arrow
    const getRoverIcon = (orientation) => {
        switch (orientation) {
            case 0: return '↑';
            case 90: return '→';
            case 180: return '↓';
            case 270: return '←';
            default: return '↑';
        }
    };

    if (!isConnected) {
        return (
            <>
                <div className="back-button">
                    <Button 
                        component={Link} 
                        to="/" 
                        variant="outlined" 
                        color="primary"
                    >
                        ← Back to Dashboard
                    </Button>
                </div>
                <div className="not-connected">
                    <h2>Rover Not Connected</h2>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={startSession}
                    >
                        Connect to Rover
                    </Button>
                </div>
            </>
        );
    }

    return (
        <div className="rover-simulation">
            <div className="back-button">
                <Button 
                    component={Link} 
                    to="/" 
                    variant="outlined" 
                    color="primary"
                >
                    ← Back to Dashboard
                </Button>
            </div>
            
            <div className="simulation-header">
                <h2>Rover Simulation</h2>
                <div className="status-indicator">
                    Status: {roverStatus?.status || 'Unknown'}
                    {isRecharging && ' (Recharging)'}
                    {communicationLost && ' (Communication Lost)'}
                </div>
            </div>

            <div className="simulation-grid">
                <div className="grid-container">
                    {Array.from({ length: 20 }, (_, y) => (
                        <div key={y} className="grid-row">
                            {Array.from({ length: 20 }, (_, x) => {
                                const isRover = roverStatus?.position?.x !== undefined && 
                                               Math.floor(roverStatus.position.x) === x && 
                                               Math.floor(roverStatus.position.y) === y;
                                
                                const hasObstacle = (x === 15 && y === 15) || 
                                                  (x === 5 && y === 20) || 
                                                  (x === 25 && y === 5);
                                
                                const isSurvivor = survivors?.some(
                                    s => s.position && 
                                         Math.floor(s.position.x) === x && 
                                         Math.floor(s.position.y) === y
                                );

                                return (
                                    <div
                                        key={x}
                                        className={`grid-cell ${isRover ? 'rover' : ''} ${hasObstacle ? 'obstacle' : ''} ${isSurvivor ? 'survivor' : ''}`}
                                    >
                                        {isRover && getRoverIcon(roverStatus.orientation)}
                                        {hasObstacle && '🚧'}
                                        {isSurvivor && '🧑'}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div className="control-panel">
                <h3>Control Panel</h3>
                <div className="control-buttons">
                    <button
                        onClick={() => moveRover('forward')}
                        disabled={isRecharging || communicationLost}
                        className="control-btn forward"
                    >
                        ↑
                    </button>
                    <div className="horizontal-controls">
                        <button
                            onClick={() => moveRover('left')}
                            disabled={isRecharging || communicationLost}
                            className="control-btn left"
                        >
                            ←
                        </button>
                        <button
                            onClick={() => stopRover()}
                            disabled={isRecharging || communicationLost}
                            className="control-btn stop"
                        >
                            ⏹
                        </button>
                        <button
                            onClick={() => moveRover('right')}
                            disabled={isRecharging || communicationLost}
                            className="control-btn right"
                        >
                            →
                        </button>
                    </div>
                    <button
                        onClick={() => moveRover('backward')}
                        disabled={isRecharging || communicationLost}
                        className="control-btn backward"
                    >
                        ↓
                    </button>
                </div>
            </div>

            <div className="info-panels-container">
                <div className="sensor-panel">
                    <h3>Sensor Data {communicationLost && '(Signal Lost)'}</h3>
                    {sensorData && !communicationLost && (
                        <div className="sensor-readings">
                            <div>Temperature: {sensorData.temperature?.toFixed(1) || 'N/A'}°C</div>
                            <div>Humidity: {sensorData.humidity?.toFixed(1) || 'N/A'}%</div>
                            <div>Battery: {batteryLevel?.toFixed(1) || 'N/A'}%</div>
                            <div>Radiation: {sensorData.radiation?.toFixed(2) || 'N/A'} mSv</div>
                            <div>Pressure: {sensorData.pressure?.toFixed(0) || 'N/A'} hPa</div>
                            <div className={isRecharging ? 'highlight' : ''}>
                                Recharging: {isRecharging ? 'Yes' : 'No'}
                            </div>
                        </div>
                    )}
                    {communicationLost && (
                        <div className="sensor-readings error">
                            Communication lost with rover.
                            Battery level too low ({batteryLevel?.toFixed(1)}%).
                            Waiting for battery to recharge above 10%.
                        </div>
                    )}
                </div>

                <div className="fleet-panel">
                    <h3>Fleet Status</h3>
                    {fleetStatus && fleetStatus[0] && (
                        <div className="fleet-info">
                            <div>Rover ID: {fleetStatus[0].id}</div>
                            <div>Name: {fleetStatus[0].name}</div>
                            <div>Mission: {fleetStatus[0].mission}</div>
                            <div className={batteryLevel < 20 ? 'warning' : ''}>
                                Battery: {batteryLevel?.toFixed(1) || 'N/A'}%
                            </div>
                        </div>
                    )}
                </div>

                <div className="survivor-panel">
                    <h3>Detected Survivors</h3>
                    <div className="survivor-list">
                        {survivors && survivors.length > 0 ? (
                            survivors.map((survivor, index) => (
                                <div key={index} className="survivor-info">
                                    <div>{survivor.name}</div>
                                    <div>Position: ({survivor.position.x.toFixed(1)}, {survivor.position.y.toFixed(1)})</div>
                                    <div>Time Remaining: {survivor.timeRemaining} min</div>
                                </div>
                            ))
                        ) : (
                            <div className="no-survivors">No survivors detected yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoverSimulation; 