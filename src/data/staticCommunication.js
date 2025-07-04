// Données statiques pour la communication
export const staticAnnonces = [
  {
    id: 1,
    titre: "Réunion parents-professeurs",
    contenu: "Chers parents, nous vous convions à la réunion parents-professeurs qui se tiendra le vendredi 20 décembre 2024 à 14h00 dans la salle polyvalente. Cette réunion permettra de faire le point sur les progrès de vos enfants et de discuter des projets pédagogiques du second trimestre.",
    ecole: { nom: "Institut Froebel LA TULIPE" },
    auteur: { nom: "Rakoto", prenom: "Marie" },
    statut: "Publié",
    priorite: "Haute",
    datePublication: "2024-12-10T08:00:00.000Z",
    dateExpiration: "2024-12-25T23:59:59.000Z",
    destinataires: "Tous les parents",
    categorie: "Réunion",
    createdAt: "2024-12-10T08:00:00.000Z",
    updatedAt: "2024-12-10T08:00:00.000Z"
  },
  {
    id: 2,
    titre: "Sortie pédagogique - Musée d'Andohalo",
    contenu: "Les élèves de 6ème A et 6ème B participeront à une sortie pédagogique au Musée d'Andohalo le mercredi 18 décembre 2024. Départ à 8h00, retour prévu à 16h00. Prévoir un pique-nique et des vêtements confortables.",
    ecole: { nom: "Institut Froebel LA TULIPE" },
    auteur: { nom: "Andriamanjato", prenom: "Jean" },
    statut: "Publié",
    priorite: "Normale",
    datePublication: "2024-12-08T10:30:00.000Z",
    dateExpiration: "2024-12-18T23:59:59.000Z",
    destinataires: "Parents 6ème A et B",
    categorie: "Sortie",
    createdAt: "2024-12-08T10:30:00.000Z",
    updatedAt: "2024-12-08T10:30:00.000Z"
  },
  {
    id: 3,
    titre: "Fermeture exceptionnelle - 25 décembre",
    contenu: "L'établissement sera fermé le mercredi 25 décembre 2024 pour les fêtes de Noël. Les cours reprendront normalement le jeudi 26 décembre 2024. Nous vous souhaitons de joyeuses fêtes en famille.",
    ecole: { nom: "Institut Froebel LA TULIPE" },
    auteur: { nom: "Rasoa", prenom: "Elisabeth" },
    statut: "Publié",
    priorite: "Haute",
    datePublication: "2024-12-15T09:00:00.000Z",
    dateExpiration: "2024-12-26T23:59:59.000Z",
    destinataires: "Toute la communauté",
    categorie: "Fermeture",
    createdAt: "2024-12-15T09:00:00.000Z",
    updatedAt: "2024-12-15T09:00:00.000Z"
  },
  {
    id: 4,
    titre: "Atelier de lecture - Bibliothèque",
    contenu: "Un atelier de lecture est organisé tous les samedis de 9h00 à 11h00 à la bibliothèque de l'école. Cet atelier est ouvert à tous les élèves du primaire et vise à développer le goût de la lecture. Inscription auprès de Mme Ravelojaona.",
    ecole: { nom: "Institut Froebel LA TULIPE" },
    auteur: { nom: "Ravelojaona", prenom: "Sahondra" },
    statut: "Publié",
    priorite: "Normale",
    datePublication: "2024-12-12T14:15:00.000Z",
    dateExpiration: "2025-01-31T23:59:59.000Z",
    destinataires: "Parents primaire",
    categorie: "Activité",
    createdAt: "2024-12-12T14:15:00.000Z",
    updatedAt: "2024-12-12T14:15:00.000Z"
  },
  {
    id: 5,
    titre: "Résultats des examens - 1er trimestre",
    contenu: "Les résultats du 1er trimestre sont disponibles dans l'espace parents depuis le 15 décembre 2024. Vous pouvez consulter les bulletins de vos enfants en vous connectant à votre espace personnel. Pour toute question, contactez le secrétariat.",
    ecole: { nom: "Institut Froebel LA TULIPE" },
    auteur: { nom: "Rakoto", prenom: "Marie" },
    statut: "Publié",
    priorite: "Haute",
    datePublication: "2024-12-15T16:00:00.000Z",
    dateExpiration: "2025-01-15T23:59:59.000Z",
    destinataires: "Tous les parents",
    categorie: "Résultats",
    createdAt: "2024-12-15T16:00:00.000Z",
    updatedAt: "2024-12-15T16:00:00.000Z"
  }
];

export const staticMessages = [
  {
    id: 1,
    sujet: "Absence de votre enfant",
    contenu: "Bonjour, nous constatons que votre enfant [Nom de l'élève] était absent aujourd'hui sans justification. Pourriez-vous nous informer de la raison de cette absence ? Merci de votre compréhension.",
    expediteur: { nom: "Rakoto", prenom: "Marie" },
    destinataire: { nom: "Ramanantsoa", prenom: "Lala" },
    statut: "Envoyé",
    priorite: "Normale",
    dateEnvoi: "2024-12-15T08:30:00.000Z",
    dateLecture: "2024-12-15T09:15:00.000Z",
    type: "Absence",
    reponse: "Mon enfant était malade, je vous prie de m'excuser.",
    createdAt: "2024-12-15T08:30:00.000Z",
    updatedAt: "2024-12-15T09:15:00.000Z"
  },
  {
    id: 2,
    sujet: "Rendez-vous demandé",
    contenu: "Bonjour, je souhaiterais prendre rendez-vous avec vous pour discuter du comportement de mon enfant en classe. Serait-il possible de nous rencontrer cette semaine ? Merci.",
    expediteur: { nom: "Ramanantsoa", prenom: "Lala" },
    destinataire: { nom: "Andriamanjato", prenom: "Jean" },
    statut: "Envoyé",
    priorite: "Haute",
    dateEnvoi: "2024-12-14T16:45:00.000Z",
    dateLecture: "2024-12-15T07:20:00.000Z",
    type: "Rendez-vous",
    reponse: "Bien sûr, je suis disponible jeudi à 17h00. Cela vous convient-il ?",
    createdAt: "2024-12-14T16:45:00.000Z",
    updatedAt: "2024-12-15T07:20:00.000Z"
  },
  {
    id: 3,
    sujet: "Information sur les devoirs",
    contenu: "Chers parents, je vous informe que les devoirs de mathématiques pour cette semaine sont disponibles sur l'espace numérique. Les élèves doivent les rendre vendredi prochain. Merci de votre collaboration.",
    expediteur: { nom: "Rasoa", prenom: "Elisabeth" },
    destinataire: { nom: "Ravelojaona", prenom: "Sahondra" },
    statut: "Envoyé",
    priorite: "Normale",
    dateEnvoi: "2024-12-13T14:20:00.000Z",
    dateLecture: "2024-12-13T18:30:00.000Z",
    type: "Devoirs",
    reponse: "Merci pour l'information, je vais vérifier avec mon enfant.",
    createdAt: "2024-12-13T14:20:00.000Z",
    updatedAt: "2024-12-13T18:30:00.000Z"
  },
  {
    id: 4,
    sujet: "Félicitations pour les progrès",
    contenu: "Bonjour, je tenais à vous féliciter pour les excellents progrès de votre enfant ce trimestre. Son travail et son comportement sont exemplaires. Continuez ainsi !",
    expediteur: { nom: "Andriamanjato", prenom: "Jean" },
    destinataire: { nom: "Ramanantsoa", prenom: "Lala" },
    statut: "Envoyé",
    priorite: "Normale",
    dateEnvoi: "2024-12-12T11:00:00.000Z",
    dateLecture: "2024-12-12T19:45:00.000Z",
    type: "Félicitations",
    reponse: "Merci beaucoup, c'est très encourageant !",
    createdAt: "2024-12-12T11:00:00.000Z",
    updatedAt: "2024-12-12T19:45:00.000Z"
  },
  {
    id: 5,
    sujet: "Question sur le programme",
    contenu: "Bonjour, j'aurais une question concernant le programme de sciences pour la classe de 5ème. Pourriez-vous me préciser les chapitres qui seront abordés ce trimestre ? Merci.",
    expediteur: { nom: "Ravelojaona", prenom: "Sahondra" },
    destinataire: { nom: "Rasoa", prenom: "Elisabeth" },
    statut: "Envoyé",
    priorite: "Normale",
    dateEnvoi: "2024-12-11T15:30:00.000Z",
    dateLecture: "2024-12-12T08:15:00.000Z",
    type: "Question",
    reponse: "Bien sûr, nous étudierons la reproduction des plantes et les écosystèmes. Je vous envoie le détail par mail.",
    createdAt: "2024-12-11T15:30:00.000Z",
    updatedAt: "2024-12-12T08:15:00.000Z"
  }
];

export const staticNotifications = [
  {
    id: 1,
    titre: "Nouveau bulletin disponible",
    contenu: "Le bulletin du 1er trimestre de votre enfant est maintenant disponible dans votre espace parents. Connectez-vous pour le consulter.",
    type: "Bulletin",
    priorite: "Haute",
    destinataire: "Tous les parents",
    dateEnvoi: "2024-12-15T16:00:00.000Z",
    dateLecture: null,
    statut: "Non lu",
    categorie: "Résultats",
    lien: "/espace-parents/bulletins",
    createdAt: "2024-12-15T16:00:00.000Z",
    updatedAt: "2024-12-15T16:00:00.000Z"
  },
  {
    id: 2,
    titre: "Rappel : Réunion parents-professeurs",
    contenu: "Rappel : La réunion parents-professeurs aura lieu demain vendredi 20 décembre à 14h00. N'oubliez pas de vous inscrire si ce n'est pas déjà fait.",
    type: "Rappel",
    priorite: "Normale",
    destinataire: "Tous les parents",
    dateEnvoi: "2024-12-19T09:00:00.000Z",
    dateLecture: null,
    statut: "Non lu",
    categorie: "Réunion",
    lien: "/espace-parents/evenements",
    createdAt: "2024-12-19T09:00:00.000Z",
    updatedAt: "2024-12-19T09:00:00.000Z"
  },
  {
    id: 3,
    titre: "Nouveau message reçu",
    contenu: "Vous avez reçu un nouveau message de Mme Rakoto concernant l'absence de votre enfant. Connectez-vous pour le consulter.",
    type: "Message",
    priorite: "Normale",
    destinataire: "Parents concernés",
    dateEnvoi: "2024-12-15T08:30:00.000Z",
    dateLecture: "2024-12-15T09:15:00.000Z",
    statut: "Lu",
    categorie: "Communication",
    lien: "/espace-parents/messages",
    createdAt: "2024-12-15T08:30:00.000Z",
    updatedAt: "2024-12-15T09:15:00.000Z"
  },
  {
    id: 4,
    titre: "Nouvelle annonce publiée",
    contenu: "Une nouvelle annonce concernant la sortie pédagogique au Musée d'Andohalo a été publiée. Consultez-la dans la section annonces.",
    type: "Annonce",
    priorite: "Normale",
    destinataire: "Parents 6ème A et B",
    dateEnvoi: "2024-12-08T10:30:00.000Z",
    dateLecture: "2024-12-08T11:45:00.000Z",
    statut: "Lu",
    categorie: "Sortie",
    lien: "/espace-parents/annonces",
    createdAt: "2024-12-08T10:30:00.000Z",
    updatedAt: "2024-12-08T11:45:00.000Z"
  },
  {
    id: 5,
    titre: "Mise à jour des emplois du temps",
    contenu: "Les emplois du temps ont été mis à jour pour le second trimestre. Consultez les nouveaux horaires dans votre espace.",
    type: "Mise à jour",
    priorite: "Normale",
    destinataire: "Tous les parents",
    dateEnvoi: "2024-12-16T07:00:00.000Z",
    dateLecture: null,
    statut: "Non lu",
    categorie: "Emploi du temps",
    lien: "/espace-parents/emplois-du-temps",
    createdAt: "2024-12-16T07:00:00.000Z",
    updatedAt: "2024-12-16T07:00:00.000Z"
  }
];

export const staticCahierLiaison = [
  {
    id: 1,
    titre: "Devoirs de mathématiques",
    message: "Les exercices 3, 4 et 5 page 42 sont à faire pour vendredi. Merci de vérifier le cahier de votre enfant.",
    type: "devoirs",
    luParParent: false,
    dateCreation: "2024-12-16T17:30:00.000Z",
    createdByName: "Mme Rakoto",
  },
  {
    id: 2,
    titre: "Information : Sortie scolaire",
    message: "La sortie au parc botanique aura lieu mardi prochain. Prévoir un pique-nique et une casquette.",
    type: "info",
    luParParent: true,
    dateCreation: "2024-12-15T09:00:00.000Z",
    createdByName: "M. Andriamanjato",
  },
  {
    id: 3,
    titre: "Comportement en classe",
    message: "Votre enfant a fait preuve d'une grande entraide aujourd'hui. Félicitations !",
    type: "comportement",
    luParParent: false,
    dateCreation: "2024-12-14T14:20:00.000Z",
    createdByName: "Mme Rasoa",
  },
  {
    id: 4,
    titre: "Santé : Vaccination",
    message: "Merci de rapporter le carnet de vaccination de votre enfant pour vérification avant vendredi.",
    type: "sante",
    luParParent: true,
    dateCreation: "2024-12-13T08:00:00.000Z",
    createdByName: "Infirmière scolaire",
  }
];

// Statistiques pour la communication
export const communicationStats = {
  annonces: {
    total: 5,
    publiees: 5,
    enAttente: 0,
    expirees: 0,
    parCategorie: {
      "Réunion": 1,
      "Sortie": 1,
      "Fermeture": 1,
      "Activité": 1,
      "Résultats": 1
    },
    parPriorite: {
      "Haute": 3,
      "Normale": 2,
      "Basse": 0
    }
  },
  messages: {
    total: 5,
    envoyes: 5,
    lus: 4,
    nonLus: 1,
    parType: {
      "Absence": 1,
      "Rendez-vous": 1,
      "Devoirs": 1,
      "Félicitations": 1,
      "Question": 1
    },
    parPriorite: {
      "Haute": 1,
      "Normale": 4,
      "Basse": 0
    }
  },
  notifications: {
    total: 5,
    lues: 2,
    nonLues: 3,
    parType: {
      "Bulletin": 1,
      "Rappel": 1,
      "Message": 1,
      "Annonce": 1,
      "Mise à jour": 1
    },
    parCategorie: {
      "Résultats": 1,
      "Réunion": 1,
      "Communication": 1,
      "Sortie": 1,
      "Emploi du temps": 1
    }
  },
  general: {
    totalCommunications: 15,
    communicationsCeMois: 12,
    tauxLecture: 73.3, // (11/15) * 100
    communicationsUrgentes: 4,
    moyenneReponse: "2.3 heures"
  }
}; 