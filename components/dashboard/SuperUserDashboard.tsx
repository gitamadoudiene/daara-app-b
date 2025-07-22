'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  Shield, 
  Settings,
  TrendingUp
} from 'lucide-react';

// Import page components
import { SchoolManagement } from './superuser/SchoolManagement';
import { AdministratorManagement } from './superuser/AdministratorManagement';
import { SystemAnalytics } from './superuser/SystemAnalytics';
import { GlobalSettings } from './superuser/GlobalSettings';
import { UserOverview } from './superuser/UserOverview';

type ActivePage = 'schools' | 'admins' | 'analytics' | 'settings' | 'users';

export function SuperUserDashboard() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>('schools');

  const sidebarItems = [
    { 
      id: 'schools' as ActivePage, 
      icon: Building2, 
      label: 'Gestion des Écoles', 
      active: activePage === 'schools' 
    },
    { 
      id: 'admins' as ActivePage, 
      icon: Shield, 
      label: 'Gestion des Administrateurs', 
      active: activePage === 'admins' 
    },
    { 
      id: 'analytics' as ActivePage, 
      icon: TrendingUp, 
      label: 'Analyses du Système', 
      active: activePage === 'analytics' 
    },
    { 
      id: 'settings' as ActivePage, 
      icon: Settings, 
      label: 'Paramètres Globaux', 
      active: activePage === 'settings' 
    },
    { 
      id: 'users' as ActivePage, 
      icon: Users, 
      label: 'Vue d Ensemble des Utilisateurs', 
      active: activePage === 'users' 
    }
  ];

  const sidebar = (
    <nav className="space-y-2">
      {sidebarItems.map((item) => (
        <Button
          key={item.id}
          variant={item.active ? 'default' : 'ghost'}
          className="w-full justify-start text-left p-2 sm:p-3"
          onClick={() => setActivePage(item.id)}
        >
          <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate text-xs sm:text-sm">{item.label}</span>
        </Button>
      ))}
    </nav>
  );

  const renderActivePage = () => {
    switch (activePage) {
      case 'schools':
        return <SchoolManagement />;
      case 'admins':
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Bienvenue, {user?.name} !</h2>
            <p className="text-muted-foreground">
              Gérez les écoles et les administrateurs dans l&apos;ensemble du système DAARA.
            </p>
          </div>
        </div>

        {renderActivePage()}
      </div>
    </DashboardLayout>
  );
}
