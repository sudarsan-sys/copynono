import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Upload,
  Camera,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Clock,
  User,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

// UI Components - Using relative paths to avoid alias resolution issues
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useToast } from '../../hooks/use-toast';

const steps = [
  { id: 1, title: 'Student ID', icon: User },
  { id: 2, title: 'Incident Details', icon: FileText },
  { id: 3, title: 'Evidence', icon: ImageIcon },
  { id: 4, title: 'Review', icon: Check },
];

const malpracticeTypes = [
  { value: 'unauthorized_material', label: 'Unauthorized material (cheat sheet, notes)' },
  { value: 'electronic_device', label: 'Electronic device usage' },
  { value: 'communication', label: 'Communication with other students' },
  { value: 'copying', label: 'Copying from another student' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'other', label: 'Other' },
];

const ReportMalpractice: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- DATABASE STUDENT STATE ---
  const [dbStudents, setDbStudents] = useState<any[]>([]);
  const [fetchingStudents, setFetchingStudents] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // --- FETCH REAL STUDENTS FROM DATABASE ---
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Calling your backend API to get students stored in PostgreSQL
        const res = await axios.get('http://localhost:5000/api/student');
        if (res.data.success) {
          setDbStudents(res.data.students);
        }
      } catch (err) {
        console.error("Failed to fetch students", err);
        toast({
          variant: "destructive",
          title: "Database Error",
          description: "Could not load the student list from the server."
        });
      } finally {
        setFetchingStudents(false);
      }
    };
    fetchStudents();
  }, [toast]);

  // Incident Details State
  const [incidentTime, setIncidentTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
  const [malpracticeType, setMalpracticeType] = useState('');
  const [severity, setSeverity] = useState<'minor' | 'major' | 'severe' | ''>('');
  const [description, setDescription] = useState('');

  // Evidence State
  const [realFile, setRealFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; size: string }[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  // Filter students fetched from DB based on search input
  const filteredStudents = dbStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.regNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRealFile(file);
      setUploadedFiles([{ name: file.name, type: file.type, size: `${(file.size / 1024 / 1024).toFixed(2)} MB` }]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      // Mapping the regNo to the studentReg field required by your backend
      formData.append('studentReg', selectedStudent.regNo);
      formData.append('examCode', 'CS101');
      formData.append('invigilatorId', '1');
      formData.append('description', `[${severity.toUpperCase()}] ${malpracticeType}: ${description}`);
      if (realFile) formData.append('evidenceImage', realFile);

      const response = await axios.post('http://localhost:5000/api/reports/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        toast({ title: 'Success', description: `Malpractice report filed for ${selectedStudent.name}.` });
        navigate('/invigilator/dashboard');
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: "Could not save the report to the database." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Search Registered Students</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Name or Register Number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {fetchingStudents ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                  <Loader2 className="animate-spin w-8 h-8 text-primary" />
                  <p className="text-sm">Connecting to database...</p>
                </div>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <Card
                    key={student.regNo}
                    className={`cursor-pointer border-2 transition-all duration-200 ${selectedStudent?.regNo === student.regNo
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-transparent hover:border-primary/30 bg-card'
                      }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${selectedStudent?.regNo === student.regNo ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                          }`}>
                          <User className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-foreground">{student.name}</h4>
                            {selectedStudent?.regNo === student.regNo && (
                              <Badge className="bg-primary text-white">Selected</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">
                            {student.regNo} • <span className="text-primary/70">{student.dept}</span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                  <User className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No students found in the database.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Time of Incident</Label>
              <div className="relative w-48">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="time" value={incidentTime} onChange={(e) => setIncidentTime(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-base font-medium">Type of Malpractice</Label>
              <div className="grid gap-2">
                {malpracticeTypes.map((type) => (
                  <label key={type.value} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${malpracticeType === type.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <input type="radio" name="malpracticeType" value={type.value} checked={malpracticeType === type.value} onChange={(e) => setMalpracticeType(e.target.value)} className="sr-only" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-base font-medium">Severity Level</Label>
              <div className="flex gap-3">
                {['minor', 'major', 'severe'].map((level) => (
                  <button key={level} type="button" onClick={() => setSeverity(level as any)} className={`flex-1 p-4 rounded-lg border-2 capitalize transition-all font-bold ${severity === level ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">Description of Incident</Label>
              <Textarea
                placeholder="Describe what happened (minimum 10 characters)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div
              className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Upload Visual Evidence</h3>
              <p className="text-sm text-muted-foreground">Click to select an image from your device</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            {uploadedFiles.length > 0 && (
              <div className="p-4 bg-secondary/50 rounded-xl flex justify-between items-center border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[200px]">{uploadedFiles[0].name}</p>
                    <p className="text-xs text-muted-foreground">{uploadedFiles[0].size}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => { setRealFile(null); setUploadedFiles([]); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card className="bg-muted/50 border-0 shadow-none">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground text-sm font-medium">Student</span>
                  <span className="text-sm font-bold text-foreground">{selectedStudent?.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground text-sm font-medium">Register No</span>
                  <span className="text-sm font-bold text-foreground font-mono">{selectedStudent?.regNo}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground text-sm font-medium">Malpractice Type</span>
                  <span className="text-sm font-bold text-foreground">
                    {malpracticeTypes.find(t => t.value === malpracticeType)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm font-medium">Severity</span>
                  <Badge className={`capitalize ${severity === 'severe' ? 'bg-red-600' : severity === 'major' ? 'bg-yellow-600' : 'bg-green-600'
                    }`}>
                    {severity}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
              <Checkbox id="confirm" checked={confirmed} onCheckedChange={(checked) => setConfirmed(checked as boolean)} />
              <Label htmlFor="confirm" className="text-sm cursor-pointer text-amber-900 leading-tight">
                I solemnly verify that the details provided are accurate and based on direct observation.
              </Label>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedStudent !== null;
      case 2: return malpracticeType && severity && description.length >= 10;
      case 3: return true;
      case 4: return confirmed;
      default: return false;
    }
  };

  return (
    <DashboardLayout title="Report Malpractice">
      <div className="max-w-2xl mx-auto py-4">
        {/* Step Indicator */}
        <div className="mb-10 flex justify-between px-2">
          {steps.map((step) => (
            <div key={step.id} className={`flex flex-col items-center gap-2 transition-all duration-300 ${currentStep === step.id ? 'scale-110' : 'opacity-60'
              }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= step.id ? 'border-primary bg-primary text-white shadow-glow' : 'border-muted bg-background text-muted-foreground'
                }`}>
                {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep === step.id ? 'text-primary' : 'text-muted-foreground'
                }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden mb-8">
          <div className="bg-primary/5 px-6 py-4 border-b">
            <h2 className="text-lg font-bold text-primary">{steps[currentStep - 1].title}</h2>
          </div>
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center px-2">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
            className="hover:bg-primary/5"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          <div className="flex gap-4">
            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                className="px-8"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!confirmed || isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white px-8 shadow-lg shadow-red-200"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  "Submit Final Report"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportMalpractice;