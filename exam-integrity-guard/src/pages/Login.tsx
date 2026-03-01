import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Shield, User, Lock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Define UserRole locally if not exported from context
type UserRole = 'invigilator' | 'admin' | 'student';

const roleOptions: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  { value: 'invigilator', label: 'Invigilator', icon: <Shield className="w-4 h-4" /> },
  { value: 'student', label: 'Student', icon: <User className="w-4 h-4" /> },
  { value: 'admin', label: 'Administrator', icon: <GraduationCap className="w-4 h-4" /> },
];

// UPDATED: Credentials matching your SERVER SEED DATA
const demoCredentials = [
  { role: 'Invigilator', label: 'Dr. Snape', identifier: 'snape@college.edu', password: 'any' },
  { role: 'Student', label: 'Harry Potter', identifier: 'STU-001', password: 'any' },
  { role: 'Admin', label: 'Admin User', identifier: 'admin@college.edu', password: 'admin123' },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Using the real async login
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState(''); // Changed from email to identifier (supports RegNo)
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('invigilator');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the AuthContext login (which hits the backend)
      const success = await login(identifier, password, role);

      if (success) {
        toast({
          title: 'Welcome back!',
          description: `Logged in successfully as ${role}.`,
        });

        // Redirect based on role
        switch (role) {
          case 'invigilator': navigate('/invigilator/dashboard'); break;
          case 'admin': navigate('/admin/dashboard'); break;
          case 'student': navigate('/student/dashboard'); break;
        }
      } else {
        toast({
          title: 'Login failed',
          description: 'User not found. Please check credentials.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Server error. Is the backend running?',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (id: string, pass: string, r: string) => {
    setIdentifier(id);
    setPassword(pass);
    setRole(r.toLowerCase() as UserRole);
  };

  const selectedRole = roleOptions.find(r => r.value === role);

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden bg-gray-50">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600 shadow-lg mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">ExamGuard</h1>
          <p className="text-gray-500 text-sm">Malpractice Detection System</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Sign in</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Login as</Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="w-full flex items-center justify-between h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {selectedRole?.icon}
                    <span className="text-sm capitalize">{selectedRole?.label}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setRole(option.value);
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50"
                      >
                        {option.icon} {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ID Field */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium">
                {role === 'student' ? 'Register Number' : 'Email Address'}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="identifier"
                  placeholder={role === 'student' ? 'e.g. STU-001' : 'e.g. prof@college.edu'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isLoading ? 'Verifying...' : 'Sign In'}
            </Button>
          </form>

          {/* SIGN UP REDIRECT BUTTON */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link to="/signup" className="text-blue-600 font-medium hover:underline">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Helper for Testing */}
        <div className="mt-6 bg-white/50 p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3 font-medium uppercase">
            Click to fill Seed Credentials
          </p>
          <div className="space-y-2">
            {demoCredentials.map((cred) => (
              <button
                key={cred.role}
                onClick={() => fillDemoCredentials(cred.identifier, cred.password, cred.role)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 transition-colors text-xs"
              >
                <span className="font-medium text-gray-700">{cred.role}: {cred.label}</span>
                <span className="text-gray-500 font-mono">{cred.identifier}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;