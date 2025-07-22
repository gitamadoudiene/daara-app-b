'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Users, 
  Shield, 
  GraduationCap,
  UserCheck,
  BookOpen,
  TrendingUp,
  Activity,
  Calendar,
  BarChart3
} from 'lucide-react';

export function SystemAnalytics() {
  const systemStats = [
    { title: 'Total Schools', value: '12', change: '+2', icon: Building2, color: 'text-blue-600' },
    { title: 'Total Users', value: '2,847', change: '+156', icon: Users, color: 'text-green-600' },
    { title: 'Administrators', value: '24', change: '+3', icon: Shield, color: 'text-purple-600' },
    { title: 'Teachers', value: '301', change: '+18', icon: GraduationCap, color: 'text-orange-600' },
    { title: 'Students', value: '2,156', change: '+124', icon: UserCheck, color: 'text-emerald-600' },
    { title: 'Parents', value: '366', change: '+11', icon: Users, color: 'text-pink-600' }
  ];

  const schoolPerformance = [
    { name: 'Daara High School', users: 1325, growth: 12, performance: 95 },
    { name: 'Excellence Academy', users: 924, growth: 8, performance: 92 },
    { name: 'Future Leaders Institute', users: 2301, growth: 15, performance: 98 },
    { name: 'Innovation Academy', users: 756, growth: 5, performance: 88 },
    { name: 'Bright Minds School', users: 432, growth: 18, performance: 94 }
  ];

  const monthlyGrowth = [
    { month: 'Jan', users: 2156, schools: 8 },
    { month: 'Feb', users: 2298, schools: 9 },
    { month: 'Mar', users: 2456, schools: 10 },
    { month: 'Apr', users: 2634, schools: 11 },
    { month: 'May', users: 2847, schools: 12 }
  ];

  const activityMetrics = [
    { label: 'Daily Active Users', value: '1,847', percentage: 65 },
    { label: 'Weekly Active Users', value: '2,456', percentage: 86 },
    { label: 'Monthly Active Users', value: '2,847', percentage: 100 },
    { label: 'System Uptime', value: '99.9%', percentage: 99.9 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">System Analytics</h3>
        <p className="text-muted-foreground">Comprehensive insights across all schools and users</p>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity Metrics</CardTitle>
          <CardDescription>User engagement and system usage statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activityMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <span className="text-sm text-muted-foreground">{metric.value}</span>
                </div>
                <Progress value={metric.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* School Performance */}
      <Card>
        <CardHeader>
          <CardTitle>School Performance Overview</CardTitle>
          <CardDescription>Performance metrics for each school in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schoolPerformance.map((school, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{school.name}</h4>
                      <p className="text-sm text-muted-foreground">{school.users} total users</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-600">+{school.growth}%</p>
                    <p className="text-xs text-muted-foreground">Growth</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{school.performance}%</p>
                    <p className="text-xs text-muted-foreground">Performance</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={school.performance >= 95 ? 'text-green-600 border-green-600' : 
                              school.performance >= 90 ? 'text-blue-600 border-blue-600' : 
                              'text-orange-600 border-orange-600'}
                  >
                    {school.performance >= 95 ? 'Excellent' : 
                     school.performance >= 90 ? 'Good' : 'Average'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Growth Trends</CardTitle>
            <CardDescription>User and school growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyGrowth.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{month.month}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium">{month.users}</p>
                      <p className="text-muted-foreground">Users</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{month.schools}</p>
                      <p className="text-muted-foreground">Schools</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Real-time system performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Server Status</p>
                    <p className="text-sm text-muted-foreground">All systems operational</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Database Performance</p>
                    <p className="text-sm text-muted-foreground">Response time: 45ms</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Excellent</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">API Performance</p>
                    <p className="text-sm text-muted-foreground">99.9% uptime</p>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-800">Stable</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent System Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Events</CardTitle>
          <CardDescription>Latest activities across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New school onboarded</p>
                <p className="text-xs text-muted-foreground">Innovation Academy joined the platform - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">System maintenance completed</p>
                <p className="text-xs text-muted-foreground">Database optimization finished successfully - 6 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New administrator created</p>
                <p className="text-xs text-muted-foreground">Admin assigned to Future Leaders Institute - 1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Peak usage reached</p>
                <p className="text-xs text-muted-foreground">2,847 concurrent users - highest this month - 2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}