from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import random
import math
import time
import threading
import logging
from werkzeug.serving import make_server
import atexit
import uuid
import json
import sys  # Add missing import for sys.exit()
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global state
class RoverSimulation:
    def __init__(self):
        # Initialize with default state
        self.reset()
        # Create persistent survivors that won't disappear/reappear randomly
        self.all_survivors = {
            "SRV-001": {
                "id": "SRV-001",
                "location": {"x": 5, "y": 5},
                "status": "stable",
                "detected": False
            },
            "SRV-002": {
                "id": "SRV-002",
                "location": {"x": 7, "y": 3},
                "status": "critical",
                "detected": False
            },
            "SRV-003": {
                "id": "SRV-003",
                "location": {"x": 8, "y": 8},
                "status": "stable",
                "detected": False
            },
            "SRV-004": {
                "id": "SRV-004",
                "location": {"x": 3, "y": 7},
                "status": "injured",
                "detected": False
            },
            "SRV-005": {
                "id": "SRV-005",
                "location": {"x": 12, "y": 4},
                "status": "critical",
                "detected": False
            },
            "SRV-006": {
                "id": "SRV-006",
                "location": {"x": 15, "y": 7},
                "status": "stable",
                "detected": False
            },
            "SRV-007": {
                "id": "SRV-007",
                "location": {"x": 2, "y": 12},
                "status": "injured",
                "detected": False
            },
            "SRV-008": {
                "id": "SRV-008",
                "location": {"x": 18, "y": 15},
                "status": "critical",
                "detected": False
            },
            "SRV-009": {
                "id": "SRV-009",
                "location": {"x": 10, "y": 18},
                "status": "stable",
                "detected": False
            },
            "SRV-010": {
                "id": "SRV-010",
                "location": {"x": 14, "y": 12},
                "status": "injured",
                "detected": False
            }
        }
        # Detection radius for survivors (increased from 2.5 to 5)
        self.detection_radius = 5.0
        # Recharging flag and rate
        self.is_recharging = False
        self.recharge_rate = 1.0  # percent per second
        self.last_update_time = time.time()

    def reset(self):
        self.rover_state = {
            "position": {"x": 2, "y": 3},
            "orientation": 90,  # degrees, 0 = North, 90 = East, etc.
            "battery": 95,
            "status": "operational"
        }
        self.active_sessions = {}
        # Reset survivor detection status
        if hasattr(self, 'all_survivors'):
            for survivor_id in self.all_survivors:
                self.all_survivors[survivor_id]["detected"] = False
        # Reset charging state
        self.is_recharging = False
        self.last_update_time = time.time()

    def create_session(self) -> str:
        """Create a new session and return its ID"""
        session_id = f"sim-{uuid.uuid4()}"
        self.active_sessions[session_id] = {
            "created_at": time.time(),
            "last_active": time.time()
        }
        return session_id
    
    def check_session(self, session_id: str) -> bool:
        """Check if a session exists and is active"""
        if session_id in self.active_sessions:
            # Update last active time
            self.active_sessions[session_id]["last_active"] = time.time()
            return True
        return False
    
    def get_survivors_in_range(self) -> List[Dict[str, Any]]:
        """Get survivors that are within detection range of the rover"""
        detected_survivors = []
        rover_pos = self.rover_state["position"]
        
        logger.info(f"Checking for survivors near rover position: {rover_pos}")
        logger.info(f"Detection radius: {self.detection_radius}")
        
        for survivor_id, survivor in self.all_survivors.items():
            # Calculate distance to the survivor
            dx = rover_pos["x"] - survivor["location"]["x"]
            dy = rover_pos["y"] - survivor["location"]["y"]
            distance = math.sqrt(dx**2 + dy**2)
            
            logger.info(f"Distance to {survivor_id}: {distance:.2f} units")
            
            # Check if survivor is within detection range
            if distance <= self.detection_radius:
                # Mark as detected
                self.all_survivors[survivor_id]["detected"] = True
                # Add to the list of detected survivors (without the "detected" field)
                survivor_data = survivor.copy()
                del survivor_data["detected"]
                detected_survivors.append(survivor_data)
                logger.info(f"Survivor {survivor_id} detected at distance {distance:.2f}")
        
        logger.info(f"Total survivors detected: {len(detected_survivors)}")
        return detected_survivors
    
    def get_all_detected_survivors(self) -> List[Dict[str, Any]]:
        """Get all survivors that have been detected so far"""
        detected_survivors = []
        
        for survivor_id, survivor in self.all_survivors.items():
            if survivor["detected"]:
                # Add to the list of detected survivors (without the "detected" field)
                survivor_data = survivor.copy()
                del survivor_data["detected"]
                detected_survivors.append(survivor_data)
        
        return detected_survivors

    def update_battery(self):
        """Update battery level based on charging state"""
        current_time = time.time()
        elapsed_seconds = current_time - self.last_update_time
        self.last_update_time = current_time
        
        # Check if battery is critical and needs to start recharging
        if self.rover_state["battery"] <= 5 and not self.is_recharging:
            logger.info("Battery level critical ({}%). Starting recharge...".format(
                self.rover_state["battery"]))
            self.is_recharging = True
            self.rover_state["status"] = "recharging"
        
        # If recharging, increase battery level
        if self.is_recharging:
            # Recharge at the specified rate
            charge_amount = self.recharge_rate * elapsed_seconds
            self.rover_state["battery"] = min(80, self.rover_state["battery"] + charge_amount)
            
            # Check if battery is charged enough to resume operations
            if self.rover_state["battery"] >= 80:
                logger.info("Battery recharged to {}%. Resuming operations.".format(
                    self.rover_state["battery"]))
                self.is_recharging = False
                self.rover_state["status"] = "operational"
        
        # Update communication status based on battery level
        if self.rover_state["battery"] < 10:
            self.rover_state["communicationActive"] = False
        elif self.rover_state["battery"] >= 10:
            self.rover_state["communicationActive"] = True
                
        # Return whether the rover is currently recharging
        return self.is_recharging

# Create simulation instance
simulation = RoverSimulation()

class Point:
    def __init__(self, coords):
        self.x = coords[0]
        self.y = coords[1]

def distance(p1, p2):
    return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)

def simple_rrt(start, goal, obstacles, max_iterations=1000):
    # Simple RRT implementation
    tree = [start]
    path = []
    
    for _ in range(max_iterations):
        # Random sample
        if random.random() < 0.1:
            sample = goal
        else:
            sample = Point([random.uniform(0, 10), random.uniform(0, 10)])
        
        # Find nearest node
        nearest_idx = 0
        nearest_dist = float('inf')
        for i, node in enumerate(tree):
            dist = distance(node, sample)
            if dist < nearest_dist:
                nearest_dist = dist
                nearest_idx = i
        
        nearest = tree[nearest_idx]
        
        # Create new node
        step_size = 0.5
        theta = math.atan2(sample.y - nearest.y, sample.x - nearest.x)
        new_node = Point([nearest.x + step_size * math.cos(theta), 
                          nearest.y + step_size * math.sin(theta)])
        
        # Check if path is obstacle-free
        collision = False
        for obs in obstacles:
            if distance(new_node, obs) < 0.5:
                collision = True
                break
        
        if not collision:
            tree.append(new_node)
            
            # Check if goal is reached
            if distance(new_node, goal) < 0.5:
                # Construct path
                current = len(tree) - 1
                path = [tree[current]]
                while current != 0:
                    current = nearest_idx
                    path.insert(0, tree[current])
                return path
    
    # Path not found
    return []

# Helper function for all API responses
def create_response(data=None, status_code=200, error=None):
    """Create a standardized API response"""
    response = {
        "timestamp": time.time(),
        "status": "success" if error is None else "error"
    }
    
    if data is not None:
        response["data"] = data
    
    if error is not None:
        response["error"] = error
    
    return jsonify(response), status_code

# Session handling middleware
def require_session(f):
    """Decorator to require a valid session for API endpoints"""
    def wrapper(*args, **kwargs):
        # Check if the session_id is provided in query parameters
        session_id = request.args.get('session_id')
        
        # If not in query, check JSON body
        if session_id is None and request.is_json:
            session_id = request.json.get('session_id')
        
        if session_id is None:
            return create_response(
                error="Session ID is required",
                status_code=401
            )
        
        if not simulation.check_session(session_id):
            return create_response(
                error="Invalid or expired session",
                status_code=401
            )
        
        return f(*args, **kwargs)
    
    # Preserve the original function's name and docstring
    wrapper.__name__ = f.__name__
    wrapper.__doc__ = f.__doc__
    return wrapper

@app.route('/api/session/start', methods=['POST', 'OPTIONS'])
def start_session():
    """Start a new session"""
    if request.method == 'OPTIONS':
        return '', 204
    
    # Reset simulation for a new session
    simulation.reset()
    
    # Create a new session
    session_id = simulation.create_session()
    
    logger.info(f"Started new session: {session_id}")
    
    # Return a session ID
    return jsonify({
        "session_id": session_id,
        "message": "Session started successfully",
        "status": "success"
    })

@app.route('/api/rrt_planner', methods=['POST'])
@require_session
def rrt_planner():
    """Path planning with RRT algorithm"""
    if not request.is_json:
        return create_response(
            error="Request must be JSON",
            status_code=400
        )
    
    data = request.json
    
    # Extract start and goal points
    start = Point([data.get('start_x', simulation.rover_state["position"]["x"]), 
                  data.get('start_y', simulation.rover_state["position"]["y"])])
    goal = Point([data.get('goal_x', 5), data.get('goal_y', 5)])
    scan_list = data.get('scan_list', [])
    
    # Create obstacles from scan data (simplified)
    obstacles = []
    for i in range(0, min(len(scan_list), 20), 2):
        if scan_list[i] < 3:  # If obstacle is close enough
            angle = i * math.pi / 180
            r = scan_list[i]
            x = start.x + r * math.cos(angle)
            y = start.y + r * math.sin(angle)
            obstacles.append(Point([x, y]))
    
    # Add some random obstacles for demonstration
    for _ in range(5):
        obstacles.append(Point([random.uniform(1, 9), random.uniform(1, 9)]))
    
    # Compute path
    path = simple_rrt(start, goal, obstacles)
    
    # Format path for response
    path_points = []
    for point in path:
        path_points.append({"x": point.x, "y": point.y})
    
    # Return directly instead of using create_response to match expected format
    return jsonify({
        "path": path_points,
        "obstacles": [{"x": obs.x, "y": obs.y} for obs in obstacles],
        "status": "success"
    })

@app.route('/api/rover/status', methods=['GET'])
@require_session
def rover_status():
    """Get the current rover status"""
    # Update battery and check recharging status
    is_recharging = simulation.update_battery()
    
    # Drain battery slightly on each status request (if not recharging)
    if not is_recharging:
        simulation.rover_state["battery"] = max(0, simulation.rover_state["battery"] - 0.05)
    
    # Return directly with the rover state
    return jsonify(simulation.rover_state)

@app.route('/api/rover/sensor-data', methods=['GET'])
@require_session
def sensor_data():
    """Get sensor data including detected survivors"""
    # Update battery status
    is_recharging = simulation.update_battery()
    
    # Drain battery slightly on each sensor data request (if not recharging)
    if not is_recharging:
        simulation.rover_state["battery"] = max(0, simulation.rover_state["battery"] - 0.1)
    
    # Get survivors within detection range
    current_survivors = simulation.get_survivors_in_range()
    # Get all detected survivors for consistent display
    all_detected = simulation.get_all_detected_survivors()
    
    # Return in the format expected by the client
    return jsonify({
        "temperature": 25 + random.uniform(-2, 2),
        "humidity": 45 + random.uniform(-5, 5),
        "batteryLevel": simulation.rover_state["battery"],
        "radiation": 0.1 + random.uniform(-0.05, 0.05),
        "airQuality": 95 + random.uniform(-2, 2),
        "survivors": all_detected
    })

@app.route('/api/rover/move', methods=['POST', 'OPTIONS'])
@require_session
def move_rover():
    """Move the rover in a specified direction"""
    if request.method == 'OPTIONS':
        return '', 204
    
    # Update battery and check recharging status
    is_recharging = simulation.update_battery()
    
    # If recharging, cannot move
    if is_recharging:
        return jsonify({
            "success": False,
            "message": f"Cannot move rover: Battery at {simulation.rover_state['battery']:.1f}% - currently recharging"
        })
    
    direction = request.args.get('direction', 'forward')
    
    # Drain battery on movement
    simulation.rover_state["battery"] = max(0, simulation.rover_state["battery"] - 0.5)
    
    # Set rover status to moving
    simulation.rover_state["status"] = "moving"
    
    # Update position based on direction and orientation
    if direction == 'forward':
        move_distance = 1
        rad = math.radians(simulation.rover_state["orientation"])
        simulation.rover_state["position"]["x"] += move_distance * math.cos(rad)
        simulation.rover_state["position"]["y"] += move_distance * math.sin(rad)
    elif direction == 'backward':
        move_distance = 1
        rad = math.radians(simulation.rover_state["orientation"] + 180)
        simulation.rover_state["position"]["x"] += move_distance * math.cos(rad)
        simulation.rover_state["position"]["y"] += move_distance * math.sin(rad)
    elif direction == 'left':
        # Rotate counterclockwise
        simulation.rover_state["orientation"] = (simulation.rover_state["orientation"] - 90) % 360
    elif direction == 'right':
        # Rotate clockwise
        simulation.rover_state["orientation"] = (simulation.rover_state["orientation"] + 90) % 360
    
    # Round position to 2 decimal places
    simulation.rover_state["position"]["x"] = round(simulation.rover_state["position"]["x"], 2)
    simulation.rover_state["position"]["y"] = round(simulation.rover_state["position"]["y"], 2)
    
    # Check if battery is critical after movement - might need to start recharging
    simulation.update_battery()
    
    logger.info(f"Rover moved {direction}. New position: {simulation.rover_state['position']}")
    
    # Return in format expected by client
    return jsonify({
        "success": True,
        "message": f"Rover moved {direction}"
    })

@app.route('/api/rover/stop', methods=['POST', 'OPTIONS'])
@require_session
def stop_rover():
    """Stop the rover"""
    if request.method == 'OPTIONS':
        return '', 204
    
    # Update battery and check recharging status
    is_recharging = simulation.update_battery()
    
    if is_recharging:
        return jsonify({
            "success": False,
            "message": "Rover is currently in recharging mode and cannot be operated"
        })
    
    simulation.rover_state["status"] = "idle"
    
    # Return in format expected by client
    return jsonify({
        "success": True,
        "message": "Rover stopped"
    })

@app.route('/api/fleet/status', methods=['GET'])
@require_session
def fleet_status():
    """Get fleet status"""
    # Return in format expected by client
    return jsonify({
        "activeRovers": 1,
        "totalRovers": 3,
        "status": "operational" if simulation.rover_state["battery"] > 20 else "low battery"
    })

@app.route('/api/disaster-rover-data', methods=['GET'])
@require_session
def disaster_data():
    """Get disaster data"""
    # Return in format expected by client
    return jsonify({
        "disasters": [
            {
                "id": 1,
                "type": "fire",
                "location": {"x": 5, "y": 5},
                "severity": "high",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
        ],
        "activeMissions": 1
    })

class ServerThread(threading.Thread):
    def __init__(self, app, host='0.0.0.0', port=5000):
        threading.Thread.__init__(self)
        self.server = make_server(host, port, app)
        self.ctx = app.app_context()
        self.ctx.push()
        
    def run(self):
        logger.info(f"API Server started on http://{self.server.host}:{self.server.port}")
        self.server.serve_forever()
        
    def shutdown(self):
        self.server.shutdown()

# Create server thread to allow for clean shutdown
server_thread = None

def start_server():
    global server_thread
    server_thread = ServerThread(app)
    server_thread.daemon = True
    server_thread.start()

def shutdown_server():
    global server_thread
    if server_thread:
        logger.info("Shutting down server...")
        server_thread.shutdown()
        logger.info("Server shutdown complete")

# Register shutdown function
atexit.register(shutdown_server)

if __name__ == '__main__':
    try:
        logger.info("Starting API server on http://localhost:5000")
        app.run(host='0.0.0.0', port=5000, debug=True)  # Use Flask's built-in server in debug mode for easier development
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt. Shutting down...")
        shutdown_server()
        sys.exit(0) 