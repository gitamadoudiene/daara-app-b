'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AttendanceSession {
  _id: string;
  classId: {
    _id: string;
    name: string;
    level: string;
  };
  subjectId: {
    _id: string;
    name: string;
    code: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'completed' | 'expired';
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  lateStudents: number;
}

export function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSessions = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch(`http://localhost:5000/api/attendance/sessions/teacher/${user.id}/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
        console.log('Sessions loaded:', data.sessions);
      } else {
        const errorData = await response.text();
        console.error('Error response:', response.status, errorData);
        toast({
          title: "Erreur",
          description: `Impossible de charger les sessions (${response.status})`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (user?.id) {
      loadSessions();
    }
  }, [user?.id, loadSessions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Presences</h2>
          <p className="text-muted-foreground">
            Gerez les presences de vos cours
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadSessions}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Sessions du jour
          </CardTitle>
          <CardDescription>
            {sessions.length} session(s) trouvee(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune session aujourd'hui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">
                          {session.subjectId.name}
                        </h3>
                        <Badge variant="outline">
                          {session.classId.name}
                        </Badge>
                        <Badge className={
                          session.status === 'completed' ? 'bg-green-100 text-green-800' :
                          session.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {session.status === 'completed' ? 'Termine' : 
                           session.status === 'pending' ? 'En attente' : 'Expire'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm">
                          <UserCheck className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">{session.presentStudents}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <UserX className="h-4 w-4 text-red-600" />
                          <span className="text-red-600 font-medium">{session.absentStudents}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          / {session.totalStudents} etudiants
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {session.status === 'pending' && (
                        <Button>
                          <CheckSquare className="mr-2 h-4 w-4" />
                          Prendre presence
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
