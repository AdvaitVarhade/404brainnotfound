import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

const EventLog = ({ events = [] }) => {
  // Function to determine log entry type
  const getEntryType = (message) => {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('error') || lowerMsg.includes('failed') || lowerMsg.includes('lost')) {
      return 'error';
    } else if (lowerMsg.includes('warning') || lowerMsg.includes('critical') || lowerMsg.includes('below')) {
      return 'warning';
    }
    return 'info';
  };

  // Get icon based on log type
  const getEntryIcon = (type) => {
    switch (type) {
      case 'error':
        return <ErrorIcon fontSize="small" color="error" />;
      case 'warning':
        return <WarningIcon fontSize="small" color="warning" />;
      default:
        return <InfoIcon fontSize="small" color="info" />;
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Event Log
      </Typography>
      
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        bgcolor: 'background.paper', 
        borderRadius: 1,
        border: '1px solid rgba(0, 0, 0, 0.12)',
        maxHeight: '300px'
      }}>
        {events.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No events to display
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {events.map((event) => {
              const entryType = getEntryType(event.message);
              const icon = getEntryIcon(entryType);
              
              return (
                <ListItem 
                  key={event.id} 
                  divider 
                  sx={{ 
                    py: 0.75,
                    px: 2,
                    bgcolor: entryType === 'error' ? 'rgba(211, 47, 47, 0.04)' : 
                             entryType === 'warning' ? 'rgba(237, 108, 2, 0.04)' : 
                             'transparent'
                  }}
                >
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    {icon}
                  </Box>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" component="span">
                          {event.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.timestamp}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default EventLog; 