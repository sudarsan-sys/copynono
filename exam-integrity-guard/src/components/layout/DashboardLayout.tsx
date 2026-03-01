import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileWarning,
  FileText,
  Calendar,
  Settings,
  HelpCircle,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Users,
  BarChart3,
  Shield,
  User,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
  highlight?: boolean;
}

const getNavItems = (role: UserRole): NavItem[] => {
  switch (role) {
    case 'invigilator':
      return [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', href: '/invigilator/dashboard' },
        { icon: <FileWarning className="w-5 h-5" />, label: 'Report Malpractice', href: '/invigilator/report', highlight: true },
        { icon: <FileText className="w-5 h-5" />, label: 'My Reports', href: '/invigilator/reports' },
        { icon: <Calendar className="w-5 h-5" />, label: 'Exam Schedule', href: '/invigilator/schedule' },
        { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/invigilator/settings' },
        { icon: <HelpCircle className="w-5 h-5" />, label: 'Help & Support', href: '/invigilator/help' },
      ];
    case 'admin':
      return [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', href: '/admin/dashboard' },
        { icon: <FileText className="w-5 h-5" />, label: 'All Cases', href: '/admin/cases', badge: 12 },
        { icon: <Users className="w-5 h-5" />, label: 'Students', href: '/admin/students' },
        { icon: <Shield className="w-5 h-5" />, label: 'Invigilators', href: '/admin/invigilators' },
        { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics', href: '/admin/analytics' },
        { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/admin/settings' },
      ];
    case 'student':
      return [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', href: '/student/dashboard' },
        { icon: <FileText className="w-5 h-5" />, label: 'My Cases', href: '/student/cases' },
        { icon: <HelpCircle className="w-5 h-5" />, label: 'Guidelines', href: '/student/guidelines' },
        { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/student/settings' },
      ];
    default:
      return [];
  }
};

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'invigilator':
      return <Shield className="w-4 h-4" />;
    case 'admin':
      return <GraduationCap className="w-4 h-4" />;
    case 'student':
      return <User className="w-4 h-4" />;
  }
};

const getRoleLabel = (role: UserRole) => {
  switch (role) {
    case 'invigilator':
      return 'Invigilator';
    case 'admin':
      return 'Administrator';
    case 'student':
      return 'Student';
  }
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  if (!user) return null;

  const navItems = getNavItems(user.role);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 gradient-primary transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-sidebar-primary" />
              </div>
              <span className="text-lg font-bold text-sidebar-foreground">ExamGuard</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-foreground'
                      : item.highlight
                      ? 'bg-sidebar-primary/20 text-sidebar-primary hover:bg-sidebar-primary/30'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}
                >
                  <span className={`${item.highlight && !isActive ? 'text-sidebar-primary' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant="warning" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sm font-semibold text-sidebar-foreground">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60 flex items-center gap-1">
                  {getRoleIcon(user.role)}
                  {getRoleLabel(user.role)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary-foreground">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-foreground">{user.name}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-secondary transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
