'use client';

import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  FileText,
  Calendar,
  TrendingUp,
  UserCheck,
  Upload
} from 'lucide-react';

export function TeacherDashboard() {
  const { user } = useAuth();

  const stats = [
    { title: 'My Classes', value: '6', icon: BookOpen, color: 'text-blue-600' },
    { title: 'Total Students', value: '158', icon: Users, color: 'text-green-600' },
    { title: 'Pending Grades', value: '12', icon: ClipboardList, color: 'text-orange-600' },
    { title: 'Today\'s Lessons', value: '4', icon: Calendar, color: 'text-purple-600' }
  ];

  const sidebarItems = [
    { icon: BookOpen, label: 'My Classes', active: true },
    { icon: ClipboardList, label: 'Grades & Assessment' },
    { icon: UserCheck, label: 'Attendance' },
    { icon: FileText, label: 'Homework & Assignments' },
    { icon: Upload, label: 'Documents' },
    { icon: TrendingUp, label: 'Progress Reports' }
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
            Ready to inspire your students today? Here's your overview.
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
                  Updated today
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your classes for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Mathematics - Grade 10-A</p>
                    <p className="text-sm text-muted-foreground">8:00 AM - 9:00 AM</p>
                  </div>
                  <Button size="sm">Start Class</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Physics - Grade 11-B</p>
                    <p className="text-sm text-muted-foreground">10:00 AM - 11:00 AM</p>
                  </div>
                  <Button size="sm" variant="outline">Upcoming</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Mathematics - Grade 9-C</p>
                    <p className="text-sm text-muted-foreground">2:00 PM - 3:00 PM</p>
                  </div>
                  <Button size="sm" variant="outline">Upcoming</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common teaching tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-20 flex-col">
                  <ClipboardList className="h-6 w-6 mb-2" />
                  Add Grades
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <UserCheck className="h-6 w-6 mb-2" />
                  Take Attendance
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Assign Homework
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Upload className="h-6 w-6 mb-2" />
                  Upload Material
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest teaching activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Grades submitted for Grade 10-A Mathematics</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Attendance recorded for Physics class</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Homework assigned to Grade 9-C</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}