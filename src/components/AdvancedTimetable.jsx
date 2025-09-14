// AdvancedTimetable.jsx
import React, { useEffect, useState } from "react";
import { runScheduler, uploadCSV } from "../api";


export default function AdvancedTimetable() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [algo, setAlgo] = useState("heuristic");

  useEffect(()=> {
    const token = localStorage.getItem("adv_token");
    if (token) { /* token already set in api */ }
  }, []);

  async function handleRun() {
    setLoading(true);
    try {
      const res = await runScheduler(algo);
      // backend returns events array
      setEvents(res.events || []);
    } catch (e) {
      console.error(e);
      alert("Scheduler failed");
    } finally { setLoading(false); }
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const res = await uploadCSV(file);
    alert("Uploaded: " + res.filename);
  }

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <select value={algo} onChange={e=>setAlgo(e.target.value)} className="border p-1">
          <option value="heuristic">Heuristic</option>
          <option value="ilp">ILP (slower)</option>
        </select>
        <button onClick={handleRun} className="px-3 py-1 bg-blue-600 text-white rounded">{loading? "Running...":"Run Scheduler"}</button>
        <label className="px-3 py-1 border rounded cursor-pointer">
          Upload CSV
          <input onChange={handleUpload} type="file" className="hidden" accept=".csv"/>
        </label>
      </div>

      <div className="grid grid-cols-6 gap-2">
        <div className="col-span-6 border p-3 rounded">
          {/* Simple events table preview */}
          <table className="w-full text-sm">
            <thead>
              <tr><th>Day</th><th>Start</th><th>End</th><th>Title</th><th>Teacher</th><th>Room</th></tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td>{["Mon","Tue","Wed","Thu","Fri"][ev.day]}</td>
                  <td>{ev.start}</td>
                  <td>{ev.end}</td>
                  <td>{ev.title}</td>
                  <td>{ev.teacher_id}</td>
                  <td>{ev.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
