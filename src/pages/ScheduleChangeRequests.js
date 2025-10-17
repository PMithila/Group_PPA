import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import AnimatedBackground from '../components/AnimatedBackground';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import {
  getScheduleChangeRequests,
  createScheduleChangeRequest,
  updateScheduleChangeRequestStatus,
  applyScheduleChangeRequest,
  getClasses,
  getLabSessions
} from '../api';
import { teacherNotificationService } from '../services/teacherNotificationService';

const weekdays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday'
];

const defaultTimeSlots = [
  '7:30-8:10',
  '8:10-8:30',
  '8:30-9:10',
  '9:10-10:30',
  '10:50-11:30',
  '11:30-12:10',
  '12:10-12:50',
  '12:50-1:30'
  
  
];

const statusLabels = {
  pending: 'Pending',
  resolved: 'Resolved',
  rejected: 'Rejected'
};

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200'
};

const buildSessionLabel = (session) => {
  if (!session) return 'Unknown session';
  const baseName = session.name || session.subject_name || session.code || `ID ${session.id}`;
  const day = session.day || 'Unscheduled';
  const time = session.time_slot || 'No time';
  return `${baseName} • ${day} • ${time}`;
};

const normalizeValue = (value) => (value === null || value === undefined ? '' : value);

const normalizeToLower = (value) => (value ? value.trim().toLowerCase() : '');

const matchesTeacher = (session, teacher) => {
  if (!session || !teacher) return false;
  const teacherName = normalizeToLower(teacher.name);
  const teacherEmail = normalizeToLower(teacher.email);
  const teacherId = teacher.id != null ? Number(teacher.id) : null;

  const sessionTeacherCandidates = [
    session.teacher,
    session.teacher_name,
    session.teacher_full_name
  ]
    .filter(Boolean)
    .map(normalizeToLower);

  if (teacherName && sessionTeacherCandidates.includes(teacherName)) {
    return true;
  }

  const sessionTeacherEmail = normalizeToLower(session.teacher_email);
  if (teacherEmail && sessionTeacherEmail && teacherEmail === sessionTeacherEmail) {
    return true;
  }

  const sessionTeacherIdRaw = session.teacher_id ?? session.teacher;
  const sessionTeacherId = sessionTeacherIdRaw != null ? Number(sessionTeacherIdRaw) : null;

  if (
    teacherId != null &&
    sessionTeacherId != null &&
    !Number.isNaN(teacherId) &&
    !Number.isNaN(sessionTeacherId) &&
    teacherId === sessionTeacherId
  ) {
    return true;
  }

  return false;
};

const ScheduleChangeRequests = () => {
  const { currentUser } = useAuth();
  const { toasts, success, error, warning, removeToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeActionId, setActiveActionId] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [applyForm, setApplyForm] = useState({
    day: '',
    time_slot: '',
    room: '',
    adminNotes: ''
  });
  const [formData, setFormData] = useState({
    sessionKey: '',
    reason: '',
    desiredDay: '',
    desiredTimeSlot: '',
    desiredRoom: '',
    desiredNotes: ''
  });

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
  const isTeacher = currentUser?.role?.toLowerCase() === 'teacher';

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getScheduleChangeRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch schedule change requests:', err);
      error('Failed to load schedule change requests.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    if (!isTeacher || !currentUser) return;
    try {
      setSessionsLoading(true);
      const [classes, labs] = await Promise.all([getClasses(), getLabSessions()]);

      const teacherClasses = Array.isArray(classes)
        ? classes
            .filter((cls) => matchesTeacher(cls, currentUser))
            .map((cls) => ({
              key: `class:${cls.id}`,
              sessionType: 'class',
              sessionId: cls.id,
              data: cls,
              label: `Class • ${buildSessionLabel(cls)}`,
              raw: cls
            }))
        : [];

      const teacherLabs = Array.isArray(labs)
        ? labs
            .filter((lab) => matchesTeacher(lab, currentUser))
            .map((lab) => ({
              key: `lab:${lab.id}`,
              sessionType: 'lab',
              sessionId: lab.id,
              data: lab,
              label: `Lab • ${buildSessionLabel(lab)}`,
              raw: lab
            }))
        : [];

      setSessions([...teacherClasses, ...teacherLabs]);

      if ([...teacherClasses, ...teacherLabs].length === 0) {
        warning('No classes or labs assigned to you were found.');
      }
    } catch (err) {
      console.error('Failed to load teacher sessions:', err);
      error('Failed to load your scheduled classes and labs.');
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isTeacher && currentUser) {
      fetchSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacher, currentUser?.id]);

  const filteredRequests = useMemo(() => {
    if (filterStatus === 'all') return requests;
    return requests.filter((req) => req.status === filterStatus);
  }, [requests, filterStatus]);

  const selectedSession = useMemo(() => {
    if (!formData.sessionKey) return null;
    return sessions.find((session) => session.key === formData.sessionKey) || null;
  }, [sessions, formData.sessionKey]);

  const resetForm = () => {
    setFormData({
      sessionKey: '',
      reason: '',
      desiredDay: '',
      desiredTimeSlot: '',
      desiredRoom: '',
      desiredNotes: ''
    });
  };

  const resetActionState = () => {
    setActiveActionId(null);
    setApplyForm({
      day: '',
      time_slot: '',
      room: '',
      adminNotes: ''
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFormChange = (event) => {
    const { name, value } = event.target;
    setApplyForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitRequest = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const reason = formData.reason.trim();
    if (!formData.sessionKey) {
      error('Please select the class or lab you want to change.');
      return;
    }

    if (reason.length < 5) {
      error('Please provide a reason with at least 5 characters.');
      return;
    }

    const [sessionType, sessionIdRaw] = formData.sessionKey.split(':');
    const sessionId = Number(sessionIdRaw);
    if (!sessionId || Number.isNaN(sessionId)) {
      error('Invalid session selected. Please refresh and try again.');
      return;
    }

    const payload = {
      sessionType,
      sessionId,
      reason
    };

    if (formData.desiredDay) payload.desiredDay = formData.desiredDay;
    if (formData.desiredTimeSlot) payload.desiredTimeSlot = formData.desiredTimeSlot;
    if (formData.desiredRoom) payload.desiredRoom = formData.desiredRoom.trim();
    if (formData.desiredNotes) payload.desiredNotes = formData.desiredNotes.trim();

    try {
      setSubmitting(true);
      await createScheduleChangeRequest(payload);
      await teacherNotificationService.emitScheduleSnapshot({
        id: currentUser?.id,
        name: currentUser?.name,
        email: currentUser?.email
      });
      success('Schedule change request submitted.');
      resetForm();
      await fetchRequests();
    } catch (err) {
      console.error('Failed to submit schedule change request:', err);
      const message = err?.response?.data?.error || 'Failed to submit schedule change request.';
      error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const openActionPanel = (request) => {
    const baseDay =
      request.desired_day ||
      request.class_details?.day ||
      request.lab_details?.day ||
      '';
    const baseTime =
      request.desired_time_slot ||
      request.class_details?.time_slot ||
      request.lab_details?.time_slot ||
      '';
    const baseRoom =
      request.desired_room ||
      request.class_details?.room ||
      request.lab_details?.room ||
      '';

    setActiveActionId(request.id);
    setApplyForm({
      day: baseDay,
      time_slot: baseTime,
      room: baseRoom,
      adminNotes: ''
    });
  };

  const emitScheduleRefreshForRequest = async (request) => {
    if (!request) return;
    await teacherNotificationService.emitScheduleSnapshot({
      id: request.teacher_id || request.teacher_details?.id,
      name: request.teacher_name || request.teacher_details?.name,
      email: request.teacher_details?.email
    });
  };

  const handleApplyRequest = async (request) => {
    const requestId = request?.id;
    if (!requestId) return;
    try {
      setProcessingAction(true);
      const payload = {};
      if (applyForm.day) payload.day = applyForm.day;
      if (applyForm.time_slot) payload.time_slot = applyForm.time_slot;
      if (applyForm.room) payload.room = applyForm.room;
      if (applyForm.adminNotes) payload.adminNotes = applyForm.adminNotes.trim();

      await applyScheduleChangeRequest(requestId, payload);
      success('Schedule updated and request resolved.');
      resetActionState();
      await fetchRequests();
      await emitScheduleRefreshForRequest(request);
    } catch (err) {
      console.error('Failed to apply schedule change request:', err);
      const message = err?.response?.data?.error || 'Failed to apply schedule change request.';
      error(message);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleResolveWithoutApply = async (request) => {
    const requestId = request?.id;
    if (!requestId) return;
    try {
      setProcessingAction(true);
      const payload = {
        status: 'resolved',
        adminNotes: applyForm.adminNotes?.trim() || undefined
      };
      await updateScheduleChangeRequestStatus(requestId, payload);
      success('Request marked as resolved.');
      resetActionState();
      await fetchRequests();
      await emitScheduleRefreshForRequest(request);
    } catch (err) {
      console.error('Failed to mark request resolved:', err);
      const message = err?.response?.data?.error || 'Failed to update request.';
      error(message);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectRequest = async (request) => {
    const requestId = request?.id;
    if (!requestId) return;
    const notes = applyForm.adminNotes?.trim();
    if (!notes) {
      error('Please provide admin notes before rejecting the request.');
      return;
    }

    try {
      setProcessingAction(true);
      await updateScheduleChangeRequestStatus(requestId, {
        status: 'rejected',
        adminNotes: notes
      });
      success('Request rejected.');
      resetActionState();
      await fetchRequests();
      await emitScheduleRefreshForRequest(request);
    } catch (err) {
      console.error('Failed to reject request:', err);
      const message = err?.response?.data?.error || 'Failed to reject request.';
      error(message);
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AnimatedBackground />
      <Header user={currentUser} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur-lg border border-white/40 rounded-3xl shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Schedule Change Requests</h1>
                <p className="text-slate-500">
                  {isAdmin
                    ? 'Review and manage teacher schedule change requests.'
                    : 'Request adjustments to your scheduled classes or labs.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">
                  Total requests
                </span>
                <span className="px-4 py-2 rounded-full bg-primary-100 text-primary-700 font-semibold">
                  {requests.length}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
                  <span>Loading requests...</span>
                </div>
              </div>
            ) : (
              <>
                {isTeacher && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Submit a request</h2>
                    <form className="space-y-4" onSubmit={handleSubmitRequest}>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                          Select class or lab
                        </label>
                        <select
                          name="sessionKey"
                          value={formData.sessionKey}
                          onChange={handleFormChange}
                          disabled={sessionsLoading}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                          required
                        >
                          <option value="">
                            {sessionsLoading ? 'Loading sessions...' : 'Choose a class or lab'}
                          </option>
                          {sessions.map((session) => (
                            <option key={session.key} value={session.key}>
                              {session.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedSession && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
                          <p className="font-semibold text-slate-700 mb-1">
                            Current schedule details
                          </p>
                          <p>
                            <span className="font-medium">Day:</span>{' '}
                            {normalizeValue(selectedSession.data.day) || 'Not assigned'}
                          </p>
                          <p>
                            <span className="font-medium">Time:</span>{' '}
                            {normalizeValue(selectedSession.data.time_slot) || 'Not assigned'}
                          </p>
                          <p>
                            <span className="font-medium">Room:</span>{' '}
                            {normalizeValue(selectedSession.data.room) || 'Not assigned'}
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                          Reason for change
                        </label>
                        <textarea
                          name="reason"
                          rows={4}
                          value={formData.reason}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                          placeholder="Explain why you need the change and include any relevant details."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-2">
                            Preferred day (optional)
                          </label>
                          <select
                            name="desiredDay"
                            value={formData.desiredDay}
                            onChange={handleFormChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                          >
                            <option value="">No preference</option>
                            {weekdays.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-2">
                            Preferred time slot (optional)
                          </label>
                          <select
                            name="desiredTimeSlot"
                            value={formData.desiredTimeSlot}
                            onChange={handleFormChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                          >
                            <option value="">No preference</option>
                            {defaultTimeSlots.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-2">
                            Preferred room (optional)
                          </label>
                          <input
                            type="text"
                            name="desiredRoom"
                            value={formData.desiredRoom}
                            onChange={handleFormChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                            placeholder="Enter a preferred room if any"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                          Additional details (optional)
                        </label>
                        <textarea
                          name="desiredNotes"
                          rows={3}
                          value={formData.desiredNotes}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                          placeholder="Include any other helpful information."
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="inline-flex items-center px-5 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-sm hover:bg-primary-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                            <>
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane mr-2" />
                              Submit request
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">Filter by status:</span>
                      <select
                        value={filterStatus}
                        onChange={(event) => setFilterStatus(event.target.value)}
                        className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="text-sm text-slate-500">
                      Showing{' '}
                      <span className="font-semibold text-slate-700">
                        {filteredRequests.length}
                      </span>{' '}
                      requests
                    </div>
                  </div>
                )}

                {filteredRequests.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500">
                    <i className="fas fa-info-circle text-2xl text-slate-400 mb-3" />
                    <p>
                      {isAdmin
                        ? 'No schedule change requests match the selected filter.'
                        : 'You have not submitted any schedule change requests yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((request) => {
                      const isPending = request.status === 'pending';
                      const classInfo = request.class_details;
                      const labInfo = request.lab_details;
                      const sessionLabel = classInfo
                        ? `Class • ${buildSessionLabel(classInfo)}`
                        : labInfo
                          ? `Lab • ${buildSessionLabel(labInfo)}`
                          : 'Session not found';

                      return (
                        <div
                          key={request.id}
                          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusStyles[request.status] || statusStyles.pending}`}>
                                  {statusLabels[request.status] || request.status}
                                </span>
                                <span className="text-sm text-slate-500">
                                  Submitted {new Date(request.created_at).toLocaleString()}
                                </span>
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                  Session
                                </p>
                                <p className="text-base font-semibold text-slate-800">
                                  {sessionLabel}
                                </p>
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                  Teacher
                                </p>
                                <p className="text-base text-slate-700">
                                  {request.teacher_name || request.teacher_details?.name || 'Unknown'}{' '}
                                  <span className="text-sm text-slate-500">
                                    ({request.teacher_details?.email || 'No email'})
                                  </span>
                                </p>
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                  Reason
                                </p>
                                <p className="text-base text-slate-700 whitespace-pre-line">
                                  {request.reason}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                    Current day
                                  </p>
                                  <p className="text-sm text-slate-700">
                                    {classInfo?.day || labInfo?.day || 'Not scheduled'}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    Requested: {request.desired_day || 'No preference'}
                                  </p>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                    Current time
                                  </p>
                                  <p className="text-sm text-slate-700">
                                    {classInfo?.time_slot || labInfo?.time_slot || 'Not scheduled'}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    Requested: {request.desired_time_slot || 'No preference'}
                                  </p>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                    Current room
                                  </p>
                                  <p className="text-sm text-slate-700">
                                    {classInfo?.room || labInfo?.room || 'Not assigned'}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    Requested: {request.desired_room || 'No preference'}
                                  </p>
                                </div>
                              </div>

                              {request.desired_notes && (
                                <div>
                                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                    Additional details
                                  </p>
                                  <p className="text-base text-slate-700 whitespace-pre-line">
                                    {request.desired_notes}
                                  </p>
                                </div>
                              )}

                              {request.admin_notes && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                  <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                                    Admin notes
                                  </p>
                                  <p className="text-sm text-emerald-700 whitespace-pre-line">
                                    {request.admin_notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            {isAdmin && (
                              <div className="w-full lg:max-w-sm">
                                {isPending ? (
                                  <div className="border border-primary-100 bg-primary-50/70 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                      <h3 className="text-sm font-semibold text-primary-700 uppercase tracking-wide">
                                        Admin actions
                                      </h3>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          activeActionId === request.id
                                            ? resetActionState()
                                            : openActionPanel(request)
                                        }
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                      >
                                        {activeActionId === request.id ? 'Close' : 'Review'}
                                      </button>
                                    </div>

                                    {activeActionId === request.id ? (
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <label className="block text-xs font-semibold text-primary-700 uppercase tracking-wide">
                                            Adjusted day
                                          </label>
                                          <select
                                            name="day"
                                            value={applyForm.day}
                                            onChange={handleApplyFormChange}
                                            className="w-full px-3 py-2 rounded-lg border border-primary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                          >
                                            <option value="">Use requested or current day</option>
                                            {weekdays.map((day) => (
                                              <option key={day} value={day}>
                                                {day}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <div className="space-y-2">
                                          <label className="block text-xs font-semibold text-primary-700 uppercase tracking-wide">
                                            Adjusted time slot
                                          </label>
                                          <select
                                            name="time_slot"
                                            value={applyForm.time_slot}
                                            onChange={handleApplyFormChange}
                                            className="w-full px-3 py-2 rounded-lg border border-primary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                          >
                                            <option value="">Use requested or current time</option>
                                            {defaultTimeSlots.map((slot) => (
                                              <option key={slot} value={slot}>
                                                {slot}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <div className="space-y-2">
                                          <label className="block text-xs font-semibold text-primary-700 uppercase tracking-wide">
                                            Adjusted room
                                          </label>
                                          <input
                                            type="text"
                                            name="room"
                                            value={applyForm.room}
                                            onChange={handleApplyFormChange}
                                            className="w-full px-3 py-2 rounded-lg border border-primary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                            placeholder="Leave empty to keep requested/current room"
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <label className="block text-xs font-semibold text-primary-700 uppercase tracking-wide">
                                            Admin notes
                                          </label>
                                          <textarea
                                            name="adminNotes"
                                            rows={3}
                                            value={applyForm.adminNotes}
                                            onChange={handleApplyFormChange}
                                            className="w-full px-3 py-2 rounded-lg border border-primary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                            placeholder="Provide context for your decision."
                                          />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                          <button
                                            type="button"
                                            disabled={processingAction}
                                          onClick={() => handleApplyRequest(request)}
                                            className="inline-flex justify-center items-center px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                          >
                                            {processingAction ? (
                                              <>
                                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                Applying...
                                              </>
                                            ) : (
                                              <>
                                                <i className="fas fa-check mr-2" />
                                                Apply change & resolve
                                              </>
                                            )}
                                          </button>
                                          <button
                                            type="button"
                                            disabled={processingAction}
                                            onClick={() => handleResolveWithoutApply(request)}
                                            className="inline-flex justify-center items-center px-4 py-2 rounded-lg bg-white text-primary-700 font-semibold border border-primary-200 hover:bg-primary-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                          >
                                            Mark as resolved
                                          </button>
                                          <button
                                            type="button"
                                            disabled={processingAction}
                                            onClick={() => handleRejectRequest(request)}
                                            className="inline-flex justify-center items-center px-4 py-2 rounded-lg bg-white text-rose-600 font-semibold border border-rose-200 hover:bg-rose-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                          >
                                            Reject request
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-primary-600">
                                        Click review to adjust schedule and resolve this request.
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                                    <p className="text-sm text-slate-600">
                                      This request was {request.status} on{' '}
                                      {request.resolved_at
                                        ? new Date(request.resolved_at).toLocaleString()
                                        : 'N/A'}
                                      .
                                    </p>
                                    {request.admin_details?.name && (
                                      <p className="text-xs text-slate-500 mt-2">
                                        Handled by {request.admin_details.name}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScheduleChangeRequests;
