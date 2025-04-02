import React, { useEffect, useState, useCallback } from 'react';
import { Box, Grid, Paper, Typography, Button, Alert, Stack, IconButton, Chip } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StopIcon from '@mui/icons-material/Stop';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import SignalWifiStatusbarConnectedNoInternet4Icon from '@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4';
import WifiIcon from '@mui/icons-material/Wifi';
import { useSimulation } from '../context/SimulationContext';
import Map3DView from './Map3DView';
import Sensors from './Sensors';
import RoverStatus from './RoverStatus';
import SurvivorList from './SurvivorList';
import EventLog from './EventLog';

const Dashboard = () => {
  const { 
    isConnected, 
    roverStatus, 
    fleetStatus, 
    sensorData, 
    disasterData,
    survivors,
    moveRover, 
    stopRover,
    eventLog,
  } = useSimulation();

  const [direction, setDirection] = useState(null);

  // Extract battery level, recharging status, and communication status from rover status
  const batteryLevel = roverStatus?.batteryLevel || 0;
  const isRecharging = roverStatus?.isRecharging || false;
  const communicationActive = roverStatus?.communicationActive !== false; // Default to true if undefined
  
  // For debugging in console
  useEffect(() => {
    console.log('Rover Status:', roverStatus);
    console.log('Battery Level:', batteryLevel);
    console.log('Position:', roverStatus?.position);
    console.log('Orientation:', roverStatus?.orientation);
    console.log('Connection Status:', isConnected);
    console.log('Communication Status:', communicationActive);
    console.log('Recharging Status:', isRecharging);
  }, [roverStatus, isConnected, communicationActive, isRecharging]);

  // Check if controls should be disabled
  const controlsDisabled = !isConnected || isRecharging || !communicationActive;

  // Function to handle directional movement - DEFINE THIS BEFORE IT'S USED
  const handleDirectionalMove = useCallback((targetOrientation) => {
    if (controlsDisabled) return;
    
    // Set rover orientation and move forward in that direction
    if (roverStatus) {
      console.log(`Handling directional move to orientation: ${targetOrientation}`);
      // Only set direction state for the corresponding UI button highlight
      if (targetOrientation === 0) setDirection('forward');
      else if (targetOrientation === 180) setDirection('backward');
      else if (targetOrientation === 270) setDirection('left');
      else if (targetOrientation === 90) setDirection('right');
      
      // Send the orientation and movement command
      moveRover('directional', targetOrientation);
    }
  }, [controlsDisabled, moveRover, roverStatus]);
  
  // Handle movement button clicks
  const handleMove = useCallback((newDirection) => {
    if (!controlsDisabled) {
      setDirection(newDirection);
      // Use the directional interface for UI buttons too
      if (newDirection === 'forward') {
        moveRover('directional', 0); // North
      } else if (newDirection === 'backward') {
        moveRover('directional', 180); // South
      } else if (newDirection === 'left') {
        moveRover('directional', 270); // West
      } else if (newDirection === 'right') {
        moveRover('directional', 90); // East
      }
    }
  }, [controlsDisabled, moveRover]);

  // Handle stop button click
  const handleStop = useCallback(() => {
    if (!isConnected) return;
    setDirection(null);
    stopRover();
  }, [isConnected, stopRover]);

  // Render battery status indicator based on level and recharging state
  const getBatteryStatus = () => {
    if (isRecharging) {
      return (
        <Chip
          icon={<BatteryChargingFullIcon />}
          label={`Recharging: ${batteryLevel}%`}
          color="warning"
          variant="outlined"
          sx={{ 
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 0.6 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0.6 }
            }
          }}
        />
      );
    } else if (batteryLevel < 20) {
      return (
        <Chip
          icon={<BatteryAlertIcon />}
          label={`Battery: ${batteryLevel}%`}
          color="error"
          variant="outlined"
        />
      );
    } else {
      return (
        <Chip
          icon={<BatteryAlertIcon />}
          label={`Battery: ${batteryLevel}%`}
          color="success"
          variant="outlined"
        />
      );
    }
  };

  // Add keyboard controls for WASD keys - direct movement style
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (controlsDisabled) return;
      
      console.log('Key pressed:', e.key.toLowerCase());
      
      switch (e.key.toLowerCase()) {
        case 'w': // Up/North
          handleDirectionalMove(0);
          break;
        case 's': // Down/South
          handleDirectionalMove(180);
          break;
        case 'a': // Left/West
          handleDirectionalMove(270);
          break;
        case 'd': // Right/East
          handleDirectionalMove(90);
          break;
        case ' ':  // Spacebar
          handleStop();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [controlsDisabled, handleStop, handleDirectionalMove]); // Add handleDirectionalMove to the dependency array

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      {/* Connection Status Alerts */}
      {!isConnected && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Not connected to rover. Please start a new session.
        </Alert>
      )}
      
      {isConnected && !communicationActive && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Communication lost: Battery level below 10%. The rover will automatically recharge to restore communication.
        </Alert>
      )}
      
      {isConnected && communicationActive && isRecharging && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Rover is recharging. Operations paused until battery reaches 80%. Current level: {batteryLevel}%
        </Alert>
      )}
      
      {isConnected && communicationActive && !isRecharging && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Connected to rover. All systems operational.
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* 3D View */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 1, height: '500px' }}>
            <Map3DView 
              roverPos={roverStatus?.position}
              roverOrientation={roverStatus?.orientation}
              survivors={survivors}
              isRecharging={isRecharging}
              communicationActive={communicationActive}
            />
          </Paper>
        </Grid>

        {/* Controls & Status */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            {/* Rover Controls */}
            <Paper sx={{ p: 2, position: 'relative' }}>
              <Typography variant="h6" gutterBottom>
                Rover Controls
                <Box component="span" sx={{ ml: 2, display: 'inline-flex', gap: 1 }}>
                  {getBatteryStatus()}
                  <Chip
                    icon={communicationActive ? <WifiIcon /> : <SignalWifiStatusbarConnectedNoInternet4Icon />}
                    label={communicationActive ? "Connected" : "No Signal"}
                    color={communicationActive ? "success" : "error"}
                    variant="outlined"
                  />
                </Box>
              </Typography>
              
              {/* Overlay message when controls are disabled */}
              {controlsDisabled && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6" color="white" align="center">
                    {isRecharging ? "Controls disabled while recharging" : 
                     !communicationActive ? "Communication lost - Cannot control rover" :
                     "Not connected to rover"}
                  </Typography>
                </Box>
              )}
              
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item xs={12} align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton 
                      color={direction === 'forward' ? 'primary' : 'default'} 
                      onClick={() => handleMove('forward')}
                      disabled={controlsDisabled}
                      size="large"
                      aria-label="Move forward"
                    >
                      <ArrowUpwardIcon fontSize="large" />
                    </IconButton>
                    <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.7 }}>W</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4} align="right">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton 
                      color={direction === 'left' ? 'primary' : 'default'} 
                      onClick={() => handleMove('left')}
                      disabled={controlsDisabled}
                      size="large"
                      aria-label="Turn left"
                    >
                      <ArrowBackIcon fontSize="large" />
                    </IconButton>
                    <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.7 }}>A</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4} align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton 
                      color="secondary" 
                      onClick={handleStop}
                      disabled={controlsDisabled}
                      size="large"
                      aria-label="Stop"
                    >
                      <StopIcon fontSize="large" />
                    </IconButton>
                    <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.7 }}>SPACE</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4} align="left">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton 
                      color={direction === 'right' ? 'primary' : 'default'} 
                      onClick={() => handleMove('right')}
                      disabled={controlsDisabled}
                      size="large"
                      aria-label="Turn right"
                    >
                      <ArrowForwardIcon fontSize="large" />
                    </IconButton>
                    <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.7 }}>D</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton 
                      color={direction === 'backward' ? 'primary' : 'default'} 
                      onClick={() => handleMove('backward')}
                      disabled={controlsDisabled}
                      size="large"
                      aria-label="Move backward"
                    >
                      <ArrowDownwardIcon fontSize="large" />
                    </IconButton>
                    <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.7 }}>S</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Status Components */}
            <RoverStatus roverStatus={roverStatus} fleetStatus={fleetStatus} />
            <Sensors sensorData={sensorData} communicationActive={communicationActive} />
          </Stack>
        </Grid>

        {/* Lower Section - Survivors and Event Log */}
        <Grid item xs={12} md={6}>
          <SurvivorList survivors={survivors} />
        </Grid>
        <Grid item xs={12} md={6}>
          <EventLog events={eventLog} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 