import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import AnimatedBackground from '../components/AnimatedBackground';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { createLeaveRequest, getLeaveRequests, updateLeaveStatus } from '../api';

const statusClasses = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200'
};

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected'
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const LeaveRequests = () => {
  const { currentUser } = useAuth();
  const { toasts, success, error, removeToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [decisionDialog, setDecisionDialog] = useState({
    open: false,
    request: null,
    status: null,
    note: ''
  });
  const [processingDecision, setProcessingDecision] = useState(false);

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const data = await getLeaveRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
      error('Failed to load leave requests.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedReason = formData.reason.trim();
    if (!formData.startDate || !formData.endDate || trimmedReason.length < 3) {
      error('Please fill all fields with valid values.');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      error('Start date cannot be after end date.');
      return;
    }

    try {
      setSubmitting(true);
      await createLeaveRequest({
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: trimmedReason
      });
      success('Leave request submitted.');
      setFormData({ startDate: '', endDate: '', reason: '' });
      await fetchLeaveRequests();
    } catch (err) {
      console.error('Failed to submit leave request:', err);
      const message = err?.response?.data?.error || 'Failed to submit leave request.';
      error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = useMemo(() => {
    if (filterStatus === 'all') return requests;
    return requests.filter((req) => req.status === filterStatus);
  }, [requests, filterStatus]);

  const openDecisionDialog = (request, status) => {
    setDecisionDialog({
      open: true,
      request,
      status,
      note: ''
    });
  };

  const closeDecisionDialog = () => {
    setDecisionDialog({
      open: false,
      request: null,
      status: null,
      note: ''
    });
    setProcessingDecision(false);
  };

  const handleDecisionSubmit = async () => {
    if (!decisionDialog.request || !decisionDialog.status) return;
    try {
      setProcessingDecision(true);
      await updateLeaveStatus(decisionDialog.request.id, {
        status: decisionDialog.status,
        decisionNote: decisionDialog.note?.trim() || undefined
      });
      success(`Leave ${decisionDialog.status === 'approved' ? 'approved' : 'rejected'}.`);
      closeDecisionDialog();
      await fetchLeaveRequests();
    } catch (err) {
      console.error('Failed to update leave request:', err);
      const message = err?.response?.data?.error || 'Failed to update leave request.';
      error(message);
      setProcessingDecision(false);
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
                <h1 className="text-3xl font-bold text-slate-800">Leave Management</h1>
                <p className="text-slate-500">
                  {isAdmin
                    ? 'Review, approve, or reject teacher leave requests.'
                    : 'Submit a leave request and track its status.'}
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

            {!isAdmin && (
              <form
                onSubmit={handleSubmit}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Reason
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleFormChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    placeholder="Tell us why you need this leave..."
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {submitting ? 'Submitting...' : 'Submit Leave Request'}
                  </button>
                </div>
              </form>
            )}

            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-full border transition ${
                      filterStatus === status
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                    }`}
                  >
                    {status === 'all' ? 'All' : statusLabels[status]}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center text-slate-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    Loading leave requests...
                  </div>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-500 bg-white/60">
                  <i className="fas fa-umbrella-beach text-3xl mb-3 text-primary-400"></i>
                  <p>{isAdmin ? 'No leave requests match this filter.' : 'No leave requests yet. Submit one above!'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white/90 border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-800">
                              {request.teacher_name || currentUser?.name || 'Teacher'}
                            </h3>
                            {request.teacher_email && (
                              <span className="text-sm text-slate-500">{request.teacher_email}</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            Submitted {formatDate(request.created_at)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            statusClasses[request.status] || statusClasses.pending
                          }`}
                        >
                          {statusLabels[request.status] || request.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs uppercase text-slate-500 tracking-wide">From</p>
                          <p className="text-base font-medium text-slate-700">
                            {formatDate(request.start_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-slate-500 tracking-wide">To</p>
                          <p className="text-base font-medium text-slate-700">
                            {formatDate(request.end_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-slate-500 tracking-wide">Status</p>
                          <p className="text-base font-medium text-slate-700 capitalize">
                            {statusLabels[request.status] || request.status}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-slate-700">Reason:</span>{' '}
                          {request.reason}
                        </p>
                      </div>

                      {request.decision_note && (
                        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
                          <p className="text-sm text-slate-600">
                            <span className="font-medium text-slate-700">
                              Admin note ({request.approver_name || 'Admin'}):
                            </span>{' '}
                            {request.decision_note}
                          </p>
                          <p className="text-xs text-slate-400 mt-2">
                            Updated {formatDate(request.decision_at)}
                          </p>
                        </div>
                      )}

                      {isAdmin && request.status === 'pending' && (
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            onClick={() => openDecisionDialog(request, 'approved')}
                            className="px-5 py-2 rounded-xl bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openDecisionDialog(request, 'rejected')}
                            className="px-5 py-2 rounded-xl bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {decisionDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {decisionDialog.status === 'approved' ? 'Approve' : 'Reject'} leave request
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {decisionDialog.request?.teacher_name || 'Teacher'} ·{' '}
                  {formatDate(decisionDialog.request?.start_date)} to{' '}
                  {formatDate(decisionDialog.request?.end_date)}
                </p>
              </div>
              <button
                onClick={closeDecisionDialog}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Note to teacher (optional)
              </label>
              <textarea
                rows={4}
                value={decisionDialog.note}
                onChange={(e) =>
                  setDecisionDialog((prev) => ({ ...prev, note: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                placeholder="Share additional context about this decision..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDecisionDialog}
                disabled={processingDecision}
                className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDecisionSubmit}
                disabled={processingDecision}
                className={`px-5 py-2 rounded-xl text-white font-semibold shadow disabled:opacity-60 ${
                  decisionDialog.status === 'approved'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {processingDecision ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
