import React, { useEffect, useState } from 'react';
import { Button, message, Select, Card, Row, Col, Statistic, Spin, Modal, Input, Badge } from 'antd';
import { SearchOutlined, TableOutlined, UserOutlined, CheckCircleOutlined, TeamOutlined, EyeOutlined, DeleteOutlined, ReloadOutlined, ClearOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { getAffectationsByGala, createAffectation, updateAffectation, deleteAffectation } from '../api/galaTableAffectationService';
import galaService from '../api/galaService';
import { getInvitesByGala } from '../api/galaInvitesService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/table.css';

const GalaTableAffectationPage = () => {
  const [galas, setGalas] = useState([]);
  const [selectedGalaId, setSelectedGalaId] = useState(null);
  const [affectations, setAffectations] = useState([]);
  const [invites, setInvites] = useState([]);
  const [tables, setTables] = useState([]);
  const [unassignedInvites, setUnassignedInvites] = useState([]);
  const [filteredUnassignedInvites, setFilteredUnassignedInvites] = useState([]);
  const [tableAssignments, setTableAssignments] = useState({});
  const [selectedInviteId, setSelectedInviteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTableDetails, setSelectedTableDetails] = useState(null);
  const [clubId, setClubId] = useState(null);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  
  const navigate = useNavigate();

  // Définir la largeur du sidebar
  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

  useEffect(() => {
    // Récupérer le clubId depuis le localStorage
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (!token) {
      message.error("Vous devez être connecté pour accéder à cette page");
      navigate('/login');
      return;
    }

    const storedClubId = userInfo?.clubId;
    if (storedClubId) {
      setClubId(storedClubId);
    } else {
      message.error("Erreur d'authentification : clubId non trouvé");
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (clubId) {
      fetchGalas();
    }
  }, [clubId]);

  useEffect(() => {
    if (!selectedGalaId) return;
    fetchDataAndOrganize();
  }, [selectedGalaId, navigate]);

  // Filtrer les invités non affectés selon le terme de recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUnassignedInvites(unassignedInvites);
    } else {
      const filtered = unassignedInvites.filter(invite =>
        (invite.Nom_Prenom || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUnassignedInvites(filtered);
    }
    // Déselectionner l'invité si il n'est plus dans la liste filtrée
    if (selectedInviteId && searchTerm.trim()) {
      const isSelectedInFiltered = filteredUnassignedInvites.some(invite => invite.id === selectedInviteId);
      if (!isSelectedInFiltered) {
        setSelectedInviteId(null);
      }
    }
  }, [unassignedInvites, searchTerm]);

  const fetchGalas = async () => {
    if (!clubId) return;
    
    try {
      setLoading(true);
      const response = await galaService.getAllGalas(clubId);
      setGalas(response.data);
      if (response.data.length > 0 && !selectedGalaId) {
        setSelectedGalaId(response.data[0].id || response.data[0].Id);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Votre session a expiré. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }
      message.error("Erreur lors du chargement des galas");
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTables = async (galaId) => {
    try {
      const tablesToCreate = Array.from({ length: 30 }, (_, i) => ({
        galaId: galaId,
        tableLibelle: `Table ${i + 1}`,
        capacite: 8
      }));

      const response = await galaService.createTables(galaId, tablesToCreate);
      if (!response.data) {
        throw new Error('Réponse invalide du serveur');
      }
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création des tables par défaut:", error);
      message.error("Erreur lors de la création des tables par défaut");
      throw error;
    }
  };

  const fetchDataAndOrganize = async () => {
    if (!selectedGalaId || !clubId) return;

    try {
      setLoading(true);
      // Réinitialiser les filtres lors du changement de gala
      setSearchTerm('');
      setTableSearchTerm('');
      
      const [affectationsResponse, invitesResponse, galaResponse] = await Promise.all([
        getAffectationsByGala(selectedGalaId),
        getInvitesByGala(selectedGalaId),
        galaService.getGala(selectedGalaId)
      ]);

      // Normaliser les invités
      const normalizedInvites = invitesResponse.map(invite => ({
        ...invite,
        id: invite.Id || invite.id,
        Nom_Prenom: invite.Nom_Prenom || invite.nom_Prenom || invite.nom_prenom || invite.nomPrenom || ''
      }));

      // Créer la liste des tables
      let tablesArray = [];
      if (galaResponse.data && galaResponse.data.tables) {
        tablesArray = galaResponse.data.tables.map((table, idx) => ({
          id: table.id || table.Id,
          numero: parseInt((table.tableLibelle || '').replace(/\D/g, ''), 10) || idx + 1,
          label: table.tableLibelle || `Table ${idx + 1}`
        }));
      }

      // Si pas de tables définies, créer 30 tables dans la base de données
      if (tablesArray.length === 0) {
        try {
          const createdTables = await createDefaultTables(selectedGalaId);
          if (createdTables && createdTables.data) {
            tablesArray = createdTables.data.map((table, idx) => ({
              id: table.id || table.Id,
              numero: idx + 1,
              label: table.tableLibelle || `Table ${idx + 1}`
            }));
        }
        } catch (error) {
          console.error("Erreur lors de la création des tables:", error);
          message.error("Impossible de créer les tables par défaut");
          return;
        }
      }

      // Trier les tables par numéro
      tablesArray.sort((a, b) => a.numero - b.numero);

      // Organiser les affectations
      const tableAssignmentsMap = {};
      const assignedInviteIds = new Set();

      affectationsResponse.forEach(affectation => {
        const tableId = affectation.GalaTableId || affectation.galaTableId;
        const inviteId = affectation.GalaInvitesId || affectation.galaInvitesId;
        
        if (!tableAssignmentsMap[tableId]) {
          tableAssignmentsMap[tableId] = [];
        }
        
        const invite = normalizedInvites.find(inv => inv.id == inviteId);
        if (invite) {
          tableAssignmentsMap[tableId].push({
            ...invite,
            affectationId: affectation.Id || affectation.id,
            dateAjout: affectation.DateAjout || affectation.dateAjout
          });
          assignedInviteIds.add(inviteId);
        }
      });

      // Invités non affectés
      const unassigned = normalizedInvites.filter(invite => !assignedInviteIds.has(invite.id));

      setInvites(normalizedInvites);
      setTables(tablesArray);
      setAffectations(affectationsResponse);
      setTableAssignments(tableAssignmentsMap);
      setUnassignedInvites(unassigned);
      setFilteredUnassignedInvites(unassigned);

    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Votre session a expiré. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }
      message.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const assignInviteToTable = async (inviteId, tableId) => {
    try {
      const payload = {
        GalaTableId: tableId,
        GalaInvitesId: inviteId
      };

      await createAffectation(payload);
      message.success('Invité affecté à la table');
      
      // Mettre à jour l'état local
      const invite = unassignedInvites.find(inv => inv.id == inviteId);
      if (invite) {
        const updatedUnassigned = unassignedInvites.filter(inv => inv.id != inviteId);
        const updatedTableAssignments = { ...tableAssignments };
        
        if (!updatedTableAssignments[tableId]) {
          updatedTableAssignments[tableId] = [];
        }
        updatedTableAssignments[tableId].push(invite);

        setUnassignedInvites(updatedUnassigned);
        setTableAssignments(updatedTableAssignments);
        setSelectedInviteId(null);
      }

    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Votre session a expiré. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }
      message.error("Erreur lors de l'affectation: " + (error.response?.data?.message || error.message));
    }
  };

  const removeInviteFromTable = async (inviteId, tableId) => {
    try {
      const affectation = affectations.find(a => 
        (a.GalaInvitesId || a.galaInvitesId) == inviteId && 
        (a.GalaTableId || a.galaTableId) == tableId
      );

      if (affectation) {
        await deleteAffectation(affectation.Id || affectation.id);
        message.success('Invité retiré de la table');

        // Mettre à jour l'état local
        const invite = tableAssignments[tableId]?.find(inv => inv.id == inviteId);
        if (invite) {
          const updatedTableAssignments = { ...tableAssignments };
          updatedTableAssignments[tableId] = updatedTableAssignments[tableId].filter(inv => inv.id != inviteId);
          
          const updatedUnassigned = [...unassignedInvites, invite];

          setTableAssignments(updatedTableAssignments);
          setUnassignedInvites(updatedUnassigned);
        }
      }

    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Votre session a expiré. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }
      message.error("Erreur lors du retrait: " + (error.response?.data?.message || error.message));
    }
  };

  const handleTableClick = (tableId) => {
    if (selectedInviteId && unassignedInvites.find(inv => inv.id == selectedInviteId)) {
      assignInviteToTable(selectedInviteId, tableId);
    }
  };

  const handleInviteClick = (inviteId) => {
    setSelectedInviteId(selectedInviteId === inviteId ? null : inviteId);
  };

  const handleInviteRemove = (inviteId, tableId) => {
    removeInviteFromTable(inviteId, tableId);
  };

  const openTableDetails = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    const assignedInvites = tableAssignments[tableId] || [];
    setSelectedTableDetails({ table, invites: assignedInvites });
    setDetailModalVisible(true);
  };

  const closeTableDetails = () => {
    setDetailModalVisible(false);
    setSelectedTableDetails(null);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedInviteId(null);
  };

  const clearTableSearch = () => {
    setTableSearchTerm('');
  };

  // Filtrer les tables selon le terme de recherche
  const filteredTables = tableSearchTerm.trim()
    ? tables.filter(table =>
        (table.label || '').toLowerCase().includes(tableSearchTerm.toLowerCase())
      )
    : tables;

  // Composant d'export Excel
  const ExcelExportComponent = () => {
    // Fonction pour formater une date
    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('fr-FR');
    };

    // Export complet (3 feuilles dans un seul fichier)
    const exportComplete = () => {
      try {
        const wb = XLSX.utils.book_new();
        const selectedGala = galas.find(g => (g.id || g.Id) === selectedGalaId);
        const galaName = selectedGala ? (selectedGala.libelle || selectedGala.Libelle) : 'Gala';

        // 1. Feuille alphabétique
        const alphabeticalInvites = [...invites].sort((a, b) => {
          const nameA = (a.Nom_Prenom || '').toLowerCase();
          const nameB = (b.Nom_Prenom || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });

        const alphabeticalData = alphabeticalInvites.map((invite, index) => {
          let tableAffectee = 'Non affecté';
          let dateAjout = '';
          for (const [tableId, assignedInvites] of Object.entries(tableAssignments)) {
            const assignedInvite = assignedInvites.find(inv => inv.id === invite.id);
            if (assignedInvite) {
              const table = tables.find(t => t.id == tableId);
              tableAffectee = table ? table.label : `Table ${tableId}`;
              dateAjout = assignedInvite.dateAjout ? new Date(assignedInvite.dateAjout).toLocaleDateString() : '';
              break;
            }
          }

          return {
            'N°': index + 1,
            'Nom et Prénom': invite.Nom_Prenom || '',
            'Table affectée': tableAffectee,
            'Date d\'affectation': dateAjout
          };
        });

        const ws1 = XLSX.utils.json_to_sheet(alphabeticalData);
        ws1['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, ws1, '1-Liste alphabétique');

        // 2. Feuille par ordre de table (ordre croissant)
        const invitesByTableData = [];
        let counter = 1;

        // Trier les tables par numéro croissant
        const sortedTablesWithInvites = [...tables]
          .filter(table => (tableAssignments[table.id] || []).length > 0) // Seulement les tables avec des invités
          .sort((a, b) => a.numero - b.numero);

        // Pour chaque table, ajouter ses invités
        sortedTablesWithInvites.forEach(table => {
          const assignedInvites = tableAssignments[table.id] || [];
          
          // Trier les invités par nom dans chaque table
          const sortedInvites = [...assignedInvites].sort((a, b) => {
            const nameA = (a.Nom_Prenom || '').toLowerCase();
            const nameB = (b.Nom_Prenom || '').toLowerCase();
            return nameA.localeCompare(nameB);
          });

          sortedInvites.forEach(invite => {
            invitesByTableData.push({
              'N°': counter++,
              'Table': table.label,
              'Nom et Prénom': invite.Nom_Prenom || '',
              'Date d\'affectation': invite.dateAjout ? new Date(invite.dateAjout).toLocaleDateString() : ''
            });
          });
        });

        // Ajouter les invités non affectés à la fin
        if (unassignedInvites.length > 0) {
          const sortedUnassigned = [...unassignedInvites].sort((a, b) => {
            const nameA = (a.Nom_Prenom || '').toLowerCase();
            const nameB = (b.Nom_Prenom || '').toLowerCase();
            return nameA.localeCompare(nameB);
          });

          sortedUnassigned.forEach(invite => {
            invitesByTableData.push({
              'N°': counter++,
              'Table': 'Non affecté',
              'Nom et Prénom': invite.Nom_Prenom || '',
              'Date d\'affectation': ''
            });
          });
        }

        const ws2 = XLSX.utils.json_to_sheet(invitesByTableData);
        ws2['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 30 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, ws2, '2-Liste par table');

        // 3. Feuille configuration des tables - Format demandé avec bordures
        const tablesParGroupe = [];
        const TABLES_PER_ROW = 3; // 3 tables par ligne comme dans l'image

        // Grouper les tables par groupes de 3, en excluant les tables vides
        const sortedTables = [...tables]
          .filter(table => (tableAssignments[table.id] || []).length > 0) // Filtrer les tables vides
          .sort((a, b) => a.numero - b.numero);
        
        for (let i = 0; i < sortedTables.length; i += TABLES_PER_ROW) {
          const groupeTables = sortedTables.slice(i, i + TABLES_PER_ROW);
          tablesParGroupe.push(groupeTables);
        }

        // Créer les données pour Excel
        const tableConfigData = [];

        // Pour chaque groupe de tables
        tablesParGroupe.forEach(groupe => {
          // Ligne d'en-tête avec les noms des tables
          const headerRow = {};
          groupe.forEach((table, index) => {
            const colLetter = String.fromCharCode(65 + index); // A, B, C...
            headerRow[colLetter] = table.label.toUpperCase();
          });
          tableConfigData.push(headerRow);

          // Trouver le nombre maximum d'invités dans ce groupe
          const maxInvites = Math.max(
            ...groupe.map(table => (tableAssignments[table.id] || []).length)
          );

          // Ajouter les lignes d'invités
          for (let i = 0; i < maxInvites; i++) {
            const dataRow = {};
            groupe.forEach((table, tableIndex) => {
              const colLetter = String.fromCharCode(65 + tableIndex);
              const assignedInvites = tableAssignments[table.id] || [];
              dataRow[colLetter] = assignedInvites[i] ? assignedInvites[i].Nom_Prenom : '';
            });
            tableConfigData.push(dataRow);
          }

          // Ajouter une ligne vide entre les groupes (sauf pour le dernier groupe)
          if (groupe !== tablesParGroupe[tablesParGroupe.length - 1]) {
            tableConfigData.push({});
          }
        });

        const ws3 = XLSX.utils.json_to_sheet(tableConfigData, { skipHeader: true });

        // Définir la largeur des colonnes
        const colWidths = [];
        for (let i = 0; i < TABLES_PER_ROW; i++) {
          colWidths.push({ wch: 35 }); // Largeur de 35 caractères pour chaque colonne
        }
        ws3['!cols'] = colWidths;

        // Ajouter des bordures à toutes les cellules
        const range = XLSX.utils.decode_range(ws3['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws3[cell_address]) ws3[cell_address] = { t: 's', v: '' };
            
            // Ajouter les bordures
            if (!ws3[cell_address].s) ws3[cell_address].s = {};
            ws3[cell_address].s.border = {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } }
            };

            // Mettre en gras les en-têtes de tables
            const cellValue = ws3[cell_address].v;
            if (cellValue && typeof cellValue === 'string' && cellValue.startsWith('TABLE')) {
              ws3[cell_address].s.font = { bold: true };
              ws3[cell_address].s.alignment = { horizontal: 'center', vertical: 'center' };
            }
          }
        }

        XLSX.utils.book_append_sheet(wb, ws3, '3-Configuration tables');

        // Générer et télécharger le fichier
        const fileName = `Export_Complet_${galaName}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        message.success(`Export complet réussi : ${invites.length} invités et ${tables.length} tables exportés`);
      } catch (error) {
        console.error('Erreur lors de l\'export complet:', error);
        message.error('Erreur lors de l\'export complet');
      }
    };

    const hasData = invites.length > 0;

    return (
      <Button 
        type="primary" 
        icon={<DownloadOutlined />}
        loading={loading}
        disabled={!hasData}
        onClick={exportComplete}
        title={!hasData ? "Aucune donnée à exporter" : "Exporter vers Excel (3 feuilles)"}
      >
        Exporter Excel
      </Button>
    );
  };
  
  const handleToggleCollapse = (collapsed) => { setIsCollapsed(collapsed); };
  const toggleSidebar = () => { setIsSidebarOpen(!isSidebarOpen); };

  // Statistiques
  const totalAffectations = affectations.length;
  const totalTables = Object.keys(tableAssignments).filter(tableId => tableAssignments[tableId].length > 0).length;
  const totalInvitesAffectes = invites.length - unassignedInvites.length;
  const totalInvitesNonAffectes = unassignedInvites.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <main 
        className="flex-1 w-full transition-all duration-300 bg-gray-100 min-h-screen overflow-x-hidden" 
        style={{ 
          marginLeft: isMobile ? '0' : `calc(${sidebarWidth})`,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth})`
        }}
      >
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isMobile && (
                  <button
                    onClick={toggleSidebar}
                    className="mr-4 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Toggle menu"
                  >
                    {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                  </button>
                )}
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Affectation des Tables
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Total affectations"
                  value={totalAffectations}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Tables utilisées"
                  value={totalTables}
                  prefix={<TableOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Invités affectés"
                  value={totalInvitesAffectes}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Invités non affectés"
                  value={totalInvitesNonAffectes}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#8c8c8c' }}
                />
              </Card>
            </Col>
          </Row>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Select
              showSearch
              placeholder="Sélectionner un gala"
              value={selectedGalaId}
              onChange={setSelectedGalaId}
              style={{ width: '100%', maxWidth: 300 }}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {galas.map(gala => (
                <Select.Option key={gala.id || gala.Id} value={gala.id || gala.Id}>
                  {gala.libelle || gala.Libelle}
                </Select.Option>
              ))}
            </Select>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchDataAndOrganize}
              loading={loading}
            >
              Actualiser
            </Button>
            <ExcelExportComponent />
          </div>

          {/* Interface d'affectation */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Liste des invités non affectés avec filtre de recherche */}
            <div className="lg:w-80 bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Invités non affectés
                </h3>
                <Badge 
                  count={filteredUnassignedInvites.length} 
                  style={{ backgroundColor: '#1890ff' }}
                  showZero
                />
              </div>
              
              {/* Filtre de recherche pour les invités */}
              <div className="mb-4">
                <Input
                  placeholder="Rechercher un invité..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                  size="small"
                  suffix={
                    searchTerm && (
                      <Button
                        size="small"
                        type="text"
                        icon={<ClearOutlined />}
                        onClick={clearSearch}
                        style={{ minWidth: 'auto', padding: '0 4px' }}
                      />
                    )
                  }
                />
                {searchTerm && (
                  <div className="text-xs text-gray-500 mt-1">
                    {filteredUnassignedInvites.length} résultat(s) trouvé(s)
                  </div>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredUnassignedInvites.map(invite => (
                  <div
                    key={invite.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedInviteId === invite.id
                        ? 'bg-blue-500 text-white border-2 border-blue-600'
                        : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                    }`}
                    onClick={() => handleInviteClick(invite.id)}
                  >
                    <div className="font-medium">{invite.Nom_Prenom}</div>
                    {selectedInviteId === invite.id && (
                      <div className="text-xs mt-1 opacity-90">
                        Cliquez sur une table pour affecter
                      </div>
                    )}
                  </div>
                ))}
                {filteredUnassignedInvites.length === 0 && !searchTerm && (
                  <div className="text-center text-gray-500 py-8">
                    Tous les invités sont affectés
                  </div>
                )}
                {filteredUnassignedInvites.length === 0 && searchTerm && (
                  <div className="text-center text-gray-500 py-8">
                    <div>Aucun invité trouvé</div>
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={clearSearch}
                      className="mt-2"
                    >
                      Effacer la recherche
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Grille des tables avec filtre de recherche */}
            <div className="flex-1">
              {/* Filtre de recherche pour les tables */}
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Tables du gala
                </h3>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Rechercher une table..."
                    prefix={<SearchOutlined />}
                    value={tableSearchTerm}
                    onChange={(e) => setTableSearchTerm(e.target.value)}
                    allowClear
                    size="small"
                    style={{ width: 200 }}
                  />
                  {tableSearchTerm && (
                    <Badge 
                      count={filteredTables.length} 
                      style={{ backgroundColor: '#52c41a' }}
                      title={`${filteredTables.length} table(s) trouvée(s)`}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredTables.map(table => {
                  const assignedInvites = tableAssignments[table.id] || [];
                  return (
                    <div
                      key={table.id}
                      className={`bg-white rounded-lg shadow p-4 min-h-32 cursor-pointer transition-all duration-200 ${
                        selectedInviteId && unassignedInvites.find(inv => inv.id == selectedInviteId)
                          ? 'hover:bg-green-50 hover:border-green-300 border-2 border-dashed border-gray-300'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleTableClick(table.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold text-blue-600 text-sm">
                          {table.label}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge 
                            count={assignedInvites.length} 
                            style={{ backgroundColor: assignedInvites.length > 0 ? '#52c41a' : '#d9d9d9' }}
                            showZero
                          />
                          <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              openTableDetails(table.id);
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        {assignedInvites.map(invite => (
                          <div
                            key={invite.id}
                            className="bg-blue-50 border border-blue-200 rounded p-2 text-xs cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInviteRemove(invite.id, table.id);
                            }}
                            title="Cliquer pour retirer de la table"
                          >
                            {invite.Nom_Prenom}
                          </div>
                        ))}
                      </div>
                      {assignedInvites.length === 0 && (
                        <div className="text-gray-400 text-xs text-center py-4">
                          Table vide
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredTables.length === 0 && tableSearchTerm && (
                <div className="text-center text-gray-500 py-8">
                  <div>Aucune table trouvée</div>
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={clearTableSearch}
                    className="mt-2"
                  >
                    Effacer la recherche
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Modal de détails de table */}
          <Modal
            title={`${selectedTableDetails?.table.label} - ${selectedTableDetails?.invites.length || 0} invité(s)`}
            open={detailModalVisible}
            onCancel={closeTableDetails}
            footer={[
              <Button key="close" onClick={closeTableDetails}>
                Fermer
              </Button>
            ]}
            width={isMobile ? '95%' : 600}
            centered={isMobile}
          >
            {selectedTableDetails && (
              <div>
                <div className="mb-4">
                  <Badge 
                    count={selectedTableDetails.invites.length} 
                    style={{ backgroundColor: '#1890ff' }}
                    showZero
                  />
                  <span className="ml-2 text-gray-600">invité(s) affecté(s)</span>
                </div>
                <div className="space-y-2">
                  {selectedTableDetails.invites.map((invite, index) => (
                    <div key={invite.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{index + 1}. {invite.Nom_Prenom}</span>
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          handleInviteRemove(invite.id, selectedTableDetails.table.id);
                          // Mettre à jour les détails
                          const updatedInvites = selectedTableDetails.invites.filter(inv => inv.id !== invite.id);
                          setSelectedTableDetails({
                            ...selectedTableDetails,
                            invites: updatedInvites
                          });
                        }}
                      >
                        Retirer
                      </Button>
                    </div>
                  ))}
                  {selectedTableDetails.invites.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      Aucun invité affecté à cette table
                    </div>
                  )}
                </div>
              </div>
            )}
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default GalaTableAffectationPage;