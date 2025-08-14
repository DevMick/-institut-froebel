import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Popconfirm,
  Drawer
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MessageOutlined,
  BellOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CommunicationPage() {
  const [loading, setLoading] = useState(false);
  const [annonces, setAnnonces] = useState([]);
  const [classes, setClasses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [editingAnnonce, setEditingAnnonce] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedClasseId, setSelectedClasseId] = useState('');
  const [form] = Form.useForm();
  const [statistiques, setStatistiques] = useState({});

  // Fonctions utilitaires
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
    loadAnnonces();
    loadClasses();
  }, []);

  // Calculer les statistiques quand les annonces changent
  useEffect(() => {
    calculateStatistics();
  }, [annonces]);

  const loadClasses = async () => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 1;
      const token = getToken();

      if (!token || token === 'null') {
        // Mode démonstration pour les classes
        setClasses([
          { id: 1, nom: 'CP A' },
          { id: 2, nom: 'CP B' },
          { id: 3, nom: 'CE1' },
          { id: 4, nom: 'CE2' },
          { id: 5, nom: 'CM1' },
          { id: 6, nom: 'CM2' }
        ]);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const classesData = Array.isArray(data) ? data : data.data || [];
        setClasses(classesData);
      } else {
        // Mode démonstration en cas d'erreur
        setClasses([
          { id: 1, nom: 'CP A' },
          { id: 2, nom: 'CP B' },
          { id: 3, nom: 'CE1' },
          { id: 4, nom: 'CE2' },
          { id: 5, nom: 'CM1' },
          { id: 6, nom: 'CM2' }
        ]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
      setClasses([]);
    }
  };

  const loadAnnonces = async () => {
    try {
      setLoading(true);
      const user = getUser();
      const ecoleId = user.ecoleId || 1;
      const token = getToken();

      if (!token || token === 'null') {
        message.error('Vous devez être connecté pour accéder à cette page');
        return;
      }

      console.log('🔄 Chargement des annonces...');
      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/annonces`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Annonces chargées:', data);
        setAnnonces(Array.isArray(data) ? data : data.data || []);
      } else if (response.status === 401) {
        message.error('Session expirée. Veuillez vous reconnecter.');
      } else {
        console.error('Erreur lors du chargement des annonces:', response.status);
        // Utiliser des données de démonstration en cas d'erreur
        setAnnonces([
          {
            id: 1,
            titre: "Réunion parents-professeurs",
            contenu: "Une réunion importante aura lieu le vendredi 15 décembre à 18h en salle polyvalente.",
            type: "information",
            datePublication: "2024-12-01T10:00:00Z",
            classeId: 1,
            auteur: "Marie Dupont"
          },
          {
            id: 2,
            titre: "Sortie pédagogique au musée",
            contenu: "Les élèves de CE1 participeront à une sortie éducative au Musée National le 20 décembre.",
            type: "activite",
            datePublication: "2024-11-28T09:00:00Z",
            classeId: 3,
            auteur: "Jean Martin"
          },
          {
            id: 3,
            titre: "URGENT - Fermeture exceptionnelle",
            contenu: "L'école sera fermée exceptionnellement le lundi 18 décembre en raison de travaux d'urgence.",
            type: "urgent",
            datePublication: "2024-12-05T08:00:00Z",
            auteur: "Direction"
          }
        ]);
        message.warning('Serveur non disponible - Mode démonstration activé');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = () => {
    const stats = {
      totalAnnonces: annonces.length,
      annoncesUrgentes: annonces.filter(a => a.type === 'urgent').length,
      annoncesInformation: annonces.filter(a => a.type === 'information').length,
      annoncesActivite: annonces.filter(a => a.type === 'activite').length,
      annoncesCeMois: annonces.filter(a => {
        const datePublication = new Date(a.datePublication);
        const maintenant = new Date();
        return datePublication.getMonth() === maintenant.getMonth() && 
               datePublication.getFullYear() === maintenant.getFullYear();
      }).length
    };
    setStatistiques(stats);
  };

  const handleCreate = () => {
    setEditingAnnonce(null);
    form.resetFields();
    setSelectedType('information');
    setSelectedClasseId('toutes');
    form.setFieldsValue({
      type: 'information',
      datePublication: dayjs(),
      classeId: 'toutes'
    });
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingAnnonce(record);
    setSelectedType(record.type || 'information');
    setSelectedClasseId(record.classeId ? record.classeId.toString() : 'toutes');
    form.setFieldsValue({
      ...record,
      datePublication: dayjs(record.datePublication),
      classeId: record.classeId ? record.classeId.toString() : 'toutes'
    });
    setModalOpen(true);
  };

  const handleView = (record) => {
    setSelectedAnnonce(record);
    setDrawerOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 1;
      const token = getToken();

      if (!token || token === 'null') {
        message.error('Vous devez être connecté pour effectuer cette action');
        return;
      }

      const requestBody = {
        titre: values.titre,
        contenu: values.contenu,
        type: values.type,
        datePublication: values.datePublication.toISOString()
      };

      // Ajouter classeId seulement si une classe spécifique est sélectionnée
      if (values.classeId && values.classeId !== 'toutes') {
        requestBody.classeId = parseInt(values.classeId);
      }

      console.log('📤 Envoi requête annonce:', requestBody);

      let response;
      if (editingAnnonce) {
        // Modification
        response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/annonces/${editingAnnonce.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      } else {
        // Création
        response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/annonces`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      }

      if (response.ok) {
        const result = await response.json();
        message.success(editingAnnonce ? 'Annonce modifiée avec succès' : 'Annonce créée avec succès');
        console.log('✅ Résultat:', result);
        
        // Recharger les données
        loadAnnonces();
        
        // Fermer le modal
        setModalOpen(false);
        form.resetFields();
        setEditingAnnonce(null);
      } else if (response.status === 401) {
        message.error('Session expirée. Veuillez vous reconnecter.');
      } else {
        const error = await response.json();
        message.error(error.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 1;
      const token = getToken();

      if (!token || token === 'null') {
        message.error('Vous devez être connecté pour effectuer cette action');
        return;
      }

      console.log('🗑️ Suppression annonce:', id);
      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/annonces/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        message.success('Annonce supprimée avec succès');
        loadAnnonces();
      } else if (response.status === 401) {
        message.error('Session expirée. Veuillez vous reconnecter.');
      } else {
        const error = await response.json();
        message.error(error.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la suppression');
    }
  };

  // Configuration des colonnes du tableau
  const columns = [
    {
      title: 'Titre',
      dataIndex: 'titre',
      key: 'titre',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.auteur} • {dayjs(record.datePublication).format('DD/MM/YYYY HH:mm')}
          </Text>
        </div>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = {
          'urgent': 'red',
          'information': 'blue',
          'activite': 'green'
        };
        const labels = {
          'urgent': 'Urgent',
          'information': 'Information',
          'activite': 'Activité'
        };
        return <Tag color={colors[type]}>{labels[type]}</Tag>;
      },
      responsive: ['sm', 'md', 'lg', 'xl']
    },
    {
      title: 'Classe Cible',
      dataIndex: 'classeId',
      key: 'classeId',
      render: (classeId) => {
        if (!classeId) return 'Toutes les classes';
        const classe = classes.find(c => c.id === classeId);
        return classe ? classe.nom : 'Classe inconnue';
      },
      responsive: ['md', 'lg', 'xl']
    },
    {
      title: 'Contenu',
      dataIndex: 'contenu',
      key: 'contenu',
      render: (text) => (
        <Text ellipsis style={{ maxWidth: '200px' }}>
          {text}
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
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Modifier"
            style={{ color: '#1890ff' }}
          />
          <Popconfirm
            title="Supprimer cette annonce ?"
            description="Cette action est irréversible."
            onConfirm={() => handleDelete(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
            okType="danger"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              title="Supprimer"
              style={{ color: '#ff4d4f' }}
            />
          </Popconfirm>
        </Space>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>Communication</Title>
        <Text style={{ color: '#666' }}>Gérez les annonces et communications de l'école</Text>
      </div>

      {/* Statistiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Total Annonces"
              value={statistiques.totalAnnonces || 0}
              prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Annonces Urgentes"
              value={statistiques.annoncesUrgentes || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Ce Mois"
              value={statistiques.annoncesCeMois || 0}
              prefix={<BellOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Activités"
              value={statistiques.annoncesActivite || 0}
              prefix={<FileTextOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Interface principale */}
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Liste des Annonces</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Nouvelle Annonce
          </Button>
        </div>

        {/* Tableau */}
        <Table
          columns={columns}
          dataSource={annonces}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} annonces`
          }}
          scroll={{ x: 1000 }}
          loading={loading}
          locale={{
            emptyText: (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📢</div>
                <Text style={{ fontSize: '16px', color: '#666' }}>
                  Aucune annonce trouvée
                </Text>
                <div style={{ marginTop: '8px' }}>
                  <Text style={{ fontSize: '12px', color: '#999' }}>
                    Créez votre première annonce pour commencer
                  </Text>
                </div>
              </div>
            )
          }}
        />
      </Card>

      {/* Modal de création/modification */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageOutlined />
            <span>{editingAnnonce ? 'Modifier l\'Annonce' : 'Nouvelle Annonce'}</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingAnnonce(null);
          setSelectedType('');
          setSelectedClasseId('');
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '16px' }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="titre"
                label="Titre de l'Annonce"
                rules={[
                  { required: true, message: 'Le titre est requis' },
                  { max: 100, message: 'Le titre ne peut pas dépasser 100 caractères' }
                ]}
              >
                <Input
                  size="large"
                  placeholder="Ex: Réunion parents-professeurs"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="Type d'Annonce"
                rules={[{ required: true, message: 'Le type est requis' }]}
              >
                <div className="select-with-icon-html">
                  <MessageOutlined className="select-icon-html" />
                  <select
                    className="modern-select-html"
                    style={{ height: '40px' }}
                    value={selectedType}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedType(value);
                      form.setFieldsValue({ type: value });
                    }}
                  >
                    <option value="">Sélectionner le type</option>
                    <option value="information">📋 Information</option>
                    <option value="activite">🎯 Activité</option>
                    <option value="urgent">⚠️ Urgent</option>
                  </select>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="classeId"
                label="Classe Cible"
                rules={[{ required: true, message: 'La classe cible est requise' }]}
              >
                <div className="select-with-icon-html">
                  <TeamOutlined className="select-icon-html" />
                  <select
                    className="modern-select-html"
                    style={{ height: '40px' }}
                    value={selectedClasseId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedClasseId(value);
                      form.setFieldsValue({ classeId: value });
                    }}
                  >
                    <option value="">Sélectionner la classe</option>
                    <option value="toutes">Toutes les classes</option>
                    {classes.map(classe => (
                      <option key={classe.id} value={classe.id}>
                        {classe.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="datePublication"
                label="Date de Publication"
                rules={[{ required: true, message: 'La date de publication est requise' }]}
              >
                <DatePicker
                  size="large"
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  placeholder="Sélectionner la date"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="contenu"
            label="Contenu de l'Annonce"
            rules={[
              { required: true, message: 'Le contenu est requis' },
              { min: 10, message: 'Le contenu doit contenir au moins 10 caractères' }
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Rédigez le contenu de votre annonce..."
              showCount
              maxLength={1000}
            />
          </Form.Item>



          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae7ff',
            borderRadius: '6px'
          }}>
            <Text style={{ fontSize: '12px', color: '#0050b3' }}>
              💡 <strong>Information :</strong> {editingAnnonce ?
                'Les modifications seront visibles immédiatement après validation.' :
                'L\'annonce sera publiée à la date sélectionnée. Si aucune classe n\'est spécifiée, elle sera visible par toute l\'école.'
              }
            </Text>
          </div>

          <div style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}>
            <Button
              onClick={() => {
                setModalOpen(false);
                form.resetFields();
                setEditingAnnonce(null);
                setSelectedType('');
                setSelectedClasseId('');
              }}
            >
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={editingAnnonce ? <EditOutlined /> : <PlusOutlined />}
            >
              {editingAnnonce ? 'Mettre à Jour' : 'Créer l\'Annonce'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Drawer pour les détails */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageOutlined />
            <span>Détails de l'Annonce</span>
          </div>
        }
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={600}
      >
        {selectedAnnonce && (
          <div>
            {/* En-tête de l'annonce */}
            <Card size="small" style={{ marginBottom: '16px', background: '#f6f8fa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Title level={4} style={{ margin: 0, marginBottom: '8px' }}>
                    {selectedAnnonce.titre}
                  </Title>
                  <Space size="small" wrap>
                    <Tag color={
                      selectedAnnonce.type === 'urgent' ? 'red' :
                      selectedAnnonce.type === 'information' ? 'blue' : 'green'
                    }>
                      {selectedAnnonce.type === 'urgent' ? 'Urgent' :
                       selectedAnnonce.type === 'information' ? 'Information' : 'Événement'}
                    </Tag>
                    <Text type="secondary">
                      {dayjs(selectedAnnonce.datePublication).format('DD/MM/YYYY à HH:mm')}
                    </Text>
                  </Space>
                </div>
              </div>
            </Card>

            {/* Informations détaillées */}
            <Card title="Informations" size="small" style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Auteur :</Text>
                  <br />
                  <Text>{selectedAnnonce.auteur}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Classe Cible :</Text>
                  <br />
                  <Text>
                    {selectedAnnonce.classeId ?
                      (classes.find(c => c.id === selectedAnnonce.classeId)?.nom || 'Classe inconnue') :
                      'Toutes les classes'
                    }
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Type :</Text>
                  <br />
                  <Tag color={
                    selectedAnnonce.type === 'urgent' ? 'red' :
                    selectedAnnonce.type === 'information' ? 'blue' : 'green'
                  }>
                    {selectedAnnonce.type === 'urgent' ? 'Urgent' :
                     selectedAnnonce.type === 'information' ? 'Information' : 'Activité'}
                  </Tag>
                </Col>
              </Row>
            </Card>

            {/* Contenu */}
            <Card title="Contenu" size="small" style={{ marginBottom: '16px' }}>
              <div style={{
                padding: '12px',
                backgroundColor: '#fafafa',
                borderRadius: '6px',
                lineHeight: '1.6'
              }}>
                <Text>{selectedAnnonce.contenu}</Text>
              </div>
            </Card>



            {/* Actions */}
            <div style={{
              marginTop: '24px',
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end'
            }}>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  handleEdit(selectedAnnonce);
                }}
              >
                Modifier
              </Button>
              <Popconfirm
                title="Supprimer cette annonce ?"
                description="Cette action est irréversible."
                onConfirm={() => {
                  setDrawerOpen(false);
                  handleDelete(selectedAnnonce.id);
                }}
                okText="Supprimer"
                cancelText="Annuler"
                okType="danger"
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                >
                  Supprimer
                </Button>
              </Popconfirm>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
