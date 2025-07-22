'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus,
  School,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  Shield,
  Edit,
  Trash2,
  Eye,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  adminCount: number;
  studentCount: number;
  teacherCount: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export function SchoolManagement() {
  const [isCreateSchoolOpen, setIsCreateSchoolOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isEditSchoolOpen, setIsEditSchoolOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([
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
  ]);

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newSchool: School = {
      id: `school${schools.length + 1}`,
      name: formData.get('school-name') as string,
      address: formData.get('school-address') as string,
      phone: formData.get('school-phone') as string,
      email: formData.get('school-email') as string,
      adminCount: 0,
      studentCount: 0,
      teacherCount: 0,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setSchools([...schools, newSchool]);
    toast.success('School created successfully!');
    setIsCreateSchoolOpen(false);
  };

  const handleEditSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    const updatedSchool: School = {
      ...selectedSchool,
      name: formData.get('school-name') as string,
      address: formData.get('school-address') as string,
      phone: formData.get('school-phone') as string,
      email: formData.get('school-email') as string,
    };
    
    setSchools(schools.map(school => 
      school.id === selectedSchool.id ? updatedSchool : school
    ));
    toast.success('School updated successfully!');
    setIsEditSchoolOpen(false);
    setSelectedSchool(null);
  };

  const handleDeleteSchool = (schoolId: string) => {
    setSchools(schools.filter(school => school.id !== schoolId));
    toast.success('School deleted successfully!');
  };

  const toggleSchoolStatus = (schoolId: string) => {
    setSchools(schools.map(school => 
      school.id === schoolId 
        ? { ...school, status: school.status === 'Active' ? 'Inactive' : 'Active' }
        : school
    ));
    toast.success('School status updated!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">School Management</h3>
          <p className="text-muted-foreground">Manage all schools in the DAARA system</p>
        </div>
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
                <Input id="school-name" name="school-name" placeholder="Enter school name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-address">Address</Label>
                <Input id="school-address" name="school-address" placeholder="Enter school address" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school-phone">Phone</Label>
                  <Input id="school-phone" name="school-phone" placeholder="Enter phone number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-email">Email</Label>
                  <Input id="school-email" name="school-email" type="email" placeholder="Enter email" required />
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

      {/* Schools List */}
      <div className="space-y-4">
        {schools.map((school) => (
          <Card key={school.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <School className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{school.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={school.status === 'Active' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}
                    >
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedSchool(school);
                      setIsViewDetailsOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedSchool(school);
                      setIsEditSchoolOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleSchoolStatus(school.id)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    {school.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>School Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedSchool?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedSchool && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">School Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedSchool.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge 
                    variant="outline" 
                    className={selectedSchool.status === 'Active' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}
                  >
                    {selectedSchool.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm text-muted-foreground">{selectedSchool.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{selectedSchool.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedSchool.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Administrators</Label>
                  <p className="text-2xl font-bold text-blue-600">{selectedSchool.adminCount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Teachers</Label>
                  <p className="text-2xl font-bold text-green-600">{selectedSchool.teacherCount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Students</Label>
                  <p className="text-2xl font-bold text-purple-600">{selectedSchool.studentCount}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Created Date</Label>
                <p className="text-sm text-muted-foreground">{new Date(selectedSchool.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit School Dialog */}
      <Dialog open={isEditSchoolOpen} onOpenChange={setIsEditSchoolOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit School</DialogTitle>
            <DialogDescription>
              Update school information
            </DialogDescription>
          </DialogHeader>
          {selectedSchool && (
            <form onSubmit={handleEditSchool} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-school-name">School Name</Label>
                <Input 
                  id="edit-school-name" 
                  name="school-name" 
                  defaultValue={selectedSchool.name}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-school-address">Address</Label>
                <Input 
                  id="edit-school-address" 
                  name="school-address" 
                  defaultValue={selectedSchool.address}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-school-phone">Phone</Label>
                  <Input 
                    id="edit-school-phone" 
                    name="school-phone" 
                    defaultValue={selectedSchool.phone}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-school-email">Email</Label>
                  <Input 
                    id="edit-school-email" 
                    name="school-email" 
                    type="email" 
                    defaultValue={selectedSchool.email}
                    required 
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditSchoolOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update School</Button>
              </div>
            </form>
          )}
        </Dialog>
      </Dialog>
    </div>
  );
}