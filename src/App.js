// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { Fab } from '@mui/material';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import './App.css'; // Ensure your CSS includes styles for .header-controls, .session-btn, .header-btn, .session-id-display
import { SimulationProvider } from './context/SimulationContext';
import RoverSimulation from './components/RoverSimulation';

// Helper component (keep as you had it)
const GlossyCard = ({ className, children }) => {
    return (
        <div className={`card ${className || ''}`}>
            {/* Keep your glass effects if desired */}
            {/* <div className="glass-highlight"></div> */}
            {/* <div className="glass-shine"></div> */}
            {children}
        </div>
    );
};

// Enhanced theme with improved colors and component styling
const theme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#0a1929',
            paper: 'rgba(14, 22, 33, 0.9)',
        },
        primary: {
            main: '#3f8cff',
            light: '#64b5f6',
            dark: '#1565c0',
        },
        secondary: {
            main: '#ff5c8d',
            light: '#ff80ab',
            dark: '#c51162',
        },
        error: {
            main: '#ff5252',
        },
        warning: {
            main: '#ffab40',
        },
        info: {
            main: '#00b0ff',
        },
        success: {
            main: '#69f0ae',
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Segoe UI", "Helvetica Neue", sans-serif',
        h6: {
            fontWeight: 500,
            letterSpacing: '0.0075em',
        },
        body1: {
            fontWeight: 400,
        },
        button: {
            fontWeight: 500,
            textTransform: 'none',
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(10, 25, 41, 0.95)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                },
                contained: {
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.25)',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                },
            },
        },
        MuiFab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    height: 8,
                },
            },
        },
    },
    shape: {
        borderRadius: 8,
    },
    shadows: [
        'none',
        '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
        '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
        '0 4px 20px rgba(0,0,0,0.3)',
        '0 6px 30px rgba(0,0,0,0.4)',
        '0 8px 40px rgba(0,0,0,0.5)',
        '0 12px 50px rgba(0,0,0,0.6)',
        '0 16px 60px rgba(0,0,0,0.7)',
    ],
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SimulationProvider>
                <Router>
                    <Box 
                        className="main-container"
                        sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            minHeight: '100vh',
                            maxHeight: '100vh',
                            background: 'linear-gradient(135deg, #0a1929 0%, #071426 100%)',
                            backgroundAttachment: 'fixed',
                            overflow: 'hidden'
                        }}
                    >
                        <Navigation />
                        
                        {/* Direct Simulation Button */}
                        <Box sx={{ 
                            position: 'fixed', 
                            bottom: 24, 
                            right: 24, 
                            zIndex: 1000 
                        }}>
                            <Link to="/simulation" style={{ textDecoration: 'none' }}>
                                <Fab
                                    variant="extended"
                                    color="primary"
                                    sx={{
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                        padding: '0 20px',
                                        borderRadius: 28,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                    }}
                                >
                                    Open Simulation
                                </Fab>
                            </Link>
                        </Box>
                        
                        <Box 
                            component="main" 
                            sx={{ 
                                flexGrow: 1, 
                                p: { xs: 2, sm: 3, md: 4 },
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                                '&::-webkit-scrollbar': {
                                    width: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: 'transparent',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-thumb:hover': {
                                    background: 'rgba(255,255,255,0.2)',
                                },
                            }}
                        >
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/simulation" element={<RoverSimulation />} />
                            </Routes>
                        </Box>
                    </Box>
                </Router>
            </SimulationProvider>
        </ThemeProvider>
    );
}

export default App;