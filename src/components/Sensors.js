import React from 'react';
import { Paper, Typography, Box, Grid, LinearProgress, Skeleton, Chip } from '@mui/material';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import WaterIcon from '@mui/icons-material/Water';
import SpeedIcon from '@mui/icons-material/Speed';
import RadarIcon from '@mui/icons-material/Radar';
import SignalWifiStatusbarConnectedNoInternet4Icon from '@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4';

const Sensors = ({ sensorData, communicationActive = true }) => {
  // Format sensor values
  const formatValue = (value, units = '', decimal = 1) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(decimal)}${units}`;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Sensor Readings
        </Typography>
        
        {!communicationActive && (
          <Chip
            icon={<SignalWifiStatusbarConnectedNoInternet4Icon />}
            label="Signal Lost"
            color="error"
            size="small"
          />
        )}
      </Box>
      
      {!sensorData && (
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={20} />
        </Box>
      )}
      
      {sensorData && (
        <Grid container spacing={2}>
          {/* Temperature */}
          <Grid item xs={6}>
            <Box 
              sx={{ 
                p: 1.5, 
                borderRadius: 1, 
                bgcolor: 'rgba(0, 0, 0, 0.1)',
                opacity: communicationActive ? 1 : 0.6 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DeviceThermostatIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Temperature
                </Typography>
              </Box>
              <Typography variant="h6">
                {communicationActive ? formatValue(sensorData.temperature, '°C') : 'Signal Lost'}
              </Typography>
              {communicationActive && sensorData.temperature && (
                <LinearProgress 
                  variant="determinate" 
                  value={(sensorData.temperature / 50) * 100} 
                  color={sensorData.temperature > 30 ? "error" : "primary"}
                  sx={{ mt: 1, height: 6, borderRadius: 5 }}
                />
              )}
            </Box>
          </Grid>
          
          {/* Humidity */}
          <Grid item xs={6}>
            <Box 
              sx={{ 
                p: 1.5, 
                borderRadius: 1, 
                bgcolor: 'rgba(0, 0, 0, 0.1)',
                opacity: communicationActive ? 1 : 0.6 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WaterIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Humidity
                </Typography>
              </Box>
              <Typography variant="h6">
                {communicationActive ? formatValue(sensorData.humidity, '%') : 'Signal Lost'}
              </Typography>
              {communicationActive && sensorData.humidity && (
                <LinearProgress 
                  variant="determinate" 
                  value={sensorData.humidity} 
                  color="info"
                  sx={{ mt: 1, height: 6, borderRadius: 5 }}
                />
              )}
            </Box>
          </Grid>
          
          {/* Pressure */}
          <Grid item xs={6}>
            <Box 
              sx={{ 
                p: 1.5, 
                borderRadius: 1, 
                bgcolor: 'rgba(0, 0, 0, 0.1)',
                opacity: communicationActive ? 1 : 0.6 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SpeedIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Pressure
                </Typography>
              </Box>
              <Typography variant="h6">
                {communicationActive ? formatValue(sensorData.pressure, ' hPa', 0) : 'Signal Lost'}
              </Typography>
            </Box>
          </Grid>
          
          {/* Radiation */}
          <Grid item xs={6}>
            <Box 
              sx={{ 
                p: 1.5, 
                borderRadius: 1, 
                bgcolor: 'rgba(0, 0, 0, 0.1)',
                opacity: communicationActive ? 1 : 0.6 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <RadarIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Radiation
                </Typography>
              </Box>
              <Typography variant="h6">
                {communicationActive ? formatValue(sensorData.radiation, ' mSv') : 'Signal Lost'}
              </Typography>
              {communicationActive && sensorData.radiation && (
                <LinearProgress 
                  variant="determinate" 
                  value={(sensorData.radiation / 0.5) * 100} 
                  color={sensorData.radiation > 0.2 ? "warning" : "success"}
                  sx={{ mt: 1, height: 6, borderRadius: 5 }}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      )}
      
      {sensorData && !communicationActive && (
        <Typography variant="body2" color="error" sx={{ mt: 2, textAlign: 'center' }}>
          Latest sensor data unavailable - communication lost with rover
        </Typography>
      )}
    </Paper>
  );
};

export default Sensors; 