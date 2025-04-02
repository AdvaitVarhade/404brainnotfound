// Standalone simulation service without API dependency
class SimulationService {
    constructor() {
        this.sessionId = null;
        this.state = {
            position: { x: 10, y: 10 },
            orientation: 0, // 0: North, 90: East, 180: South, 270: West
            status: 'idle',
            batteryLevel: 70,
            isRecharging: false,
            communicationActive: true,
            sensorData: {
                temperature: 22.5,
                humidity: 45,
                pressure: 1013,
                radiation: 0.12,
                proximity: [],
                lidar: [],
                camera: null,
                survivors: []
            },
            disasters: [],
            survivors: [],
            obstacles: [
                { x: 15, y: 15, radius: 2 },
                { x: 5, y: 20, radius: 3 },
                { x: 25, y: 5, radius: 4 }
            ]
        };
        
        // Battery management interval
        this.batteryInterval = null;
    }

    // Start a new simulation session
    async startSession() {
        this.sessionId = `sim-${Date.now()}`;
        
        // Reset state for new session
        this.state = {
            ...this.state,
            position: { x: 10, y: 10 },
            orientation: 90, // 90: East (was 0/North) - Changed to make front be 90 degrees offset
            status: 'idle',
            batteryLevel: 70,
            isRecharging: false,
            communicationActive: true,
            sensorData: {
                ...this.state.sensorData,
                survivors: []
            },
            survivors: []
        };
        
        // Add some random survivors
        this.generateRandomSurvivors();
        
        // Start battery management
        this.startBatteryManagement();
        
        return {
            sessionId: this.sessionId,
            status: 'Session started successfully'
        };
    }
    
    // Stop the current session
    async stopSession() {
        if (this.batteryInterval) {
            clearInterval(this.batteryInterval);
            this.batteryInterval = null;
        }
        
        this.sessionId = null;
        return {
            status: 'Session stopped successfully'
        };
    }
    
    // Battery management logic
    startBatteryManagement() {
        // Clear any existing interval
        if (this.batteryInterval) {
            clearInterval(this.batteryInterval);
        }
        
        // Update battery level every second
        this.batteryInterval = setInterval(() => {
            this.manageBatteryState();
        }, 1000);
    }
    
    // Manage battery state and recharging
    manageBatteryState() {
        // If already recharging, handle recharging logic
        if (this.state.isRecharging) {
            // Increase battery level
            this.state.batteryLevel = Math.min(100, this.state.batteryLevel + 0.5);
            
            // If battery level reaches 80%, stop recharging
            if (this.state.batteryLevel >= 80) {
                this.state.isRecharging = false;
                this.state.status = 'idle';
            }
        } 
        // If battery is low, start recharging
        else if (this.state.batteryLevel <= 5) {
            this.state.isRecharging = true;
            this.state.status = 'recharging';
        }
        // Normal battery drain when not recharging
        else if (this.state.status === 'moving') {
            // Battery drain is much slower when moving (was 0.2)
            this.state.batteryLevel = Math.max(0, this.state.batteryLevel - 0.05);
        } else {
            // Very slow battery drain when idle (was 0.05)
            this.state.batteryLevel = Math.max(0, this.state.batteryLevel - 0.01);
        }
        
        // Update communication status based on battery level
        if (this.state.batteryLevel < 10 && this.state.communicationActive) {
            this.state.communicationActive = false;
            this.state.status = 'communication_lost';
        } else if (this.state.batteryLevel >= 10 && !this.state.communicationActive) {
            this.state.communicationActive = true;
            this.state.status = this.state.isRecharging ? 'recharging' : 'idle';
        }
    }

    // Get the current status of the rover
    async getRoverStatus() {
        // Manage battery state
        this.manageBatteryState();
        
        return {
            status: this.state.status,
            position: this.state.position,
            orientation: this.state.orientation,
            batteryLevel: this.state.batteryLevel,
            isRecharging: this.state.isRecharging,
            communicationActive: this.state.communicationActive
        };
    }

    // Get sensor data from rover
    async getSensorData() {
        // If communication lost, return limited data
        if (!this.state.communicationActive) {
            return {
                status: 'error',
                message: 'Communication lost with rover',
                lastKnownData: {
                    ...this.state.sensorData,
                    temperature: null,
                    humidity: null,
                    pressure: null,
                    radiation: null,
                    proximity: [],
                    lidar: [],
                    camera: null
                }
            };
        }
        
        // If recharging, don't update sensor readings
        if (this.state.isRecharging) {
            return {
                ...this.state.sensorData,
                status: 'limited',
                message: 'Rover in recharging mode, sensor readings limited'
            };
        }
        
        // Update some random sensor values
        this.state.sensorData.temperature = 20 + Math.random() * 5;
        this.state.sensorData.humidity = 40 + Math.random() * 10;
        this.state.sensorData.pressure = 1010 + Math.random() * 10;
        this.state.sensorData.radiation = 0.1 + Math.random() * 0.1;
        
        // Generate random proximity data based on obstacles
        this.state.sensorData.proximity = this.generateProximityData();
        this.state.sensorData.lidar = this.generateLidarData();
        
        // Check for survivors
        const detectedSurvivors = this.checkForSurvivors();
        
        // Debug log to see what survivors are being detected
        console.log('Checking for survivors near position:', this.state.position);
        console.log('All survivors:', this.state.survivors);
        console.log('Newly detected survivors:', detectedSurvivors);
        console.log('Current sensorData.survivors:', this.state.sensorData.survivors);
        
        if (detectedSurvivors.length > 0) {
            // Only add new survivors that aren't already in the list
            const existingIds = this.state.sensorData.survivors.map(s => s.id);
            const newSurvivors = detectedSurvivors.filter(s => !existingIds.includes(s.id));
            
            if (newSurvivors.length > 0) {
                this.state.sensorData.survivors = [
                    ...this.state.sensorData.survivors,
                    ...newSurvivors
                ];
                console.log('Updated sensorData.survivors:', this.state.sensorData.survivors);
            }
        }
        
        return this.state.sensorData;
    }

    // Move the rover in a specific direction
    async moveRover(direction, targetOrientation) {
        // Don't move if communication lost or recharging
        if (!this.state.communicationActive || this.state.isRecharging) {
            return {
                status: 'error',
                message: this.state.isRecharging ? 
                    'Cannot move while recharging' : 
                    'Communication lost with rover'
            };
        }
        
        const distance = 0.5;  // distance to move per call
        let newOrientation = this.state.orientation;
        let directionMultiplier = 1;
        
        // Handle direct directional movement (WASD controls)
        if (direction === 'directional' && targetOrientation !== undefined) {
            // Set orientation directly to the target and move forward
            newOrientation = targetOrientation;
            this.state.orientation = newOrientation;
            
            // We're already setting the proper orientation, so we'll move forward
            direction = 'forward';
        } 
        // Handle traditional controls
        else {
            // Update orientation based on direction
            switch (direction) {
                case 'forward':
                    // Keep current orientation
                    break;
                case 'backward':
                    // For backward movement, we don't change the orientation
                    // We'll move in the opposite direction of current orientation
                    directionMultiplier = -1;
                    break;
                case 'left':
                    // Turn left 90 degrees
                    newOrientation = (this.state.orientation + 270) % 360;
                    this.state.orientation = newOrientation;
                    break;
                case 'right':
                    // Turn right 90 degrees
                    newOrientation = (this.state.orientation + 90) % 360;
                    this.state.orientation = newOrientation;
                    break;
                default:
                    return { status: 'error', message: 'Invalid direction' };
            }
        }
        
        // Calculate new position based on orientation
        // For the angle calculation, convert orientation to radians
        const angle = (newOrientation * Math.PI) / 180;
        
        // Calculate position changes
        const newX = this.state.position.x + directionMultiplier * distance * Math.cos(angle);
        const newY = this.state.position.y + directionMultiplier * distance * Math.sin(angle);
        
        // Check if new position is valid (not hitting an obstacle)
        if (!this.isPositionValid(newX, newY)) {
            return { status: 'error', message: 'Cannot move in that direction - obstacle detected' };
        }
        
        // Update position
        this.state.position.x = newX;
        this.state.position.y = newY;
        this.state.status = 'moving';
        
        // Drain battery more when moving, but much less than before (was 0.5)
        this.state.batteryLevel = Math.max(0, this.state.batteryLevel - 0.1);
        
        return {
            status: 'success',
            message: `Moved ${direction}`,
            newPosition: this.state.position,
            newOrientation: this.state.orientation
        };
    }

    // Stop the rover
    async stopRover() {
        // Don't process command if communication lost
        if (!this.state.communicationActive) {
            return {
                status: 'error',
                message: 'Communication lost with rover'
            };
        }
        
        if (!this.state.isRecharging) {
            this.state.status = 'idle';
        }
        
        return {
            status: 'success',
            message: 'Rover stopped'
        };
    }

    // Get the status of the fleet (in this case, just our single rover)
    async getFleetStatus() {
        return [
            {
                id: 'rover-1',
                name: 'Rescue Rover',
                status: this.state.status,
                batteryLevel: this.state.batteryLevel,
                isRecharging: this.state.isRecharging,
                communicationActive: this.state.communicationActive,
                position: this.state.position,
                mission: 'Search and rescue'
            }
        ];
    }

    // Get disaster data
    async getDisasterData() {
        // If communication lost, return limited data
        if (!this.state.communicationActive) {
            return {
                status: 'error',
                message: 'Communication lost with rover',
                data: []
            };
        }
        
        return {
            status: 'success',
            data: this.state.disasters
        };
    }

    // Check if the rover is near any survivors
    checkForSurvivors() {
        // If communication lost or recharging, can't detect survivors
        if (!this.state.communicationActive || this.state.isRecharging) {
            return [];
        }
        
        // Increase detection radius to make survivors easier to find
        const detectionRadius = 5;
        const detectedSurvivors = [];
        
        this.state.survivors.forEach(survivor => {
            // Check if survivor is already detected
            const alreadyDetected = this.state.sensorData.survivors.some(
                detected => detected.id === survivor.id
            );
            
            if (!alreadyDetected) {
                const distance = Math.sqrt(
                    Math.pow(survivor.position.x - this.state.position.x, 2) +
                    Math.pow(survivor.position.y - this.state.position.y, 2)
                );
                
                console.log(`Distance to ${survivor.name}: ${distance} (detection radius: ${detectionRadius})`);
                
                if (distance <= detectionRadius) {
                    // Survivor detected
                    console.log(`Survivor detected: ${survivor.name} at position (${survivor.position.x}, ${survivor.position.y})`);
                    detectedSurvivors.push(survivor);
                }
            }
        });
        
        return detectedSurvivors;
    }

    // Check if a position is valid (not hitting an obstacle)
    isPositionValid(x, y) {
        for (const obstacle of this.state.obstacles) {
            const distance = Math.sqrt(
                Math.pow(x - obstacle.x, 2) + Math.pow(y - obstacle.y, 2)
            );
            
            if (distance < obstacle.radius) {
                return false;
            }
        }
        return true;
    }

    // Generate random proximity data based on obstacles
    generateProximityData() {
        const proximityData = [];
        
        for (const obstacle of this.state.obstacles) {
            const distance = Math.sqrt(
                Math.pow(obstacle.x - this.state.position.x, 2) +
                Math.pow(obstacle.y - this.state.position.y, 2)
            );
            
            if (distance < 10) {
                const angle = Math.atan2(
                    obstacle.y - this.state.position.y,
                    obstacle.x - this.state.position.x
                );
                
                proximityData.push({
                    angle: (angle * 180) / Math.PI,
                    distance,
                    intensity: 1 - distance / 10
                });
            }
        }
        
        return proximityData;
    }

    // Generate random LIDAR data
    generateLidarData() {
        const lidarPoints = 24;
        const maxRange = 20;
        const lidarData = [];
        
        for (let i = 0; i < lidarPoints; i++) {
            const angle = (i * 360) / lidarPoints;
            const angleRad = (angle * Math.PI) / 180;
            
            // Calculate distance to nearest obstacle in this direction
            let distance = maxRange;
            
            for (const obstacle of this.state.obstacles) {
                const obstacleDir = Math.atan2(
                    obstacle.y - this.state.position.y,
                    obstacle.x - this.state.position.x
                );
                
                const angleDiff = Math.abs(angleRad - obstacleDir);
                const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
                
                if (normalizedDiff < 0.2) {
                    const obstacleDistance = Math.sqrt(
                        Math.pow(obstacle.x - this.state.position.x, 2) +
                        Math.pow(obstacle.y - this.state.position.y, 2)
                    );
                    
                    if (obstacleDistance < distance) {
                        distance = obstacleDistance;
                    }
                }
            }
            
            lidarData.push({
                angle,
                distance: distance + Math.random() * 0.5 // Add some noise
            });
        }
        
        return lidarData;
    }

    // Generate random survivors
    generateRandomSurvivors() {
        const numSurvivors = 7; // Fixed number of survivors for better control
        this.state.survivors = [];
        
        // Create survivors spread widely across the map in different quadrants
        this.state.survivors = [
            {
                id: 'survivor-1',
                name: 'Survivor 1',
                status: 'critical',
                position: { x: 5, y: 5 }, // Bottom-left quadrant
                vitalSigns: {
                    heartRate: 60 + Math.floor(Math.random() * 40),
                    bodyTemperature: 36 + Math.random() * 2,
                    respirationRate: 12 + Math.floor(Math.random() * 8)
                },
                timeRemaining: 30 + Math.floor(Math.random() * 50)
            },
            {
                id: 'survivor-2',
                name: 'Survivor 2',
                status: 'stable',
                position: { x: 25, y: 5 }, // Bottom-right quadrant
                vitalSigns: {
                    heartRate: 60 + Math.floor(Math.random() * 40),
                    bodyTemperature: 36 + Math.random() * 2,
                    respirationRate: 12 + Math.floor(Math.random() * 8)
                },
                timeRemaining: 30 + Math.floor(Math.random() * 50)
            },
            {
                id: 'survivor-3',
                name: 'Survivor 3',
                status: 'critical',
                position: { x: 5, y: 25 }, // Top-left quadrant
                vitalSigns: {
                    heartRate: 60 + Math.floor(Math.random() * 40),
                    bodyTemperature: 36 + Math.random() * 2,
                    respirationRate: 12 + Math.floor(Math.random() * 8)
                },
                timeRemaining: 30 + Math.floor(Math.random() * 50)
            },
            {
                id: 'survivor-4',
                name: 'Survivor 4',
                status: 'injured',
                position: { x: 25, y: 25 }, // Top-right quadrant
                vitalSigns: {
                    heartRate: 60 + Math.floor(Math.random() * 40),
                    bodyTemperature: 36 + Math.random() * 2,
                    respirationRate: 12 + Math.floor(Math.random() * 8)
                },
                timeRemaining: 30 + Math.floor(Math.random() * 50)
            },
            {
                id: 'survivor-5',
                name: 'Survivor 5',
                status: 'stable',
                position: { x: 15, y: 25 }, // Top-middle
                vitalSigns: {
                    heartRate: 60 + Math.floor(Math.random() * 40),
                    bodyTemperature: 36 + Math.random() * 2,
                    respirationRate: 12 + Math.floor(Math.random() * 8)
                },
                timeRemaining: 30 + Math.floor(Math.random() * 50)
            },
            {
                id: 'survivor-6',
                name: 'Survivor 6',
                status: 'critical',
                position: { x: 2, y: 15 }, // Middle-left
                vitalSigns: {
                    heartRate: 60 + Math.floor(Math.random() * 40),
                    bodyTemperature: 36 + Math.random() * 2,
                    respirationRate: 12 + Math.floor(Math.random() * 8)
                },
                timeRemaining: 30 + Math.floor(Math.random() * 50)
            },
            {
                id: 'survivor-7',
                name: 'Survivor 7',
                status: 'injured',
                position: { x: 28, y: 15 }, // Middle-right
                vitalSigns: {
                    heartRate: 60 + Math.floor(Math.random() * 40),
                    bodyTemperature: 36 + Math.random() * 2,
                    respirationRate: 12 + Math.floor(Math.random() * 8)
                },
                timeRemaining: 30 + Math.floor(Math.random() * 50)
            }
        ];
        
        // Log generated survivors for debugging
        console.log('Generated survivors:', this.state.survivors);
    }
}

export const simulationService = new SimulationService(); 