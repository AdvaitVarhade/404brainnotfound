import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, Chip, Avatar, Grid } from '@mui/material';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

const SurvivorList = ({ survivors = [] }) => {
  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Detected Survivors
      </Typography>
      
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        bgcolor: 'background.paper', 
        borderRadius: 1,
        border: '1px solid rgba(0, 0, 0, 0.12)',
        maxHeight: '300px'
      }}>
        {survivors.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No survivors detected yet
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {survivors.map((survivor) => (
              <ListItem 
                key={survivor.id} 
                divider 
                sx={{ 
                  py: 1.5,
                  px: 2
                }}
              >
                <Grid container spacing={1}>
                  <Grid item xs={12} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main', 
                            width: 32, 
                            height: 32,
                            mr: 1
                          }}
                        >
                          <AccessibilityNewIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="subtitle1">
                          {survivor.name}
                        </Typography>
                      </Box>
                      
                      <Chip 
                        label={`${survivor.timeRemaining} min remaining`} 
                        size="small" 
                        color={
                          survivor.timeRemaining < 15 ? "error" : 
                          survivor.timeRemaining < 30 ? "warning" : 
                          "success"
                        }
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: 'rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1.5
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FavoriteIcon fontSize="small" sx={{ mr: 0.5, color: 'error.main' }} />
                        <Typography variant="body2">
                          {survivor.vitalSigns.heartRate} bpm
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DeviceThermostatIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
                        <Typography variant="body2">
                          {survivor.vitalSigns.bodyTemperature.toFixed(1)}°C
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <HealthAndSafetyIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                        <Typography variant="body2">
                          {survivor.vitalSigns.respirationRate} br/min
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Position: ({survivor.position.x.toFixed(1)}, {survivor.position.y.toFixed(1)})
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default SurvivorList;