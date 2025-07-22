'use client';

import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  Calendar,
  Settings,
  TrendingUp,
  Shield,
  Database
} from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Students', value: '1,234', icon: Users, color: 'text-blue-600' },
    { title: 'Total Teachers', value: '89', icon: UserCheck, color: 'text-green-600' },
    { title: 'Total Classes', value: '45', icon: BookOpen, color: 'text-purple-600' },
    { title: 'Active Sessions', value: '23', icon: Calendar, color: 'text-orange-600' }
  ];

  const sidebarItems = [
    { icon: Users, label: 'User Management', active: true },
    { icon: BookOpen, label: 'School Structure' },
    { icon: TrendingUp, label: 'Reports & Analytics' },
    { icon: Shield, label: 'Security Settings' },
    { icon: Database, label: 'Data Management' },
    { icon: Settings, label: 'System Settings' }
  ];

  const sidebar = (
    <nav className="space-y-2">
      {sidebarItems.map((item, index) => (
        <Button
          key={index}
          variant={item.active ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </nav>
  );

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">
            Here's what's happening at {user?.school?.name} today.
          </p>
        </div>

        {/* Stats Grid */}
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
                  +12% from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest system activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">New teacher registered</p>
                    <p className="text-xs text-muted-foreground">Sarah Johnson joined Mathematics Department</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Grade submission completed</p>
                    <p className="text-xs text-muted-foreground">Physics grades for Grade 10-A updated</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">System maintenance scheduled</p>
                    <p className="text-xs text-muted-foreground">Scheduled for this weekend</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Add User
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BookOpen className="h-6 w-6 mb-2" />
                  Create Class
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  View Reports
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Settings className="h-6 w-6 mb-2" />
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>System Announcements</CardTitle>
            <CardDescription>Important updates and notices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">New Feature: Real-time Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Parents and students will now receive instant notifications for grades and attendance.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">Security Update</h4>
                <p className="text-sm text-muted-foreground">
                  Enhanced security measures have been implemented for better data protection.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}