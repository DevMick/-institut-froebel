// Données statiques pour le personnel (administrateurs et professeurs)
export const staticPersonnel = {
  administrateurs: [
    {
      id: 1,
      nom: "Rakoto",
      prenom: "Marie",
      email: "marie.rakoto@institut-froebel.mg",
      telephone: "+261 34 12 345 67",
      poste: "Directrice Générale",
      ecole: { nom: "Institut Froebel LA TULIPE" },
      dateEmbauche: "2020-09-01T08:00:00.000Z",
      statut: "Actif",
      permissions: ["Gestion complète", "Administration", "Rapports"],
      isActive: true,
      createdAt: "2020-09-01T08:00:00.000Z",
      updatedAt: "2024-09-01T08:00:00.000Z"
    },
    {
      id: 2,
      nom: "Razafindrakoto",
      prenom: "Jean-Pierre",
      email: "jeanpierre.razafindrakoto@institut-froebel.mg",
      telephone: "+261 34 23 456 78",
      poste: "Directeur Administratif",
      ecole: { nom: "Institut Froebel LA TULIPE" },
      dateEmbauche: "2021-03-15T08:00:00.000Z",
      statut: "Actif",
      permissions: ["Administration", "Gestion financière", "Ressources humaines"],
      isActive: true,
      createdAt: "2021-03-15T08:00:00.000Z",
      updatedAt: "2024-09-01T08:00:00.000Z"
    },
    {
      id: 3,
      nom: "Andriamampianina",
      prenom: "Sylvie",
      email: "sylvie.andriamampianina@institut-froebel.mg",
      telephone: "+261 34 34 567 89",
      poste: "Responsable Pédagogique",
      ecole: { nom: "Institut Froebel LA TULIPE" },
      dateEmbauche: "2022-01-10T08:00:00.000Z",
      statut: "Actif",
      permissions: ["Pédagogie", "Formation", "Évaluation"],
      isActive: true,
      createdAt: "2022-01-10T08:00:00.000Z",
      updatedAt: "2024-09-01T08:00:00.000Z"
    }
  ],
  professeurs: [
    {
      id: 1,
      nom: "Rasolofomanana",
      prenom: "Andry",
      email: "andry.rasolofomanana@institut-froebel.mg",
      telephone: "+261 34 45 678 90",
      matieres: ["Mathématiques", "Physique"],
      classes: ["6ème A", "5ème B", "4ème A"],
      ecole: { nom: "Institut Froebel LA TULIPE" },
      dateEmbauche: "2023-09-01T08:00:00.000Z",
      statut: "Actif",
      niveau: "Licence en Mathématiques",
      experience: "5 ans",
      isActive: true,
      createdAt: "2023-09-01T08:00:00.000Z",
      updatedAt: "2024-09-01T08:00:00.000Z"
    },
    {
      id: 2,
      nom: "Ramanantsoa",
      prenom: "Félicité",
      email: "felicite.ramanantsoa@institut-froebel.mg",
      telephone: "+261 34 56 789 01",
      matieres: ["Français", "Histoire-Géographie"],
      classes: ["6ème B", "5ème A", "3ème B"],
      ecole: { nom: "Institut Froebel LA TULIPE" },
      dateEmbauche: "2022-09-01T08:00:00.000Z",
      statut: "Actif",
      niveau: "Master en Lettres Modernes",
      experience: "8 ans",
      isActive: true,
      createdAt: "2022-09-01T08:00:00.000Z",
      updatedAt: "2024-09-01T08:00:00.000Z"
    },
    {
      id: 3,
      nom: "Rajaonarison",
      prenom: "Henintsoa",
      email: "henintsoa.rajaonarison@institut-froebel.mg",
      telephone: "+261 34 67 890 12",
      matieres: ["SVT", "Chimie"],
      classes: ["4ème B", "3ème A", "3ème C"],
      ecole: { nom: "Institut Froebel LA TULIPE" },
      dateEmbauche: "2021-09-01T08:00:00.000Z",
      statut: "Actif",
      niveau: "Master en Biologie",
      experience: "6 ans",
      isActive: true,
      createdAt: "2021-09-01T08:00:00.000Z",
      updatedAt: "2024-09-01T08:00:00.000Z"
    },
    {
      id: 4,
      nom: "Rakotomalala",
      prenom: "Mamy",
      email: "mamy.rakotomalala@institut-froebel.mg",
      telephone: "+261 34 78 901 23",
      matieres: ["Anglais", "Espagnol"],
      classes: ["6ème A", "6ème B", "5ème A", "5ème B"],
      ecole: { nom: "Institut Froebel LA TULIPE" },
      dateEmbauche: "2023-03-01T08:00:00.000Z",
      statut: "Actif",
      niveau: "Licence en Langues Étrangères",
      experience: "3 ans",
      isActive: true,
      createdAt: "2023-03-01T08:00:00.000Z",
      updatedAt: "2024-09-01T08:00:00.000Z"
    },
    {
      id: 5,
      nom: "Razafindrakoto",
      prenom: "Tahina",
      email: "tahina.razafindrakoto@institut-froebel.mg",
      telephone: "+261 34 89 012 34",
      matieres: ["Informatique", "Technologie"],
      classes: ["4ème A", "4ème B", "3ème A", "3ème B", "3ème C"],
      ecole: { nom: "Institut Froebel LA TULIPE" },
      dateEmbauche: "2022-03-15T08:00:00.000Z",
      statut: "Actif",
      niveau: "Master en Informatique",
      experience: "4 ans",
      isActive: true,
      createdAt: "2022-03-15T08:00:00.000Z",
      updatedAt: "2024-09-01T08:00:00.000Z"
    }
  ]
};

// Statistiques du personnel
export const personnelStats = {
  general: {
    totalPersonnel: staticPersonnel.administrateurs.length + staticPersonnel.professeurs.length,
    totalAdministrateurs: staticPersonnel.administrateurs.length,
    totalProfesseurs: staticPersonnel.professeurs.length,
    personnelActif: staticPersonnel.administrateurs.filter(a => a.isActive).length + 
                    staticPersonnel.professeurs.filter(p => p.isActive).length
  },
  administrateurs: {
    total: staticPersonnel.administrateurs.length,
    actifs: staticPersonnel.administrateurs.filter(a => a.isActive).length,
    inactifs: staticPersonnel.administrateurs.filter(a => !a.isActive).length,
    moyenneExperience: "3.2 ans"
  },
  professeurs: {
    total: staticPersonnel.professeurs.length,
    actifs: staticPersonnel.professeurs.filter(p => p.isActive).length,
    inactifs: staticPersonnel.professeurs.filter(p => !p.isActive).length,
    moyenneExperience: "5.2 ans",
    matieresEnseignees: [...new Set(staticPersonnel.professeurs.flatMap(p => p.matieres))].length,
    classesCouvertes: [...new Set(staticPersonnel.professeurs.flatMap(p => p.classes))].length
  },
  parClasse: {
    "6ème A": staticPersonnel.professeurs.filter(p => p.classes.includes("6ème A")).length,
    "6ème B": staticPersonnel.professeurs.filter(p => p.classes.includes("6ème B")).length,
    "5ème A": staticPersonnel.professeurs.filter(p => p.classes.includes("5ème A")).length,
    "5ème B": staticPersonnel.professeurs.filter(p => p.classes.includes("5ème B")).length,
    "4ème A": staticPersonnel.professeurs.filter(p => p.classes.includes("4ème A")).length,
    "4ème B": staticPersonnel.professeurs.filter(p => p.classes.includes("4ème B")).length,
    "3ème A": staticPersonnel.professeurs.filter(p => p.classes.includes("3ème A")).length,
    "3ème B": staticPersonnel.professeurs.filter(p => p.classes.includes("3ème B")).length,
    "3ème C": staticPersonnel.professeurs.filter(p => p.classes.includes("3ème C")).length
  }
}; 