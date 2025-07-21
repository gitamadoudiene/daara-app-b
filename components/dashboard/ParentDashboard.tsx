'use client';

import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Calendar,
  FileText,
  MessageSquare,
  Bell,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export function ParentDashboard() {
  const { user } = useAuth();

  const children = [
    { name: 'Emma Brown', grade: 'Grade 10-A', attendance: '95%', avgGrade: 'A-' },
    { name: 'James Brown', grade: 'Grade 8-B', attendance: '92%', avgGrade: 'B+' }
  ];

  const sidebarItems = [
    { icon: Users, label: 'My Children', active: true },
    { icon: BookOpen, label: 'Grades & Reports' },
    { icon: UserCheck, label: 'Attendance' },
    { icon: FileText, label: 'Homework' },
    { icon: MessageSquare, label: 'Messages' },
    { icon: Bell, label: 'Notifications' }
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
            Stay connected with your children's academic progress.
          </p>
        </div>

        {/* Children Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{child.name}</CardTitle>
                  <Badge variant="secondary">{child.grade}</Badge>
                </div>
                <CardDescription>Academic Overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Grade</span>
                    <Badge variant="outline">{child.avgGrade}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Attendance</span>
                    <Badge variant="outline">{child.attendance}</Badge>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Updates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
              <CardDescription>Latest academic performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Emma - Mathematics</p>
                    <p className="text-sm text-muted-foreground">Chapter 5 Quiz</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">A</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">James - Science</p>
                    <p className="text-sm text-muted-foreground">Lab Report</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">B+</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">Emma - English</p>
                    <p className="text-sm text-muted-foreground">Essay Assignment</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">A-</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Important dates and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Parent-Teacher Meeting</p>
                    <p className="text-xs text-muted-foreground">March 15, 2024 at 3:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Emma's Math Test</p>
                    <p className="text-xs text-muted-foreground">March 18, 2024</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">James's Science Fair</p>
                    <p className="text-xs text-muted-foreground">March 22, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Important updates about your children</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-3 bg-blue-50 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Emma received a new grade in Mathematics</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-3 bg-orange-50 rounded-lg">
                <Bell className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">James was absent from Science class</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-3 bg-green-50 rounded-lg">
                <Bell className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">New homework assigned to Emma</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}