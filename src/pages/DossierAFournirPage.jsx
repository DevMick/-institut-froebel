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
  Typography
} from 'antd';
import { 
  FolderOutlined, 
  BookOutlined, 
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function DossierAFournirPage() {
  const [loading, setLoading] = useState(false);
  const [dossiers, setDossiers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDossier, setEditingDossier] = useState(null);
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

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDossiers(),
        loadClasses()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      message.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadDossiers = async () => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      
      console.log('Chargement des dossiers à fournir pour l\'école:', ecoleId);
      
      const response = await fetch(`https://mon-api-aspnet.onrender.com/api/ecoles/${ecoleId}/dossier-a-fournir`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Réponse dossiers:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('Données dossiers reçues:', data);
        setDossiers(data);
      } else {
        // Mode démonstration si serveur indisponible
        console.log('Serveur non disponible, utilisation des données de démonstration');
        setDossiers([
          { 
            id: 1, 
            nom: 'Certificat de naissance', 
            classeId: 1, 
            classe: { nom: 'CP-A' } 
          },
          { 
            id: 2, 
            nom: 'Carnet de vaccination', 
            classeId: 1, 
            classe: { nom: 'CP-A' } 
          },
          { 
            id: 3, 
            nom: 'Certificat médical', 
            classeId: 2, 
            classe: { nom: 'CP-B' } 
          },
          { 
            id: 4, 
            nom: 'Photos d\'identité (4 exemplaires)', 
            classeId: 3, 
            classe: { nom: 'CE1-A' } 
          },
          { 
            id: 5, 
            nom: 'Bulletin scolaire de l\'année précédente', 
            classeId: 3, 
            classe: { nom: 'CE1-A' } 
          },
          { 
            id: 6, 
            nom: 'Attestation d\'assurance scolaire', 
            classeId: 4, 
            classe: { nom: 'CE2-A' } 
          }
        ]);
        message.warning('Serveur non disponible - Mode démonstration activé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des dossiers:', error);
      // Mode démonstration en cas d'erreur
      setDossiers([
        { 
          id: 1, 
          nom: 'Certificat de naissance', 
          classeId: 1, 
          classe: { nom: 'CP-A' } 
        },
        { 
          id: 2, 
          nom: 'Carnet de vaccination', 
          classeId: 1, 
          classe: { nom: 'CP-A' } 
        }
      ]);
      message.warning('Serveur non disponible - Mode démonstration activé');
    }
  };

  const loadClasses = async () => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      
      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/classes`, {
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

  // Créer un dossier
  const createDossier = async (values) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      const token = getToken();

      // Vérifier si le token existe
      if (!token || token === 'null') {
        message.error('Vous devez être connecté pour effectuer cette action');
        return;
      }

      console.log('Création dossier avec token:', token ? 'Token présent' : 'Token manquant');

      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/dossier-a-fournir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          nom: values.nom,
          classeId: values.classeId
        })
      });

      console.log('Réponse création dossier:', response.status, response.statusText);

      if (response.ok) {
        message.success('Dossier à fournir créé avec succès');
        loadDossiers();
        setModalOpen(false);
        form.resetFields();
      } else if (response.status === 401) {
        message.error('Session expirée. Veuillez vous reconnecter.');
      } else {
        const error = await response.json();
        message.error(error.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la création');
    }
  };

  // Modifier un dossier
  const updateDossier = async (id, values) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      const token = getToken();

      // Vérifier si le token existe
      if (!token || token === 'null') {
        message.error('Vous devez être connecté pour effectuer cette action');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/dossier-a-fournir/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          nom: values.nom,
          classeId: values.classeId
        })
      });

      if (response.ok) {
        message.success('Dossier à fournir modifié avec succès');
        loadDossiers();
        setModalOpen(false);
        form.resetFields();
        setEditingDossier(null);
      } else if (response.status === 401) {
        message.error('Session expirée. Veuillez vous reconnecter.');
      } else {
        const error = await response.text();
        console.error('Erreur modification dossier:', error);
        message.error('Erreur lors de la modification du dossier');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la modification');
    }
  };

  // Supprimer un dossier
  const deleteDossier = async (id) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      const token = getToken();

      // Vérifier si le token existe
      if (!token || token === 'null') {
        message.error('Vous devez être connecté pour effectuer cette action');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/dossier-a-fournir/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        message.success('Dossier à fournir supprimé avec succès');
        loadDossiers();
      } else if (response.status === 401) {
        message.error('Session expirée. Veuillez vous reconnecter.');
      } else {
        const error = await response.text();
        console.error('Erreur suppression dossier:', error);
        message.error('Erreur lors de la suppression du dossier');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la suppression');
    }
  };

  // Handlers
  const handleView = (record) => {
    setSelectedDossier(record);
    setDrawerOpen(true);
  };

  const handleEdit = (record) => {
    setEditingDossier(record);
    setModalOpen(true);
    form.setFieldsValue(record);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Supprimer le dossier à fournir',
      content: `Êtes-vous sûr de vouloir supprimer le dossier "${record.nom}" ?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        await deleteDossier(record.id);
      }
    });
  };

  const handleSubmit = async (values) => {
    if (editingDossier) {
      await updateDossier(editingDossier.id, values);
    } else {
      await createDossier(values);
    }
  };

  // Trouver le nom de la classe
  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : `Classe ${classeId}`;
  };

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
        <Title level={2} style={{ marginBottom: '8px' }}>Dossiers à Fournir</Title>
        <Text style={{ color: '#666' }}>Gérez les documents requis pour l'inscription par classe</Text>
      </div>

      {/* Statistiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic 
              title="Total Documents" 
              value={dossiers.length} 
              prefix={<FolderOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic 
              title="Classes Concernées" 
              value={new Set(dossiers.map(d => d.classeId)).size} 
              prefix={<BookOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic 
              title="Documents Actifs" 
              value={dossiers.length} 
              prefix={<FileTextOutlined style={{ color: '#faad14' }} />} 
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
              placeholder="Rechercher un document ou une classe..."
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
              onClick={() => {
                setModalOpen(true);
                setEditingDossier(null);
                form.resetFields();
              }}
              style={{ width: '100%' }}
            >
              Nouveau Document
            </Button>
          </Col>
        </Row>

        {/* Tableau */}
        <Table
          columns={[
            {
              title: 'Document à fournir',
              dataIndex: 'nom',
              key: 'nom',
              render: (nom) => (
                <div style={{ maxWidth: '400px' }}>
                  <Text style={{ fontSize: '14px' }}>{nom}</Text>
                </div>
              ),
              responsive: ['xs', 'sm', 'md', 'lg', 'xl']
            },
            {
              title: 'Classe',
              key: 'classe',
              render: (_, record) => (
                <Tag color="blue" style={{ fontSize: '14px' }}>
                  {getClassName(record.classeId)}
                </Tag>
              ),
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
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                    title="Modifier"
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
          ]}
          dataSource={dossiers.filter(dossier =>
            dossier.nom?.toLowerCase().includes(search.toLowerCase()) ||
            getClassName(dossier.classeId).toLowerCase().includes(search.toLowerCase())
          )}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} documents`
          }}
          scroll={{ x: 700 }}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        />
      </Card>

      {/* Drawer pour les détails */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOutlined />
            <span>Document à Fournir</span>
          </div>
        }
        placement="right"
        width={500}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedDossier && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Document">
                <Text style={{ fontWeight: 'bold' }}>{selectedDossier.nom}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Classe concernée">
                <Tag color="blue" style={{ fontSize: '14px' }}>
                  {getClassName(selectedDossier.classeId)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ID Classe">
                {selectedDossier.classeId}
              </Descriptions.Item>
              <Descriptions.Item label="ID Document">
                {selectedDossier.id}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>

      {/* Modal pour ajouter/modifier */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editingDossier ? <EditOutlined /> : <PlusOutlined />}
            <span>
              {editingDossier ? 'Modifier le document' : 'Nouveau document à fournir'}
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingDossier(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="nom"
            label="Document à fournir"
            rules={[{ required: true, message: 'Le nom du document est requis' }]}
          >
            <TextArea
              rows={3}
              placeholder="Décrivez le document à fournir..."
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            name="classeId"
            label="Classe concernée"
            rules={[{ required: true, message: 'La classe est requise' }]}
          >
            <select
              style={{
                width: '100%',
                height: '40px',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#fff',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onChange={(e) => {
                const value = e.target.value;
                form.setFieldsValue({ classeId: parseInt(value) });
              }}
              defaultValue={editingDossier?.classeId || ''}
              onFocus={(e) => e.target.style.borderColor = '#40a9ff'}
              onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
            >
              <option value="">Sélectionnez une classe</option>
              {classes.map(classe => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  setEditingDossier(null);
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
              >
                {editingDossier ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
