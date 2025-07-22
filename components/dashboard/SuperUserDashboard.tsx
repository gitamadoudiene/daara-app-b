'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SchoolManagement } from '@/components/superuser/SchoolManagement';
import { AdministratorManagement } from '@/components/superuser/AdministratorManagement';
import { SystemAnalytics } from '@/components/superuser/SystemAnalytics';
import { GlobalSettings } from '@/components/superuser/GlobalSettings';
import { UserOverview } from '@/components/superuser/UserOverview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  Shield, 
  Settings,
  TrendingUp,
  Database
} from 'lucide-react';

type ActivePage = 'schools' | 'administrators' | 'analytics' | 'settings' | 'users';

export function SuperUserDashboard() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>('schools');

  // Mock data for demonstration
  const stats = [
    { title: 'Total Schools', value: '12', icon: Building2, color: 'text-blue-600' },
    { title: 'Total Administrators', value: '24', icon: Shield, color: 'text-green-600' },
    { title: 'Active Users', value: '2,847', icon: Users, color: 'text-purple-600' },
    { title: 'System Health', value: '99.9%', icon: TrendingUp, color: 'text-emerald-600' }
  ];

  const sidebarItems = [
    { icon: Building2, label: 'School Management', key: 'schools' as ActivePage },
    { icon: Shield, label: 'Administrator Management', key: 'administrators' as ActivePage },
    { icon: Database, label: 'System Analytics', key: 'analytics' as ActivePage },
    { icon: Settings, label: 'Global Settings', key: 'settings' as ActivePage },
    { icon: Users, label: 'User Overview', key: 'users' as ActivePage }
  ];

  const sidebar = (
    <nav className="space-y-2">
      {sidebarItems.map((item, index) => (
        <Button
          key={index}
          variant={activePage === item.key ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActivePage(item.key)}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </nav>
  );

  const renderActivePage = () => {
    switch (activePage) {
      case 'schools':
        return <SchoolManagement />;
      case 'administrators':
        return <AdministratorManagement />;
      case 'analytics':
        return <SystemAnalytics />;
      case 'settings':
        return <GlobalSettings />;
      case 'users':
        return <UserOverview />;
      default:
        return <SchoolManagement />;
    }
  };

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">
            Manage schools and administrators across the entire DAARA system.
          </p>
        </div>

        {/* Stats Grid - Show only on main dashboard */}
        {activePage === 'schools' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    System-wide metrics
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Active Page Content */}
        {renderActivePage()}
      </div>
    </DashboardLayout>
  );
}