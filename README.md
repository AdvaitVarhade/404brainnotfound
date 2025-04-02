# Autonomous Rescue Rover Dashboard

A web application for controlling and monitoring an autonomous rescue rover in disaster zones. The dashboard provides real-time visualization of the rover's status, sensor data, and detected survivors.

## Features

- Real-time rover status monitoring
- Interactive map view with rover position and survivor locations
- Sensor data visualization (Ultrasonic, IR, RFID, Accelerometer)
- Survivor detection and tracking
- Event logging system
- Battery level monitoring with automatic recharging
- Communication status tracking

## Technical Requirements

- Node.js (v14 or higher)
- npm or yarn package manager
- Modern web browser with JavaScript enabled

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rescue-rover-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Integration

The dashboard integrates with the following API endpoints:

- Start Session: `POST https://roverdata2-production.up.railway.app/api/session/start`
- Get Rover Status: `GET https://roverdata2-production.up.railway.app/api/rover/status?session_id=<SessionId>`
- Get Sensor Data: `GET https://roverdata2-production.up.railway.app/api/rover/sensor-data?session_id=<SessionId>`
- Move Rover: `POST https://roverdata2-production.up.railway.app/api/rover/move?session_id=<SessionId>&direction=<direction>`
- Stop Rover: `POST https://roverdata2-production.up.railway.app/api/rover/stop?session_id=<SessionId>`

## Rover Behavior

- The rover stops moving when recharging
- Recharging starts at 5% and stops at 80%
- Communication is lost when battery is below 10%
- Communication is regained after recharging above 10%

## Project Structure

```
rescue-rover-dashboard/
├── src/
│   ├── components/
│   │   ├── Dashboard.js
│   │   ├── MapView.js
│   │   ├── Navigation.js
│   │   ├── SensorReadings.js
│   │   ├── SurvivorList.js
│   │   └── LogPanel.js
│   ├── services/
│   │   └── roverService.js
│   ├── hooks/
│   │   └── useRoverData.js
│   └── App.js
├── public/
├── package.json
└── README.md
```

## Technologies Used

- React.js
- Material-UI
- Axios for API calls
- Chart.js for data visualization
- React Router for navigation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
