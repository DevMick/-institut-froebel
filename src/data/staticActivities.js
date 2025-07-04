// Données statiques pour les activités
export const staticActivities = [
  {
    id: 1,
    nom: "Sortie pédagogique - Musée d'Andohalo",
    description: "Visite guidée du musée d'Andohalo pour découvrir l'histoire et la culture malgache. Les élèves de 6ème A et B participeront à cette sortie éducative avec des ateliers pratiques.",
    type: "Sortie",
    classe: { nom: "6ème A", id: 1 },
    ecole: { nom: "Institut Froebel LA TULIPE" },
    dateDebut: "2024-12-20T08:00:00.000Z",
    dateFin: "2024-12-20T16:00:00.000Z",
    lieu: "Musée d'Andohalo, Antananarivo",
    responsable: "Marie Rakoto",
    statut: "Planifiée",
    priorite: "Haute",
    budget: 150000,
    nombreParticipants: 45,
    categorie: "Culturelle",
    matieres: ["Histoire", "Géographie", "Arts plastiques"],
    objectifs: ["Découvrir l'histoire malgache", "Développer la curiosité culturelle", "Pratiquer l'observation"],
    materiel: ["Carnets de notes", "Appareils photos", "Questionnaires"],
    createdAt: "2024-12-01T10:00:00.000Z",
    updatedAt: "2024-12-01T10:00:00.000Z"
  },
  {
    id: 2,
    nom: "Atelier de lecture - Bibliothèque",
    description: "Atelier hebdomadaire de lecture pour développer le goût de la lecture chez les élèves du primaire. Activités de lecture à voix haute, discussions sur les livres et jeux littéraires.",
    type: "Atelier",
    classe: { nom: "CP", id: 2 },
    ecole: { nom: "Institut Froebel LA TULIPE" },
    dateDebut: "2024-12-21T09:00:00.000Z",
    dateFin: "2024-12-21T11:00:00.000Z",
    lieu: "Bibliothèque de l'école",
    responsable: "Sahondra Ravelojaona",
    statut: "En cours",
    priorite: "Normale",
    budget: 50000,
    nombreParticipants: 25,
    categorie: "Éducative",
    matieres: ["Français", "Littérature"],
    objectifs: ["Développer la lecture", "Enrichir le vocabulaire", "Stimuler l'imagination"],
    materiel: ["Livres jeunesse", "Tableaux", "Marqueurs"],
    createdAt: "2024-11-15T14:30:00.000Z",
    updatedAt: "2024-12-15T14:30:00.000Z"
  },
  {
    id: 3,
    nom: "Compétition de mathématiques",
    description: "Compétition inter-classes de mathématiques pour stimuler l'intérêt des élèves pour les mathématiques. Épreuves individuelles et par équipes avec des prix à gagner.",
    type: "Compétition",
    classe: { nom: "5ème B", id: 3 },
    ecole: { nom: "Institut Froebel LA TULIPE" },
    dateDebut: "2024-12-25T14:00:00.000Z",
    dateFin: "2024-12-25T17:00:00.000Z",
    lieu: "Salle polyvalente",
    responsable: "Jean Andriamanjato",
    statut: "Planifiée",
    priorite: "Normale",
    budget: 80000,
    nombreParticipants: 30,
    categorie: "Académique",
    matieres: ["Mathématiques"],
    objectifs: ["Stimuler l'intérêt pour les maths", "Développer l'esprit de compétition", "Renforcer les compétences"],
    materiel: ["Calculatrices", "Feuilles d'exercices", "Prix"],
    createdAt: "2024-12-10T09:15:00.000Z",
    updatedAt: "2024-12-10T09:15:00.000Z"
  },
  {
    id: 4,
    nom: "Projet jardin potager",
    description: "Projet interdisciplinaire de création d'un jardin potager dans l'école. Les élèves apprennent la botanique, l'écologie et développent des compétences pratiques.",
    type: "Projet",
    classe: { nom: "4ème A", id: 4 },
    ecole: { nom: "Institut Froebel LA TULIPE" },
    dateDebut: "2024-12-18T08:00:00.000Z",
    dateFin: "2025-06-30T16:00:00.000Z",
    lieu: "Jardin de l'école",
    responsable: "Elisabeth Rasoa",
    statut: "En cours",
    priorite: "Haute",
    budget: 120000,
    nombreParticipants: 35,
    categorie: "Environnementale",
    matieres: ["Sciences", "Biologie", "Écologie"],
    objectifs: ["Apprendre la botanique", "Développer l'écocitoyenneté", "Pratiquer le jardinage"],
    materiel: ["Graines", "Outils de jardinage", "Arrosoirs"],
    createdAt: "2024-11-20T11:45:00.000Z",
    updatedAt: "2024-12-18T08:00:00.000Z"
  },
  {
    id: 5,
    nom: "Spectacle de fin d'année",
    description: "Grand spectacle de fin d'année présentant les talents des élèves : danse, théâtre, musique et arts visuels. Événement ouvert aux parents et à la communauté.",
    type: "Événement",
    classe: { nom: "Toutes classes", id: 5 },
    ecole: { nom: "Institut Froebel LA TULIPE" },
    dateDebut: "2025-06-15T18:00:00.000Z",
    dateFin: "2025-06-15T22:00:00.000Z",
    lieu: "Salle de spectacle de l'école",
    responsable: "Marie Rakoto",
    statut: "Planifiée",
    priorite: "Haute",
    budget: 200000,
    nombreParticipants: 120,
    categorie: "Artistique",
    matieres: ["Musique", "Arts plastiques", "Théâtre"],
    objectifs: ["Développer les talents artistiques", "Renforcer la confiance en soi", "Créer des liens communautaires"],
    materiel: ["Instruments de musique", "Costumes", "Éclairage"],
    createdAt: "2024-12-01T16:00:00.000Z",
    updatedAt: "2024-12-01T16:00:00.000Z"
  }
];

// Statistiques pour les activités
export const activityStats = {
  general: {
    totalActivities: 5,
    activitiesCeMois: 3,
    activitiesEnCours: 2,
    activitiesPlanifiees: 3,
    budgetTotal: 600000,
    participantsTotal: 255
  },
  parType: {
    "Sortie": 1,
    "Atelier": 1,
    "Compétition": 1,
    "Projet": 1,
    "Événement": 1
  },
  parStatut: {
    "Planifiée": 3,
    "En cours": 2,
    "Terminée": 0,
    "Annulée": 0
  },
  parCategorie: {
    "Culturelle": 1,
    "Éducative": 1,
    "Académique": 1,
    "Environnementale": 1,
    "Artistique": 1
  },
  parPriorite: {
    "Haute": 3,
    "Normale": 2,
    "Basse": 0
  },
  budget: {
    total: 600000,
    moyenne: 120000,
    plusEleve: 200000,
    plusBas: 50000
  },
  participation: {
    moyenne: 51,
    plusElevee: 120,
    plusBasse: 25
  },
  matieres: {
    "Histoire": 1,
    "Géographie": 1,
    "Arts plastiques": 2,
    "Français": 1,
    "Littérature": 1,
    "Mathématiques": 1,
    "Sciences": 1,
    "Biologie": 1,
    "Écologie": 1,
    "Musique": 1,
    "Théâtre": 1
  }
}; 