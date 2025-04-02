import React from 'react';
import { Paper, Typography, Box, Grid, LinearProgress, Chip } from '@mui/material';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import NavigationIcon from '@mui/icons-material/Navigation';
import SpeedIcon from '@mui/icons-material/Speed';

const RoverStatus = ({ roverStatus, fleetStatus }) => {
  if (!roverStatus) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Rover Status
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      </Paper>
    );
  }

  const { status, position, orientation, batteryLevel, isRecharging, communicationActive } = roverStatus;

  // Format status text
  const getStatusText = () => {
    if (!communicationActive) return 'Communication Lost';
    if (isRecharging) return 'Recharging';
    if (status === 'moving') return 'Moving';
    return status.charAt(0).toUpperCase() + status.slice(1); // Capitalize first letter
  };

  // Get battery color
  const getBatteryColor = () => {
    if (isRecharging) return 'warning';
    if (batteryLevel < 10) return 'error';
    if (batteryLevel < 20) return 'warning';
    return 'success';
  };

  // Get battery icon
  const getBatteryIcon = () => {
    if (isRecharging) return <BatteryChargingFullIcon />;
    if (batteryLevel < 20) return <BatteryAlertIcon />;
    return <BatteryFullIcon />;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Rover Status
      </Typography>
      
      <Grid container spacing={2}>
        {/* Status */}
        <Grid item xs={12}>
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: 1, 
              bgcolor: 'rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SpeedIcon sx={{ mr: 1, color: 'info.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {getStatusText()}
                </Typography>
              </Box>
            </Box>
            
            {/* Show Fleet Status if available */}
            {fleetStatus && fleetStatus[0] && (
              <Chip 
                label={fleetStatus[0].mission} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
        </Grid>
        
        {/* Battery Level */}
        <Grid item xs={12}>
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: 1, 
              bgcolor: 'rgba(0, 0, 0, 0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getBatteryIcon()}
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  Battery Level
                </Typography>
              </Box>
              
              {isRecharging && (
                <Chip 
                  label="Charging" 
                  size="small" 
                  color="warning" 
                  variant="outlined"
                  icon={<BatteryChargingFullIcon />}
                  sx={{ 
                    animation: 'pulse 1.5s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 0.6 },
                      '50%': { opacity: 1 },
                      '100%': { opacity: 0.6 }
                    }
                  }}
                />
              )}
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={batteryLevel} 
              color={getBatteryColor()}
              sx={{ 
                height: 10, 
                borderRadius: 5, 
                mb: 0.5,
                transition: isRecharging ? 'transform 1s ease' : 'none'
              }}
            />
            
            <Typography variant="body2" color="text.secondary" align="right">
              {batteryLevel.toFixed(2)}%
            </Typography>
          </Box>
        </Grid>
        
        {/* Position */}
        <Grid item xs={12}>
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: 1, 
              bgcolor: 'rgba(0, 0, 0, 0.1)',
              opacity: communicationActive ? 1 : 0.6
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <MyLocationIcon sx={{ mr: 1, mt: 0.5, color: 'warning.main' }} />
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Position {!communicationActive && "(Last Known)"}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.primary">
                      X: {position.x.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.primary">
                      Y: {position.y.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <NavigationIcon 
                    sx={{ 
                      mr: 1, 
                      fontSize: '1rem',
                      transform: `rotate(${orientation}deg)`,
                      color: 'primary.main'
                    }} 
                  />
                  <Typography variant="body2" color="text.primary">
                    Orientation: {orientation}°
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RoverStatus;