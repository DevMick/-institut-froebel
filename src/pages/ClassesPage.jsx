import { useState, useEffect } from 'react';
import { 
  Card, 
  Table,
  Button,
  Input,
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

} from 'antd';
import {
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import '../styles/LoginPage.css'; // Pour les styles du select personnalisé
import classesApi from '../services/classesApi';

const { Title, Text } = Typography;

export default function ClassesPage() {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
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
      await loadClasses();
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
      const ecoleId = user.ecoleId || 1;

      console.log('Chargement des classes pour l\'école:', ecoleId);

      const result = await classesApi.getClassesByEcole(ecoleId);
      console.log('Classes chargées:', result);

      if (result.success && Array.isArray(result.data)) {
        setClasses(result.data);
        message.success(`${result.data.length} classes chargées`);
      } else {
        // Mode démonstration si serveur indisponible
        console.log('Serveur non disponible, utilisation des données de démonstration');
        setClasses([
          { id: 1, nom: 'CP-A' },
          { id: 2, nom: 'CP-B' },
          { id: 3, nom: 'CE1-A' },
          { id: 4, nom: 'CE2-A' },
          { id: 5, nom: 'CM1-A' }
        ]);
        message.warning('Serveur non disponible - Mode démonstration activé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
      // Mode démonstration en cas d'erreur
      setClasses([
        { id: 1, nom: 'CP-A' },
        { id: 2, nom: 'CP-B' },
        { id: 3, nom: 'CE1-A' }
      ]);
      message.warning('Serveur non disponible - Mode démonstration activé');
    }
  };



  // Créer une classe
  const createClass = async (values) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 1;

      const result = await classesApi.createClasse(ecoleId, { nom: values.nom });

      if (result.success) {
        message.success('Classe créée avec succès');
        loadClasses();
        setModalOpen(false);
        form.resetFields();
      } else {
        message.error(result.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la création');
    }
  };

  // Modifier une classe
  const updateClass = async (id, values) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 1;

      const result = await classesApi.updateClasse(ecoleId, id, { nom: values.nom });

      if (result.success) {
        message.success('Classe modifiée avec succès');
        loadClasses();
        setModalOpen(false);
        form.resetFields();
        setEditingClass(null);
      } else {
        console.error('Erreur modification classe:', result.message);
        message.error(result.message || 'Erreur lors de la modification de la classe');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la modification');
    }
  };

  // Supprimer une classe
  const deleteClass = async (id) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 1;

      const result = await classesApi.deleteClasse(ecoleId, id);

      if (result.success) {
        message.success('Classe supprimée avec succès');
        loadClasses();
      } else {
        console.error('Erreur suppression classe:', result.message);
        message.error(result.message || 'Erreur lors de la suppression de la classe');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la suppression');
    }
  };

  // Handlers
  const handleView = (record) => {
    setSelectedClass(record);
    setDrawerOpen(true);
  };

  const handleEdit = (record) => {
    setEditingClass(record);
    setModalOpen(true);
    form.setFieldsValue(record);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Supprimer la classe',
      content: `Êtes-vous sûr de vouloir supprimer la classe ${record.nom} ?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        await deleteClass(record.id);
      }
    });
  };

  const handleSubmit = async (values) => {
    if (editingClass) {
      await updateClass(editingClass.id, values);
    } else {
      await createClass(values);
    }
  };



  // Colonnes du tableau
  const columns = [
    {
      title: 'Nom de la classe',
      dataIndex: 'nom',
      key: 'nom',
      render: (nom) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{nom}</div>
        </div>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
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
  ];

  // Filtrage des données
  const filteredClasses = classes.filter(classe =>
    classe.nom?.toLowerCase().includes(search.toLowerCase())
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
        <Title level={2} style={{ marginBottom: '8px' }}>Gestion des Classes</Title>
        <Text style={{ color: '#666' }}>Gérez les classes de votre établissement</Text>
      </div>

      {/* Statistiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic 
              title="Total Classes" 
              value={classes.length} 
              prefix={<BookOutlined style={{ color: '#1890ff' }} />} 
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
              placeholder="Rechercher une classe..."
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
                setEditingClass(null);
                form.resetFields();
              }}
              style={{ width: '100%' }}
            >
              Nouvelle Classe
            </Button>
          </Col>
        </Row>

        {/* Tableau */}
        <Table
          columns={columns}
          dataSource={filteredClasses}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} classes`
          }}
          scroll={{ x: 800 }}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        />
      </Card>

      {/* Drawer pour les détails */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOutlined />
            <span>Classe - {selectedClass?.nom}</span>
          </div>
        }
        placement="right"
        width={480}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedClass && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Nom de la classe">
                <span style={{ fontWeight: 'bold' }}>{selectedClass.nom}</span>
              </Descriptions.Item>
              {selectedClass.createdAt && (
                <Descriptions.Item label="Créée le">
                  {new Date(selectedClass.createdAt).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Drawer>

      {/* Modal pour ajouter/modifier */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editingClass ? <EditOutlined /> : <PlusOutlined />}
            <span>
              {editingClass ? 'Modifier la classe' : 'Nouvelle classe'}
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingClass(null);
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
            label="Nom de la classe"
            rules={[{ required: true, message: 'Le nom de la classe est requis' }]}
          >
            <Input size="large" placeholder="Ex: CP-A, CE1-B..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  setEditingClass(null);
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
                {editingClass ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
