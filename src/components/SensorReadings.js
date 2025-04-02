// src/components/SensorReadings.js
import React from 'react';
import { Box, Typography, Grid, LinearProgress, Paper, Tooltip, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import WavesIcon from '@mui/icons-material/Waves';
import AirIcon from '@mui/icons-material/Air';
import WarningIcon from '@mui/icons-material/Warning';
import SensorsIcon from '@mui/icons-material/Sensors';
import SpeedIcon from '@mui/icons-material/Speed';
import RadioIcon from '@mui/icons-material/Radio';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

// Function to determine color based on value and ranges
const getValueColor = (value, ranges) => {
  if (value <= ranges.low.max) return ranges.low.color;
  if (value <= ranges.medium.max) return ranges.medium.color;
  return ranges.high.color;
};

// Circular gauge component for sensor readings
const CircularGauge = ({ value, minValue = 0, maxValue = 100, title, unit, icon, color }) => {
  // Calculate percentage for the gauge
  const percentage = Math.min(100, Math.max(0, ((value - minValue) / (maxValue - minValue)) * 100));
  
  return (
    <Box sx={{ textAlign: 'center', position: 'relative' }}>
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `conic-gradient(
            ${color} ${percentage}%, 
            rgba(200, 200, 200, 0.2) ${percentage}% 100%
          )`,
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '70%',
            height: '70%',
            borderRadius: '50%',
            background: '#1a1a1a',
          }
        }}
      >
        <Box sx={{ position: 'absolute', color: 'white', zIndex: 1 }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="subtitle2" sx={{ mt: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: color, fontWeight: 'bold' }}>
        {value !== undefined ? `${value.toFixed(1)} ${unit}` : 'N/A'}
      </Typography>
    </Box>
  );
};

// Progress bar indicator component for sensor readings
const SensorBar = ({ value, label, minValue = 0, maxValue = 100, ranges, unit = '%' }) => {
  const normalizedValue = Math.min(100, Math.max(0, ((value - minValue) / (maxValue - minValue)) * 100));
  const color = getValueColor(value, ranges);
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color, fontWeight: 'bold' }}>
          {value !== undefined ? `${value.toFixed(1)} ${unit}` : 'N/A'}
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={normalizedValue} 
        sx={{ 
          height: 8, 
          borderRadius: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
          }
        }}
      />
    </Box>
  );
};

// Mini card for displaying simple sensor values
const SensorCard = ({ title, value, unit, icon, color = 'white' }) => (
  <Grid item xs={6}>
    <Box sx={{ 
      p: 1.5, 
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 1, 
      display: 'flex',
      alignItems: 'center',
      gap: 1.5
    }}>
      <Box sx={{ color: color }}>{icon}</Box>
      <Box>
        <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {value !== undefined ? `${value} ${unit}` : 'N/A'}
        </Typography>
      </Box>
    </Box>
  </Grid>
);

const SensorReadings = ({ status, battery, sensorData, isLoading, isConnected }) => {
  // Early return if not connected or loading
  if (!isConnected) {
    return (
      <Paper sx={{ p: 2, height: '100%', backgroundColor: '#1e1e1e', color: 'white' }}>
        <Typography variant="h6" gutterBottom>
          Sensor Readings
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Typography variant="body1" color="text.secondary">
            Not connected to rover
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Paper sx={{ p: 2, height: '100%', backgroundColor: '#1e1e1e', color: 'white' }}>
        <Typography variant="h6" gutterBottom>
          Sensor Readings
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Typography variant="body1" color="text.secondary">
            Loading sensor data...
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Define color ranges for each sensor
  const temperatureRanges = {
    low: { max: 22, color: '#2196f3' },  // Blue for cool
    medium: { max: 27, color: '#4caf50' }, // Green for normal
    high: { max: 100, color: '#f44336' }   // Red for hot
  };

  const humidityRanges = {
    low: { max: 30, color: '#ff9800' },    // Orange for dry
    medium: { max: 60, color: '#4caf50' },  // Green for comfortable
    high: { max: 100, color: '#2196f3' }   // Blue for humid
  };

  const radiationRanges = {
    low: { max: 0.1, color: '#4caf50' },    // Green for safe
    medium: { max: 0.3, color: '#ff9800' },  // Orange for caution
    high: { max: 1, color: '#f44336' }      // Red for dangerous
  };

  const airQualityRanges = {
    low: { max: 50, color: '#f44336' },      // Red for poor
    medium: { max: 80, color: '#ff9800' },   // Orange for moderate
    high: { max: 100, color: '#4caf50' }     // Green for good
  };

  const batteryRanges = {
    low: { max: 30, color: '#f44336' },      // Red for low
    medium: { max: 70, color: '#ff9800' },   // Orange for medium
    high: { max: 100, color: '#4caf50' }     // Green for full
  };

  // Battery gauge component with pulsing animation for recharging
  const BatteryGauge = ({ value, isRecharging, ...props }) => {
    return (
      <Box sx={{ position: 'relative' }}>
        <CircularGauge 
          value={value} 
          title="Battery" 
          unit="%" 
          icon={<BatteryChargingFullIcon />}
          color={getValueColor(value, batteryRanges)}
          {...props}
        />
        
        {isRecharging && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              animation: 'pulse 1.5s infinite',
              backgroundColor: 'rgba(255, 152, 0, 0.15)',
              '@keyframes pulse': {
                '0%': {
                  opacity: 0.3,
                  transform: 'scale(0.95)',
                },
                '50%': {
                  opacity: 0.6,
                  transform: 'scale(1.05)',
                },
                '100%': {
                  opacity: 0.3,
                  transform: 'scale(0.95)',
                },
              },
              zIndex: -1,
            }}
          />
        )}
      </Box>
    );
  };

  // Get data from props or use defaults
  const temperature = sensorData?.temperature ?? 25;
  const humidity = sensorData?.humidity ?? 45;
  const batteryLevel = battery ?? 95;
  const radiation = sensorData?.radiation ?? 0.1;
  const airQuality = sensorData?.airQuality ?? 95;
  
  // Additional sensor data with defaults
  const ultrasonicDistance = sensorData?.ultrasonicDistance ?? Math.floor(Math.random() * 150 + 50);
  const rfidTag = sensorData?.rfidTag ?? (Math.random() > 0.7 ? "ID-" + Math.floor(Math.random() * 1000) : null);
  const irTemperature = sensorData?.irTemperature ?? (temperature + Math.random() * 2 - 1).toFixed(1);
  const pressure = sensorData?.pressure ?? Math.floor(Math.random() * 100 + 900);
  const co2Level = sensorData?.co2Level ?? Math.floor(Math.random() * 500 + 400);
  
  // Accelerometer data
  const accelerometer = sensorData?.accelerometer ?? {
    x: (Math.random() * 2 - 1).toFixed(2),
    y: (Math.random() * 2 - 1).toFixed(2),
    z: (Math.random() * 2 - 1).toFixed(2)
  };

  return (
    <Paper sx={{ p: 2, height: '100%', backgroundColor: '#1e1e1e', color: 'white', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        Sensor Readings
        <Box 
          sx={{ 
            ml: 'auto', 
            backgroundColor: status === 'operational' ? '#4caf50' : 
                            status === 'moving' ? '#2196f3' : 
                            status === 'recharging' ? '#ff9800' : '#ff9800',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem'
          }}
        >
          {status?.toUpperCase() || 'UNKNOWN'}
        </Box>
      </Typography>
      
      <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
      
      {/* Recharging notification */}
      {status === 'recharging' && (
        <Box 
          sx={{ 
            p: 2, 
            mb: 2, 
            backgroundColor: 'rgba(255, 152, 0, 0.15)', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderLeft: '4px solid #ff9800'
          }}
        >
          <BatteryChargingFullIcon sx={{ color: '#ff9800' }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
              Automatic Recharging In Progress
            </Typography>
            <Typography variant="body2">
              Battery at {batteryLevel.toFixed(1)}%. Rover will resume operations at 80%.
            </Typography>
          </Box>
        </Box>
      )}
      
      {/* Circular gauges for primary readings */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <CircularGauge 
            value={temperature} 
            minValue={0}
            maxValue={40}
            title="Temperature" 
            unit="°C" 
            icon={<ThermostatIcon />}
            color={getValueColor(temperature, temperatureRanges)}
          />
        </Grid>
        <Grid item xs={4}>
          <BatteryGauge
            value={batteryLevel}
            isRecharging={status === 'recharging'}
          />
        </Grid>
        <Grid item xs={4}>
          <CircularGauge 
            value={humidity} 
            title="Humidity" 
            unit="%" 
            icon={<OpacityIcon />}
            color={getValueColor(humidity, humidityRanges)}
          />
        </Grid>
      </Grid>
      
      {/* Bar indicators for secondary readings */}
      <Box sx={{ mt: 3 }}>
        <SensorBar 
          value={radiation} 
          label={<><WavesIcon fontSize="small" /> Radiation</>} 
          minValue={0} 
          maxValue={1}
          ranges={radiationRanges}
          unit="mSv"
        />
        
        <SensorBar 
          value={airQuality} 
          label={<><AirIcon fontSize="small" /> Air Quality</>} 
          ranges={airQualityRanges}
          unit=""
        />
      </Box>
      
      {/* Additional Sensors Section */}
      <Accordion 
        sx={{ 
          mt: 3, 
          backgroundColor: 'rgba(0,0,0,0.2)', 
          color: 'white',
          '&:before': {
            display: 'none',
          }
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Typography 
            variant="subtitle2" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1 
            }}
          >
            <SensorsIcon fontSize="small" /> Additional Sensors
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <SensorCard 
              title="Ultrasonic" 
              value={ultrasonicDistance} 
              unit="cm" 
              icon={<CompareArrowsIcon />} 
              color="#64b5f6"
            />
            
            <SensorCard 
              title="IR Temperature" 
              value={irTemperature} 
              unit="°C" 
              icon={<ThermostatIcon />} 
              color="#ef5350"
            />
            
            <SensorCard 
              title="Pressure" 
              value={pressure} 
              unit="hPa" 
              icon={<SpeedIcon />} 
              color="#81c784"
            />
            
            <SensorCard 
              title="CO2 Level" 
              value={co2Level} 
              unit="ppm" 
              icon={<AirIcon />} 
              color="#ffb74d"
            />
          </Grid>
          
          {/* RFID detection */}
          <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <RadioIcon fontSize="small" /> RFID Detection
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {rfidTag ? 
                <span style={{ color: '#64b5f6', fontWeight: 'bold' }}>Tag detected: {rfidTag}</span> : 
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>No RFID tags in range</span>
              }
            </Typography>
          </Box>
          
          {/* Accelerometer data */}
          <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
            <Typography variant="subtitle2">Accelerometer (G)</Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={4}>
                <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>X-Axis</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f48fb1' }}>
                  {accelerometer.x}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>Y-Axis</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#80deea' }}>
                  {accelerometer.y}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>Z-Axis</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a5d6a7' }}>
                  {accelerometer.z}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
      
      {/* Warning section */}
      {batteryLevel < 30 && (
        <Box sx={{ mt: 2, p: 1, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
          <WarningIcon sx={{ color: '#f44336', mr: 1 }} />
          <Typography variant="body2" color="#f44336">
            Low battery warning! Battery at {batteryLevel}%
          </Typography>
        </Box>
      )}
      
      {radiation > 0.2 && (
        <Box sx={{ mt: 2, p: 1, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
          <WarningIcon sx={{ color: '#f44336', mr: 1 }} />
          <Typography variant="body2" color="#f44336">
            High radiation detected! ({radiation.toFixed(2)} mSv)
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default SensorReadings;