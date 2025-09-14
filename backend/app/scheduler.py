# scheduler.py
"""
Provides:
- run_heuristic(data, config)
- run_ilp(data, config)

data: dict with keys: teachers, subjects, rooms, availability (pandas DataFrames or lists/dicts)
config: dict with scheduling params (days, start/end times, slot_minutes)
"""

from datetime import datetime, timedelta
import pandas as pd
from typing import List, Dict, Any
import pulp

def default_config():
    # Monday-Friday, 7:30-13:30, 30-min slots
    return {
        "days": [0,1,2,3,4],
        "start": "07:30",
        "end": "13:30",
        "slot_minutes": 30
    }

def time_to_minutes(hhmm: str) -> int:
    h,m = map(int, hhmm.split(":"))
    return h*60 + m

def build_slot_times(cfg):
    start = time_to_minutes(cfg["start"])
    end = time_to_minutes(cfg["end"])
    step = cfg["slot_minutes"]
    times = list(range(start, end, step))
    return times

# Heuristic scheduler: greedy placement
def run_heuristic(data: Dict[str, Any], config: Dict[str, Any] = None):
    cfg = config or default_config()
    slot_times = build_slot_times(cfg)
    num_slots = len(slot_times)
    days = cfg["days"]

    teachers_df = data.get("teachers")
    subjects_df = data.get("subjects")
    rooms_df = data.get("rooms")
    availability_df = data.get("availability")

    # Normalize to dataframes if lists/dicts given
    if isinstance(teachers_df, list): teachers_df = pd.DataFrame(teachers_df)
    if isinstance(subjects_df, list): subjects_df = pd.DataFrame(subjects_df)
    if isinstance(rooms_df, list): rooms_df = pd.DataFrame(rooms_df)
    if isinstance(availability_df, list): availability_df = pd.DataFrame(availability_df)

    # Build teacher availability map (teacher_id -> day -> set(slot_idx))
    teacher_ids = list(teachers_df['id'].astype(str)) if teachers_df is not None else []
    teacher_avail = {tid: {d:set(range(num_slots)) for d in days} for tid in teacher_ids}
    if availability_df is not None:
        for _, row in availability_df.iterrows():
            tid = str(row['teacher_id'])
            day = int(row['day'])
            start = time_to_minutes(row['start'])
            end = time_to_minutes(row['end'])
            indices = [i for i,t in enumerate(slot_times) if t >= start and t+cfg['slot_minutes'] <= end]
            teacher_avail[tid][day] = set(indices)

    # Rooms all available unless further constraints
    room_ids = list(rooms_df['id'].astype(str)) if rooms_df is not None else []
    room_avail = {rid: {d:set(range(num_slots)) for d in days} for rid in room_ids}

    # Prepare subjects list with required number of periods
    subjects = []
    for _, row in subjects_df.iterrows():
        subjects.append({
            "id": str(row['id']),
            "name": row.get('name', str(row['id'])),
            "teacher_id": str(row.get('teacher_id')) if not pd.isna(row.get('teacher_id')) else None,
            "periods": int(row.get('periods_per_week', 1))
        })

    # Greedy place heaviest-first
    subjects = sorted(subjects, key=lambda s: -s['periods'])
    schedule_events = []
    schedule_grid = {d: [None]*num_slots for d in days}
    teacher_occupancy = {tid: {d:set() for d in days} for tid in teacher_ids}

    for subj in subjects:
        to_place = subj['periods']
        placed = 0
        # try to distribute over slots/days
        for round_idx in range(num_slots):
            if placed >= to_place:
                break
            for d in days:
                if placed >= to_place:
                    break
                si = (round_idx + d) % num_slots
                if schedule_grid[d][si] is not None:
                    continue
                tid = subj['teacher_id']
                if tid and si not in teacher_avail.get(tid, {}).get(d, set()):
                    continue
                if tid and si in teacher_occupancy.get(tid, {}).get(d, set()):
                    continue
                # find room
                found_room = None
                for rid in room_ids:
                    if si in room_avail[rid][d]:
                        found_room = rid
                        break
                if not found_room:
                    continue
                schedule_grid[d][si] = {"subject_id": subj['id'], "teacher_id": tid, "room": found_room}
                if tid:
                    teacher_occupancy[tid][d].add(si)
                room_avail[found_room][d].remove(si)
                event = {
                    "id": f"{subj['id']}_{d}_{si}",
                    "title": subj['name'],
                    "subject_id": subj['id'],
                    "teacher_id": tid,
                    "day": d,
                    "start": minutes_to_hhmm(slot_times[si]),
                    "end": minutes_to_hhmm(slot_times[si] + cfg['slot_minutes']),
                    "room": found_room
                }
                schedule_events.append(event)
                placed += 1
    return schedule_events

def minutes_to_hhmm(m: int):
    hh = m // 60
    mm = m % 60
    return f"{hh:02d}:{mm:02d}"

# ILP scheduler using PuLP (more optimal; slower)
def run_ilp(data: Dict[str, Any], config: Dict[str, Any] = None, time_limit: int = 30):
    cfg = config or default_config()
    slot_times = build_slot_times(cfg)
    num_slots = len(slot_times)
    days = cfg['days']

    teachers_df = data.get("teachers")
    subjects_df = data.get("subjects")
    rooms_df = data.get("rooms")
    availability_df = data.get("availability")

    if isinstance(teachers_df, list): teachers_df = pd.DataFrame(teachers_df)
    if isinstance(subjects_df, list): subjects_df = pd.DataFrame(subjects_df)
    if isinstance(rooms_df, list): rooms_df = pd.DataFrame(rooms_df)
    if isinstance(availability_df, list): availability_df = pd.DataFrame(availability_df)

    teacher_ids = list(teachers_df['id'].astype(str)) if teachers_df is not None else []
    room_ids = list(rooms_df['id'].astype(str)) if rooms_df is not None else []

    # teacher availability map
    teacher_avail = {tid: {d:set(range(num_slots)) for d in days} for tid in teacher_ids}
    if availability_df is not None:
        for _, row in availability_df.iterrows():
            tid = str(row['teacher_id'])
            d = int(row['day'])
            s = time_to_minutes(row['start']); e = time_to_minutes(row['end'])
            indices = [i for i,t in enumerate(slot_times) if t >= s and t+cfg['slot_minutes'] <= e]
            teacher_avail[tid][d] = set(indices)

    # Build subject list
    subjects = []
    for _, row in subjects_df.iterrows():
        subjects.append({
            "id": str(row['id']),
            "name": row.get('name', str(row['id'])),
            "teacher_id": str(row.get('teacher_id')) if not pd.isna(row.get('teacher_id')) else None,
            "periods": int(row.get('periods_per_week', 1))
        })

    prob = pulp.LpProblem("timetable", pulp.LpMinimize)
    # Decision variables x[s,d,t,r] in {0,1}
    x = {}
    for s in subjects:
        sid = s['id']
        for d in days:
            for t in range(num_slots):
                for r in room_ids:
                    name = f"x_{sid}_{d}_{t}_{r}"
                    x[(sid,d,t,r)] = pulp.LpVariable(name, cat="Binary")

    # Objective: minimize teacher gaps (soft). For simplicity, minimize sum of assigned values (prefers fewer assignments where possible)
    prob += pulp.lpSum([x_var for x_var in x.values()])

    # Constraints:
    # 1) Each subject must be scheduled exactly 'periods' times (across all days/times/rooms)
    for s in subjects:
        prob += pulp.lpSum([x[(s['id'],d,t,r)] for d in days for t in range(num_slots) for r in room_ids]) == s['periods']

    # 2) Teacher conflict: a teacher can teach at most one subject in a given slot
    for tid in teacher_ids:
        for d in days:
            for t in range(num_slots):
                relevant = []
                for s in subjects:
                    if s['teacher_id'] == tid:
                        for r in room_ids:
                            relevant.append(x[(s['id'],d,t,r)])
                if relevant:
                    prob += pulp.lpSum(relevant) <= 1

    # 3) Room conflict: at most one subject in a room at a slot
    for r in room_ids:
        for d in days:
            for t in range(num_slots):
                prob += pulp.lpSum([x[(s['id'],d,t,r)] for s in subjects]) <= 1

    # 4) Teacher availability
    for s in subjects:
        tid = s['teacher_id']
        if not tid:
            continue
        for d in days:
            allowed = teacher_avail.get(tid, {}).get(d, set())
            for t in range(num_slots):
                if t not in allowed:
                    for r in room_ids:
                        prob += x[(s['id'],d,t,r)] == 0

    # Solve (respect time_limit)
    pulp.PULP_CBC_CMD(msg=False, timeLimit=time_limit).solve(prob)

    events = []
    for (sid,d,t,r), var in x.items():
        if var.value() and var.value() > 0.5:
            # find subject record
            srec = next(s for s in subjects if s['id']==sid)
            ev = {
                "id": f"{sid}_{d}_{t}_{r}",
                "title": srec['name'],
                "subject_id": sid,
                "teacher_id": srec.get('teacher_id'),
                "day": d,
                "start": minutes_to_hhmm(slot_times[t]),
                "end": minutes_to_hhmm(slot_times[t] + cfg['slot_minutes']),
                "room": r
            }
            events.append(ev)
    return events
