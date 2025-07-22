'use client';

import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();

  const stats = [
    { title: 'Current GPA', value: '3.7', icon: TrendingUp, color: 'text-green-600' },
    { title: 'Attendance Rate', value: '95%', icon: CheckCircle, color: 'text-blue-600' },
    { title: 'Pending Homework', value: '3', icon: FileText, color: 'text-orange-600' },
    { title: 'Upcoming Tests', value: '2', icon: AlertCircle, color: 'text-red-600' }
  ];

  const sidebarItems = [
    { icon: TrendingUp, label: 'My Grades', active: true },
    { icon: Calendar, label: 'Schedule' },
    { icon: FileText, label: 'Homework' },
    { icon: BookOpen, label: 'Subjects' },
    { icon: Users, label: 'Classmates' },
    { icon: Clock, label: 'Attendance' }
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
            Keep up the great work at {user?.school?.name}! Here's your academic overview.
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
                  This semester
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
              <CardDescription>Your latest academic performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Mathematics</p>
                    <p className="text-sm text-muted-foreground">Chapter 5 Quiz</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">A</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Physics</p>
                    <p className="text-sm text-muted-foreground">Lab Report</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">B+</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">English</p>
                    <p className="text-sm text-muted-foreground">Essay Assignment</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">A-</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your classes for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Mathematics</p>
                    <p className="text-sm text-muted-foreground">8:00 AM - 9:00 AM</p>
                  </div>
                  <Badge variant="outline">Next</Badge>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Physics</p>
                    <p className="text-sm text-muted-foreground">10:00 AM - 11:00 AM</p>
                  </div>
                  <Badge variant="outline">Upcoming</Badge>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">English</p>
                    <p className="text-sm text-muted-foreground">2:00 PM - 3:00 PM</p>
                  </div>
                  <Badge variant="outline">Upcoming</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Progress</CardTitle>
            <CardDescription>Your performance across all subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Mathematics</span>
                  <span className="text-sm text-muted-foreground">88%</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Physics</span>
                  <span className="text-sm text-muted-foreground">82%</span>
                </div>
                <Progress value={82} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">English</span>
                  <span className="text-sm text-muted-foreground">91%</span>
                </div>
                <Progress value={91} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">History</span>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Homework */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Homework</CardTitle>
            <CardDescription>Assignments due soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium">Mathematics - Problem Set 12</p>
                  <p className="text-sm text-muted-foreground">Due: Tomorrow</p>
                </div>
                <Badge variant="destructive">Urgent</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium">Physics - Lab Report</p>
                  <p className="text-sm text-muted-foreground">Due: March 20</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium">English - Essay Draft</p>
                  <p className="text-sm text-muted-foreground">Due: March 22</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}