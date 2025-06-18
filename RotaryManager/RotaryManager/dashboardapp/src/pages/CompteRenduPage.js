import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Form,
  Select,
  Button,
  Input,
  Card,
  message,
  Spin,
  Space,
  Typography,
  Divider,
  Checkbox,
  Row,
  Col,
  Alert,
  Tag
} from 'antd';
import { 
  FileTextOutlined, 
  TeamOutlined, 
  UserOutlined, 
  SearchOutlined, 
  FileWordOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { FaBars, FaTimes } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CompteRenduPage = () => {
  const { clubId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);
  const [reunions, setReunions] = useState([]);
  const [selectedReunion, setSelectedReunion] = useState(null);
  const [presences, setPresences] = useState([]);
  const [invites, setInvites] = useState([]);
  const [ordresDuJour, setOrdresDuJour] = useState([]);
  const [divers, setDivers] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchPresences, setSearchPresences] = useState('');
  const [searchInvites, setSearchInvites] = useState('');

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
      fetchReunions();
    }
  }, [clubId]);

  const fetchReunions = async () => {
    try {
      console.log('=== CHARGEMENT DES RÉUNIONS ===');
      console.log('Club ID:', clubId);
      const response = await axios.get(`http://localhost:5265/api/clubs/${clubId}/reunions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Réunions reçues:', response.data);
      setReunions(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des réunions:', error);
      message.error('Erreur lors du chargement des réunions');
    }
  };

  const handleReunionChange = async (reunionId) => {
    if (!reunionId) return;
    
    console.log('=== CHANGEMENT DE RÉUNION ===');
    console.log('Club ID:', clubId);
    console.log('Réunion ID:', reunionId);
    
    setLoading(true);
    try {
      // Récupérer les détails de la réunion d'abord
      console.log('Chargement des détails de la réunion...');
      const reunionResponse = await axios.get(
        `http://localhost:5265/api/clubs/${clubId}/reunions/${reunionId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('Détails de la réunion reçus:', reunionResponse.data);
      setSelectedReunion(reunionResponse.data);

      // Utiliser les données de la réunion détaillée pour extraire les présences et invités
      const reunionData = reunionResponse.data;
      
      // Ajouter la propriété selected à TRUE par défaut pour les présences
      const presencesWithSelection = (reunionData.presences || []).map(p => ({
        ...p,
        selected: true
      }));
      setPresences(presencesWithSelection);
      
      // Ajouter la propriété selected à TRUE par défaut pour les invités
      const invitesWithSelection = (reunionData.invites || []).map(i => ({
        ...i,
        selected: true
      }));
      setInvites(invitesWithSelection);

      // Récupérer les ordres du jour avec contenu modifiable
      const ordresWithContent = (reunionData.ordresDuJour || []).map(ordre => ({
        ...ordre,
        contenu: '' // Contenu vide par défaut à remplir par l'utilisateur
      }));
      setOrdresDuJour(ordresWithContent);
      
      setDivers(''); // Réinitialiser le divers à chaque changement de réunion
      
      console.log('=== DONNÉES CHARGÉES ===');
      console.log('Présences:', presencesWithSelection);
      console.log('Invités:', invitesWithSelection);
      console.log('Ordres du jour:', ordresWithContent);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données de la réunion:', error);
      message.error('Erreur lors du chargement des données de la réunion');
    } finally {
      setLoading(false);
    }
  };

  // Génération du document Word avec gestion d'erreur améliorée
  const handleGenerateWord = async () => {
    try {
      setWordLoading(true);
      console.log('=== GÉNÉRATION DU DOCUMENT WORD ===');
      console.log('Club ID:', clubId);
      console.log('Réunion ID:', selectedReunion.id);

      // Validation des données avant envoi
      const selectedPresences = presences.filter(p => p.selected);
      const selectedInvites = invites.filter(i => i.selected);

      console.log('Présences sélectionnées:', selectedPresences);
      console.log('Invités sélectionnés:', selectedInvites);

      // Préparer les données au format attendu par le backend
      const requestData = {
        presences: selectedPresences.map(p => ({
          nomComplet: p.nomCompletMembre
        })),
        invites: selectedInvites.map(i => ({
          nom: i.nom,
          prenom: i.prenom,
          organisation: i.organisation
        })),
        ordresDuJour: ordresDuJour.map((ordre, index) => ({
          numero: index + 1,
          description: ordre.description,
          contenu: ordre.contenu || ''
        })),
        divers: divers || ''
      };

      console.log('=== DONNÉES ENVOYÉES AU SERVEUR ===');
      console.log('Request data complète:', requestData);

      const response = await axios.post(
        `http://localhost:5265/api/clubs/${clubId}/reunions/${selectedReunion.id}/compte-rendu`,
        requestData,
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Vérifier que la réponse est bien un blob
      if (response.data.size === 0) {
        throw new Error('Le fichier généré est vide');
      }

      // Créer un nom de fichier sécurisé
      const dateFormatted = new Date(selectedReunion.date).toLocaleDateString('fr-FR').replace(/\//g, '-');
      const typeReunionSafe = selectedReunion.typeReunionLibelle.replace(/[^a-zA-Z0-9]/g, '-');
      const fileName = `compte-rendu-${typeReunionSafe}-${dateFormatted}.docx`;

      // Créer un lien pour télécharger le fichier
      const url = window.URL.createObjectURL(new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      }));
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success({
        content: 'Document Word généré avec succès !',
        duration: 5,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });

    } catch (error) {
      console.error('Erreur lors de la génération du document Word:', error);
      
      // Gestion d'erreur améliorée
      let errorMessage = 'Erreur lors de la génération du document Word';
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Vous n\'avez pas l\'autorisation de générer ce document';
        } else if (error.response.status === 404) {
          errorMessage = 'Réunion ou modèle de document non trouvé';
        } else if (error.response.status === 500) {
          errorMessage = 'Erreur du serveur lors de la génération du document';
        }
      } else if (error.request) {
        errorMessage = 'Impossible de contacter le serveur';
      }
      
      message.error({
        content: errorMessage,
        duration: 8
      });
    } finally {
      setWordLoading(false);
    }
  };

  const handleToggleCollapse = useCallback((collapsed) => {
    setIsCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Largeur dynamique selon l'état du sidebar
  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

  // Filtrage des listes
  const filteredPresences = presences.filter(membre =>
    `${membre.nomCompletMembre}`.toLowerCase().includes(searchPresences.toLowerCase())
  );

  const filteredInvites = invites.filter(invite =>
    `${invite.nom} ${invite.prenom}`.toLowerCase().includes(searchInvites.toLowerCase())
  );

  // Fonctions pour sélectionner/désélectionner tout
  const selectAllPresences = () => {
    setPresences(presences.map(p => ({ ...p, selected: true })));
  };

  const deselectAllPresences = () => {
    setPresences(presences.map(p => ({ ...p, selected: false })));
  };

  const selectAllInvites = () => {
    setInvites(invites.map(i => ({ ...i, selected: true })));
  };

  const deselectAllInvites = () => {
    setInvites(invites.map(i => ({ ...i, selected: false })));
  };

  // Statistiques pour affichage
  const selectedPresencesCount = presences.filter(p => p.selected).length;
  const selectedInvitesCount = invites.filter(i => i.selected).length;
  const totalParticipants = selectedPresencesCount + selectedInvitesCount;

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
                  <FileTextOutlined className="mr-2" />
                  Génération du Compte-Rendu
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Sélection de la réunion */}
          <Card className="mb-6">
            <Form form={form} layout="vertical">
              <Form.Item
                name="reunionId"
                label="Sélectionner la réunion"
                rules={[{ required: true, message: 'Veuillez sélectionner une réunion' }]}
              >
                <Select
                  placeholder="Choisir une réunion"
                  onChange={handleReunionChange}
                  loading={loading}
                  size="large"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {reunions.map(reunion => (
                    <Option key={reunion.id} value={reunion.id}>
                      {`${new Date(reunion.date).toLocaleDateString('fr-FR')} - ${reunion.typeReunionLibelle}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Card>

          {selectedReunion && (
            <>
              {/* Informations de la réunion et bouton de génération */}
              <Card className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <Title level={4} className="mb-2">
                      {selectedReunion.typeReunionLibelle}
                    </Title>
                    <Space wrap>
                      <Tag color="blue">
                        {new Date(selectedReunion.date).toLocaleDateString('fr-FR')}
                      </Tag>
                      <Tag color="green">
                        {selectedReunion.heure || 'Heure non définie'}
                      </Tag>
                      <Tag color="orange">
                        {totalParticipants} participant(s) sélectionné(s)
                      </Tag>
                    </Space>
                  </div>
                  <Button 
                    type="primary" 
                    icon={<FileWordOutlined />} 
                    onClick={handleGenerateWord}
                    loading={wordLoading}
                    size="large"
                    disabled={!selectedReunion}
                  >
                    {wordLoading ? 'Génération en cours...' : 'Générer le compte-rendu Word'}
                  </Button>
                </div>
                
                {totalParticipants === 0 && (
                  <Alert
                    message="Aucun participant sélectionné"
                    description="Veuillez sélectionner au moins un membre présent ou un invité pour générer le compte-rendu."
                    type="warning"
                    showIcon
                    className="mt-4"
                  />
                )}
              </Card>

              {/* Listes des participants */}
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} lg={12}>
                  <Card 
                    title={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <TeamOutlined className="mr-2" />
                          Liste des présences
                        </div>
                        <div>
                          <Button size="small" onClick={selectAllPresences}>
                            Tout sélectionner
                          </Button>
                          <Button size="small" onClick={deselectAllPresences} className="ml-2">
                            Tout désélectionner
                          </Button>
                        </div>
                      </div>
                    }
                  >
                    <Input
                      placeholder="Rechercher un membre..."
                      prefix={<SearchOutlined />}
                      value={searchPresences}
                      onChange={(e) => setSearchPresences(e.target.value)}
                      className="mb-4"
                      allowClear
                    />
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {filteredPresences.length === 0 ? (
                        <Text type="secondary">Aucune présence enregistrée</Text>
                      ) : (
                        <Checkbox.Group
                          value={presences.filter(p => p.selected).map(p => p.membreId)}
                          onChange={(values) => {
                            const newPresences = presences.map(p => ({
                              ...p,
                              selected: values.includes(p.membreId)
                            }));
                            setPresences(newPresences);
                          }}
                          style={{ width: '100%' }}
                        >
                          <Space direction="vertical" style={{ width: '100%' }}>
                            {filteredPresences.map(membre => (
                              <Checkbox key={membre.membreId} value={membre.membreId}>
                                {membre.nomCompletMembre}
                              </Checkbox>
                            ))}
                          </Space>
                        </Checkbox.Group>
                      )}
                    </div>
                    <div className="mt-2 text-gray-500 text-sm">
                      {selectedPresencesCount} membre(s) sélectionné(s) sur {presences.length}
                    </div>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card 
                    title={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <UserOutlined className="mr-2" />
                          Liste des invités
                        </div>
                        <div>
                          <Button size="small" onClick={selectAllInvites}>
                            Tout sélectionner
                          </Button>
                          <Button size="small" onClick={deselectAllInvites} className="ml-2">
                            Tout désélectionner
                          </Button>
                        </div>
                      </div>
                    }
                  >
                    <Input
                      placeholder="Rechercher un invité..."
                      prefix={<SearchOutlined />}
                      value={searchInvites}
                      onChange={(e) => setSearchInvites(e.target.value)}
                      className="mb-4"
                      allowClear
                    />
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {filteredInvites.length === 0 ? (
                        <Text type="secondary">Aucun invité enregistré</Text>
                      ) : (
                        <Checkbox.Group
                          value={invites.filter(i => i.selected).map(i => i.id)}
                          onChange={(values) => {
                            const newInvites = invites.map(i => ({
                              ...i,
                              selected: values.includes(i.id)
                            }));
                            setInvites(newInvites);
                          }}
                          style={{ width: '100%' }}
                        >
                          <Space direction="vertical" style={{ width: '100%' }}>
                            {filteredInvites.map(invite => (
                              <Checkbox key={invite.id} value={invite.id}>
                                {`${invite.nom} ${invite.prenom}`.trim()}
                                {invite.organisation && (
                                  <span className="text-gray-500 text-sm ml-2">
                                    ({invite.organisation})
                                  </span>
                                )}
                              </Checkbox>
                            ))}
                          </Space>
                        </Checkbox.Group>
                      )}
                    </div>
                    <div className="mt-2 text-gray-500 text-sm">
                      {selectedInvitesCount} invité(s) sélectionné(s) sur {invites.length}
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Ordres du jour */}
              <Card title="Ordres du jour" className="mb-6">
                {ordresDuJour.length === 0 ? (
                  <Alert
                    message="Aucun ordre du jour défini"
                    description="Cette réunion n'a pas d'ordre du jour enregistré."
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                  />
                ) : (
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {ordresDuJour.map((ordre, index) => (
                      <div key={index} className="w-full p-4 border border-gray-200 rounded-lg">
                        <Text strong className="text-lg block mb-3">
                          {index + 1}. {ordre.description}
                        </Text>
                        <TextArea
                          rows={4}
                          value={ordre.contenu || ''}
                          onChange={(e) => {
                            const newOrdres = [...ordresDuJour];
                            newOrdres[index].contenu = e.target.value;
                            setOrdresDuJour(newOrdres);
                          }}
                          placeholder="Saisissez le contenu de la discussion pour cet ordre du jour..."
                          className="mt-2"
                        />
                      </div>
                    ))}
                  </Space>
                )}
              </Card>

              {/* Section Divers */}
              <Card title="Points divers" className="mb-6">
                <TextArea
                  rows={6}
                  value={divers}
                  onChange={(e) => setDivers(e.target.value)}
                  placeholder="Saisissez les points divers abordés lors de la réunion..."
                />
              </Card>
            </>
          )}

          {loading && (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
              <Text className="ml-3">Chargement des données de la réunion...</Text>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompteRenduPage;