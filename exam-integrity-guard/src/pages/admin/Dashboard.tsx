import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Filter,
  Search,
  Check,
  X,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Student {
  name: string;
  regNo: string;
  dept: string;
}

interface Invigilator {
  name: string;
  staffId: string;
}

interface Evidence {
  storageUrl: string;
  checksumHash: string;
  fileType: string;
  isSuspectedDuplicate?: boolean;
  duplicateOfId?: number;
  pHash?: string;
}

interface Report {
  id: number;
  student: Student;
  invigilator: Invigilator;
  examCode: string;
  status: string; // PENDING, UNDER_REVIEW, ACCEPTED, REJECTED
  incidentDate: string;
  malpracticeType?: string;
  severityLevel?: string;
  adminRemarks?: string;
  studentExplanation?: string;
  evidence: Evidence[];
}

const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reports/all');
      if (response.data.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selectedReport) return;
    try {
      const response = await axios.patch(`http://localhost:5000/api/reports/${selectedReport.id}/status`, {
        status,
        adminRemarks
      });
      if (response.data.success) {
        setReports(reports.map(r => r.id === selectedReport.id ? { ...r, status, adminRemarks } : r));
        setSelectedReport(null);
        setAdminRemarks("");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'PENDING').length,
    resolved: reports.filter(r => ['ACCEPTED', 'REJECTED'].includes(r.status)).length
  };

  const filteredReports = reports.filter(r =>
    r.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.student?.regNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.examCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `CASE-${r.id}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Top Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-glass hover:shadow-glass-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-info/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Cases</p>
                  <p className="text-4xl font-bold tracking-tight text-foreground">{stats.total}</p>
                </div>
                <div className="p-3 rounded-2xl bg-info/15 text-info ring-1 ring-info/20 shadow-inner">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-glass hover:shadow-glass-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-warning/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                  <p className="text-4xl font-bold tracking-tight text-foreground">{stats.pending}</p>
                </div>
                <div className="p-3 rounded-2xl bg-warning/15 text-warning ring-1 ring-warning/20 shadow-inner">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-glass hover:shadow-glass-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Resolved Cases</p>
                  <p className="text-4xl font-bold tracking-tight text-foreground">{stats.resolved}</p>
                </div>
                <div className="p-3 rounded-2xl bg-success/15 text-success ring-1 ring-success/20 shadow-inner">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card className="border-0 shadow-glass bg-card/50 backdrop-blur-xl">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border/50 gap-4">
            <div>
              <CardTitle className="text-xl font-semibold tracking-tight">Malpractice Reports</CardTitle>
              <CardDescription>Manage and review the reported incidents</CardDescription>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search student, id, exam..."
                  className="w-full pl-9 bg-background/50 border-border/50 focus:bg-background transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0 bg-background/50 border-border/50">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr className="border-b border-border/50">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Case ID</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student Info</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Exam</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severity</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span>Loading reports...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No reports found.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group cursor-pointer" onClick={() => setSelectedReport(report)}>
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm font-medium text-primary">CASE-{report.id}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">{report.student?.name}</p>
                              {report.evidence?.[0]?.isSuspectedDuplicate && (
                                <Badge variant="destructive" className="animate-pulse bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25 text-[10px] py-0 h-5">
                                  🚨 Duplicate of #{report.evidence[0].duplicateOfId}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{report.student?.regNo} • {report.student?.dept}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="font-mono bg-background/50 border-border/50 text-foreground">{report.examCode}</Badge>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-foreground">{new Date(report.incidentDate).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{new Date(report.incidentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            variant="outline"
                            className={`
                              ${report.severityLevel === 'major' ? 'border-orange-500/30 text-orange-500 bg-orange-500/10' :
                                report.severityLevel === 'severe' ? 'border-red-500/30 text-red-500 bg-red-500/10' :
                                  'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'}
                            `}
                          >
                            {report.severityLevel || 'Minor'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            variant="secondary"
                            className={`
                              ${report.status === 'PENDING' ? 'bg-warning/15 text-warning border-warning/20' :
                                report.status === 'ACCEPTED' ? 'bg-success/15 text-success border-success/20' :
                                  report.status === 'REJECTED' ? 'bg-destructive/15 text-destructive border-destructive/20' :
                                    'bg-info/15 text-info border-info/20'}
                            `}
                          >
                            {report.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            Review <ChevronDown className="w-4 h-4 ml-1 -rotate-90" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Custom Review Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-4xl rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight">Review Case CASE-{selectedReport.id}</h2>
                    {selectedReport.evidence?.[0]?.isSuspectedDuplicate && (
                      <Badge variant="destructive" className="bg-destructive/15 text-destructive border-destructive/30 text-xs">
                        🚨 Possible Duplicate of Case #{selectedReport.evidence[0].duplicateOfId}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Student: {selectedReport.student?.name} ({selectedReport.student?.regNo})</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => setSelectedReport(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
                {/* Evidence Section */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Evidence Snapshot
                  </h3>
                  {selectedReport.evidence && selectedReport.evidence.length > 0 ? (
                    <div className="space-y-4">
                      <div className="rounded-xl overflow-hidden border border-border shadow-sm ring-1 ring-black/5">
                        <img
                          src={selectedReport.evidence[0].storageUrl}
                          alt="Evidence snapshot"
                          className="w-full object-cover max-h-[300px]"
                        />
                      </div>
                      <div className="bg-muted/30 p-4 rounded-xl border border-border font-mono text-xs space-y-4">
                        <div>
                          <p className="text-muted-foreground mb-1">Cryptographic Hash (SHA-256):</p>
                          <p className="break-all text-primary/80" title="Integrity Check (Must match original exactly)">
                            {selectedReport.evidence[0].checksumHash}
                          </p>
                        </div>
                        {selectedReport.evidence[0].pHash && (
                          <div className="pt-3 border-t border-border/50">
                            <p className="text-muted-foreground mb-1">Perceptual Hash (pHash):</p>
                            <p className="break-all text-warning/80" title="Visual Similarity Check">
                              {selectedReport.evidence[0].pHash}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground bg-muted/10">
                      No visual evidence available
                    </div>
                  )}
                </div>

                {/* Details & Actions Section */}
                <div className="w-full lg:w-[400px] flex flex-col gap-6">
                  <div className="bg-muted/20 p-5 rounded-xl border border-border space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Exam Code</p>
                        <p className="font-semibold text-foreground">{selectedReport.examCode}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Reported By</p>
                        <p className="font-semibold text-foreground">{selectedReport.invigilator?.name}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground mb-1">Malpractice Type</p>
                        <p className="font-medium text-foreground">{selectedReport.malpracticeType || "Unauthorized Reference"}</p>
                      </div>
                      {selectedReport.studentExplanation && (
                        <div className="col-span-2 mt-2 p-3 bg-background rounded-lg border border-border/50">
                          <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">Student Explanation</p>
                          <p className="text-sm text-foreground italic">"{selectedReport.studentExplanation}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">Admin Verdict & Remarks</label>
                    <Textarea
                      placeholder="Add official remarks regarding the decision..."
                      className="resize-none h-28 bg-background border-border/50 focus:border-primary"
                      value={adminRemarks}
                      onChange={(e) => setAdminRemarks(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                    <Button
                      className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      onClick={() => handleStatusUpdate('ACCEPTED')}
                      disabled={!adminRemarks}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Accept & Penalize
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 hover:bg-success hover:text-success-foreground border-success/30 hover:border-success/50"
                      onClick={() => handleStatusUpdate('REJECTED')}
                      disabled={!adminRemarks}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Reject (Dismiss)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
