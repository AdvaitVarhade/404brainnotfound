import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
// Restore hook import
import { useRoverData } from '../hooks/useRoverData';

const Navigation = () => {
    // Restore hook call
    const { 
        sessionId, 
        isLoading, 
        isConnected, 
        startSession, 
        error
    } = useRoverData();

    // Restore original handler that calls the hook's function
    const handleStartSessionClick = () => {
        console.log('[Navigation] Start Session button clicked! Calling startSession hook...'); 
        startSession();
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Autonomous Rescue Rover Dashboard
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Restore dynamic status display */}
                    <Typography variant="body2" sx={{ 
                        border: `1px solid ${error ? 'red' : (isConnected ? 'lightgreen' : 'grey')}`,
                        p: '4px 8px',
                        borderRadius: '4px',
                        minWidth: '150px',
                        textAlign: 'center',
                        color: error ? 'error.main' : 'inherit'
                    }}>
                        {isLoading ? "Connecting..." : 
                         error ? "Connection Error" :
                         isConnected && sessionId ? `Session: ${sessionId.substring(0, 8)}...` : 
                         "Not Connected"}
                    </Typography>
                    
                    {/* Restore original MUI Button */}
                    <Button
                        color="inherit"
                        variant="outlined"
                        onClick={handleStartSessionClick} // Use the restored handler
                        disabled={isConnected || isLoading} 
                    >
                        {isLoading ? "Starting..." : "Start New Session"}
                    </Button>
                    
                    {/* Remove the plain HTML button */}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navigation; 