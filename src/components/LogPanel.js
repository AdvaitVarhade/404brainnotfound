import React, { useRef } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const LogPanel = ({ logs }) => {
    const logContainerRef = useRef(null);

    const getLogIcon = (log) => {
        if (log.includes('moved') || log.includes('Moving') || log.includes('forward') || log.includes('backward') || log.includes('left') || log.includes('right')) {
            return <DirectionsIcon fontSize="small" sx={{ color: '#3f8cff', mr: 1 }} />;
        } else if (log.includes('Survivor') || log.includes('survivor')) {
            return <PersonPinCircleIcon fontSize="small" sx={{ color: '#ff5252', mr: 1 }} />;
        } else if (log.includes('Battery') || log.includes('battery')) {
            return <BatteryAlertIcon fontSize="small" sx={{ color: '#ffab40', mr: 1 }} />;
        } else if (log.includes('Error') || log.includes('error')) {
            return <ErrorIcon fontSize="small" sx={{ color: '#ff5252', mr: 1 }} />;
        } else {
            return <InfoIcon fontSize="small" sx={{ color: '#aaaaaa', mr: 1 }} />;
        }
    };

    const getLogColor = (log) => {
        if (log.includes('moved') || log.includes('Moving') || log.includes('forward') || log.includes('backward') || log.includes('left') || log.includes('right')) {
            return '#3f8cff';
        } else if (log.includes('Survivor') || log.includes('survivor')) {
            return '#ff5252';
        } else if (log.includes('Battery') || log.includes('battery')) {
            return '#ffab40';
        } else if (log.includes('Error') || log.includes('error')) {
            return '#ff5252';
        } else {
            return 'text.primary';
        }
    };

    const formatTimestamp = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <Box
            ref={logContainerRef}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
                bgcolor: 'rgba(0, 0, 0, 0.15)',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
            }}
        >
            <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
                {logs.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', mt: 2 }}>
                        No events logged yet.
                    </Typography>
                ) : (
                    logs.map((log, index) => (
                        <Box 
                            key={index}
                            sx={{
                                py: 1,
                                borderBottom: index !== logs.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                display: 'flex',
                                alignItems: 'flex-start',
                            }}
                        >
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                minWidth: '70px',
                                mr: 1,
                                color: 'text.secondary',
                                fontSize: '0.75rem'
                            }}>
                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                                {formatTimestamp()}
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                {getLogIcon(log)}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: getLogColor(log),
                                        fontFamily: 'monospace',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {log}
                                </Typography>
                            </Box>
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default LogPanel; 