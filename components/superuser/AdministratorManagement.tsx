'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus,
  Shield,
  Mail,
  Calendar,
  Building2,
  Edit,
  Trash2,
  UserPlus,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface Administrator {
  id: string;
  name: string;
  email: string;
  schoolId: string;
  schoolName: string;
  avatar?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  lastLogin?: string;
}

interface School {
  id: string;
  name: string;
}

export function AdministratorManagement() {
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [isEditAdminOpen, setIsEditAdminOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Administrator | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchool, setFilterSchool] = useState('all');

  const schools: School[] = [
    { id: 'school1', name: 'Daara High School' },
    { id: 'school2', name: 'Excellence Academy' },
    { id: 'school3', name: 'Future Leaders Institute' }
  ];

  const [administrators, setAdministrators] = useState<Administrator[]>([
    {
      id: 'admin1',
      name: 'John Smith',
      email: 'john.smith@daarahigh.edu',
      schoolId: 'school1',
      schoolName: 'Daara High School',
      status: 'Active',
      createdAt: '2024-01-15',
      lastLogin: '2024-03-10'
    },
    {
      id: 'admin2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@daarahigh.edu',
      schoolId: 'school1',
      schoolName: 'Daara High School',
      status: 'Active',
      createdAt: '2024-02-01',
      lastLogin: '2024-03-09'
    },
    {
      id: 'admin3',
      name: 'Michael Brown',
      email: 'michael.brown@excellence.edu',
      schoolId: 'school2',
      schoolName: 'Excellence Academy',
      status: 'Active',
      createdAt: '2024-01-20',
      lastLogin: '2024-03-08'
    },
    {
      id: 'admin4',
      name: 'Emily Davis',
      email: 'emily.davis@futureleaders.edu',
      schoolId: 'school3',
      schoolName: 'Future Leaders Institute',
      status: 'Inactive',
      createdAt: '2024-02-15',
      lastLogin: '2024-02-28'
    }
  ]);

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const schoolId = formData.get('admin-school') as string;
    const school = schools.find(s => s.id === schoolId);
    
    const newAdmin: Administrator = {
      id: `admin${administrators.length + 1}`,
      name: formData.get('admin-name') as string,
      email: formData.get('admin-email') as string,
      schoolId,
      schoolName: school?.name || '',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setAdministrators([...administrators, newAdmin]);
    toast.success('Administrator created successfully!');
    setIsCreateAdminOpen(false);
  };

  const handleEditAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    const schoolId = formData.get('admin-school') as string;
    const school = schools.find(s => s.id === schoolId);
    
    const updatedAdmin: Administrator = {
      ...selectedAdmin,
      name: formData.get('admin-name') as string,
      email: formData.get('admin-email') as string,
      schoolId,
      schoolName: school?.name || ''
    };
    
    setAdministrators(administrators.map(admin => 
      admin.id === selectedAdmin.id ? updatedAdmin : admin
    ));
    toast.success('Administrator updated successfully!');
    setIsEditAdminOpen(false);
    setSelectedAdmin(null);
  };

  const handleDeleteAdmin = (adminId: string) => {
    setAdministrators(administrators.filter(admin => admin.id !== adminId));
    toast.success('Administrator deleted successfully!');
  };

  const toggleAdminStatus = (adminId: string) => {
    setAdministrators(administrators.map(admin => 
      admin.id === adminId 
        ? { ...admin, status: admin.status === 'Active' ? 'Inactive' : 'Active' }
        : admin
    ));
    toast.success('Administrator status updated!');
  };

  const filteredAdministrators = administrators.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchool = filterSchool === 'all' || admin.schoolId === filterSchool;
    return matchesSearch && matchesSchool;
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Administrator Management</h3>
          <p className="text-muted-foreground">Manage administrators across all schools</p>
        </div>
        <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
          <DialogTrigger asChild>
            <Button>
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
                  <Input id="admin-name" name="admin-name" placeholder="Enter full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input id="admin-email" name="admin-email" type="email" placeholder="Enter email" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-school">Assign to School</Label>
                <Select name="admin-school" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search administrators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
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
      </div>

      {/* Administrators List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdministrators.map((admin) => (
          <Card key={admin.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={admin.avatar} alt={admin.name} />
                  <AvatarFallback>
                    {admin.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{admin.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={admin.status === 'Active' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}
                    >
                      {admin.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{admin.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{admin.schoolName}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created: {new Date(admin.createdAt).toLocaleDateString()}</span>
              </div>
              {admin.lastLogin && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Last login: {new Date(admin.lastLogin).toLocaleDateString()}</span>
                </div>
              )}
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedAdmin(admin);
                    setIsEditAdminOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleAdminStatus(admin.id)}
                >
                  {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteAdmin(admin.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Administrator Dialog */}
      <Dialog open={isEditAdminOpen} onOpenChange={setIsEditAdminOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Administrator</DialogTitle>
            <DialogDescription>
              Update administrator information
            </DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <form onSubmit={handleEditAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-admin-name">Full Name</Label>
                  <Input 
                    id="edit-admin-name" 
                    name="admin-name" 
                    defaultValue={selectedAdmin.name}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-admin-email">Email</Label>
                  <Input 
                    id="edit-admin-email" 
                    name="admin-email" 
                    type="email" 
                    defaultValue={selectedAdmin.email}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-admin-school">Assign to School</Label>
                <Select name="admin-school" defaultValue={selectedAdmin.schoolId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditAdminOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Administrator</Button>
              </div>
            </form>
          )}
        </Dialog>
      </Dialog>
    </div>
  );
}