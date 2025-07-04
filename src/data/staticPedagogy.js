// Données statiques pour la pédagogie de l'Institut Froebel LA TULIPE

// BULLETINS
export const staticBulletins = [
  {
    id: 1,
    eleve: { id: 1, nom: "Andriamanjato", prenom: "Sofia" },
    classe: { id: 1, nom: "6ème A" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    trimestre: "1er Trimestre",
    anneeScolaire: "2024-2025",
    dateCreation: "2024-12-15T08:00:00.000Z",
    moyennes: {
      "Mathématiques": 16.5,
      "Français": 15.8,
      "Histoire-Géographie": 14.2,
      "Sciences": 17.1,
      "Anglais": 16.9,
      "Arts Plastiques": 15.5,
      "EPS": 18.0,
      "Technologie": 16.2
    },
    moyenneGenerale: 16.3,
    appreciation: "Excellente élève, très travailleuse et motivée. Continue ainsi !",
    rang: 2,
    effectif: 28,
    pdfUrl: "/bulletins/bulletin_sofia_andriamanjato_6a_t1.pdf",
    statut: "Publié"
  },
  {
    id: 2,
    eleve: { id: 2, nom: "Rasolofomanana", prenom: "Tahiry" },
    classe: { id: 1, nom: "6ème A" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    trimestre: "1er Trimestre",
    anneeScolaire: "2024-2025",
    dateCreation: "2024-12-15T08:00:00.000Z",
    moyennes: {
      "Mathématiques": 18.2,
      "Français": 14.7,
      "Histoire-Géographie": 15.8,
      "Sciences": 16.4,
      "Anglais": 17.1,
      "Arts Plastiques": 16.8,
      "EPS": 17.5,
      "Technologie": 15.9
    },
    moyenneGenerale: 16.6,
    appreciation: "Très bon niveau en mathématiques. Efforts à fournir en français.",
    rang: 1,
    effectif: 28,
    pdfUrl: "/bulletins/bulletin_tahiry_rasolofomanana_6a_t1.pdf",
    statut: "Publié"
  },
  {
    id: 3,
    eleve: { id: 3, nom: "Rakotomalala", prenom: "Miora" },
    classe: { id: 1, nom: "6ème A" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    trimestre: "1er Trimestre",
    anneeScolaire: "2024-2025",
    dateCreation: "2024-12-15T08:00:00.000Z",
    moyennes: {
      "Mathématiques": 14.8,
      "Français": 17.2,
      "Histoire-Géographie": 16.5,
      "Sciences": 15.1,
      "Anglais": 18.4,
      "Arts Plastiques": 16.7,
      "EPS": 15.8,
      "Technologie": 14.9
    },
    moyenneGenerale: 16.2,
    appreciation: "Excellent niveau en français et anglais. Peut progresser en mathématiques.",
    rang: 3,
    effectif: 28,
    pdfUrl: "/bulletins/bulletin_miora_rakotomalala_6a_t1.pdf",
    statut: "Publié"
  },
  {
    id: 4,
    eleve: { id: 9, nom: "Razafimahatratra", prenom: "Andry" },
    classe: { id: 3, nom: "5ème A" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    trimestre: "1er Trimestre",
    anneeScolaire: "2024-2025",
    dateCreation: "2024-12-15T08:00:00.000Z",
    moyennes: {
      "Mathématiques": 16.8,
      "Français": 15.4,
      "Histoire-Géographie": 17.1,
      "Sciences": 16.9,
      "Anglais": 15.7,
      "Arts Plastiques": 16.2,
      "EPS": 18.5,
      "Technologie": 17.3
    },
    moyenneGenerale: 16.7,
    appreciation: "Leader naturel de la classe. Très bon niveau général.",
    rang: 1,
    effectif: 30,
    pdfUrl: "/bulletins/bulletin_andry_razafimahatratra_5a_t1.pdf",
    statut: "Publié"
  },
  {
    id: 5,
    eleve: { id: 16, nom: "Rakotomalala", prenom: "Ando" },
    classe: { id: 7, nom: "3ème A" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    trimestre: "1er Trimestre",
    anneeScolaire: "2024-2025",
    dateCreation: "2024-12-15T08:00:00.000Z",
    moyennes: {
      "Mathématiques": 17.2,
      "Français": 16.8,
      "Histoire-Géographie": 18.1,
      "Sciences": 17.5,
      "Anglais": 16.9,
      "Arts Plastiques": 15.7,
      "EPS": 17.8,
      "Technologie": 18.3,
      "Philosophie": 16.4
    },
    moyenneGenerale: 17.3,
    appreciation: "Élève mature et responsable. Excellent niveau pour le brevet.",
    rang: 1,
    effectif: 31,
    pdfUrl: "/bulletins/bulletin_ando_rakotomalala_3a_t1.pdf",
    statut: "Publié"
  }
];

// EMPLOIS DU TEMPS (Documents complets par classe)
export const staticEmplois = [
  {
    id: 1,
    classe: { id: 1, nom: "6ème A" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    anneeScolaire: "2024-2025",
    trimestre: "1er Trimestre",
    dateCreation: "2024-09-01T08:00:00.000Z",
    dateModification: "2024-12-15T08:00:00.000Z",
    responsable: { nom: "Rakoto", prenom: "Marie" },
    statut: "Actif",
    documentUrl: "/emplois/emploi_6a_2024_2025.docx",
    documentPdfUrl: "/emplois/emploi_6a_2024_2025.pdf",
    description: "Emploi du temps complet de la classe 6ème A pour l'année scolaire 2024-2025",
    matieres: ["Mathématiques", "Français", "Histoire-Géographie", "Sciences", "Anglais", "Arts Plastiques", "EPS", "Technologie"],
    enseignants: [
      { nom: "Rakoto", prenom: "Marie", matiere: "Mathématiques" },
      { nom: "Razafindrakoto", prenom: "Jean-Pierre", matiere: "Français" },
      { nom: "Rasolofomanana", prenom: "Elisabeth", matiere: "Histoire-Géographie" },
      { nom: "Andrianarivelo", prenom: "Claude", matiere: "Sciences" },
      { nom: "Rakotondrainibe", prenom: "Sylvie", matiere: "Anglais" },
      { nom: "Ramananarivo", prenom: "Patrick", matiere: "EPS" }
    ]
  },
  {
    id: 2,
    classe: { id: 2, nom: "6ème B" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    anneeScolaire: "2024-2025",
    trimestre: "1er Trimestre",
    dateCreation: "2024-09-01T08:00:00.000Z",
    dateModification: "2024-12-15T08:00:00.000Z",
    responsable: { nom: "Razafindrakoto", prenom: "Jean-Pierre" },
    statut: "Actif",
    documentUrl: "/emplois/emploi_6b_2024_2025.docx",
    documentPdfUrl: "/emplois/emploi_6b_2024_2025.pdf",
    description: "Emploi du temps complet de la classe 6ème B pour l'année scolaire 2024-2025",
    matieres: ["Mathématiques", "Français", "Histoire-Géographie", "Sciences", "Anglais", "Arts Plastiques", "EPS", "Technologie"],
    enseignants: [
      { nom: "Razafindrakoto", prenom: "Jean-Pierre", matiere: "Français" },
      { nom: "Rakoto", prenom: "Marie", matiere: "Mathématiques" },
      { nom: "Rasolofomanana", prenom: "Elisabeth", matiere: "Histoire-Géographie" },
      { nom: "Andrianarivelo", prenom: "Claude", matiere: "Sciences" },
      { nom: "Rakotondrainibe", prenom: "Sylvie", matiere: "Anglais" },
      { nom: "Ramananarivo", prenom: "Patrick", matiere: "EPS" }
    ]
  },
  {
    id: 3,
    classe: { id: 3, nom: "5ème A" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    anneeScolaire: "2024-2025",
    trimestre: "1er Trimestre",
    dateCreation: "2024-09-01T08:00:00.000Z",
    dateModification: "2024-12-15T08:00:00.000Z",
    responsable: { nom: "Rakoto", prenom: "Marie" },
    statut: "Actif",
    documentUrl: "/emplois/emploi_5a_2024_2025.docx",
    documentPdfUrl: "/emplois/emploi_5a_2024_2025.pdf",
    description: "Emploi du temps complet de la classe 5ème A pour l'année scolaire 2024-2025",
    matieres: ["Mathématiques", "Français", "Histoire-Géographie", "Sciences", "Anglais", "Arts Plastiques", "EPS", "Technologie"],
    enseignants: [
      { nom: "Rakoto", prenom: "Marie", matiere: "Mathématiques" },
      { nom: "Razafindrakoto", prenom: "Jean-Pierre", matiere: "Français" },
      { nom: "Rasolofomanana", prenom: "Elisabeth", matiere: "Histoire-Géographie" },
      { nom: "Andrianarivelo", prenom: "Claude", matiere: "Sciences" },
      { nom: "Rakotondrainibe", prenom: "Sylvie", matiere: "Anglais" },
      { nom: "Ramananarivo", prenom: "Patrick", matiere: "EPS" }
    ]
  },
  {
    id: 4,
    classe: { id: 4, nom: "5ème B" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    anneeScolaire: "2024-2025",
    trimestre: "1er Trimestre",
    dateCreation: "2024-09-01T08:00:00.000Z",
    dateModification: "2024-12-15T08:00:00.000Z",
    responsable: { nom: "Razafindrakoto", prenom: "Jean-Pierre" },
    statut: "Actif",
    documentUrl: "/emplois/emploi_5b_2024_2025.docx",
    documentPdfUrl: "/emplois/emploi_5b_2024_2025.pdf",
    description: "Emploi du temps complet de la classe 5ème B pour l'année scolaire 2024-2025",
    matieres: ["Mathématiques", "Français", "Histoire-Géographie", "Sciences", "Anglais", "Arts Plastiques", "EPS", "Technologie"],
    enseignants: [
      { nom: "Razafindrakoto", prenom: "Jean-Pierre", matiere: "Français" },
      { nom: "Rakoto", prenom: "Marie", matiere: "Mathématiques" },
      { nom: "Rasolofomanana", prenom: "Elisabeth", matiere: "Histoire-Géographie" },
      { nom: "Andrianarivelo", prenom: "Claude", matiere: "Sciences" },
      { nom: "Rakotondrainibe", prenom: "Sylvie", matiere: "Anglais" },
      { nom: "Ramananarivo", prenom: "Patrick", matiere: "EPS" }
    ]
  },
  {
    id: 5,
    classe: { id: 7, nom: "3ème A" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    anneeScolaire: "2024-2025",
    trimestre: "1er Trimestre",
    dateCreation: "2024-09-01T08:00:00.000Z",
    dateModification: "2024-12-15T08:00:00.000Z",
    responsable: { nom: "Andriamanantena", prenom: "Nathalie" },
    statut: "Actif",
    documentUrl: "/emplois/emploi_3a_2024_2025.docx",
    documentPdfUrl: "/emplois/emploi_3a_2024_2025.pdf",
    description: "Emploi du temps complet de la classe 3ème A pour l'année scolaire 2024-2025",
    matieres: ["Mathématiques", "Français", "Histoire-Géographie", "Sciences", "Anglais", "EPS", "Technologie", "Philosophie"],
    enseignants: [
      { nom: "Andriamanantena", prenom: "Nathalie", matiere: "Philosophie" },
      { nom: "Rasolofomanana", prenom: "Elisabeth", matiere: "Histoire-Géographie" },
      { nom: "Rakoto", prenom: "Marie", matiere: "Mathématiques" },
      { nom: "Razafindrakoto", prenom: "Jean-Pierre", matiere: "Français" },
      { nom: "Andrianarivelo", prenom: "Claude", matiere: "Sciences" },
      { nom: "Rakotondrainibe", prenom: "Sylvie", matiere: "Anglais" }
    ]
  }
];

// CAHIERS DE LIAISON
export const staticCahiers = [
  {
    id: 1,
    eleve: { id: 1, nom: "Andriamanjato", prenom: "Sofia" },
    classe: { id: 1, nom: "6ème A" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    type: "Communication",
    date: "2024-12-15T08:00:00.000Z",
    auteur: { nom: "Rakoto", prenom: "Marie" },
    destinataire: { nom: "Andriamanjato", prenom: "Jean" },
    sujet: "Réunion parents-professeurs",
    contenu: "Bonjour, nous organisons une réunion parents-professeurs le 20 décembre 2024 à 18h00. Votre présence est souhaitée.",
    statut: "Envoyé",
    pdfUrl: "/cahiers/cahier_sofia_andriamanjato_15dec.pdf"
  },
  {
    id: 2,
    eleve: { id: 2, nom: "Rasolofomanana", prenom: "Tahiry" },
    classe: { id: 1, nom: "6ème A" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    type: "Absence",
    date: "2024-12-14T08:00:00.000Z",
    auteur: { nom: "Rasolofomanana", prenom: "Marie" },
    destinataire: { nom: "Razafindrakoto", prenom: "Jean-Pierre" },
    sujet: "Absence de Tahiry",
    contenu: "Tahiry sera absente demain pour un rendez-vous médical. Merci de l'excuser.",
    statut: "Lu",
    pdfUrl: "/cahiers/cahier_tahiry_rasolofomanana_14dec.pdf"
  },
  {
    id: 3,
    eleve: { id: 3, nom: "Rakotomalala", prenom: "Miora" },
    classe: { id: 1, nom: "6ème A" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    type: "Félicitations",
    date: "2024-12-13T08:00:00.000Z",
    auteur: { nom: "Rakotondrainibe", prenom: "Sylvie" },
    destinataire: { nom: "Rakotomalala", prenom: "Pierre" },
    sujet: "Excellente participation en anglais",
    contenu: "Félicitations à Miora pour son excellente participation en cours d'anglais. Elle fait preuve d'un très bon niveau.",
    statut: "Lu",
    pdfUrl: "/cahiers/cahier_miora_rakotomalala_13dec.pdf"
  },
  {
    id: 4,
    eleve: { id: 9, nom: "Razafimahatratra", prenom: "Andry" },
    classe: { id: 3, nom: "5ème A" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    type: "Information",
    date: "2024-12-12T08:00:00.000Z",
    auteur: { nom: "Rakoto", prenom: "Marie" },
    destinataire: { nom: "Razafimahatratra", prenom: "Henri" },
    sujet: "Sortie pédagogique",
    contenu: "Une sortie pédagogique est prévue le 25 décembre 2024 au musée d'Andohalo. Autorisation parentale requise.",
    statut: "Envoyé",
    pdfUrl: "/cahiers/cahier_andry_razafimahatratra_12dec.pdf"
  },
  {
    id: 5,
    eleve: { id: 16, nom: "Rakotomalala", prenom: "Ando" },
    classe: { id: 7, nom: "3ème A" },
    ecole: { id: 1, nom: "Institut Froebel LA TULIPE" },
    type: "Orientation",
    date: "2024-12-11T08:00:00.000Z",
    auteur: { nom: "Andriamanantena", prenom: "Nathalie" },
    destinataire: { nom: "Rakotomalala", prenom: "Pierre" },
    sujet: "Entretien d'orientation",
    contenu: "Nous souhaitons organiser un entretien d'orientation pour discuter des choix de filière pour le lycée.",
    statut: "Lu",
    pdfUrl: "/cahiers/cahier_ando_rakotomalala_11dec.pdf"
  }
];

// STATISTIQUES PÉDAGOGIE
export const pedagogyStats = {
  bulletins: {
    total: 5,
    publies: 5,
    enAttente: 0,
    moyenneGenerale: 16.6,
    meilleureMoyenne: 17.3,
    plusFaibleMoyenne: 16.2
  },
  emplois: {
    total: 5,
    classes: 5,
    matieres: 8,
    enseignants: 6,
    actifs: 5,
    enAttente: 0
  },
  cahiers: {
    total: 5,
    envoyes: 3,
    lus: 2,
    types: {
      "Communication": 1,
      "Absence": 1,
      "Félicitations": 1,
      "Information": 1,
      "Orientation": 1
    }
  },
  schoolName: "Institut Froebel LA TULIPE",
  academicYear: "2024-2025"
}; 