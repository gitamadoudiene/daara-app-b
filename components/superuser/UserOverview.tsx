'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Shield, 
  GraduationCap, 
  UserCheck, 
  Search,
  Filter,
  Building2,
  Mail,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Ban
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'parent' | 'student';
  schoolId: string;
  schoolName: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
}

export function UserOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const schools = [
    { id: 'school1', name: 'Daara High School' },
    { id: 'school2', name: 'Excellence Academy' },
    { id: 'school3', name: 'Future Leaders Institute' }
  ];

  const users: User[] = [
    {
      id: 'admin1',
      name: 'John Smith',
      email: 'john.smith@daarahigh.edu',
      role: 'admin',
      schoolId: 'school1',
      schoolName: 'Daara High School',
      status: 'Active',
      lastLogin: '2024-03-10',
      createdAt: '2024-01-15'
    },
    {
      id: 'teacher1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@daarahigh.edu',
      role: 'teacher',
      schoolId: 'school1',
      schoolName: 'Daara High School',
      status: 'Active',
      lastLogin: '2024-03-09',
      createdAt: '2024-02-01'
    },
    {
      id: 'parent1',
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      role: 'parent',
      schoolId: 'school1',
      schoolName: 'Daara High School',
      status: 'Active',
      lastLogin: '2024-03-08',
      createdAt: '2024-02-15'
    },
    {
      id: 'student1',
      name: 'Emma Brown',
      email: 'emma.brown@student.daarahigh.edu',
      role: 'student',
      schoolId: 'school1',
      schoolName: 'Daara High School',
      status: 'Active',
      lastLogin: '2024-03-10',
      createdAt: '2024-02-15'
    },
    {
      id: 'admin2',
      name: 'Lisa Wilson',
      email: 'lisa.wilson@excellence.edu',
      role: 'admin',
      schoolId: 'school2',
      schoolName: 'Excellence Academy',
      status: 'Active',
      lastLogin: '2024-03-07',
      createdAt: '2024-01-20'
    },
    {
      id: 'teacher2',
      name: 'David Martinez',
      email: 'david.martinez@excellence.edu',
      role: 'teacher',
      schoolId: 'school2',
      schoolName: 'Excellence Academy',
      status: 'Inactive',
      lastLogin: '2024-02-28',
      createdAt: '2024-01-25'
    }
  ];

  const roleStats = [
    { role: 'Administrators', count: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-red-600' },
    { role: 'Teachers', count: users.filter(u => u.role === 'teacher').length, icon: GraduationCap, color: 'text-blue-600' },
    { role: 'Parents', count: users.filter(u => u.role === 'parent').length, icon: Users, color: 'text-green-600' },
    { role: 'Students', count: users.filter(u => u.role === 'student').length, icon: UserCheck, color: 'text-purple-600' }
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'parent': return 'bg-green-100 text-green-800';
      case 'student': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSchool = filterSchool === 'all' || user.schoolId === filterSchool;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesSchool && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">User Overview</h3>
        <p className="text-muted-foreground">Comprehensive view of all users across the platform</p>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.role}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
              <p className="text-xs text-muted-foreground">
                Active users
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Search and filter users across all schools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrators</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="parent">Parents</SelectItem>
                <SelectItem value="student">Students</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSchool} onValueChange={setFilterSchool}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by school" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium">{user.name}</h4>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={user.status === 'Active' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}
                      >
                        {user.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-3 w-3" />
                        <span>{user.schoolName}</span>
                      </div>
                      {user.lastLogin && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Ban className="mr-2 h-4 w-4" />
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* School Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution by School</CardTitle>
          <CardDescription>Overview of user distribution across schools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schools.map((school) => {
              const schoolUsers = users.filter(u => u.schoolId === school.id);
              const adminCount = schoolUsers.filter(u => u.role === 'admin').length;
              const teacherCount = schoolUsers.filter(u => u.role === 'teacher').length;
              const parentCount = schoolUsers.filter(u => u.role === 'parent').length;
              const studentCount = schoolUsers.filter(u => u.role === 'student').length;
              
              return (
                <div key={school.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{school.name}</h4>
                      <p className="text-sm text-muted-foreground">{schoolUsers.length} total users</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-red-600">{adminCount}</p>
                      <p className="text-muted-foreground">Admins</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-blue-600">{teacherCount}</p>
                      <p className="text-muted-foreground">Teachers</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-green-600">{parentCount}</p>
                      <p className="text-muted-foreground">Parents</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-purple-600">{studentCount}</p>
                      <p className="text-muted-foreground">Students</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}