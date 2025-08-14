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
  Select,
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
  TeamOutlined,
  UserOutlined,
  PlusOutlined,
  CrownOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import '../styles/LoginPage.css'; // Pour les styles du select personnalisé
const { Title, Text } = Typography;

export default function PersonnelPage() {
  const [loading, setLoading] = useState(false);
  const [administrators, setAdministrators] = useState([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState(null);
  const [form] = Form.useForm();

  // Handlers
  const handleView = (record, type) => {
    setSelectedPersonnel({ ...record, type });
    setDrawerOpen(true);
  };

  const handleEdit = (record, type) => {
    setEditingPersonnel({ ...record, type });
    setModalOpen(true);
    form.setFieldsValue(record);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: `Supprimer l'administrateur`,
      content: `Êtes-vous sûr de vouloir supprimer ${record.prenom} ${record.nom} ?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        await deleteAdministrator(record.id);
      }
    });
  };

  const handleSubmit = async (values) => {
    if (editingPersonnel) {
      await updateAdministrator(editingPersonnel.id, values);
    } else {
      await createAdministrator(values);
    }
  };

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
      await loadAdministrators();
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      message.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadAdministrators = async () => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 1; // Utiliser l'école de l'utilisateur connecté

      console.log('Chargement des administrateurs pour l\'école:', ecoleId);
      console.log('Token utilisé:', getToken());

      // Utiliser l'endpoint spécifié pour récupérer les utilisateurs de l'école
      const response = await fetch(`/api/auth/school/${ecoleId}/users`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });

      console.log('Réponse administrateurs:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('Données administrateurs reçues:', data);

        // Extraire le tableau users de la réponse
        const users = data.users || data || [];
        console.log('Utilisateurs extraits:', users);

        // Filtrer seulement les administrateurs et super administrateurs
        const admins = users.filter(user =>
          user.roles?.includes('Admin') ||
          user.roles?.includes('SuperAdmin')
        );

        console.log('Administrateurs filtrés:', admins);
        setAdministrators(admins);
      } else {
        const errorData = await response.text();
        console.error('Erreur réponse administrateurs:', response.status, errorData);

        // Si le serveur n'est pas disponible, utiliser des données de démonstration
        if (response.status === 0 || response.status >= 500) {
          console.log('Serveur non disponible, utilisation des données de démonstration');
          setAdministrators([
            {
              id: 1,
              nom: 'Dupont',
              prenom: 'Marie',
              email: 'admin.test@institutfroebel.com',
              telephone: '0123456789',
              roles: ['Admin'],
              adresse: '123 Rue de l\'École, 75001 Paris'
            }
          ]);
          message.warning('Serveur non disponible - Mode démonstration activé');
        } else {
          message.error(`Erreur lors du chargement des administrateurs: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des administrateurs:', error);

      // Si erreur de réseau, utiliser des données de démonstration
      if (error.message.includes('fetch') || error.message.includes('Network')) {
        console.log('Erreur réseau, utilisation des données de démonstration');
        setAdministrators([
          {
            id: 1,
            nom: 'Dupont',
            prenom: 'Marie',
            email: 'admin.test@institutfroebel.com',
            telephone: '0123456789',
            roles: ['Admin'],
            adresse: '123 Rue de l\'École, 75001 Paris'
          }
        ]);
        message.warning('Serveur non disponible - Mode démonstration activé');
      } else {
        message.error('Erreur de connexion lors du chargement des administrateurs');
      }
    }
  };





  // Créer un administrateur
  const createAdministrator = async (values) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 1;

      const response = await fetch('http://localhost:5000/api/auth/register/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ecoleId,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          nom: values.nom,
          prenom: values.prenom,
          telephone: values.telephone,
          adresse: values.adresse
        })
      });

      if (response.ok) {
        message.success('Administrateur créé avec succès');
        loadAdministrators();
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



  // Modifier un administrateur
  const updateAdministrator = async (id, values) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 1;

      console.log('Modification administrateur:', id, values);

      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'Accept': '*/*'
        },
        body: JSON.stringify({
          nom: values.nom,
          prenom: values.prenom,
          email: values.email,
          telephone: values.telephone,
          adresse: values.adresse
        })
      });

      if (response.ok) {
        message.success('Administrateur modifié avec succès');
        loadAdministrators();
        setModalOpen(false);
        form.resetFields();
        setEditingPersonnel(null);
      } else {
        const error = await response.text();
        console.error('Erreur modification admin:', error);
        message.error('Erreur lors de la modification de l\'administrateur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la modification');
    }
  };



  // Supprimer un administrateur
  const deleteAdministrator = async (id) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 1;

      console.log('Suppression administrateur:', id);

      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': '*/*'
        }
      });

      if (response.ok) {
        message.success('Administrateur supprimé avec succès');
        loadAdministrators();
      } else {
        const error = await response.text();
        console.error('Erreur suppression admin:', error);
        message.error('Erreur lors de la suppression de l\'administrateur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la suppression');
    }
  };



  // Colonnes pour les administrateurs
  const adminColumns = [
    {
      title: 'Nom',
      key: 'nom',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.prenom} {record.nom}</div>
          <div className="text-sm text-gray-500">{record.email}</div>
        </div>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    },
    {
      title: 'Téléphone',
      dataIndex: 'telephone',
      key: 'telephone',
      responsive: ['md', 'lg', 'xl']
    },
    {
      title: 'Rôles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles) => (
        <div>
          {roles?.map((role, index) => (
            <Tag key={index} color="orange" className="mb-1">{role}</Tag>
          ))}
        </div>
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
            onClick={() => handleView(record, 'admin')}
            title="Voir les détails"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record, 'admin')}
            title="Modifier"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record, 'admin')}
            danger
            title="Supprimer"
          />
        </Space>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    }
  ];



  // Filtrage des données
  const filteredAdmins = administrators.filter(a =>
    a.nom?.toLowerCase().includes(search.toLowerCase()) ||
    a.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <Title level={2} className="mb-2">Gestion du Personnel</Title>
        <Text className="text-gray-600">Gérez les administrateurs de votre établissement</Text>
      </div>

      {/* Statistiques */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Total Personnel"
              value={administrators.length}
              prefix={<TeamOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Administrateurs"
              value={administrators.length}
              prefix={<CrownOutlined className="text-orange-500" />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Personnel Actif"
              value={administrators.length}
              prefix={<UserOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Section Administrateurs */}
      <Card className="shadow-sm">
        <div className="mb-4">
          <Title level={3} className="mb-4 flex items-center gap-2">
            <CrownOutlined />
            Administrateurs
          </Title>

          {/* Barre d'actions */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} md={16}>
              <Input.Search
                placeholder="Rechercher un administrateur..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
                size="large"
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={8} className="text-right">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => {
                  setModalOpen(true);
                  setEditingPersonnel(null);
                  form.resetFields();
                }}
                className="w-full md:w-auto"
              >
                Nouvel Administrateur
              </Button>
            </Col>
          </Row>

          {/* Tableau */}
          <Table
            columns={adminColumns}
            dataSource={filteredAdmins}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} administrateurs`
            }}
            scroll={{ x: 800 }}
            className="shadow-sm"
          />
        </div>
      </Card>

      {/* Drawer pour les détails */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <CrownOutlined />
            <span>
              Administrateur - {selectedPersonnel?.prenom} {selectedPersonnel?.nom}
            </span>
          </div>
        }
        placement="right"
        width={480}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedPersonnel && (
          <div className="space-y-4">
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Nom complet">
                <span className="font-medium">{selectedPersonnel.prenom} {selectedPersonnel.nom}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Email">{selectedPersonnel.email}</Descriptions.Item>
              <Descriptions.Item label="Téléphone">{selectedPersonnel.telephone}</Descriptions.Item>
              {selectedPersonnel.adresse && (
                <Descriptions.Item label="Adresse">{selectedPersonnel.adresse}</Descriptions.Item>
              )}

              {selectedPersonnel.type === 'admin' && (
                <Descriptions.Item label="Rôles">
                  <div className="space-y-1">
                    {selectedPersonnel.roles?.map((role, index) => (
                      <Tag key={index} color="orange">{role}</Tag>
                    ))}
                  </div>
                </Descriptions.Item>
              )}

              {selectedPersonnel.createdAt && (
                <Descriptions.Item label="Créé le">
                  {new Date(selectedPersonnel.createdAt).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Drawer>

      {/* Modal pour ajouter/modifier */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            {editingPersonnel ? <EditOutlined /> : <PlusOutlined />}
            <span>
              {editingPersonnel ?
                `Modifier l'administrateur` :
                `Nouvel administrateur`
              }
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingPersonnel(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="prenom"
                label="Prénom"
                rules={[{ required: true, message: 'Le prénom est requis' }]}
              >
                <Input size="large" placeholder="Entrez le prénom" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="nom"
                label="Nom"
                rules={[{ required: true, message: 'Le nom est requis' }]}
              >
                <Input size="large" placeholder="Entrez le nom" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'L\'email est requis' },
              { type: 'email', message: 'Format d\'email invalide' }
            ]}
          >
            <Input size="large" placeholder="exemple@institutfroebel.com" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="telephone"
                label="Téléphone"
                rules={[{ required: true, message: 'Le téléphone est requis' }]}
              >
                <Input size="large" placeholder="0123456789" />
              </Form.Item>
            </Col>

          </Row>

          <Form.Item
            name="adresse"
            label="Adresse"
            rules={[{ required: true, message: 'L\'adresse est requise' }]}
          >
            <Input.TextArea
              size="large"
              placeholder="Entrez l'adresse complète"
              rows={3}
            />
          </Form.Item>

          {!editingPersonnel && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="password"
                  label="Mot de passe"
                  rules={[{ required: true, message: 'Le mot de passe est requis' }]}
                >
                  <Input.Password size="large" placeholder="Mot de passe" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="confirmPassword"
                  label="Confirmer le mot de passe"
                  rules={[
                    { required: true, message: 'Confirmez le mot de passe' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                      },
                    }),
                  ]}
                >
                  <Input.Password size="large" placeholder="Confirmez le mot de passe" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item className="mb-0 mt-6">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setModalOpen(false);
                  setEditingPersonnel(null);
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
                {editingPersonnel ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}