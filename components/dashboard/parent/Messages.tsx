'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare,
  Send,
  Reply,
  Forward,
  Trash2,
  Star,
  StarOff,
  MoreHorizontal,
  Search,
  Filter,
  Paperclip,
  User,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  School,
  BookOpen,
  Calendar,
  PlusCircle
} from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: string;
  from: {
    name: string;
    role: 'teacher' | 'admin' | 'parent' | 'school';
    avatar?: string;
    subject?: string;
  };
  to: string[];
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'academic' | 'behavior' | 'administrative' | 'general' | 'event';
  childName?: string;
  attachments?: string[];
  thread?: Message[];
}

interface Conversation {
  id: string;
  participants: {
    name: string;
    role: string;
    avatar?: string;
  }[];
  subject: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  childName?: string;
  category: string;
}

export function Messages() {
  const [activeTab, setActiveTab] = useState<string>('inbox');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCompose, setShowCompose] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    content: '',
    childName: '',
    category: 'general'
  });

  // Mock data for messages
  const messages: Message[] = [
    {
      id: '1',
      from: {
        name: 'M. Dubois',
        role: 'teacher',
        avatar: '/avatars/teacher1.jpg',
        subject: 'Mathématiques'
      },
      to: ['Parent Emma'],
      subject: 'Excellent progrès en algèbre',
      content: 'Bonjour, je tenais à vous féliciter pour les progrès remarquables d\'Emma en algèbre. Elle a particulièrement bien réussi le contrôle de cette semaine avec une note de 18/20. Elle fait preuve d\'une grande rigueur dans ses raisonnements et n\'hésite pas à poser des questions pertinentes en classe. Continuez à l\'encourager dans cette voie !',
      timestamp: '2024-07-22T14:30:00Z',
      read: false,
      starred: false,
      priority: 'normal',
      category: 'academic',
      childName: 'Emma',
      attachments: ['controle-algebre-emma.pdf']
    },
    {
      id: '2',
      from: {
        name: 'Mme. Laurent',
        role: 'teacher',
        avatar: '/avatars/teacher2.jpg',
        subject: 'Sciences'
      },
      to: ['Parent Lucas'],
      subject: 'Retard récurrent - Besoin d\'entretien',
      content: 'Madame, Monsieur, je me permets de vous contacter concernant les retards répétés de Lucas en cours de sciences. Au cours des deux dernières semaines, il est arrivé en retard 4 fois, ce qui perturbe le bon déroulement du cours. Pourriez-nous convenir d\'un entretien pour discuter de cette situation ? Je suis disponible en fin de semaine.',
      timestamp: '2024-07-22T11:15:00Z',
      read: true,
      starred: true,
      priority: 'high',
      category: 'behavior',
      childName: 'Lucas'
    },
    {
      id: '3',
      from: {
        name: 'Secrétariat',
        role: 'admin',
        avatar: '/avatars/admin.jpg'
      },
      to: ['Tous les parents'],
      subject: 'Réunion parents-professeurs - 25 juillet',
      content: 'Chers parents, nous organisons une réunion parents-professeurs le jeudi 25 juillet de 18h à 20h. Cette réunion sera l\'occasion de faire le bilan du trimestre et d\'aborder la préparation de la rentrée. Merci de confirmer votre présence avant le 23 juillet. Des créneaux individuels seront également disponibles sur demande.',
      timestamp: '2024-07-21T16:00:00Z',
      read: true,
      starred: false,
      priority: 'normal',
      category: 'event'
    },
    {
      id: '4',
      from: {
        name: 'Mme. Leroy',
        role: 'teacher',
        avatar: '/avatars/teacher3.jpg',
        subject: 'Français'
      },
      to: ['Parent Lucas'],
      subject: 'Projet lecture été - Recommandations',
      content: 'Bonjour, suite à nos échanges concernant le niveau de lecture de Lucas, je vous transmets une liste de livres adaptés pour les vacances d\'été. Ces lectures l\'aideront à consolider ses acquis et à préparer la rentrée. N\'hésitez pas si vous avez des questions sur le choix des ouvrages.',
      timestamp: '2024-07-21T10:30:00Z',
      read: false,
      starred: false,
      priority: 'normal',
      category: 'academic',
      childName: 'Lucas',
      attachments: ['liste-lecture-ete.pdf']
    },
    {
      id: '5',
      from: {
        name: 'Direction',
        role: 'admin',
        avatar: '/avatars/director.jpg'
      },
      to: ['Tous les parents'],
      subject: 'URGENT - Modification horaires bus scolaire',
      content: 'En raison de travaux sur la ligne de bus, les horaires sont modifiés à partir du 23 juillet. Départ école : 16h45 au lieu de 17h00. Merci de prendre vos dispositions et d\'informer vos enfants. Cette modification est temporaire et prendra fin le 30 juillet.',
      timestamp: '2024-07-20T15:45:00Z',
      read: true,
      starred: true,
      priority: 'urgent',
      category: 'administrative'
    }
  ];

  // Mock data for conversations
  const conversations: Conversation[] = [
    {
      id: '1',
      participants: [
        { name: 'M. Dubois', role: 'Professeur Maths', avatar: '/avatars/teacher1.jpg' },
        { name: 'Vous', role: 'Parent', avatar: '/avatars/parent.jpg' }
      ],
      subject: 'Suivi Emma - Mathématiques',
      lastMessage: 'Excellent progrès en algèbre',
      lastMessageTime: '2024-07-22T14:30:00Z',
      unreadCount: 1,
      childName: 'Emma',
      category: 'academic'
    },
    {
      id: '2',
      participants: [
        { name: 'Mme. Laurent', role: 'Professeur Sciences', avatar: '/avatars/teacher2.jpg' },
        { name: 'Vous', role: 'Parent', avatar: '/avatars/parent.jpg' }
      ],
      subject: 'Retards Lucas - Sciences',
      lastMessage: 'Retard récurrent - Besoin d\'entretien',
      lastMessageTime: '2024-07-22T11:15:00Z',
      unreadCount: 0,
      childName: 'Lucas',
      category: 'behavior'
    },
    {
      id: '3',
      participants: [
        { name: 'Équipe enseignante', role: 'Groupe', avatar: '/avatars/group.jpg' }
      ],
      subject: 'Informations générales',
      lastMessage: 'Réunion parents-professeurs - 25 juillet',
      lastMessageTime: '2024-07-21T16:00:00Z',
      unreadCount: 0,
      category: 'event'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'Important';
      case 'normal': return 'Normal';
      case 'low': return 'Faible';
      default: return 'Normal';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-green-100 text-green-800';
      case 'behavior': return 'bg-yellow-100 text-yellow-800';
      case 'administrative': return 'bg-purple-100 text-purple-800';
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'academic': return 'Académique';
      case 'behavior': return 'Comportement';
      case 'administrative': return 'Administratif';
      case 'event': return 'Événement';
      case 'general': return 'Général';
      default: return 'Général';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return <BookOpen className="h-4 w-4" />;
      case 'behavior': return <User className="h-4 w-4" />;
      case 'administrative': return <School className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'general': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher': return <BookOpen className="h-4 w-4" />;
      case 'admin': return <School className="h-4 w-4" />;
      case 'parent': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-FR');
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.from.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || message.category === selectedCategory;
    
    switch (activeTab) {
      case 'inbox':
        return matchesSearch && matchesCategory;
      case 'unread':
        return !message.read && matchesSearch && matchesCategory;
      case 'starred':
        return message.starred && matchesSearch && matchesCategory;
      default:
        return matchesSearch && matchesCategory;
    }
  });

  const unreadCount = messages.filter(m => !m.read).length;
  const starredCount = messages.filter(m => m.starred).length;

  const handleSendMessage = () => {
    // Logic to send message
    setShowCompose(false);
    setNewMessage({ to: '', subject: '', content: '', childName: '', category: 'general' });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Messages</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Communiquez avec les enseignants et l&apos;administration
          </p>
        </div>
        <Button onClick={() => setShowCompose(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouveau Message
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{messages.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-2xl font-bold">{unreadCount}</div>
              <div className="text-sm text-muted-foreground">Non lus</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold">{starredCount}</div>
              <div className="text-sm text-muted-foreground">Favoris</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{conversations.length}</div>
              <div className="text-sm text-muted-foreground">Conversations</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="academic">Académique</SelectItem>
                <SelectItem value="behavior">Comportement</SelectItem>
                <SelectItem value="administrative">Administratif</SelectItem>
                <SelectItem value="event">Événement</SelectItem>
                <SelectItem value="general">Général</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Compose Modal */}
      {showCompose && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">Nouveau Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={newMessage.to} onValueChange={(value) => setNewMessage({...newMessage, to: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Destinataire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M. Dubois">M. Dubois (Prof. Maths)</SelectItem>
                  <SelectItem value="Mme. Laurent">Mme. Laurent (Prof. Sciences)</SelectItem>
                  <SelectItem value="Mme. Leroy">Mme. Leroy (Prof. Français)</SelectItem>
                  <SelectItem value="Direction">Direction</SelectItem>
                  <SelectItem value="Secrétariat">Secrétariat</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newMessage.childName} onValueChange={(value) => setNewMessage({...newMessage, childName: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Concernant l'enfant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Emma">Emma</SelectItem>
                  <SelectItem value="Lucas">Lucas</SelectItem>
                  <SelectItem value="general">Général</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Sujet du message"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
              />
              <Select value={newMessage.category} onValueChange={(value) => setNewMessage({...newMessage, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Académique</SelectItem>
                  <SelectItem value="behavior">Comportement</SelectItem>
                  <SelectItem value="administrative">Administratif</SelectItem>
                  <SelectItem value="general">Général</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Votre message..."
              value={newMessage.content}
              onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
              rows={4}
            />
            <div className="flex space-x-2">
              <Button onClick={handleSendMessage}>
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </Button>
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Annuler
              </Button>
              <Button variant="outline">
                <Paperclip className="mr-2 h-4 w-4" />
                Joindre Fichier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inbox">
            Boîte de Réception ({messages.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Non Lus ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="starred">
            Favoris ({starredCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tous les Messages</CardTitle>
              <CardDescription>
                Ensemble de vos communications avec l&apos;école
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div key={message.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${!message.read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={message.from.avatar} />
                        <AvatarFallback>
                          {getRoleIcon(message.from.role)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className={`text-base font-semibold ${!message.read ? 'text-blue-900' : 'text-gray-900'}`}>
                              {message.from.name}
                            </h4>
                            {message.from.subject && (
                              <Badge variant="outline" className="text-xs">
                                {message.from.subject}
                              </Badge>
                            )}
                            {!message.read && (
                              <Badge className="bg-blue-600 text-white text-xs">
                                Nouveau
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {formatTimeAgo(message.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* Toggle starred */}}
                            >
                              {message.starred ? 
                                <Star className="h-4 w-4 text-yellow-500 fill-current" /> : 
                                <StarOff className="h-4 w-4 text-gray-400" />
                              }
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className={`text-sm font-medium ${!message.read ? 'text-blue-800' : 'text-gray-700'}`}>
                            {message.subject}
                          </h5>
                          <Badge className={getPriorityColor(message.priority)}>
                            {getPriorityLabel(message.priority)}
                          </Badge>
                          <Badge className={getCategoryColor(message.category)}>
                            {getCategoryIcon(message.category)}
                            <span className="ml-1">{getCategoryLabel(message.category)}</span>
                          </Badge>
                          {message.childName && (
                            <Badge variant="outline" className="text-xs">
                              {message.childName}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {message.content}
                        </p>

                        {message.attachments && message.attachments.length > 0 && (
                          <div className="flex items-center space-x-2 mb-3">
                            <Paperclip className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-muted-foreground">
                              {message.attachments.length} pièce(s) jointe(s)
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Reply className="mr-2 h-4 w-4" />
                            Répondre
                          </Button>
                          <Button variant="outline" size="sm">
                            <Forward className="mr-2 h-4 w-4" />
                            Transférer
                          </Button>
                          {!message.read && (
                            <Button variant="outline" size="sm">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marquer Lu
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMessages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun message trouvé</p>
                  <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Messages Non Lus</CardTitle>
              <CardDescription>
                Messages nécessitant votre attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div key={message.id} className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={message.from.avatar} />
                        <AvatarFallback>
                          {getRoleIcon(message.from.role)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-semibold text-blue-900">
                            {message.from.name}
                          </h4>
                          <span className="text-sm text-blue-600">
                            {formatTimeAgo(message.timestamp)}
                          </span>
                        </div>
                        
                        <h5 className="text-sm font-medium text-blue-800 mb-2">
                          {message.subject}
                        </h5>
                        
                        <p className="text-sm text-blue-700 mb-3">
                          {message.content}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marquer Lu
                          </Button>
                          <Button variant="outline" size="sm">
                            <Reply className="mr-2 h-4 w-4" />
                            Répondre
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMessages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                  <p>Tous les messages sont lus</p>
                  <p className="text-sm">Excellente gestion de votre boîte de réception !</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="starred" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Messages Favoris</CardTitle>
              <CardDescription>
                Messages marqués comme importants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={message.from.avatar} />
                        <AvatarFallback>
                          {getRoleIcon(message.from.role)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Star className="h-5 w-5 text-yellow-500 fill-current" />
                            <h4 className="text-base font-semibold text-yellow-900">
                              {message.from.name}
                            </h4>
                          </div>
                          <span className="text-sm text-yellow-600">
                            {formatTimeAgo(message.timestamp)}
                          </span>
                        </div>
                        
                        <h5 className="text-sm font-medium text-yellow-800 mb-2">
                          {message.subject}
                        </h5>
                        
                        <p className="text-sm text-yellow-700 mb-3">
                          {message.content}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Reply className="mr-2 h-4 w-4" />
                            Répondre
                          </Button>
                          <Button variant="outline" size="sm">
                            <StarOff className="mr-2 h-4 w-4" />
                            Retirer Favori
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMessages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun message en favori</p>
                  <p className="text-sm">Marquez des messages importants avec l&apos;étoile</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions Rapides</CardTitle>
          <CardDescription>
            Gérez vos communications efficacement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Button variant="outline" className="w-full">
              <CheckCircle className="mr-2 h-4 w-4" />
              Tout Marquer Lu
            </Button>
            <Button variant="outline" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Conversations
            </Button>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filtres Avancés
            </Button>
            <Button variant="outline" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Nettoyer Boîte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
