'use client';

import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { SuperUserDashboard } from '@/components/dashboard/SuperUserDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { ParentDashboard } from '@/components/dashboard/ParentDashboard';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginForm />;
  }

  switch (user.role) {
    case 'super_user':
      return <SuperUserDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <LoginForm />;
  }
}