import { useState, useEffect } from 'react';
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
  Collapse
} from 'antd';
import { 
  QuestionCircleOutlined, 
  InfoCircleOutlined, 
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
const { Panel } = Collapse;

export default function FAQAdmissionsPage() {
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
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
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      
      console.log('Chargement des FAQ admissions pour l\'école:', ecoleId);
      
      const response = await fetch(`https://mon-api-aspnet.onrender.com/api/ecoles/${ecoleId}/faq-admissions`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Réponse FAQ:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('Données FAQ reçues:', data);
        setFaqs(data);
      } else {
        // Mode démonstration si serveur indisponible
        console.log('Serveur non disponible, utilisation des données de démonstration');
        setFaqs([
          { 
            id: 1, 
            nom: 'À quel âge peut-on inscrire un enfant en maternelle ?'
          },
          { 
            id: 2, 
            nom: 'Quels sont les documents nécessaires pour l\'inscription ?'
          },
          { 
            id: 3, 
            nom: 'Quand ont lieu les inscriptions pour la rentrée prochaine ?'
          },
          { 
            id: 4, 
            nom: 'Y a-t-il une liste d\'attente si l\'école est complète ?'
          },
          { 
            id: 5, 
            nom: 'L\'école propose-t-elle un service de cantine ?'
          },
          { 
            id: 6, 
            nom: 'Quels sont les horaires de l\'école ?'
          },
          { 
            id: 7, 
            nom: 'Comment se déroule la visite de l\'école ?'
          },
          { 
            id: 8, 
            nom: 'Y a-t-il des frais d\'inscription en plus des frais de scolarité ?'
          }
        ]);
        message.warning('Serveur non disponible - Mode démonstration activé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des FAQ:', error);
      // Mode démonstration en cas d'erreur
      setFaqs([
        { 
          id: 1, 
          nom: 'À quel âge peut-on inscrire un enfant en maternelle ?'
        },
        { 
          id: 2, 
          nom: 'Quels sont les documents nécessaires pour l\'inscription ?'
        }
      ]);
      message.warning('Serveur non disponible - Mode démonstration activé');
    } finally {
      setLoading(false);
    }
  };

  // Créer une FAQ
  const createFaq = async (values) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      const token = getToken();

      // Vérifier si le token existe
      if (!token || token === 'null') {
        message.error('Vous devez être connecté pour effectuer cette action');
        return;
      }

      console.log('Création FAQ avec token:', token ? 'Token présent' : 'Token manquant');

      const response = await fetch(`https://mon-api-aspnet.onrender.com/api/ecoles/${ecoleId}/faq-admissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          titre: values.titre,
          nom: values.nom
        })
      });

      console.log('Réponse création FAQ:', response.status, response.statusText);

      if (response.ok) {
        message.success('FAQ admission créée avec succès');
        loadFaqs();
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

  // Modifier une FAQ
  const updateFaq = async (id, values) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      const token = getToken();

      // Vérifier si le token existe
      if (!token || token === 'null') {
        message.error('Vous devez être connecté pour effectuer cette action');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/faq-admissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          titre: values.titre,
          nom: values.nom
        })
      });

      if (response.ok) {
        message.success('FAQ admission modifiée avec succès');
        loadFaqs();
        setModalOpen(false);
        form.resetFields();
        setEditingFaq(null);
      } else if (response.status === 401) {
        message.error('Session expirée. Veuillez vous reconnecter.');
      } else {
        const error = await response.text();
        console.error('Erreur modification FAQ:', error);
        message.error('Erreur lors de la modification de la FAQ');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la modification');
    }
  };

  // Supprimer une FAQ
  const deleteFaq = async (id) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 2;
      const token = getToken();

      // Vérifier si le token existe
      if (!token || token === 'null') {
        message.error('Vous devez être connecté pour effectuer cette action');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/faq-admissions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        message.success('FAQ admission supprimée avec succès');
        loadFaqs();
      } else if (response.status === 401) {
        message.error('Session expirée. Veuillez vous reconnecter.');
      } else {
        const error = await response.text();
        console.error('Erreur suppression FAQ:', error);
        message.error('Erreur lors de la suppression de la FAQ');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la suppression');
    }
  };

  // Handlers
  const handleView = (record) => {
    setSelectedFaq(record);
    setDrawerOpen(true);
  };

  const handleEdit = (record) => {
    setEditingFaq(record);
    setModalOpen(true);
    form.setFieldsValue(record);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Supprimer la FAQ admission',
      content: `Êtes-vous sûr de vouloir supprimer cette question : "${record.titre}" ?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        await deleteFaq(record.id);
      }
    });
  };

  const handleSubmit = async (values) => {
    if (editingFaq) {
      await updateFaq(editingFaq.id, values);
    } else {
      await createFaq(values);
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
    <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>FAQ Admissions</Title>
        <Text style={{ color: '#666' }}>Gérez les questions fréquemment posées sur les admissions</Text>
      </div>

      {/* Statistiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic 
              title="Total Questions" 
              value={faqs.length} 
              prefix={<QuestionCircleOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic 
              title="Questions Actives" 
              value={faqs.length} 
              prefix={<InfoCircleOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic 
              title="Aide aux Parents" 
              value={faqs.length} 
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
              placeholder="Rechercher une question..."
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
                setEditingFaq(null);
                form.resetFields();
              }}
              style={{ width: '100%' }}
            >
              Nouvelle Question
            </Button>
          </Col>
        </Row>

        {/* Tableau */}
        <Table
          columns={[
            {
              title: 'Question',
              dataIndex: 'titre',
              key: 'titre',
              render: (titre) => (
                <div style={{ maxWidth: '400px' }}>
                  <Text strong style={{ fontSize: '14px' }}>{titre}</Text>
                </div>
              ),
              responsive: ['xs', 'sm', 'md', 'lg', 'xl']
            },
            {
              title: 'Réponse',
              dataIndex: 'nom',
              key: 'nom',
              render: (nom) => (
                <div style={{ maxWidth: '300px' }}>
                  <Text ellipsis style={{ fontSize: '12px', color: '#666' }}>
                    {nom && nom.length > 100 ? `${nom.substring(0, 100)}...` : nom}
                  </Text>
                </div>
              ),
              responsive: ['md', 'lg', 'xl']
            },
            {
              title: 'Statut',
              key: 'statut',
              render: () => (
                <Tag color="green" style={{ fontSize: '12px' }}>
                  Active
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
          dataSource={faqs.filter(faq =>
            faq.nom?.toLowerCase().includes(search.toLowerCase())
          )}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} questions`
          }}
          scroll={{ x: 700 }}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        />
      </Card>



      {/* Drawer pour les détails */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QuestionCircleOutlined />
            <span>FAQ Admission</span>
          </div>
        }
        placement="right"
        width={600}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedFaq && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Question">
                <Text style={{ fontWeight: 'bold' }}>{selectedFaq.titre}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Réponse">
                <Text>{selectedFaq.nom}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Statut">
                <Tag color="green">Active</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ID">
                {selectedFaq.id}
              </Descriptions.Item>
              <Descriptions.Item label="Longueur réponse">
                {selectedFaq.nom ? selectedFaq.nom.length : 0} caractères
              </Descriptions.Item>
            </Descriptions>

            <Card title="Aperçu pour les Parents" size="small">
              <Collapse>
                <Panel header={selectedFaq.titre} key="1">
                  <Text style={{ lineHeight: '1.6' }}>
                    {selectedFaq.nom || 'Aucune réponse configurée'}
                  </Text>
                </Panel>
              </Collapse>
            </Card>
          </div>
        )}
      </Drawer>

      {/* Modal pour ajouter/modifier */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editingFaq ? <EditOutlined /> : <PlusOutlined />}
            <span>
              {editingFaq ? 'Modifier la question' : 'Nouvelle question FAQ'}
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingFaq(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="titre"
            label="Question FAQ"
            rules={[{ required: true, message: 'La question est requise' }]}
          >
            <Input
              placeholder="Ex: Quels sont les documents requis pour l'inscription ?"
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            name="nom"
            label="Réponse"
            rules={[{ required: true, message: 'La réponse est requise' }]}
          >
            <TextArea
              rows={6}
              placeholder="Rédigez une réponse détaillée à cette question..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <div style={{
            background: '#f6f8fa',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            <Text style={{ fontSize: '12px', color: '#666' }}>
              💡 <strong>Conseils :</strong> Formulez des questions claires et précises que les parents se posent souvent.
              Exemples : "À quel âge...", "Quels documents...", "Comment se déroule...", "Y a-t-il..."
            </Text>
          </div>

          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  setEditingFaq(null);
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
                {editingFaq ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
