# api/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class AITimetableScheduler:
    def __init__(self):
        self.teachers = []
        self.subjects = []
        self.rooms = []
        self.constraints = []
    
    def load_data(self, excel_data):
        """Load data from Excel sheets"""
        try:
            # Parse the Excel data
            if 'Teachers' in excel_data:
                self.teachers = excel_data['Teachers']
            if 'Subjects' in excel_data:
                self.subjects = excel_data['Subjects']
            if 'Classrooms' in excel_data:
                self.rooms = excel_data['Classrooms']
            
            return True
        except Exception as e:
            print(f"Error loading data: {e}")
            return False
    
    def generate_timetable(self, constraints=None):
        """Generate optimized timetable using AI algorithms"""
        try:
            # This is where the AI magic happens
            # For now, we'll create a sample timetable
            timetable = self._create_sample_timetable()
            
            # Apply constraints if provided
            if constraints:
                timetable = self._apply_constraints(timetable, constraints)
            
            return timetable
        except Exception as e:
            print(f"Error generating timetable: {e}")
            return None
    
    def _create_sample_timetable(self):
        """Create a sample timetable for demonstration"""
        days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        time_slots = [
            '8:00-9:00', '9:00-10:00', '10:00-11:00', 
            '11:00-12:00', '12:00-1:00', '1:00-2:00'
        ]
        
        timetable = []
        for time in time_slots:
            day_entries = {}
            for day in days_of_week:
                # 70% chance of having a class
                if np.random.random() > 0.3:
                    subject = f"SUB{np.random.randint(100, 500)}"
                    room = f"Room {chr(65 + np.random.randint(0, 10))}{np.random.randint(1, 20)}"
                    teacher = f"Teacher {np.random.randint(1, 50)}"
                    
                    class_types = ['lecture', 'lab', 'tutorial']
                    class_type = np.random.choice(class_types)
                    
                    day_entries[day] = {
                        'type': class_type,
                        'content': f"{subject} ({room})",
                        'teacher': teacher,
                        'subject': subject,
                        'room': room
                    }
                else:
                    day_entries[day] = None
            
            timetable.append({
                'time': time,
                'days': day_entries
            })
        
        return timetable
    
    def _apply_constraints(self, timetable, constraints):
        """Apply scheduling constraints to the timetable"""
        # Implement constraint satisfaction logic here
        # This would include:
        # - Teacher availability constraints
        # - Room capacity constraints
        # - Subject requirements
        # - Time slot preferences
        
        return timetable
    
    def analyze_timetable(self, timetable):
        """Analyze timetable for conflicts and optimization opportunities"""
        analysis = {
            'conflicts': [],
            'optimization_opportunities': [],
            'teacher_workload': {},
            'room_utilization': {}
        }
        
        # Check for teacher conflicts
        teacher_assignments = {}
        for slot in timetable:
            for day, class_info in slot['days'].items():
                if class_info:
                    key = f"{day}-{slot['time']}"
                    if key not in teacher_assignments:
                        teacher_assignments[key] = []
                    
                    if class_info['teacher'] in teacher_assignments[key]:
                        analysis['conflicts'].append({
                            'type': 'teacher_conflict',
                            'teacher': class_info['teacher'],
                            'day': day,
                            'time': slot['time'],
                            'message': f"{class_info['teacher']} is double-booked at {slot['time']} on {day}"
                        })
                    else:
                        teacher_assignments[key].append(class_info['teacher'])
        
        return analysis

# Initialize the AI scheduler
ai_scheduler = AITimetableScheduler()

@app.route('/api/generate-timetable', methods=['POST'])
def generate_timetable():
    """API endpoint to generate timetable"""
    try:
        data = request.get_json()
        excel_data = data.get('excel_data', {})
        constraints = data.get('constraints', {})
        
        # Load data into scheduler
        if not ai_scheduler.load_data(excel_data):
            return jsonify({'error': 'Failed to load data'}), 400
        
        # Generate timetable
        timetable = ai_scheduler.generate_timetable(constraints)
        
        if timetable:
            # Analyze the generated timetable
            analysis = ai_scheduler.analyze_timetable(timetable)
            
            return jsonify({
                'success': True,
                'timetable': timetable,
                'analysis': analysis
            })
        else:
            return jsonify({'error': 'Failed to generate timetable'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-timetable', methods=['POST'])
def analyze_timetable():
    """API endpoint to analyze existing timetable"""
    try:
        data = request.get_json()
        timetable = data.get('timetable', [])
        
        analysis = ai_scheduler.analyze_timetable(timetable)
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, port=5000)