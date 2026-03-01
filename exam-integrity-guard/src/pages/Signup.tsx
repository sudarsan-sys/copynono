import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Shield, GraduationCap, Eye, EyeOff, Mail, Hash, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'invigilator' | 'student';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [role, setRole] = useState<UserRole>('student');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Common Fields
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    // Role Specific Fields
    const [email, setEmail] = useState(''); // Invigilator
    const [staffId, setStaffId] = useState(''); // Invigilator
    const [regNo, setRegNo] = useState(''); // Student
    const [dept, setDept] = useState(''); // Student

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                role,
                name,
                password, // Sent but not stored in DB currently
                ...(role === 'invigilator' ? { email, staffId } : { regNo, dept })
            };

            const response = await axios.post('http://localhost:5000/api/auth/register', payload);

            if (response.data.success) {
                toast({
                    title: "Account Created!",
                    description: "Registration successful. Please login to continue.",
                });
                navigate('/');
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.response?.data?.message || "Could not create account.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden bg-gray-50">
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600 shadow-lg mb-4">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-500 text-sm">Join ExamGuard System</p>
                </div>

                <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">

                    {/* Role Toggles */}
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('student')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <User className="w-4 h-4" /> Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('invigilator')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${role === 'invigilator' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Shield className="w-4 h-4" /> Invigilator
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Student Specific Fields */}
                        {role === 'student' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="regNo">Register Number</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="regNo"
                                            placeholder="e.g. STU-005"
                                            className="pl-9"
                                            value={regNo}
                                            onChange={(e) => setRegNo(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dept">Department</Label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="dept"
                                            placeholder="e.g. CSE"
                                            className="pl-9"
                                            value={dept}
                                            onChange={(e) => setDept(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Invigilator Specific Fields */}
                        {role === 'invigilator' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="staffId">Staff ID</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="staffId"
                                            placeholder="e.g. PROF-005"
                                            className="pl-9"
                                            value={staffId}
                                            onChange={(e) => setStaffId(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="e.g. prof@college.edu"
                                            className="pl-9"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Password (UI Only for now) */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    className="pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-500">Already have an account? </span>
                        <Link to="/" className="text-blue-600 font-medium hover:underline">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;