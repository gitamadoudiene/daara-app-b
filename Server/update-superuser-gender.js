 <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Créer une nouvelle Classe</DialogTitle>
                        <DialogDescription>
                          Veuillez remplir les informations de la classe pour {user?.school?.name || 'votre école'}.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateClass} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="class-name">Nom de la Classe</Label>
                            <Input
                              id="class-name"
                              value={classForm.name}
                              onChange={(e) => setClassForm({...classForm, name: e.target.value})}
                              placeholder="Ex: 6ème A, CM2 B"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="class-level">Niveau</Label>
                            <Select 
                              value={classForm.level} 
                              onValueChange={(value) => setClassForm({...classForm, level: value})}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le niveau" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CP">CP - Cours Préparatoire</SelectItem>
                                <SelectItem value="CE1">CE1 - Cours Élémentaire 1</SelectItem>
                                <SelectItem value="CE2">CE2 - Cours Élémentaire 2</SelectItem>
                                <SelectItem value="CM1">CM1 - Cours Moyen 1</SelectItem>
                                <SelectItem value="CM2">CM2 - Cours Moyen 2</SelectItem>
                                <SelectItem value="6eme">6ème</SelectItem>
                                <SelectItem value="5eme">5ème</SelectItem>
                                <SelectItem value="4eme">4ème</SelectItem>
                                <SelectItem value="3eme">3ème</SelectItem>
                                <SelectItem value="2nde">2nde</SelectItem>
                                <SelectItem value="1ere">1ère</SelectItem>
                                <SelectItem value="Terminal_S">Terminal S</SelectItem>
                                <SelectItem value="Terminal_L">Terminal L</SelectItem>
                                <SelectItem value="Terminal_G">Terminal G</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="class-capacity">Capacité</Label>
                            <Input
                              id="class-capacity"
                              type="number"
                              value={classForm.capacity}
                              onChange={(e) => setClassForm({...classForm, capacity: e.target.value})}
                              placeholder="Ex: 35"
                              min="1"
                              max="50"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="class-academic-year">Année Académique</Label>
                            <Select 
                              value={classForm.academicYear} 
                              onValueChange={(value) => setClassForm({...classForm, academicYear: value})}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner l'année" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2023-2024">2023-2024</SelectItem>
                                <SelectItem value="2024-2025">2024-2025</SelectItem>
                                <SelectItem value="2025-2026">2025-2026</SelectItem>
                                <SelectItem value="2026-2027">2026-2027</SelectItem>
                                <SelectItem value="2027-2028">2027-2028</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="class-teacher">Professeur Titulaire</Label>
                            <Select
                              value={classForm.teacherId}
                              onValueChange={(value) => setClassForm({...classForm, teacherId: value})}
                              disabled={loadingTeachers}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={loadingTeachers ? "Chargement des professeurs..." : "Sélectionner un professeur"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Aucun professeur</SelectItem>
                                {teachers.map((teacher) => (
                                  <SelectItem key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="class-room">Salle de Classe</Label>
                            <Select
                              value={classForm.room}
                              onValueChange={(value) => setClassForm({...classForm, room: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une salle" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Salle non assignée</SelectItem>
                                {rooms.map((room) => (
                                  <SelectItem key={room.id} value={room.id}>
                                    {room.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Matières</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                              {loadingSubjects ? (
                                <div className="col-span-full text-center py-4 text-sm text-gray-500">
                                  Chargement des matières...
                                </div>
                              ) : availableSubjects.length === 0 ? (
                                <div className="col-span-full text-center py-4 text-sm text-gray-500">
                                  Aucune matière disponible
                                </div>
                              ) : (
                                availableSubjects.map((subject) => (
                                  <div key={subject.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`subject-${subject.id}`}
                                      checked={classForm.subjects.includes(subject.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setClassForm({
                                            ...classForm,
                                            subjects: [...classForm.subjects, subject.id]
                                          });
                                        } else {
                                          setClassForm({
                                            ...classForm,
                                            subjects: classForm.subjects.filter(id => id !== subject.id)
                                          });
                                        }
                                      }}
                                      className="rounded"
                                    />
                                    <Label
                                      htmlFor={`subject-${subject.id}`}
                                      className="text-sm cursor-pointer"
                                    >
                                      {subject.name}
                                    </Label>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>École</Label>
                            <div className="p-2 bg-gray-50 rounded border">
                              <span className="text-sm text-gray-600">🏫 {user?.school?.name || 'École non spécifiée'}</span>
                              <p className="text-xs text-gray-500 mt-1">École verrouillée pour cet administrateur</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsCreateClassOpen(false)}>
                            Annuler
                          </Button>
                          <Button type="submit">Créer la Classe</Button>
                        </div>
                      </form>
                    </DialogContent>


</DialogHeader>
                  <form onSubmit={handleCreateClass} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="class-name">Nom de la Classe</Label>
                        <Input 
                          id="class-name" 
                          value={createClassForm.name}
                          onChange={(e) => setCreateClassForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: 6ème A" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="class-level">Niveau</Label>
                        <Select 
                          value={createClassForm.level}
                          onValueChange={(value) => setCreateClassForm(prev => ({ ...prev, level: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le niveau" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CP">CP - Cours Préparatoire</SelectItem>
                            <SelectItem value="CE1">CE1 - Cours Élémentaire 1</SelectItem>
                            <SelectItem value="CE2">CE2 - Cours Élémentaire 2</SelectItem>
                            <SelectItem value="CM1">CM1 - Cours Moyen 1</SelectItem>
                            <SelectItem value="CM2">CM2 - Cours Moyen 2</SelectItem>
                            <SelectItem value="6eme">6ème</SelectItem>
                            <SelectItem value="5eme">5ème</SelectItem>
                            <SelectItem value="4eme">4ème</SelectItem>
                            <SelectItem value="3eme">3ème</SelectItem>
                            <SelectItem value="2nde">2nde</SelectItem>
                            <SelectItem value="1ere">1ère</SelectItem>
                            <SelectItem value="Terminal_S">Terminal S</SelectItem>
                            <SelectItem value="Terminal_L">Terminal L</SelectItem>
                            <SelectItem value="Terminal_G">Terminal G</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="class-capacity">Capacité</Label>
                        <Input 
                          id="class-capacity" 
                          type="number"
                          value={createClassForm.capacity}
                          onChange={(e) => setCreateClassForm(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                          placeholder="40" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="class-teacher">Enseignant Principal</Label>
                        <Select 
                          value={createClassForm.teacherId}
                          onValueChange={(value) => setCreateClassForm(prev => ({ ...prev, teacherId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un enseignant" />
                          </SelectTrigger>
                          <SelectContent>
                            {schoolTeachers.map((teacher) => (
                              <SelectItem key={teacher._id} value={teacher._id}>
                                {teacher.name} {teacher.subjects?.length > 0 ? `(${teacher.subjects.join(', ')})` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="class-room">Salle</Label>
                        <Input 
                          id="class-room" 
                          value={createClassForm.room}
                          onChange={(e) => setCreateClassForm(prev => ({ ...prev, room: e.target.value }))}
                          placeholder="Ex: Salle 101" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                      <Button type="submit" className="flex-1">Créer Classe</Button>
                      <Button type="button" variant="outline" onClick={() => setIsCreateClassOpen(false)} className="flex-1">
                        Annuler
                      </Button>
                    </div>
                  </form>
</DialogContent>