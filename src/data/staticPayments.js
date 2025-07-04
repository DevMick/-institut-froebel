// Données statiques pour les paiements
export const staticPayments = [
  {
    id: 1,
    eleve: { nom: "Rakoto", prenom: "Jean", classe: "6ème A" },
    ecole: { nom: "Institut Froebel LA TULIPE" },
    montant: 120000,
    modePaiement: "Espèces",
    datePaiement: "2024-12-10T09:00:00.000Z",
    statut: "Payé",
    reference: "PAY20241210001",
    commentaire: "Premier versement",
    createdAt: "2024-12-10T09:00:00.000Z",
    updatedAt: "2024-12-10T09:00:00.000Z"
  },
  {
    id: 2,
    eleve: { nom: "Rabe", prenom: "Sitraka", classe: "5ème B" },
    ecole: { nom: "Institut Froebel LA TULIPE" },
    montant: 150000,
    modePaiement: "Virement bancaire",
    datePaiement: "2024-12-12T11:30:00.000Z",
    statut: "Payé",
    reference: "PAY20241212002",
    commentaire: "Solde trimestre 1",
    createdAt: "2024-12-12T11:30:00.000Z",
    updatedAt: "2024-12-12T11:30:00.000Z"
  },
  {
    id: 3,
    eleve: { nom: "Andrianina", prenom: "Fara", classe: "4ème A" },
    ecole: { nom: "Institut Froebel LA TULIPE" },
    montant: 90000,
    modePaiement: "Mobile Money",
    datePaiement: "2024-12-13T14:00:00.000Z",
    statut: "En attente",
    reference: "PAY20241213003",
    commentaire: "En attente de validation",
    createdAt: "2024-12-13T14:00:00.000Z",
    updatedAt: "2024-12-13T14:00:00.000Z"
  },
  {
    id: 4,
    eleve: { nom: "Razanajatovo", prenom: "Miora", classe: "CP" },
    ecole: { nom: "Institut Froebel LA TULIPE" },
    montant: 80000,
    modePaiement: "Chèque",
    datePaiement: "2024-12-14T10:00:00.000Z",
    statut: "Remboursé",
    reference: "PAY20241214004",
    commentaire: "Chèque annulé et remboursé",
    createdAt: "2024-12-14T10:00:00.000Z",
    updatedAt: "2024-12-14T10:00:00.000Z"
  },
  {
    id: 5,
    eleve: { nom: "Randriamampionona", prenom: "Tiana", classe: "3ème B" },
    ecole: { nom: "Institut Froebel LA TULIPE" },
    montant: 160000,
    modePaiement: "Espèces",
    datePaiement: "2024-12-15T14:00:00.000Z",
    statut: "Payé",
    reference: "PAY20241215005",
    commentaire: "Paiement complet trimestre 2",
    createdAt: "2024-12-15T14:00:00.000Z",
    updatedAt: "2024-12-15T14:00:00.000Z"
  }
];

export const paymentStats = {
  totalPaiements: 5,
  montantTotal: 600000,
  enAttente: 1,
  rembourses: 1,
  moyenneParEleve: 120000,
  dernierPaiement: "2024-12-15T14:00:00.000Z"
}; 