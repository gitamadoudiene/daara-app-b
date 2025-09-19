// Correction simple pour SchoolStructure.tsx - section fetchClasses

const fetchClasses = async () => {
  try {
    console.log('🔍 fetchClasses: Début de la récupération');
    const token = localStorage.getItem('daara_token');
    console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'AUCUN TOKEN');
    
    if (!token) {
      console.warn('❌ Aucun token trouvé');
      return;
    }

    // Utiliser directement l'ID de l'école "Les Pedagogues" 
    const schoolId = '68c7700cd9f7c4207d3c9ea6';
    const url = `/api/classes/school/${schoolId}`;
    console.log('🌐 URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log('📊 Données reçues:', data);
      console.log('📊 Nombre de classes:', data.length);
      
      const mappedClasses = data.map((cls: any) => {
        let teacherName = 'Non assigné';
        
        // Simple: si resTeacher est un objet avec name, l'utiliser
        if (cls.resTeacher && typeof cls.resTeacher === 'object' && cls.resTeacher.name) {
          teacherName = cls.resTeacher.name;
        }

        return {
          id: cls._id,
          name: cls.name,
          level: cls.level,
          capacity: cls.capacity || 40,
          enrolled: cls.studentCount || 0,
          teacher: teacherName,
          room: cls.room || 'Salle à définir',
          subject: cls.subjects?.join(', ') || 'Non défini',
          status: (cls.studentCount || 0) >= (cls.capacity || 40) ? 'Complet' : 'Actif',
          createdAt: new Date(cls.createdAt).toLocaleDateString('fr-FR'),
          resTeacherId: cls.resTeacher?._id || null
        };
      });
      
      console.log('✅ Classes mappées:', mappedClasses);
      setClasses(mappedClasses);
    } else {
      const errorText = await response.text();
      console.error('❌ Erreur API:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des classes:', error);
  }
};