'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building2, 
  Users, 
  Shield, 
  Settings,
  Plus,
  School,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Database,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

export function SuperUserDashboard() {
  const { user } = useAuth();
  const [isCreateSchoolOpen, setIsCreateSchoolOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);

  // Mock data for demonstration
  const stats = [
    { title: 'Total Schools', value: '12', icon: Building2, color: 'text-blue-600' },
    { title: 'Total Administrators', value: '24', icon: Shield, color: 'text-green-600' },
    { title: 'Active Users', value: '2,847', icon: Users, color: 'text-purple-600' },
    { title: 'System Health', value: '99.9%', icon: TrendingUp, color: 'text-emerald-600' }
  ];

  const schools = [
    {
      id: 'school1',
      name: 'Daara High School',
      address: '123 Education Street, Learning City',
      phone: '+1-555-0123',
      email: 'info@daarahigh.edu',
      adminCount: 2,
      studentCount: 1234,
      teacherCount: 89,
      status: 'Active',
      createdAt: '2024-01-01'
    },
    {
      id: 'school2',
      name: 'Excellence Academy',
      address: '456 Knowledge Avenue, Study Town',
      phone: '+1-555-0456',
      email: 'contact@excellence.edu',
      adminCount: 1,
      studentCount: 856,
      teacherCount: 67,
      status: 'Active',
      createdAt: '2024-01-15'
    },
    {
      id: 'school3',
      name: 'Future Leaders Institute',
      address: '789 Innovation Blvd, Tech City',
      phone: '+1-555-0789',
      email: 'admin@futureleaders.edu',
      adminCount: 3,
      studentCount: 2156,
      teacherCount: 145,
      status: 'Active',
      createdAt: '2024-02-01'
    }
  ];

  const sidebarItems = [
    { icon: Building2, label: 'School Management', active: true },
    { icon: Shield, label: 'Administrator Management' },
    { icon: Database, label: 'System Analytics' },
    { icon: Settings, label: 'Global Settings' },
    { icon: Users, label: 'User Overview' }
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

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('School created successfully!');
    setIsCreateSchoolOpen(false);
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Administrator created successfully!');
    setIsCreateAdminOpen(false);
  };

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
            <p className="text-muted-foreground">
              Manage schools and administrators across the entire DAARA system.
            </p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Administrator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Administrator</DialogTitle>
                  <DialogDescription>
                    Create a new administrator and assign them to a school.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name">Full Name</Label>
                      <Input id="admin-name" placeholder="Enter full name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email</Label>
                      <Input id="admin-email" type="email" placeholder="Enter email" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-school">Assign to School</Label>
                    <select id="admin-school" className="w-full p-2 border rounded-md" required>
                      <option value="">Select a school</option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateAdminOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Administrator</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isCreateSchoolOpen} onOpenChange={setIsCreateSchoolOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create School
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New School</DialogTitle>
                  <DialogDescription>
                    Add a new school to the DAARA system.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSchool} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="school-name">School Name</Label>
                    <Input id="school-name" placeholder="Enter school name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school-address">Address</Label>
                    <Input id="school-address" placeholder="Enter school address" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="school-phone">Phone</Label>
                      <Input id="school-phone" placeholder="Enter phone number" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="school-email">Email</Label>
                      <Input id="school-email" type="email" placeholder="Enter email" required />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateSchoolOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create School</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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
                  System-wide metrics
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Schools Management */}
        <Card>
          <CardHeader>
            <CardTitle>School Management</CardTitle>
            <CardDescription>Manage all schools in the DAARA system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schools.map((school) => (
                <div key={school.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <School className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">{school.name}</h3>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {school.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{school.address}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{school.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{school.email}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>{school.adminCount} Administrators</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{school.teacherCount} Teachers</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{school.studentCount} Students</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {new Date(school.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest system-wide activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">New school registered</p>
                    <p className="text-xs text-muted-foreground">Future Leaders Institute joined the system</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Administrator created</p>
                    <p className="text-xs text-muted-foreground">New admin assigned to Excellence Academy</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">System maintenance completed</p>
                    <p className="text-xs text-muted-foreground">Database optimization finished successfully</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Overall system performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Server Uptime</span>
                  <Badge variant="outline" className="text-green-600">99.9%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Performance</span>
                  <Badge variant="outline" className="text-green-600">Excellent</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Sessions</span>
                  <Badge variant="outline">2,847</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Storage Usage</span>
                  <Badge variant="outline">67%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}