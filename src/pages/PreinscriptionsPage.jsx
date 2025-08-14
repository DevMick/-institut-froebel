import React, { useState, useEffect } from 'react';
import PreInscriptionForm from '../components/admissions/PreInscriptionForm';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Tag, 
  Space, 
  Modal, 
  message,
  Spin,
  Row,
  Col,
  Statistic,
  Drawer,
  Descriptions,
  Typography,
} from 'antd';
import {
  FileTextOutlined,
  UserOutlined,
  EyeOutlined,
  SearchOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  PlusOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function PreinscriptionsPage() {
  const [loading, setLoading] = useState(false);
  const [preinscriptions, setPreinscriptions] = useState([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPreinscription, setSelectedPreinscription] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);

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
    loadPreinscriptions();
    loadClasses();
  }, []);

  const loadPreinscriptions = async () => {
    setLoading(true);
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      
      console.log('Chargement des préinscriptions pour l\'école:', ecoleId);
      
      const response = await fetch(`https://mon-api-aspnet.onrender.com/api/ecoles/${ecoleId}/preinscriptions`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });

      console.log('Réponse préinscriptions:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('Données préinscriptions reçues:', data);

        // L'API retourne directement un tableau
        setPreinscriptions(data);
      } else {
        // Mode démonstration si serveur indisponible
        console.log('Serveur non disponible, utilisation des données de démonstration');
        setPreinscriptions([
          {
            parentId: '1',
            parentEmail: 'koffi.kouame@email.com',
            parentNom: 'Koffi Kouame',
            parentTelephone: '+225 07 12 34 56 78',
            estValide: false,
            nombreEnfants: 1,
            nombreEnfantsPreInscrits: 1,
            nombreEnfantsInscrits: 0,
            datePreinscription: '2025-07-02T03:49:49.435145Z'
          },
          {
            parentId: '2',
            parentEmail: 'adjoua.kouassi@email.com',
            parentNom: 'Adjoua Kouassi',
            parentTelephone: '+225 07 12 34 56 78',
            estValide: false,
            nombreEnfants: 2,
            nombreEnfantsPreInscrits: 2,
            nombreEnfantsInscrits: 0,
            datePreinscription: '2025-07-02T02:44:28.109105Z'
          }
        ]);
        message.warning('Serveur non disponible - Mode démonstration activé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préinscriptions:', error);
      // Mode démonstration en cas d'erreur
      setPreinscriptions([
        {
          parentId: '1',
          parentEmail: 'koffi.kouame@email.com',
          parentNom: 'Koffi Kouame',
          parentTelephone: '+225 07 12 34 56 78',
          estValide: false,
          nombreEnfants: 1,
          nombreEnfantsPreInscrits: 1,
          nombreEnfantsInscrits: 0,
          datePreinscription: '2025-07-02T03:49:49.435145Z'
        }
      ]);
      message.warning('Serveur non disponible - Mode démonstration activé');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une préinscription
  const deletePreinscription = async (id) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;

      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/preinscriptions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': '*/*'
        }
      });

      if (response.ok) {
        message.success('Préinscription supprimée avec succès');
        loadPreinscriptions();
      } else {
        const error = await response.text();
        console.error('Erreur suppression préinscription:', error);
        message.error('Erreur lors de la suppression de la préinscription');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la suppression');
    }
  };

  const loadClasses = async () => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;

      const response = await fetch(`https://mon-api-aspnet.onrender.com/api/ecoles/${ecoleId}/classes`, {
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
          { id: 3, nom: 'CE1-A' }
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

  // Créer une préinscription
  const createPreinscription = async (values) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;

      const requestData = {
        parent: {
          nom: values.parent.nom,
          prenom: values.parent.prenom,
          email: values.parent.email,
          telephone: values.parent.telephone,
          adresse: values.parent.adresse,
          sexe: values.parent.sexe,
          dateNaissance: values.parent.dateNaissance ? new Date(values.parent.dateNaissance).toISOString() : null,
          motDePasse: values.parent.motDePasse
        },
        enfants: values.enfants.map(enfant => ({
          nom: enfant.nom,
          prenom: enfant.prenom,
          dateNaissance: enfant.dateNaissance ? new Date(enfant.dateNaissance).toISOString() : null,
          sexe: enfant.sexe,
          classeId: enfant.classeId
        }))
      };

      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/preinscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        message.success('Préinscription créée avec succès !');
        setModalOpen(false);
        loadPreinscriptions();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur de connexion. Veuillez réessayer.');
    }
  };

  // Handlers
  const handleView = (record) => {
    setSelectedPreinscription(record);
    setDrawerOpen(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Supprimer la préinscription',
      content: `Êtes-vous sûr de vouloir supprimer la préinscription de ${record.parentNom} ?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        await deletePreinscription(record.parentId);
      }
    });
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Parent',
      key: 'parent',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            {record.parentNom}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.parentEmail}
          </div>
        </div>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    },
    {
      title: 'Téléphone',
      dataIndex: 'parentTelephone',
      key: 'parentTelephone',
      responsive: ['md', 'lg', 'xl']
    },
    {
      title: 'Enfants',
      key: 'enfants',
      render: (_, record) => (
        <div>
          <Tag color="blue" style={{ marginBottom: '2px' }}>
            {record.nombreEnfants} enfant{record.nombreEnfants > 1 ? 's' : ''}
          </Tag>
          <br />
          <Tag color="green" style={{ fontSize: '11px' }}>
            {record.nombreEnfantsPreInscrits} pré-inscrit{record.nombreEnfantsPreInscrits > 1 ? 's' : ''}
          </Tag>
        </div>
      ),
      responsive: ['sm', 'md', 'lg', 'xl']
    },
    {
      title: 'Date de préinscription',
      dataIndex: 'datePreinscription',
      key: 'datePreinscription',
      render: (date) => new Date(date).toLocaleDateString('fr-FR'),
      responsive: ['md', 'lg', 'xl']
    },
    {
      title: 'Statut',
      dataIndex: 'estValide',
      key: 'estValide',
      render: (estValide) => {
        const color = estValide ? 'green' : 'orange';
        const text = estValide ? 'Validée' : 'En attente';
        return <Tag color={color}>{text}</Tag>;
      },
      responsive: ['sm', 'md', 'lg', 'xl']
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
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            danger
            title="Supprimer"
          />
        </Space>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    }
  ];

  // Filtrage des données
  const filteredPreinscriptions = preinscriptions.filter(preinscription =>
    preinscription.parentNom?.toLowerCase().includes(search.toLowerCase()) ||
    preinscription.parentEmail?.toLowerCase().includes(search.toLowerCase()) ||
    preinscription.parentTelephone?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>Gestion des Préinscriptions</Title>
        <Text style={{ color: '#666' }}>Gérez les demandes de préinscription de votre établissement</Text>
      </div>

      {/* Statistiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic 
              title="Total Préinscriptions" 
              value={preinscriptions.length} 
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="En Attente"
              value={preinscriptions.filter(p => !p.estValide).length}
              prefix={<CalendarOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Validées"
              value={preinscriptions.filter(p => p.estValide).length}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Interface principale */}
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {/* Barre d'actions */}
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} md={16}>
            <Input.Search
              placeholder="Rechercher par nom du parent ou de l'enfant, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
              size="large"
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setModalOpen(true)}
              style={{ width: '100%' }}
            >
              Nouvelle Préinscription
            </Button>
          </Col>
        </Row>

        {/* Tableau */}
        <Table
          columns={columns}
          dataSource={filteredPreinscriptions}
          rowKey="parentId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} préinscriptions`
          }}
          scroll={{ x: 800 }}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        />
      </Card>

      {/* Drawer pour les détails */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextOutlined />
            <span>Préinscription - {selectedPreinscription?.parentNom}</span>
          </div>
        }
        placement="right"
        width={600}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedPreinscription && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Informations du parent */}
            <Card title="Informations du Parent" size="small">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Nom complet">
                  <span style={{ fontWeight: 'bold' }}>
                    {selectedPreinscription.parentNom}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined /> Email</>}>
                  {selectedPreinscription.parentEmail}
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Téléphone</>}>
                  {selectedPreinscription.parentTelephone}
                </Descriptions.Item>
                <Descriptions.Item label="ID Parent">
                  {selectedPreinscription.parentId}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Informations des enfants */}
            <Card title="Statistiques des enfants" size="small">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Nombre total d'enfants">
                  <Tag color="blue">{selectedPreinscription.nombreEnfants}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Enfants pré-inscrits">
                  <Tag color="green">{selectedPreinscription.nombreEnfantsPreInscrits}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Enfants inscrits">
                  <Tag color="purple">{selectedPreinscription.nombreEnfantsInscrits}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Informations de la demande */}
            <Card title="Informations de la demande" size="small">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Date de préinscription">
                  {new Date(selectedPreinscription.datePreinscription).toLocaleString('fr-FR')}
                </Descriptions.Item>
                <Descriptions.Item label="Statut">
                  <Tag color={selectedPreinscription.estValide ? 'green' : 'orange'}>
                    {selectedPreinscription.estValide ? 'Validée' : 'En attente'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="ID de la préinscription">
                  {selectedPreinscription.parentId}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        )}
      </Drawer>

      {/* Modal pour nouvelle préinscription */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusOutlined />
            <span>Nouvelle Préinscription</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <div style={{ maxHeight: '70vh', overflow: 'auto', padding: '16px 0' }}>
          <PreInscriptionForm onSuccess={() => {
            setModalOpen(false);
            loadPreinscriptions();
          }} />
        </div>
      </Modal>
    </div>
  );
}
