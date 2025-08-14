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
  InputNumber
} from 'antd';
import { 
  DollarOutlined, 
  BookOutlined, 
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function TarifsPage() {
  const [loading, setLoading] = useState(false);
  const [tarifs, setTarifs] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTarif, setSelectedTarif] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTarif, setEditingTarif] = useState(null);
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
        loadTarifs(),
        loadClasses()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      message.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadTarifs = async () => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      
      console.log('Chargement des tarifs pour l\'école:', ecoleId);
      
      const response = await fetch(`/api/ecoles/${ecoleId}/tarifs`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Réponse tarifs:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('Données tarifs reçues:', data);
        setTarifs(data);
      } else {
        // Mode démonstration si serveur indisponible
        console.log('Serveur non disponible, utilisation des données de démonstration');
        setTarifs([
          { id: 1, tarif: 15000, classeId: 1, classe: { nom: 'CP-A' } },
          { id: 2, tarif: 16000, classeId: 2, classe: { nom: 'CP-B' } },
          { id: 3, tarif: 17000, classeId: 3, classe: { nom: 'CE1-A' } },
          { id: 4, tarif: 18000, classeId: 4, classe: { nom: 'CE2-A' } },
          { id: 5, tarif: 19000, classeId: 5, classe: { nom: 'CM1-A' } }
        ]);
        message.warning('Serveur non disponible - Mode démonstration activé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tarifs:', error);
      // Mode démonstration en cas d'erreur
      setTarifs([
        { id: 1, tarif: 15000, classeId: 1, classe: { nom: 'CP-A' } },
        { id: 2, tarif: 16000, classeId: 2, classe: { nom: 'CP-B' } },
        { id: 3, tarif: 17000, classeId: 3, classe: { nom: 'CE1-A' } }
      ]);
      message.warning('Serveur non disponible - Mode démonstration activé');
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

  // Créer un tarif
  const createTarif = async (values) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;

      const response = await fetch(`https://mon-api-aspnet.onrender.com/api/ecoles/${ecoleId}/tarifs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          tarif: values.tarif,
          classeId: values.classeId
        })
      });

      if (response.ok) {
        message.success('Tarif créé avec succès');
        loadTarifs();
        setModalOpen(false);
        form.resetFields();
      } else {
        const error = await response.json();
        message.error(error.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la création');
    }
  };

  // Modifier un tarif
  const updateTarif = async (id, values) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;

      const response = await fetch(`https://mon-api-aspnet.onrender.com/api/ecoles/${ecoleId}/tarifs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          tarif: values.tarif,
          classeId: values.classeId
        })
      });

      if (response.ok) {
        message.success('Tarif modifié avec succès');
        loadTarifs();
        setModalOpen(false);
        form.resetFields();
        setEditingTarif(null);
      } else {
        const error = await response.text();
        console.error('Erreur modification tarif:', error);
        message.error('Erreur lors de la modification du tarif');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la modification');
    }
  };

  // Supprimer un tarif
  const deleteTarif = async (id) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;

      const response = await fetch(`https://mon-api-aspnet.onrender.com/api/ecoles/${ecoleId}/tarifs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        message.success('Tarif supprimé avec succès');
        loadTarifs();
      } else {
        const error = await response.text();
        console.error('Erreur suppression tarif:', error);
        message.error('Erreur lors de la suppression du tarif');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la suppression');
    }
  };

  // Handlers
  const handleView = (record) => {
    setSelectedTarif(record);
    setDrawerOpen(true);
  };

  const handleEdit = (record) => {
    setEditingTarif(record);
    setModalOpen(true);
    form.setFieldsValue(record);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Supprimer le tarif',
      content: `Êtes-vous sûr de vouloir supprimer le tarif de ${record.tarif} FCFA pour la classe ${getClassName(record.classeId)} ?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        await deleteTarif(record.id);
      }
    });
  };

  const handleSubmit = async (values) => {
    if (editingTarif) {
      await updateTarif(editingTarif.id, values);
    } else {
      await createTarif(values);
    }
  };

  // Trouver le nom de la classe
  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : `Classe ${classeId}`;
  };

  // Formatage du prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
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
        <Title level={2} style={{ marginBottom: '8px' }}>Gestion des Tarifs</Title>
        <Text style={{ color: '#666' }}>Gérez les tarifs de scolarité par classe</Text>
      </div>

      {/* Statistiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic 
              title="Total Tarifs" 
              value={tarifs.length} 
              prefix={<DollarOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic 
              title="Tarif Moyen" 
              value={tarifs.length > 0 ? Math.round(tarifs.reduce((sum, t) => sum + t.tarif, 0) / tarifs.length) : 0}
              suffix="FCFA"
              prefix={<BookOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic 
              title="Tarif Maximum" 
              value={tarifs.length > 0 ? Math.max(...tarifs.map(t => t.tarif)) : 0}
              suffix="FCFA"
              prefix={<DollarOutlined style={{ color: '#faad14' }} />} 
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
              placeholder="Rechercher par classe..."
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
                setEditingTarif(null);
                form.resetFields();
              }}
              style={{ width: '100%' }}
            >
              Nouveau Tarif
            </Button>
          </Col>
        </Row>

        {/* Tableau */}
        <Table
          columns={[
            {
              title: 'Classe',
              key: 'classe',
              render: (_, record) => (
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {getClassName(record.classeId)}
                  </div>
                </div>
              ),
              responsive: ['xs', 'sm', 'md', 'lg', 'xl']
            },
            {
              title: 'Tarif',
              dataIndex: 'tarif',
              key: 'tarif',
              render: (tarif) => (
                <Tag color="green" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {formatPrice(tarif)}
                </Tag>
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
          ]}
          dataSource={tarifs.filter(tarif =>
            getClassName(tarif.classeId).toLowerCase().includes(search.toLowerCase())
          )}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} tarifs`
          }}
          scroll={{ x: 600 }}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        />
      </Card>

      {/* Drawer pour les détails */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarOutlined />
            <span>Tarif - {selectedTarif && getClassName(selectedTarif.classeId)}</span>
          </div>
        }
        placement="right"
        width={480}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedTarif && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Classe">
                <span style={{ fontWeight: 'bold' }}>{getClassName(selectedTarif.classeId)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Tarif">
                <Tag color="green" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {formatPrice(selectedTarif.tarif)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ID Classe">
                {selectedTarif.classeId}
              </Descriptions.Item>
              <Descriptions.Item label="ID Tarif">
                {selectedTarif.id}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>

      {/* Modal pour ajouter/modifier */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editingTarif ? <EditOutlined /> : <PlusOutlined />}
            <span>
              {editingTarif ? 'Modifier le tarif' : 'Nouveau tarif'}
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingTarif(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="classeId"
            label="Classe"
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
              defaultValue={editingTarif?.classeId || ''}
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

          <Form.Item
            name="tarif"
            label="Tarif (FCFA)"
            rules={[{ required: true, message: 'Le tarif est requis' }]}
          >
            <InputNumber
              size="large"
              placeholder="Montant en FCFA"
              min={0}
              max={1000000}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              parser={value => value.replace(/\s?/g, '')}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  setEditingTarif(null);
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
                {editingTarif ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
