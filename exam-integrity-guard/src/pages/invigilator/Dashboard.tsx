import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  FileText,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Mock data for Exam (Static for now)
const currentExam = {
  name: 'CS101 - Database Management Systems',
  time: { start: '10:00 AM', end: '1:00 PM' },
  venue: 'Examination Hall A, Block 3',
  students: { present: 87, total: 90 },
};

const InvigilatorDashboard: React.FC = () => {
  // 1. Timer State
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 30, seconds: 0 });

  // 2. Backend Data State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    activeExams: 0,
    myReports: 0
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);

  // 3. Fetch Data from Backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reports/dashboard');
        
        if (response.data.success) {
          setStats(response.data.stats);
          setRecentReports(response.data.recentReports);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 4. Countdown Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        else if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        else if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  // 5. Dynamic Stats Array
  const quickStats = [
    { label: 'Total Reports Today', value: stats.totalReports, icon: FileText, trend: 'Updated just now' },
    { label: 'Pending Reviews', value: stats.pendingReports, icon: Clock, trend: 'Awaiting action' },
    { label: 'Active Exams', value: stats.activeExams, icon: ClipboardCheck, trend: 'In progress' },
    { label: 'My Total Reports', value: stats.myReports, icon: AlertTriangle, trend: 'This semester' },
  ];

  return (
    <DashboardLayout title="Invigilator Dashboard">
      <div className="space-y-6">
        {/* Live Exam Status */}
        <Card className="border-0 shadow-glass bg-gradient-to-br from-card to-secondary/20 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Live Exam Status</CardTitle>
              <Badge variant="success" className="animate-pulse-slow">
                <span className="w-2 h-2 bg-success-foreground rounded-full mr-2 inline-block" />
                In Progress
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Exam Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">{currentExam.name}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{currentExam.time.start} - {currentExam.time.end}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{currentExam.venue}</span>
                  </div>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center justify-center md:justify-end">
                <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-6 py-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold font-mono text-primary">
                    {formatTime(countdown.hours)}:{formatTime(countdown.minutes)}:{formatTime(countdown.seconds)}
                  </span>
                  <span className="text-sm text-muted-foreground">remaining</span>
                </div>
              </div>
            </div>

            {/* Students Present */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Students Present</span>
                </div>
                <span className="font-semibold text-foreground">
                  {currentExam.students.present}/{currentExam.students.total}
                </span>
              </div>
              <Progress value={(currentExam.students.present / currentExam.students.total) * 100} className="h-2" />
            </div>

            {/* Action Buttons - UPDATED: REMOVED Attendance & View Reports */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/invigilator/report">
                <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-pulse-ring shadow-glow-accent gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  🚨 Report Malpractice
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-glass hover:shadow-glass-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">
                       {loading ? "..." : stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.trend}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Reports */}
        <Card className="border-0 shadow-glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading reports...</div>
            ) : recentReports.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No reports found.</div>
            ) : (
                <div className="divide-y divide-border">
                {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                        report.severity === 'minor' ? 'bg-yellow-500' :
                        report.severity === 'major' ? 'bg-orange-500' :
                        'bg-red-600'
                        }`} />
                        <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{report.id}</span>
                            <Badge variant="outline" className="text-xs">
                            {report.severity.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{report.studentName} • {report.time}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'}>
                        {report.status === 'pending' ? 'Pending Review' : 'Under Review'}
                        </Badge>
                    </div>
                    </div>
                ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InvigilatorDashboard;