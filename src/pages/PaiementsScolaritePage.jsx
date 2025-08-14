import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  message,
  Spin,
  Row,
  Col,
  Statistic,
  Drawer,
  Descriptions,
  Typography,
  InputNumber,
  Progress,
  Tabs
} from 'antd';
import {
  DollarOutlined,
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  CreditCardOutlined,
  BankOutlined,
  MoneyCollectOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  TagOutlined
} from '@ant-design/icons';
import '../styles/LoginPage.css'; // Pour les styles du select personnalisé

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function PaiementsScolaritePage() {
  const [loading, setLoading] = useState(false);
  const [eleves, setEleves] = useState([]);
  const [classes, setClasses] = useState([]);
  const [statistiques, setStatistiques] = useState({});
  const [search, setSearch] = useState('');
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [selectedAnnee, setSelectedAnnee] = useState('2024-2025');
  const [selectedStatutPaiement, setSelectedStatutPaiement] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [paiementEleve, setPaiementEleve] = useState(null);
  const [form] = Form.useForm();

  // Récupérer le token depuis localStorage
  const getToken = () => localStorage.getItem('token');
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  };

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  // Recharger les élèves quand les filtres de données changent (pas le statut paiement qui est filtré côté client)
  useEffect(() => {
    loadEleves();
  }, [selectedClasse, selectedAnnee]);

  // Calculer les statistiques quand les élèves changent
  useEffect(() => {
    loadStatistiques();
  }, [eleves]);

  // Fonction utilitaire pour filtrer les élèves
  const filterEleves = (elevesList) => {
    return elevesList.filter(eleve => {
      // Filtre par recherche (nom)
      const matchesSearch = eleve.nomComplet?.toLowerCase().includes(search.toLowerCase());

      // Filtre par classe
      const matchesClasse = !selectedClasse || eleve.classeId === parseInt(selectedClasse);

      // Filtre par statut de paiement
      const matchesStatutPaiement = !selectedStatutPaiement || eleve.statutPaiement === selectedStatutPaiement;

      return matchesSearch && matchesClasse && matchesStatutPaiement;
    });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await loadClasses();
      await loadEleves();
      // Les statistiques seront calculées après le chargement des élèves
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      message.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      
      const response = await fetch(`/api/ecoles/${ecoleId}/classes`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        // Mode démonstration
        setClasses([
          { id: 1, nom: 'CP-A' },
          { id: 2, nom: 'CP-B' },
          { id: 3, nom: 'CE1-A' },
          { id: 4, nom: 'CE2-A' },
          { id: 5, nom: 'CM1-A' }
        ]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
      setClasses([
        { id: 1, nom: 'CP-A' },
        { id: 2, nom: 'CP-B' },
        { id: 3, nom: 'CE1-A' }
      ]);
    }
  };

  const loadEleves = async () => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      const token = getToken();

      console.log('🔄 Début du chargement des données');
      console.log('📋 Paramètres:', { ecoleId, selectedClasse, selectedAnnee, token: token ? 'Présent' : 'Absent' });

      // Vérifier si le token existe
      if (!token || token === 'null') {
        console.log('❌ Aucun token trouvé, activation du mode démonstration');
        setEleves(elevesDemo);
        setStatistiques(statistiquesDemo);
        return;
      }

      // 1. Récupérer tous les enfants (nouveau endpoint simplifié)
      const enfantsUrl = `/api/ecoles/${ecoleId}/enfants`;

      console.log('🔗 URL enfants (nouveau endpoint):', enfantsUrl);

      // 2. Récupérer tous les paiements existants
      let paiementsUrl = `/api/ecoles/${ecoleId}/paiements-scolarite/tous?page=1&pageSize=100`;
      if (selectedClasse) {
        paiementsUrl += `&classeId=${selectedClasse}`;
      }
      if (selectedAnnee) {
        paiementsUrl += `&anneeScolaire=${selectedAnnee}`;
      }

      console.log('🔗 URL paiements construite:', paiementsUrl);

      // Exécuter les deux requêtes en parallèle
      console.log('🚀 Lancement des requêtes parallèles...');

      const [enfantsResponse, paiementsResponse] = await Promise.all([
        fetch(enfantsUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(paiementsUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      console.log('📥 Réponse enfants:', {
        status: enfantsResponse.status,
        statusText: enfantsResponse.statusText,
        ok: enfantsResponse.ok,
        url: enfantsUrl
      });

      console.log('📥 Réponse paiements:', {
        status: paiementsResponse.status,
        statusText: paiementsResponse.statusText,
        ok: paiementsResponse.ok,
        url: paiementsUrl
      });

      // Vérifier si les requêtes ont échoué
      if (!enfantsResponse.ok) {
        console.log('❌ Requête enfants échouée');
        if (enfantsResponse.status === 401) {
          message.error('Session expirée. Veuillez vous reconnecter.');
          return;
        }
        console.log('🎭 Activation du mode démonstration');
        message.warning('Serveur non disponible - Mode démonstration activé');
        setEleves(elevesDemo);
        setStatistiques(statistiquesDemo);
        return;
      }

      if (enfantsResponse.ok) {
        const enfantsData = await enfantsResponse.json();
        console.log('✅ Données enfants reçues (nouveau endpoint):', {
          count: enfantsData.length,
          data: enfantsData
        });

        // Vérifier les données du premier enfant pour debug (nouveau format)
        if (enfantsData.length > 0) {
          console.log('🔍 Premier enfant (debug):', {
            id: enfantsData[0].id,
            nom: enfantsData[0].nom,
            prenom: enfantsData[0].prenom,
            parentNom: enfantsData[0].parentNom,
            parent: enfantsData[0].parent,
            keys: Object.keys(enfantsData[0])
          });
        }

        // Récupérer les paiements (peut échouer si aucun paiement n'existe)
        let paiementsData = [];
        if (paiementsResponse.ok) {
          paiementsData = await paiementsResponse.json();
          console.log('✅ Données paiements reçues:', {
            count: paiementsData.length,
            data: paiementsData
          });

        // Vérifier les données du premier paiement pour debug
        if (paiementsData.length > 0) {
          console.log('🔍 Premier paiement (debug):', {
            id: paiementsData[0].id,
            enfantId: paiementsData[0].enfantId,
            enfantNom: paiementsData[0].enfantNom,
            parentNom: paiementsData[0].parentNom,
            paiementScolariteId: paiementsData[0].paiementScolariteId,
            keys: Object.keys(paiementsData[0]),
            fullObject: paiementsData[0]
          });

          // Analyser tous les champs pour trouver l'ID du dossier de paiement
          console.log('🔍 Analyse complète du premier paiement:');
          Object.keys(paiementsData[0]).forEach(key => {
            console.log(`  ${key}:`, paiementsData[0][key], `(${typeof paiementsData[0][key]})`);
          });
        }
        } else {
          console.log('⚠️ Aucun paiement trouvé ou erreur paiements:', {
            status: paiementsResponse.status,
            statusText: paiementsResponse.statusText
          });
        }

        // Créer un map des paiements par enfantId pour un accès rapide
        const paiementsMap = new Map();
        paiementsData.forEach((paiement, index) => {
          console.log(`💳 Paiement ${index + 1}:`, {
            id: paiement.id,
            enfantId: paiement.enfantId,
            montantTotal: paiement.montantTotal,
            montantPaye: paiement.montantPaye,
            fullData: paiement
          });
          paiementsMap.set(paiement.enfantId, paiement);
        });

        console.log('🗺️ Map des paiements créée:', {
          size: paiementsMap.size,
          keys: Array.from(paiementsMap.keys()),
          entries: Array.from(paiementsMap.entries())
        });

        // Récupérer les parents pour chaque enfant
        console.log('👨‍👩‍👧‍👦 Récupération des parents...');
        let enfantsAvecParents;

        try {
          enfantsAvecParents = await Promise.all(
            enfantsData.map(async (enfant) => {
              try {
                console.log(`🔍 Récupération parents pour enfant ${enfant.id} (${enfant.prenom} ${enfant.nom})`);
                const parentsResponse = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/parent-enfants/enfants/${enfant.id}/parents`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                  }
                });

                console.log(`📡 Réponse parents enfant ${enfant.id}:`, parentsResponse.status, parentsResponse.statusText);

                if (parentsResponse.ok) {
                  const parentsData = await parentsResponse.json();
                  console.log(`👨‍👩‍👧‍👦 Parents trouvés pour enfant ${enfant.id}:`, parentsData);

                  let parentNom = 'Parent non renseigné';
                  if (Array.isArray(parentsData) && parentsData.length > 0) {
                    const parent = parentsData[0];
                    parentNom = `${parent.prenom || ''} ${parent.nom || ''}`.trim() || 'Parent non renseigné';
                  } else if (parentsData && parentsData.prenom && parentsData.nom) {
                    // Au cas où ce ne serait pas un tableau
                    parentNom = `${parentsData.prenom} ${parentsData.nom}`;
                  }

                  console.log(`✅ Parent final pour enfant ${enfant.id}:`, parentNom);

                  return { ...enfant, parentNom };
                } else {
                  console.log(`❌ Erreur récupération parents enfant ${enfant.id}:`, parentsResponse.status);
                  const errorText = await parentsResponse.text();
                  console.log(`❌ Détail erreur:`, errorText);
                  return { ...enfant, parentNom: 'Parent non renseigné' };
                }
              } catch (error) {
                console.error(`💥 Exception récupération parents pour enfant ${enfant.id}:`, error);
                return { ...enfant, parentNom: 'Parent non renseigné' };
              }
            })
          );

          console.log('🎯 Enfants avec parents récupérés:', enfantsAvecParents.map(e => ({
            id: e.id,
            nom: `${e.prenom} ${e.nom}`,
            parentNom: e.parentNom
          })));
        } catch (error) {
          console.error('💥 Erreur globale récupération parents:', error);
          // Fallback : utiliser les enfants sans parents
          enfantsAvecParents = enfantsData.map(enfant => ({
            ...enfant,
            parentNom: 'Parent non renseigné'
          }));
        }

        // Combiner les données : enfants + paiements
        console.log('🔄 Début de la combinaison des données...');

        // 1. Traiter les enfants existants
        const enfantsComplets = enfantsAvecParents.map((enfant, index) => {
          console.log(`👶 Traitement enfant ${index + 1}/${enfantsData.length}:`, {
            id: enfant.id,
            nom: `${enfant.prenom} ${enfant.nom}`,
            statut: enfant.statut
          });
          const paiement = paiementsMap.get(enfant.id);

          console.log(`💰 Paiement pour enfant ${enfant.id}:`, paiement ? 'Trouvé' : 'Non trouvé');

          if (paiement) {
            // Calculer d'abord les valeurs nécessaires
            const montantRestant = paiement.montantTotal - paiement.montantPaye;
            const pourcentagePaye = paiement.montantTotal > 0 ? (paiement.montantPaye / paiement.montantTotal) * 100 : 0;

            let statutPaiement = 'en_attente';
            if (paiement.montantPaye >= paiement.montantTotal) {
              statutPaiement = 'completement_paye';
            } else if (paiement.montantPaye > 0) {
              statutPaiement = 'partiellement_paye';
            }

            // Enfant avec paiement existant
            console.log(`✅ Enfant avec paiement:`, {
              enfantId: enfant.id,
              enfantNom: `${enfant.prenom} ${enfant.nom}`,
              paiementDossierId: paiement.id,
              montantTotal: paiement.montantTotal,
              montantPaye: paiement.montantPaye,
              montantRestant: montantRestant,
              statut: statutPaiement,
              parentNom: enfant.parentNom
            });

            // Vérification du mapping des IDs
            console.log(`🔗 Mapping pour ${enfant.prenom} ${enfant.nom}:`, {
              'enfant.id': enfant.id,
              'paiement.id': paiement.id,
              'paiement.enfantId': paiement.enfantId,
              'mapping_correct': paiement.enfantId === enfant.id
            });

            console.log(`📊 Calculs pour enfant ${enfant.id}:`, {
              montantRestant,
              pourcentagePaye,
              statutPaiement,
              parentNom: enfant.parentNom
            });

            return {
              id: enfant.id,
              enfantId: enfant.id,
              nomComplet: `${enfant.prenom} ${enfant.nom}`,
              classeNom: enfant.classeNom,
              classeId: enfant.classeId,
              statutEleve: enfant.statut,
              statutPaiement: statutPaiement,
              montantTotal: paiement.montantTotal,
              montantPaye: paiement.montantPaye,
              montantRestant: montantRestant,
              pourcentagePaye: Math.round(pourcentagePaye * 100) / 100,
              peutEtreValide: pourcentagePaye >= 33.33,
              parentNom: enfant.parentNom || 'Parent non renseigné',
              anneeScolaire: paiement.anneeScolaire,
              paiementScolariteId: paiement.id, // ID du dossier de paiement de scolarité (ex: 6 pour enfant 12)
              paiementId: paiement.id, // Même ID pour l'instant
              dateNaissance: enfant.dateNaissance,
              sexe: enfant.sexe,
              dateInscription: enfant.dateInscription
            };
          } else {
            // Enfant sans paiement (nouveau)
            console.log(`🆕 Enfant sans paiement:`, {
              enfantId: enfant.id,
              tarifScolarite: enfant.tarifScolarite,
              parentNom: enfant.parentNom
            });

            return {
              id: enfant.id,
              enfantId: enfant.id,
              nomComplet: `${enfant.prenom} ${enfant.nom}`,
              classeNom: enfant.classeNom,
              classeId: enfant.classeId,
              statutEleve: enfant.statut,
              statutPaiement: 'en_attente',
              montantTotal: enfant.tarifScolarite || 200000,
              montantPaye: 0,
              montantRestant: enfant.tarifScolarite || 200000,
              pourcentagePaye: 0,
              peutEtreValide: false,
              parentNom: enfant.parentNom || 'Parent non renseigné',
              anneeScolaire: selectedAnnee,
              paiementId: null, // Pas de paiement existant
              dateNaissance: enfant.dateNaissance,
              sexe: enfant.sexe,
              dateInscription: enfant.dateInscription
            };
          }
        });

        // 2. Ajouter les enfants qui ont des paiements mais ne sont pas dans la liste des enfants
        const enfantsOrphelins = paiementsData.filter(paiement => {
          return !enfantsData.find(enfant => enfant.id === paiement.enfantId);
        });

        console.log(`👶 Enfants orphelins trouvés: ${enfantsOrphelins.length}`);

        // Récupérer les parents pour les enfants orphelins
        const enfantsOrphelinsAvecParents = await Promise.all(
          enfantsOrphelins.map(async (paiement) => {
            console.log(`👶 Enfant avec paiement mais pas dans liste:`, {
              enfantId: paiement.enfantId,
              montantTotal: paiement.montantTotal,
              montantPaye: paiement.montantPaye
            });

            // Récupérer le parent pour cet enfant
            let parentNom = 'Parent non renseigné';
            try {
              console.log(`🔍 Récupération parent pour enfant orphelin ${paiement.enfantId}`);
              const parentsResponse = await fetch(`/api/ecoles/${ecoleId}/parent-enfants/enfants/${paiement.enfantId}/parents`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json'
                }
              });

              if (parentsResponse.ok) {
                const parentsData = await parentsResponse.json();
                console.log(`👨‍👩‍👧‍👦 Parents trouvés pour enfant orphelin ${paiement.enfantId}:`, parentsData);

                if (Array.isArray(parentsData) && parentsData.length > 0) {
                  const parent = parentsData[0];
                  parentNom = `${parent.prenom || ''} ${parent.nom || ''}`.trim() || 'Parent non renseigné';
                } else if (parentsData && parentsData.prenom && parentsData.nom) {
                  parentNom = `${parentsData.prenom} ${parentsData.nom}`;
                }
                console.log(`✅ Parent final pour enfant orphelin ${paiement.enfantId}:`, parentNom);
              } else {
                console.log(`❌ Erreur récupération parent enfant orphelin ${paiement.enfantId}:`, parentsResponse.status);
              }
            } catch (error) {
              console.error(`💥 Exception récupération parent pour enfant orphelin ${paiement.enfantId}:`, error);
            }

            const nomComplet = `${paiement.enfantPrenom || ''} ${paiement.enfantNom || ''}`.trim() || `Enfant ${paiement.enfantId}`;

            // Calculer les valeurs nécessaires pour les enfants orphelins
            const montantRestant = paiement.montantTotal - paiement.montantPaye;
            const pourcentagePaye = paiement.montantTotal > 0 ? (paiement.montantPaye / paiement.montantTotal) * 100 : 0;

            let statutPaiement = 'en_attente';
            if (paiement.montantPaye >= paiement.montantTotal) {
              statutPaiement = 'completement_paye';
            } else if (paiement.montantPaye > 0) {
              statutPaiement = 'partiellement_paye';
            }

            // Déterminer le statut de l'élève basé sur le paiement
            const statutEleve = pourcentagePaye >= 33.33 ? 'inscrit' : 'pre_inscrit';

            console.log(`👤 Construction nom complet pour enfant orphelin ${paiement.enfantId}:`, {
              enfantPrenom: paiement.enfantPrenom,
              enfantNom: paiement.enfantNom,
              nomComplet: nomComplet,
              montantRestant: montantRestant,
              statutPaiement: statutPaiement
            });

            return {
              id: paiement.enfantId,
              enfantId: paiement.enfantId,
              nomComplet: nomComplet,
              classeNom: paiement.classeNom || 'Classe inconnue',
              classeId: paiement.classeId || null,
              statutEleve: statutEleve,
              statutPaiement: statutPaiement,
              montantTotal: paiement.montantTotal,
              montantPaye: paiement.montantPaye,
              montantRestant: montantRestant,
              pourcentagePaye: Math.round(pourcentagePaye * 100) / 100,
              peutEtreValide: pourcentagePaye >= 33.33,
              parentNom: parentNom,
              anneeScolaire: paiement.anneeScolaire,
              paiementId: paiement.id,
              dateNaissance: null,
              sexe: null,
              dateInscription: null
            };
          })
        );

        // 3. Combiner les deux listes
        const tousLesEnfants = [...enfantsComplets, ...enfantsOrphelinsAvecParents];

        console.log('🎯 Données finales combinées:', {
          enfantsDeBase: enfantsComplets.length,
          enfantsAvecPaiementsSeulement: enfantsOrphelinsAvecParents.length,
          total: tousLesEnfants.length,
          data: tousLesEnfants
        });

        setEleves(tousLesEnfants);
      } else {
        // Mode démonstration si serveur indisponible
        console.log('❌ Erreur enfants - Serveur non disponible:', {
          status: enfantsResponse.status,
          statusText: enfantsResponse.statusText
        });
        console.log('🔄 Utilisation des données de démonstration');
        setEleves([
          {
            id: 3,
            enfantId: 3,
            nomComplet: 'Jean Kouame',
            classeNom: '6ème',
            classeId: 1,
            statutEleve: 'pre_inscrit',
            statutPaiement: 'partiellement_paye',
            montantTotal: 200000,
            montantPaye: 75000,
            montantRestant: 125000,
            pourcentagePaye: 37.5,
            peutEtreValide: true,
            parentNom: 'Koffi Kouame',
            paiementScolariteId: 7, // ID du dossier de paiement (correspond à enfantId 13 dans les vraies données)
            paiementId: 7 // Même ID pour l'instant
          },
          {
            id: 1,
            enfantId: 1,
            nomComplet: 'Aya Kouassi',
            classeNom: '6ème',
            classeId: 1,
            statutEleve: 'pre_inscrit',
            statutPaiement: 'en_attente',
            montantTotal: 200000,
            montantPaye: 0,
            montantRestant: 200000,
            pourcentagePaye: 0,
            peutEtreValide: false,
            parentNom: 'Adjoua Kouassi',
            paiementId: null // Pas de paiement
          },
          {
            id: 2,
            enfantId: 2,
            nomComplet: 'Koffi Kouassi',
            classeNom: '5ème',
            classeId: 2,
            statutEleve: 'inscrit', // Inscrit (paiement complet)
            statutPaiement: 'completement_paye',
            montantTotal: 200000,
            montantPaye: 200000,
            montantRestant: 0,
            pourcentagePaye: 100,
            peutEtreValide: true,
            parentNom: 'Adjoua Kouassi',
            paiementScolariteId: 1, // ID du dossier de paiement de scolarité
            paiementId: 25 // ID du paiement spécifique
          },
          {
            id: 4,
            enfantId: 4,
            nomComplet: 'Marie Traore',
            classeNom: '6ème',
            classeId: 1,
            statutEleve: 'inscrit', // Inscrit (paiement complet)
            statutPaiement: 'completement_paye',
            montantTotal: 200000,
            montantPaye: 200000,
            montantRestant: 0,
            pourcentagePaye: 100,
            peutEtreValide: true,
            parentNom: 'Ibrahim Traore',
            paiementScolariteId: 4, // ID du dossier de paiement de scolarité
            paiementId: 30 // ID du paiement spécifique
          }
        ]);
        message.warning('Serveur non disponible - Mode démonstration activé');
      }
    } catch (error) {
      console.error('💥 Erreur lors du chargement des enfants:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      console.log('🔄 Basculement vers le mode démonstration');
      setEleves([
        {
          id: 3,
          enfantId: 3,
          nomComplet: 'Jean Kouame',
          classeNom: '6ème',
          classeId: 1,
          statutEleve: 'pre_inscrit',
          statutPaiement: 'partiellement_paye',
          montantTotal: 200000,
          montantPaye: 75000,
          montantRestant: 125000,
          pourcentagePaye: 37.5,
          peutEtreValide: true,
          parentNom: 'Koffi Kouame',
          paiementScolariteId: 3,
          paiementId: 15
        },
        {
          id: 2,
          enfantId: 2,
          nomComplet: 'Koffi Kouassi',
          classeNom: '5ème',
          classeId: 2,
          statutEleve: 'inscrit',
          statutPaiement: 'completement_paye',
          montantTotal: 200000,
          montantPaye: 200000,
          montantRestant: 0,
          pourcentagePaye: 100,
          peutEtreValide: true,
          parentNom: 'Adjoua Kouassi',
          paiementScolariteId: 1,
          paiementId: 25
        }
      ]);
      message.warning('Serveur non disponible - Mode démonstration activé');
    }
  };

  const loadStatistiques = async () => {
    try {
      console.log('📊 Calcul des statistiques...');
      console.log('📋 Données élèves pour statistiques:', {
        count: eleves.length,
        eleves: eleves.map(e => ({
          id: e.id,
          nom: e.nomComplet,
          statutEleve: e.statutEleve,
          montantTotal: e.montantTotal,
          montantPaye: e.montantPaye
        }))
      });

      // Calculer les statistiques basées sur les enfants chargés
      const totalEnfants = eleves.length;
      const montantTotalAttendu = eleves.reduce((sum, eleve) => sum + eleve.montantTotal, 0);
      const montantTotalPercu = eleves.reduce((sum, eleve) => sum + eleve.montantPaye, 0);
      const pourcentageRecouvrement = montantTotalAttendu > 0 ? (montantTotalPercu / montantTotalAttendu) * 100 : 0;

      const statsCalculees = {
        totalEleves: totalEnfants,
        elevesPreInscrits: eleves.filter(e => e.statutEleve === 'pre_inscrit').length,
        elevesInscrits: eleves.filter(e => e.statutEleve === 'inscrit').length,
        montantTotalAttendu: montantTotalAttendu,
        montantTotalPercu: montantTotalPercu,
        pourcentageRecouvrement: Math.round(pourcentageRecouvrement * 100) / 100
      };

      console.log('✅ Statistiques calculées:', statsCalculees);

      setStatistiques(statsCalculees);
    } catch (error) {
      console.error('💥 Erreur lors du calcul des statistiques:', error);
      setStatistiques({
        totalEleves: 0,
        elevesPreInscrits: 0,
        elevesInscrits: 0,
        montantTotalAttendu: 0,
        montantTotalPercu: 0,
        pourcentageRecouvrement: 0
      });
    }
  };

  // Créer un nouveau paiement de scolarité (pour enfants sans paiement)
  const creerPaiementScolarite = async (values) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      const token = getToken();

      // Vérifier si le token existe
      if (!token || token === 'null') {
        message.error('Vous devez être connecté pour effectuer cette action');
        return;
      }

      console.log('Créer paiement de scolarité pour enfant ID:', paiementEleve.enfantId);
      console.log('🔍 Données complètes de l\'enfant sélectionné:', paiementEleve);

      // Récupérer les tarifs depuis l'API pour faire le bon mapping
      let tarifId = 1; // Valeur par défaut

      try {
        const tarifsResponse = await fetch(`/api/ecoles/${ecoleId}/tarifs`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (tarifsResponse.ok) {
          const tarifsData = await tarifsResponse.json();
          console.log('📋 Tarifs récupérés:', tarifsData);

          // Trouver le tarif correspondant à la classe de l'enfant
          const tarifCorrespondant = tarifsData.find(tarif =>
            tarif.classeId === paiementEleve.classeId ||
            tarif.classeNom === paiementEleve.classeNom
          );

          if (tarifCorrespondant) {
            tarifId = tarifCorrespondant.id;
            console.log('✅ Tarif trouvé:', {
              enfantClasse: `${paiementEleve.classeNom} (ID: ${paiementEleve.classeId})`,
              tarifId: tarifId,
              tarifMontant: tarifCorrespondant.tarif
            });
          } else {
            console.warn('⚠️ Aucun tarif trouvé pour la classe, utilisation du tarif par défaut');
          }
        } else {
          console.error('❌ Erreur récupération tarifs:', tarifsResponse.status);
        }
      } catch (error) {
        console.error('💥 Exception récupération tarifs:', error);
      }

      const requestBody = {
        enfantId: paiementEleve.enfantId,
        tarifId: tarifId,
        anneeScolaire: selectedAnnee,
        montantPaiement: values.montant,
        modePaiement: "Espèces",
        commentaire: values.commentaire || `Création du paiement de scolarité pour ${paiementEleve.nomComplet || 'l\'enfant'}`
      };

      console.log('🎯 Données enfant pour création paiement:', {
        enfantId: paiementEleve.enfantId,
        nomComplet: paiementEleve.nomComplet,
        classeId: paiementEleve.classeId,
        classeNom: paiementEleve.classeNom,
        tarifScolarite: paiementEleve.tarifScolarite,
        tarifIdUtilise: tarifId,
        mappingUtilise: `${paiementEleve.classeNom} → Tarif ${tarifId}`
      });

      console.log('📤 Envoi requête création paiement:', {
        url: `/api/ecoles/${ecoleId}/paiements-scolarite`,
        body: requestBody
      });

      const response = await fetch(`/api/ecoles/${ecoleId}/paiements-scolarite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Réponse paiement:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        message.success('Paiement de scolarité créé avec succès');
        console.log('Résultat création:', result);

        // Recharger les données
        loadEleves();
        loadStatistiques();

        // Fermer le modal
        setModalOpen(false);
        form.resetFields();
        setPaiementEleve(null);
      } else if (response.status === 401) {
        message.error('Session expirée. Veuillez vous reconnecter.');
      } else {
        const error = await response.json();
        message.error(error.message || 'Erreur lors de la création du paiement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la création du paiement');
    }
  };

  // Mettre à jour un paiement existant
  const mettreAJourPaiement = async (values) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      const token = getToken();

      // Vérifier si le token existe
      if (!token || token === 'null') {
        message.error('Vous devez être connecté pour effectuer cette action');
        return;
      }

      console.log('Mise à jour du paiement:', {
        paiementId: paiementEleve.paiementId,
        paiementScolariteId: paiementEleve.paiementScolariteId,
        enfantNom: paiementEleve.nomComplet,
        enfantId: paiementEleve.enfantId,
        fullPaiementEleve: paiementEleve
      });

      // Vérifier que nous avons les IDs nécessaires
      if (!paiementEleve.paiementId) {
        message.error('ID du paiement manquant');
        return;
      }

      // Récupérer l'ID du dossier de paiement - utiliser paiementId qui contient le bon ID
      const paiementScolariteId = paiementEleve.paiementScolariteId || paiementEleve.paiementId;
      const enfantId = paiementEleve.enfantId;

      console.log('IDs utilisés pour la mise à jour:', {
        enfantId,
        paiementScolariteId,
        enfantNom: paiementEleve.nomComplet,
        recordId: paiementEleve.id,
        'paiementEleve.paiementScolariteId': paiementEleve.paiementScolariteId,
        'paiementEleve.paiementId': paiementEleve.paiementId,
        'utilise_paiementId_comme_fallback': !paiementEleve.paiementScolariteId && paiementEleve.paiementId,
        fullRecord: paiementEleve
      });

      // Vérification que nous avons le bon ID du dossier de paiement
      if (!paiementScolariteId) {
        message.error('ID du dossier de paiement manquant. Impossible de mettre à jour.');
        console.error('paiementScolariteId manquant:', {
          paiementEleve,
          enfantId,
          recordId: paiementEleve.id
        });
        return;
      }

      // Vérifier que nous n'utilisons pas l'ID de l'enfant par erreur
      if (paiementScolariteId === enfantId) {
        console.warn('⚠️ ATTENTION: paiementScolariteId semble être égal à enfantId. Vérifiez le mapping des données.');
      }

      const requestBody = {
        montant: values.montant,
        modePaiement: values.modePaiement || 'especes',
        numeroCheque: values.modePaiement === 'cheque' ? values.numeroCheque : null,
        referenceVirement: values.modePaiement === 'virement' ? values.referenceVirement : null,
        numeroTransaction: values.modePaiement === 'carte_bancaire' ? values.numeroTransaction : null,
        commentaire: values.commentaire || 'Mise à jour du paiement'
      };

      // Utiliser le bon endpoint : paiements-scolarite/{paiementScolariteId}/paiement
      const apiUrl = `/api/ecoles/${ecoleId}/paiements-scolarite/${paiementScolariteId}/paiement`;
      console.log('URL API appelée:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Réponse mise à jour paiement:', response.status, response.statusText);

      if (response.ok) {
        // Vérifier si la réponse contient du JSON
        const contentType = response.headers.get('content-type');
        let result = null;

        if (contentType && contentType.includes('application/json')) {
          try {
            result = await response.json();
          } catch (jsonError) {
            console.log('Réponse sans contenu JSON, mais succès');
          }
        }

        message.success('Paiement mis à jour avec succès');
        console.log('Résultat mise à jour:', result);

        // Recharger les données
        loadEleves();
        loadStatistiques();

        // Fermer le modal
        setModalOpen(false);
        form.resetFields();
        setPaiementEleve(null);
      } else if (response.status === 401) {
        message.error('Session expirée. Veuillez vous reconnecter.');
      } else if (response.status === 403) {
        message.error('Accès refusé. Vous n\'avez pas les permissions nécessaires pour modifier ce paiement.');
      } else if (response.status === 400) {
        try {
          const error = await response.json();
          console.error('Erreur 400 - Validation:', error);

          if (error.errors && error.errors.paiementScolariteId) {
            message.error('ID du paiement de scolarité invalide. Vérification des données...');
            console.error('paiementScolariteId invalide:', {
              valeur: paiementEleve.paiementScolariteId,
              type: typeof paiementEleve.paiementScolariteId,
              paiementEleve: paiementEleve
            });
          } else {
            message.error(error.title || 'Erreur de validation des données');
          }
        } catch (jsonError) {
          message.error('Erreur de validation des données');
        }
      } else if (response.status === 405) {
        message.error('Méthode non autorisée. L\'endpoint ne supporte pas cette opération.');
        console.error('Erreur 405: Méthode PUT non supportée sur cet endpoint');
      } else {
        try {
          const error = await response.json();
          message.error(error.message || 'Erreur lors de la mise à jour');
        } catch (jsonError) {
          message.error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la mise à jour');
    }
  };

  // Handlers
  const handleView = (record) => {
    setSelectedEleve(record);
    setDrawerOpen(true);
  };

  const handlePaiement = (record) => {
    console.log('🎯 handlePaiement appelé avec record:', {
      id: record.id,
      enfantId: record.enfantId,
      paiementId: record.paiementId,
      paiementScolariteId: record.paiementScolariteId,
      nomComplet: record.nomComplet,
      fullRecord: record
    });

    setPaiementEleve(record);
    setModalOpen(true);
    form.resetFields();

    // Si c'est une mise à jour (paiement existant), pré-remplir les champs
    if (record.paiementId) {
      form.setFieldsValue({
        montant: record.montantRestant, // Montant restant à payer
        modePaiement: 'especes', // Valeur par défaut
        commentaire: `Modification du paiement pour ${record.nomComplet}`
      });
    } else {
      // Pour création, utiliser le montant total
      form.setFieldsValue({
        montant: record.montantTotal,
        commentaire: `Création du paiement de scolarité pour ${record.nomComplet}`
      });
    }
  };

  const handleSubmit = async (values) => {
    // Déterminer s'il s'agit d'une création ou d'une mise à jour
    if (paiementEleve.paiementId) {
      await mettreAJourPaiement(values);
    } else {
      await creerPaiementScolarite(values);
    }
  };

  // Formatage du prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };



  // Couleur du statut de paiement
  const getStatutColor = (statut) => {
    switch (statut) {
      case 'en_attente': return 'orange';
      case 'partiellement_paye': return 'blue';
      case 'completement_paye': return 'green';
      default: return 'default';
    }
  };



  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>Paiements de Scolarité</Title>
        <Text style={{ color: '#666' }}>Gérez les paiements de scolarité des enfants préinscrits et inscrits</Text>
      </div>

      {/* Statistiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Total Enfants"
              value={statistiques.totalEleves || 0}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Pré-inscrits"
              value={eleves.filter(e => e.statutEleve === 'pre_inscrit').length || 0}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Inscrits"
              value={eleves.filter(e => e.statutEleve === 'inscrit').length || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Recouvrement"
              value={statistiques.pourcentageRecouvrement || 0}
              suffix="%"
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtres */}
      <Card style={{ marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong>Classe :</Text>
              <div className="select-with-icon-html" style={{ marginTop: '4px' }}>
                <HomeOutlined className="select-icon-html" />
                <select
                  className="modern-select-html"
                  value={selectedClasse || ''}
                  onChange={(e) => setSelectedClasse(e.target.value || null)}
                >
                  <option value="">Toutes les classes</option>
                  {classes.map(classe => (
                    <option key={classe.id} value={classe.id}>
                      {classe.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong>Année Scolaire :</Text>
              <div className="select-with-icon-html" style={{ marginTop: '4px' }}>
                <TagOutlined className="select-icon-html" />
                <select
                  className="modern-select-html"
                  value={selectedAnnee}
                  onChange={(e) => setSelectedAnnee(e.target.value)}
                >
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong>Statut Paiement :</Text>
              <div className="select-with-icon-html" style={{ marginTop: '4px' }}>
                <DollarOutlined className="select-icon-html" />
                <select
                  className="modern-select-html"
                  value={selectedStatutPaiement || ''}
                  onChange={(e) => setSelectedStatutPaiement(e.target.value || null)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="partiellement_paye">Partiellement payé</option>
                  <option value="completement_paye">Complètement payé</option>
                </select>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong>Recherche :</Text>
              <Input.Search
                style={{ marginTop: '4px' }}
                placeholder="Nom de l'élève..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
                prefix={<SearchOutlined />}
              />
            </div>
          </Col>
          {(selectedClasse || selectedStatutPaiement || search) && (
            <Col xs={24} sm={12} md={4}>
              <div style={{ marginTop: '20px' }}>
                <Button
                  type="default"
                  onClick={() => {
                    setSelectedClasse(null);
                    setSelectedStatutPaiement(null);
                    setSearch('');
                  }}
                  style={{ width: '100%' }}
                  icon={<SearchOutlined />}
                >
                  Réinitialiser
                </Button>
              </div>
            </Col>
          )}
        </Row>
      </Card>

      {/* Interface principale */}
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {/* Indicateur de filtrage */}
        {(selectedClasse || selectedStatutPaiement || search) && (
          <div style={{
            marginBottom: '16px',
            padding: '8px 12px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae7ff',
            borderRadius: '6px',
            fontSize: '12px'
          }}>
            <Text style={{ color: '#0050b3' }}>
              🔍 <strong>Filtres actifs:</strong>
              {selectedClasse && ` Classe sélectionnée`}
              {selectedStatutPaiement && ` • Statut: ${selectedStatutPaiement.replace('_', ' ')}`}
              {search && ` • Recherche: "${search}"`}
              {` • ${filterEleves(eleves).length} résultat(s) trouvé(s)`}
            </Text>
          </div>
        )}

        {/* Tableau */}
        <Table
          columns={[
            {
              title: 'Élève',
              key: 'eleve',
              render: (_, record) => (
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {record.nomComplet}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {record.classeNom} • Parent: {record.parentNom}
                  </div>
                </div>
              ),
              responsive: ['xs', 'sm', 'md', 'lg', 'xl']
            },

            {
              title: 'Paiement',
              key: 'paiement',
              render: (_, record) => (
                <div>
                  <Progress
                    percent={record.pourcentagePaye}
                    size="small"
                    status={record.pourcentagePaye >= 100 ? 'success' : 'active'}
                  />
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    {formatPrice(record.montantPaye)} / {formatPrice(record.montantTotal)}
                  </div>
                </div>
              ),
              responsive: ['md', 'lg', 'xl']
            },
            {
              title: 'Statut Paiement',
              dataIndex: 'statutPaiement',
              key: 'statutPaiement',
              render: (statut) => {
                const labels = {
                  'en_attente': 'En attente',
                  'partiellement_paye': 'Partiel',
                  'completement_paye': 'Complet'
                };
                return (
                  <Tag color={getStatutColor(statut)}>
                    {labels[statut] || statut}
                  </Tag>
                );
              },
              responsive: ['sm', 'md', 'lg', 'xl']
            },
            {
              title: 'Restant',
              dataIndex: 'montantRestant',
              key: 'montantRestant',
              render: (montant) => (
                <Text style={{
                  color: montant > 0 ? '#ff4d4f' : '#52c41a',
                  fontWeight: 'bold'
                }}>
                  {formatPrice(montant)}
                </Text>
              ),
              responsive: ['lg', 'xl']
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Space size="small">
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handleView(record)}
                    title="Voir les détails"
                  />
                  {!record.paiementId && (
                    <Button
                      type="text"
                      icon={<DollarOutlined />}
                      onClick={() => handlePaiement(record)}
                      title="Créer paiement de scolarité"
                      style={{ color: '#52c41a' }}
                    />
                  )}
                  {record.paiementScolariteId && record.statutPaiement !== 'paye_complet' && (
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handlePaiement(record)}
                      title="Ajouter un versement"
                      style={{ color: '#1890ff' }}
                    />
                  )}
                  {record.statutPaiement === 'paye_complet' && (
                    <>
                      <Button
                        type="text"
                        icon={<CheckCircleOutlined />}
                        title="Paiement complet"
                        style={{ color: '#52c41a' }}
                        disabled
                      />
                      {/* Bouton de test temporaire */}
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handlePaiement(record)}
                        title="Test endpoint (temporaire)"
                        style={{ color: '#ff7a00' }}
                        size="small"
                      >
                        Test
                      </Button>
                    </>
                  )}
                </Space>
              ),
              responsive: ['xs', 'sm', 'md', 'lg', 'xl']
            }
          ]}
          dataSource={filterEleves(eleves)}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} élèves`
          }}
          scroll={{ x: 1000 }}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          loading={loading}
          locale={{
            emptyText: (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <Text style={{ fontSize: '16px', color: '#666' }}>
                  {(selectedClasse || selectedStatutPaiement || search)
                    ? 'Aucun élève ne correspond aux filtres sélectionnés'
                    : 'Aucun élève trouvé'
                  }
                </Text>
                {(selectedClasse || selectedStatutPaiement || search) && (
                  <div style={{ marginTop: '8px' }}>
                    <Text style={{ fontSize: '12px', color: '#999' }}>
                      Essayez de modifier ou supprimer les filtres
                    </Text>
                  </div>
                )}
              </div>
            )
          }}
        />
      </Card>

      {/* Drawer pour les détails */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserOutlined />
            <span>Détails - {selectedEleve?.nomComplet}</span>
          </div>
        }
        placement="right"
        width={600}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedEleve && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Nom complet">
                <Text style={{ fontWeight: 'bold' }}>{selectedEleve.nomComplet}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Classe">
                <Tag color="blue">{selectedEleve.classeNom}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Parent">
                <Text style={{ fontWeight: 'bold' }}>{selectedEleve.parentNom}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Date de naissance">
                {selectedEleve.dateNaissance ? new Date(selectedEleve.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseignée'}
              </Descriptions.Item>
              <Descriptions.Item label="Sexe">
                <Tag color={selectedEleve.sexe === 'M' ? 'blue' : 'pink'}>
                  {selectedEleve.sexe === 'M' ? 'Masculin' : 'Féminin'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Statut">
                <Tag color="orange">
                  Pré-inscrit
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Date d'inscription">
                {selectedEleve.dateInscription ? new Date(selectedEleve.dateInscription).toLocaleDateString('fr-FR') : 'Non renseignée'}
              </Descriptions.Item>
            </Descriptions>

            <Card title="Détails Financiers" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Montant Total"
                    value={selectedEleve.montantTotal}
                    suffix="FCFA"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Montant Payé"
                    value={selectedEleve.montantPaye}
                    suffix="FCFA"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Montant Restant"
                    value={selectedEleve.montantRestant}
                    suffix="FCFA"
                    valueStyle={{ color: selectedEleve.montantRestant > 0 ? '#ff4d4f' : '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Pourcentage Payé"
                    value={selectedEleve.pourcentagePaye}
                    suffix="%"
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
              </Row>

              <div style={{ marginTop: '16px' }}>
                <Progress
                  percent={selectedEleve.pourcentagePaye}
                  status={selectedEleve.pourcentagePaye >= 100 ? 'success' : 'active'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>

              {selectedEleve.peutEtreValide && selectedEleve.statutEleve === 'pre_inscrit' && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: '6px'
                }}>
                  <Text style={{ color: '#52c41a' }}>
                    ✅ Cet élève peut être validé (≥ 33.33% payé)
                  </Text>
                </div>
              )}
            </Card>
          </div>
        )}
      </Drawer>

      {/* Modal pour effectuer un paiement */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {paiementEleve?.paiementId ? <EditOutlined /> : <DollarOutlined />}
            <span>
              {paiementEleve?.paiementId ? 'Modifier Paiement' : 'Créer Paiement de Scolarité'} - {paiementEleve?.nomComplet}
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setPaiementEleve(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        {paiementEleve && (
          <div>
            {/* Résumé de l'élève */}
            <Card size="small" style={{ marginBottom: '16px', background: '#f6f8fa' }}>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Classe :</Text> {paiementEleve.classeNom}
                </Col>
                <Col span={12}>
                  <Text strong>Parent :</Text> {paiementEleve.parentNom}
                </Col>
                <Col span={12}>
                  <Text strong>Année Scolaire :</Text> {selectedAnnee}
                </Col>
                <Col span={12}>
                  <Text strong>Tarif Suggéré :</Text>
                  <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    {formatPrice(paiementEleve.montantTotal)}
                  </Text>
                </Col>
              </Row>
            </Card>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="montant"
                    label={paiementEleve?.paiementId ? "Montant du Paiement (FCFA)" : "Montant Total de la Scolarité (FCFA)"}
                    rules={[
                      { required: true, message: 'Le montant est requis' },
                      {
                        type: 'number',
                        min: 1,
                        max: paiementEleve?.paiementId ? paiementEleve?.montantRestant : undefined,
                        message: paiementEleve?.paiementId ?
                          `Le montant doit être entre 1 et ${paiementEleve?.montantRestant} FCFA (montant restant)` :
                          'Le montant doit être supérieur à 0'
                      }
                    ]}
                    initialValue={paiementEleve?.paiementId ? paiementEleve?.montantRestant : paiementEleve?.montantTotal}
                  >
                    <InputNumber
                      size="large"
                      placeholder={paiementEleve?.paiementId ?
                        `Montant restant: ${paiementEleve?.montantRestant?.toLocaleString()} FCFA` :
                        "Montant total de la scolarité"
                      }
                      min={1}
                      max={paiementEleve?.paiementId ? paiementEleve?.montantRestant : undefined}
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                      parser={value => value.replace(/\s?/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  {paiementEleve?.paiementId ? (
                    // Mode de paiement pour mise à jour
                    <Form.Item
                      name="modePaiement"
                      label="Mode de Paiement"
                      rules={[{ required: true, message: 'Le mode de paiement est requis' }]}
                    >
                      <div className="select-with-icon-html">
                        <DollarOutlined className="select-icon-html" />
                        <select
                          className="modern-select-html"
                          style={{ height: '40px' }}
                          onChange={(e) => {
                            const value = e.target.value;
                            form.setFieldsValue({ modePaiement: value });
                          }}
                          defaultValue="especes"
                        >
                          <option value="especes">💰 Espèces</option>
                          <option value="cheque">📄 Chèque</option>
                          <option value="virement">🏦 Virement</option>
                          <option value="carte_bancaire">💳 Carte Bancaire</option>
                        </select>
                      </div>
                    </Form.Item>
                  ) : (
                    // Année scolaire pour création
                    <Form.Item
                      name="anneeScolaire"
                      label="Année Scolaire"
                      initialValue={selectedAnnee}
                    >
                      <div className="select-with-icon-html">
                        <TagOutlined className="select-icon-html" />
                        <select
                          className="modern-select-html"
                          style={{ height: '40px' }}
                          value={selectedAnnee}
                          disabled
                        >
                          <option value={selectedAnnee}>{selectedAnnee}</option>
                        </select>
                      </div>
                    </Form.Item>
                  )}
                </Col>
              </Row>

              {/* Champs conditionnels pour les mises à jour seulement */}
              {paiementEleve?.paiementId && (
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) =>
                  prevValues.modePaiement !== currentValues.modePaiement
                }>
                  {({ getFieldValue }) => {
                    const modePaiement = getFieldValue('modePaiement');

                    if (modePaiement === 'cheque') {
                      return (
                        <Form.Item
                          name="numeroCheque"
                          label="Numéro de Chèque"
                          rules={[{ required: true, message: 'Le numéro de chèque est requis' }]}
                        >
                          <Input size="large" placeholder="Ex: CHQ123456789" />
                        </Form.Item>
                      );
                    }

                    if (modePaiement === 'virement') {
                      return (
                        <Form.Item
                          name="referenceVirement"
                          label="Référence de Virement"
                          rules={[{ required: true, message: 'La référence de virement est requise' }]}
                        >
                          <Input size="large" placeholder="Ex: VIR20250108001" />
                        </Form.Item>
                      );
                    }

                    if (modePaiement === 'carte_bancaire') {
                      return (
                        <Form.Item
                          name="numeroTransaction"
                          label="Numéro de Transaction"
                          rules={[{ required: true, message: 'Le numéro de transaction est requis' }]}
                        >
                          <Input size="large" placeholder="Ex: TXN789456123" />
                        </Form.Item>
                      );
                    }

                    return null;
                  }}
                </Form.Item>
              )}

              <Form.Item
                name="commentaire"
                label="Commentaire (optionnel)"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Commentaire sur ce paiement..."
                  maxLength={200}
                  showCount
                />
              </Form.Item>

              {/* Informations importantes */}
              <div style={{
                background: '#e6f7ff',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                border: '1px solid #91d5ff'
              }}>
                <Text style={{ fontSize: '12px', color: '#0050b3' }}>
                  💡 <strong>Information :</strong> {paiementEleve?.paiementId ?
                    `Modification du paiement existant pour ${paiementEleve.nomComplet}. Montant restant à payer: ${paiementEleve?.montantRestant?.toLocaleString()} FCFA.` :
                    `Création d'un nouveau dossier de paiement de scolarité pour ${paiementEleve.nomComplet} pour l'année ${selectedAnnee}.`
                  }
                </Text>

                {paiementEleve?.paiementId && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae7ff',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>💰 <strong>Montant total:</strong></span>
                      <span>{paiementEleve?.montantTotal?.toLocaleString()} FCFA</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>✅ <strong>Déjà payé:</strong></span>
                      <span style={{ color: '#52c41a' }}>{paiementEleve?.montantPaye?.toLocaleString()} FCFA</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>⏳ <strong>Reste à payer:</strong></span>
                      <span style={{ color: '#fa8c16' }}>{paiementEleve?.montantRestant?.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                )}
              </div>

              <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button
                    onClick={() => {
                      setModalOpen(false);
                      setPaiementEleve(null);
                      form.resetFields();
                    }}
                    size="large"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    icon={paiementEleve?.paiementId ? <EditOutlined /> : <DollarOutlined />}
                  >
                    {paiementEleve?.paiementId ? 'Mettre à Jour le Paiement' : 'Créer le Paiement de Scolarité'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
