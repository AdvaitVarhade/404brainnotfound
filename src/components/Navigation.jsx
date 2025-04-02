import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useSimulation } from '../context/SimulationContext';
import { useRoverData } from '../hooks/useRoverData';

const Navigation = () => {
    const { sessionId: simSessionId, isLoading: simIsLoading } = useSimulation();
    const { isConnected, isLoading: apiIsLoading, startSession } = useRoverData();
    const location = useLocation();
    const isSimulation = location.pathname === '/simulation';
    
    const handleStartSession = () => {
        console.log("Starting session...");
        startSession();
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: '#1e1e1e' }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography variant="h6" component={RouterLink} to="/" sx={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    fontWeight: 500
                }}>
                    Autonomous Rescue Rover Dashboard
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                        variant="text"
                        color="inherit"
                        component={RouterLink}
                        to={isSimulation ? "/" : "/simulation"}
                        sx={{
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            color: '#888',
                            '&:hover': { color: 'white' }
                        }}
                    >
                        {isSimulation ? "Exit Simulation" : "Enter Simulation"}
                    </Button>
                    <Button
                        variant="outlined"
                        color="inherit"
                        disabled={apiIsLoading || simIsLoading}
                        sx={{
                            borderColor: isConnected ? '#4caf50' : '#444',
                            color: isConnected ? '#4caf50' : '#888',
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: isConnected ? '#66bb6a' : '#666',
                                color: isConnected ? '#66bb6a' : 'white'
                            }
                        }}
                    >
                        {isConnected ? "Connected" : "Not Connected"}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={apiIsLoading || simIsLoading}
                        onClick={handleStartSession}
                        sx={{
                            backgroundColor: '#2a2a2a',
                            color: 'white',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#3a3a3a'
                            }
                        }}
                    >
                        {apiIsLoading ? "CONNECTING..." : "START NEW SESSION"}
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navigation; 