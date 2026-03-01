import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  ShieldAlert,
  FileText,
  User,
  LogOut,
  Image as ImageIcon,
  ChevronRight
} from 'lucide-react';

// --- LOCAL AUTH HOOK (Fallback for standalone operation) ---
const useAuth = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Read user from localStorage to simulate Context behavior
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/'; // Hard redirect to login
  };

  return { user, logout };
};

// --- LOCAL UI COMPONENTS ---

const Button = ({ children, className = "", variant = "primary", disabled, onClick }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2";
  const variants: any = {
    primary: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>{children}</div>
);

const Badge = ({ children, className = "" }: any) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const Textarea = ({ className = "", ...props }: any) => (
  <textarea className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all ${className}`} {...props} />
);

// Simple Layout Wrapper
const DashboardLayout = ({ children, title }: any) => {
  const { logout, user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <span className="font-bold text-xl text-gray-900">ExamGuard</span>
            <span className="text-gray-400">|</span>
            <span className="font-medium text-gray-600">{title}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Signed in as <strong>{user?.name || 'Student'}</strong>
            </span>
            <Button variant="ghost" onClick={logout} className="text-sm">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

// --- MAIN COMPONENT ---

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // SELECTION STATE
  const [selectedCase, setSelectedCase] = useState<any>(null);

  const [responseMsg, setResponseMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  // 1. Fetch Student Data on Load
  const fetchDashboardData = async () => {
    try {
      if (!user?.id) return;
      const res = await axios.get(`http://localhost:5000/api/student/${user.id}/cases`);
      setData(res.data);

      // Auto-select the active case (priority) or the first case in history
      if (res.data.activeCaseDetails) {
        setSelectedCase(res.data.activeCaseDetails);
      } else if (res.data.cases && res.data.cases.length > 0) {
        // Hydrate the first case from history if no active case details are separate
        setSelectedCase(res.data.cases[0]);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // 2. Handle Response Submission
  const handleResponseSubmit = async (caseId: number) => {
    if (!responseMsg.trim()) return;

    // Parse ID just in case it's "CASE-1" format
    const numericId = typeof caseId === 'string' && caseId.startsWith('CASE-')
      ? parseInt(caseId.split('-')[1])
      : caseId;

    setSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/student/respond', {
        caseId: numericId,
        explanation: responseMsg
      });

      if (res.data.success) {
        alert("Response Recorded: Your explanation has been submitted.");
        setResponseMsg('');
        fetchDashboardData();
      }
    } catch (error) {
      alert("Submission Failed: Could not submit response.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to determine Image Source
  const getEvidenceSrc = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('https')) {
      return url;
    }
    return `http://localhost:5000/${url}`;
  };

  // Handle case selection from history list
  const handleCaseSelect = (historyCase: any) => {
    // If the clicked case matches the 'activeCaseDetails' ID, use the rich details object
    if (data?.activeCaseDetails && historyCase.id === data.activeCaseDetails.id) {
      setSelectedCase(data.activeCaseDetails);
    } else {
      // Otherwise use the history item (Note: History items currently lack evidenceUrl from backend)
      setSelectedCase(historyCase);
    }
    setShowEvidence(false); // Reset evidence toggle on switch
    setResponseMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading academic records...</p>
        </div>
      </div>
    );
  }

  // Determine if the currently selected case allows for a response
  const canRespond = selectedCase && selectedCase.status === 'REPORTED';
  // Determine if rich evidence data is available for the selected case
  const hasEvidence = selectedCase?.evidenceUrl;

  return (
    <DashboardLayout title="Student Portal">
      <div className="space-y-8">

        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
            <p className="text-gray-500">Register No: <span className="font-mono font-medium text-gray-700">{user?.id}</span></p>
          </div>
          {data?.hasActiveCase ? (
            <Badge className="bg-red-100 text-red-700 border border-red-200">Action Required</Badge>
          ) : (
            <Badge className="bg-green-100 text-green-700 border border-green-200">Good Standing</Badge>
          )}
        </div>

        {/* Selected Case Detail View */}
        {selectedCase ? (
          <div className={`rounded-xl shadow-sm overflow-hidden ring-1 ${selectedCase.status === 'REPORTED'
              ? 'bg-white border-l-4 border-red-500 ring-black/5'
              : 'bg-white border-l-4 border-gray-300 ring-gray-200'
            }`}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full shrink-0 ${selectedCase.status === 'REPORTED' ? 'bg-red-50' : 'bg-gray-100'
                  }`}>
                  {selectedCase.status === 'REPORTED' ? (
                    <ShieldAlert className="w-8 h-8 text-red-600" />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h2 className={`text-xl font-bold mb-1 ${selectedCase.status === 'REPORTED' ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                      {selectedCase.status === 'REPORTED' ? 'Active Malpractice Incident' : 'Case Details'}
                    </h2>
                    <Badge className="bg-gray-100 text-gray-600 border border-gray-200 font-mono">
                      {selectedCase.id}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600 mb-4 space-y-1 mt-2">
                    <p>Exam Code: <span className="font-semibold text-gray-900">{selectedCase.exam}</span></p>
                    <p>Date: <span className="font-semibold text-gray-900">{selectedCase.date}</span></p>
                    <p>Status: <span className={`font-semibold ${selectedCase.status === 'REPORTED' ? 'text-red-600' : 'text-blue-600'
                      }`}>{selectedCase.status}</span></p>
                    {selectedCase.invigilatorName && (
                      <p>Reported By: <span className="font-semibold text-gray-900">{selectedCase.invigilatorName}</span></p>
                    )}
                  </div>

                  <hr className="my-4 border-gray-100" />

                  {/* Evidence Toggle */}
                  <div className="mb-6">
                    {hasEvidence ? (
                      <div>
                        <button
                          onClick={() => setShowEvidence(!showEvidence)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                          {showEvidence ? 'Hide Evidence' : 'View Proof / Evidence'}
                        </button>

                        {showEvidence && (
                          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="space-y-2">
                              <img
                                src={getEvidenceSrc(selectedCase.evidenceUrl)}
                                alt="Evidence"
                                className="w-full h-auto max-h-96 object-contain rounded-md border border-gray-300 bg-white"
                                onError={(e: any) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://placehold.co/600x400?text=Evidence+Image+Error';
                                }}
                              />
                              <div className="flex justify-between items-center text-xs text-gray-500 px-1">
                                <span>Evidence ID: {selectedCase.id}</span>
                                <a
                                  href={getEvidenceSrc(selectedCase.evidenceUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-500 hover:underline flex items-center gap-1"
                                >
                                  Open Original <ChevronRight className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> No digital evidence available for this case.
                      </div>
                    )}
                  </div>

                  {/* Student Response Section */}
                  {!selectedCase.studentExplanation ? (
                    canRespond ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <MessageSquare className="w-4 h-4" />
                          Submit Your Explanation
                        </div>
                        <Textarea
                          placeholder="Please provide your explanation or defense regarding this incident..."
                          value={responseMsg}
                          onChange={(e: any) => setResponseMsg(e.target.value)}
                          className="min-h-[120px]"
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleResponseSubmit(selectedCase.id)}
                            disabled={submitting || !responseMsg.trim()}
                            variant="primary"
                          >
                            {submitting ? "Submitting Response..." : "Submit Official Response"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center text-gray-500 text-sm">
                        No response required or case is closed.
                      </div>
                    )
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" /> Response Submitted
                      </p>
                      <p className="text-sm text-gray-600 italic">"{selectedCase.studentExplanation}"</p>
                      <p className="text-xs text-gray-400 mt-2">Waiting for invigilator review.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-900 mb-2">No Active Incidents</h2>
            <p className="text-green-700 max-w-lg mx-auto">
              Select a case from history to view details if available.
            </p>
          </div>
        )}

        {/* Case History List */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <Clock className="w-5 h-5 text-gray-500" /> Case History
            </h3>
          </div>
          <div className="p-0">
            {data?.cases?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {data.cases.map((c: any) => (
                  <div
                    key={c.id}
                    onClick={() => handleCaseSelect(c)}
                    className={`p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer ${selectedCase?.id === c.id ? 'bg-blue-50/50' : ''
                      }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{c.exam}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-sm text-gray-500 font-mono">{c.id}</span>
                        {selectedCase?.id === c.id && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] ml-2">Viewing</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-3 h-3" /> Reported by: {c.invigilatorName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" /> {new Date(c.date).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`
                        ${c.status === 'CLOSED' ? 'bg-gray-100 text-gray-600' : ''}
                        ${c.status === 'REPORTED' ? 'bg-red-100 text-red-700' : ''}
                        ${c.status === 'PENDING_REVIEW' ? 'bg-orange-100 text-orange-700' : ''}
                      `}>
                        {c.status.replace('_', ' ')}
                      </Badge>

                      {c.studentExplanation && (
                        <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Response Sent
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p>No history found.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;