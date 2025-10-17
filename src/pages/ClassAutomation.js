import React, { useState } from 'react';
import Header from '../components/Header';
import AnimatedBackground from '../components/AnimatedBackground';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { generateScheduleFromExcel } from '../api';
import { teacherNotificationService } from '../services/teacherNotificationService';

const ClassAutomation = () => {
  const { currentUser } = useAuth();
  const { toasts, success, error, removeToast } = useToast();
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setResults(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      error('Please choose an Excel file to upload.');
      return;
    }

    setSubmitting(true);
    setResults(null);

    try {
      const response = await generateScheduleFromExcel(file);
      setResults(response);
      success('Schedule generation request completed.');

      if (response?.results?.length) {
        const processedTeachers = new Set();
        for (const item of response.results) {
          if (item.status !== 'created' || !item.class) continue;
          const teacherId = item.class.teacher_id;
          const teacherName = item.class.teacher;
          const teacherEmail = item.class.teacher_email || item.class.teacherEmail;
          const identityKey = teacherId != null ? `id:${teacherId}` : teacherEmail ? `email:${teacherEmail}` : teacherName;
          if (!identityKey || processedTeachers.has(identityKey)) continue;
          processedTeachers.add(identityKey);
          await teacherNotificationService.emitScheduleSnapshot({
            id: teacherId,
            name: teacherName,
            email: teacherEmail
          });
        }
      }
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to generate schedule.';
      error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white shadow-xl rounded-3xl p-10 text-center max-w-md">
          <i className="fas fa-lock text-4xl text-red-500 mb-4"></i>
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">Access Restricted</h1>
          <p className="text-slate-600">Only administrators can access the class automation tools.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AnimatedBackground />
      <Header user={currentUser} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-8 space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-800">Automated Class Scheduling</h1>
            <p className="text-slate-600">
              Upload an Excel file with columns such as <strong>Teacher</strong>, <strong>Subject</strong>, and <strong>Grade</strong>.
              Optional columns like <strong>Preferred Days</strong>, <strong>Preferred Times</strong>, <strong>Duration</strong>, and
              <strong> Max Students</strong> help fine-tune the generated timetable. The system uses AI to produce a conflict-free schedule.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Excel file (XLSX / XLS)
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-600
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0
                             file:text-sm file:font-semibold
                             file:bg-primary-100 file:text-primary-700
                             hover:file:bg-primary-200"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Ensure each row lists a teacher assignment. Example headers: Teacher, Subject, Grade, Preferred Days, Preferred Times.
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting || !file}
                className="px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow
                          hover:bg-primary-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Generating…' : 'Generate Schedule'}
              </button>
            </div>
          </form>

          {results && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800">Generation Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <SummaryCard label="Requests" value={results.summary?.requested ?? 0} />
                <SummaryCard label="Generated" value={results.summary?.generated ?? 0} />
                <SummaryCard label="Created" value={results.summary?.created ?? 0} highlight="success" />
                <SummaryCard label="Failed" value={results.summary?.failed ?? 0} highlight="danger" />
              </div>

              {Array.isArray(results.conflicts) && results.conflicts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
                  <h3 className="text-lg font-semibold text-amber-800">
                    Conflicts & Unscheduled Requests
                  </h3>
                  <ul className="space-y-2 text-sm text-amber-900">
                    {results.conflicts.map((conflict, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1 text-amber-600">⚠️</span>
                        <span>{conflict}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold text-slate-800">Details</h3>
                {results.results?.length ? (
                  <ul className="space-y-3">
                    {results.results.map((item, index) => (
                      <li
                        key={index}
                        className={`p-4 rounded-xl border text-sm ${
                          item.status === 'created'
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                      >
                        {item.status === 'created' ? (
                          <span>
                            ✅ Scheduled <strong>{item.class?.name || item.class?.code}</strong> for{' '}
                            <strong>{item.class?.teacher}</strong> on {item.class?.day} at {item.class?.time_slot}.
                          </span>
                        ) : (
                          <span>
                            ⚠️ Failed to schedule <strong>{item.suggestion?.subject || 'Unknown subject'}</strong> for{' '}
                            <strong>{item.suggestion?.teacher}</strong>. Reason: {item.reason || 'Unknown'}.
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-600">No additional details were returned from the generator.</p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const SummaryCard = ({ label, value, highlight }) => {
  const highlightClasses = {
    success: 'bg-green-100 text-green-700',
    danger: 'bg-red-100 text-red-700'
  };
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 ${highlight ? highlightClasses[highlight] : ''}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
};

export default ClassAutomation;
