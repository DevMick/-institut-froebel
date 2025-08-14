import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Drawer,
  Avatar,
  List,
  Empty,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BookOutlined,
  UserOutlined,
  MessageOutlined,
  TeamOutlined,
  SendOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CahierLiaisonPage() {
  const [loading, setLoading] = useState(false);
  const [loadingEleves, setLoadingEleves] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // États pour les données
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // États pour la sélection
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [selectedEleve, setSelectedEleve] = useState(null);
  
  // États pour les modals/drawers
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [selectedType, setSelectedType] = useState('');

  const [form] = Form.useForm();

  // Fonctions utilitaires
  const getToken = () => localStorage.getItem('token');
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  };

  // Charger les classes au montage
  useEffect(() => {
    loadClasses();
  }, []);

  // Charger les élèves quand une classe est sélectionnée
  useEffect(() => {
    if (selectedClasse) {
      loadEleves();
    } else {
      setEleves([]);
      setSelectedEleve(null);
    }
  }, [selectedClasse]);

  // Charger les messages quand un élève est sélectionné
  useEffect(() => {
    if (selectedEleve) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [selectedEleve]);



  const loadClasses = async () => {
    try {
      setLoading(true);
      const user = getUser();
      const ecoleId = user.ecoleId || 1;
      const token = getToken();

      if (!token || token === 'null') {
        message.error('Vous devez être connecté pour accéder à cette page');
        return;
      }

      console.log('🔄 Chargement des classes...');
      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Classes chargées:', data);
        setClasses(Array.isArray(data) ? data : data.data || []);
      } else if (response.status === 401) {
        message.error('Session expirée. Veuillez vous reconnecter.');
      } else {
        console.error('Erreur lors du chargement des classes:', response.status);
        // Données de démonstration
        setClasses([
          { id: 1, nom: 'CP A', effectif: 25 },
          { id: 2, nom: 'CP B', effectif: 23 },
          { id: 3, nom: 'CE1', effectif: 28 },
          { id: 4, nom: 'CE2', effectif: 26 },
          { id: 5, nom: 'CM1', effectif: 24 },
          { id: 6, nom: 'CM2', effectif: 22 }
        ]);
        message.warning('Serveur non disponible - Mode démonstration activé');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors du chargement des classes');
    } finally {
      setLoading(false);
    }
  };

  const loadEleves = async () => {
    try {
      setLoadingEleves(true);
      const user = getUser();
      const ecoleId = user.ecoleId || 1;
      const token = getToken();

      console.log('🔄 Chargement des élèves pour la classe:', selectedClasse);
      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/enfants?classeId=${selectedClasse}&statut=inscrit`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Élèves chargés:', data);
        const elevesData = Array.isArray(data) ? data : data.data || [];
        setEleves(elevesData);
        
        // Sélectionner automatiquement le premier élève s'il y en a
        if (elevesData.length > 0) {
          setSelectedEleve(elevesData[0]);
        }
      } else {
        console.error('Erreur lors du chargement des élèves:', response.status);
        // Données de démonstration
        const demoEleves = [
          { id: 1, prenom: 'Marie', nom: 'Dupont', dateNaissance: '2015-03-15' },
          { id: 2, prenom: 'Jean', nom: 'Martin', dateNaissance: '2015-07-22' },
          { id: 3, prenom: 'Sophie', nom: 'Bernard', dateNaissance: '2015-01-10' },
          { id: 4, prenom: 'Lucas', nom: 'Petit', dateNaissance: '2015-09-05' },
          { id: 5, prenom: 'Emma', nom: 'Moreau', dateNaissance: '2015-11-18' }
        ];
        setEleves(demoEleves);
        setSelectedEleve(demoEleves[0]);
        message.warning('Serveur non disponible - Mode démonstration activé');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors du chargement des élèves');
    } finally {
      setLoadingEleves(false);
    }
  };

  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      const user = getUser();
      const ecoleId = user.ecoleId || 1;
      const token = getToken();

      console.log('🔄 Rechargement des messages après suppression pour l\'élève:', selectedEleve.id);
      const loadUrl = `http://localhost:5000/api/ecoles/${ecoleId}/enfants/${selectedEleve.id}/cahier-liaison`;
      console.log('📡 URL de rechargement:', loadUrl);

      const response = await fetch(loadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Messages rechargés après suppression:', data);
        console.log('📊 Nombre de messages reçus:', Array.isArray(data) ? data.length : (data.data ? data.data.length : 0));
        setMessages(Array.isArray(data) ? data : data.data || []);
      } else {
        console.error('Erreur lors du chargement des messages:', response.status);
        // Données de démonstration
        setMessages([
          {
            id: 1,
            titre: "Comportement en classe",
            message: "Votre enfant a eu un excellent comportement aujourd'hui. Il a participé activement aux activités et a aidé ses camarades.",
            type: "comportement",
            dateCreation: "2024-12-01T10:00:00Z",
            auteur: "Mme Dubois",
            lu: false
          },
          {
            id: 2,
            titre: "Travail à la maison",
            message: "N'oubliez pas de réviser les tables de multiplication pour demain. Exercices pages 45-46 du manuel.",
            type: "travail",
            dateCreation: "2024-11-30T15:30:00Z",
            auteur: "M. Martin",
            lu: true
          },
          {
            id: 3,
            titre: "Sortie pédagogique",
            message: "Rappel : sortie au musée vendredi prochain. Pensez à apporter le pique-nique et l'autorisation signée.",
            type: "information",
            dateCreation: "2024-11-29T09:15:00Z",
            auteur: "Mme Dubois",
            lu: true
          }
        ]);
        message.warning('Serveur non disponible - Mode démonstration activé');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors du chargement des messages');
    } finally {
      setLoadingMessages(false);
    }
  };



  const handleCreate = () => {
    if (!selectedEleve) {
      message.warning('Veuillez sélectionner un élève');
      return;
    }

    setEditingMessage(null);
    form.resetFields();
    setSelectedType('information');
    form.setFieldsValue({
      type: 'information'
    });
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingMessage(record);
    setSelectedType(record.type);
    form.setFieldsValue({
      titre: record.titre,
      message: record.message,
      type: record.type
    });
    setModalOpen(true);
  };

  const handleView = (record) => {
    setSelectedMessage(record);
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
        message: values.message,
        type: values.type
      };

      console.log('📤 Envoi requête message:', requestBody);
      console.log('🎯 Élève sélectionné:', selectedEleve);
      console.log('🏫 École ID:', ecoleId);

      let response;
      let url;
      if (editingMessage) {
        // Modification
        url = `http://localhost:5000/api/ecoles/${ecoleId}/enfants/${selectedEleve.id}/cahier-liaison/${editingMessage.id}`;
        console.log('🔄 PUT URL:', url);
        response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      } else {
        // Création
        url = `http://localhost:5000/api/ecoles/${ecoleId}/enfants/${selectedEleve.id}/cahier-liaison`;
        console.log('➕ POST URL:', url);
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      }

      console.log('📡 Réponse:', response.status, response.statusText);

      if (response.ok) {
        // Essayer de parser le JSON, mais ne pas échouer si c'est vide
        let result = null;
        try {
          const text = await response.text();
          if (text) {
            result = JSON.parse(text);
          }
        } catch (parseError) {
          console.log('Réponse non-JSON, mais succès:', parseError);
        }

        message.success(editingMessage ? 'Message modifié avec succès' : 'Message créé avec succès');
        console.log('✅ Résultat:', result);

        // Recharger les messages
        loadMessages();

        // Fermer le modal
        setModalOpen(false);
        form.resetFields();
        setEditingMessage(null);
        setSelectedType('');
      } else if (response.status === 401) {
        message.error('Session expirée. Veuillez vous reconnecter.');
      } else {
        // Gestion d'erreur plus robuste
        let errorMessage = 'Erreur lors de la sauvegarde';
        try {
          const text = await response.text();
          if (text) {
            const error = JSON.parse(text);
            errorMessage = error.message || errorMessage;
          }
        } catch (parseError) {
          console.log('Erreur de parsing de la réponse d\'erreur:', parseError);
        }
        message.error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur:', error);

      // Mode démonstration en cas d'erreur réseau
      console.log('Mode démonstration - Simulation de la sauvegarde');

      if (editingMessage) {
        // Simulation de la modification
        const updatedMessages = messages.map(m =>
          m.id === editingMessage.id
            ? { ...m, titre: values.titre, message: values.message, type: values.type }
            : m
        );
        setMessages(updatedMessages);
        message.success('Message modifié avec succès (mode démonstration)');
      } else {
        // Simulation de la création
        const newMessage = {
          id: Date.now(), // ID temporaire
          titre: values.titre,
          message: values.message,
          type: values.type,
          dateCreation: new Date().toISOString(),
          auteur: 'Vous',
          lu: false
        };
        setMessages([...messages, newMessage]);
        message.success('Message créé avec succès (mode démonstration)');
      }

      // Fermer le modal
      setModalOpen(false);
      form.resetFields();
      setEditingMessage(null);
      setSelectedType('');
    }
  };

  // Supprimer un message
  const deleteMessage = async (id) => {
    try {
      const user = getUser();
      const ecoleId = user.ecoleId || 1;
      const token = getToken();

      if (!token || token === 'null') {
        message.error('Vous devez être connecté pour effectuer cette action');
        return;
      }

      if (!selectedEleve) {
        message.error('Aucun élève sélectionné');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/ecoles/${ecoleId}/enfants/${selectedEleve.id}/cahier-liaison/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        message.success('Message supprimé avec succès');
        loadMessages();
      } else if (response.status === 401) {
        message.error('Session expirée. Veuillez vous reconnecter.');
      } else {
        const error = await response.text();
        console.error('Erreur suppression message:', error);
        message.error('Erreur lors de la suppression du message');
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la suppression');
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Supprimer le message',
      content: `Êtes-vous sûr de vouloir supprimer le message "${record.titre}" ?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        await deleteMessage(record.id);
      }
    });
  };

  // Configuration des colonnes du tableau
  const columns = [
    {
      title: 'Message',
      dataIndex: 'titre',
      key: 'titre',
      render: (text, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Text strong>{text}</Text>
            {!record.lu && <Tag color="red" size="small">Non lu</Tag>}
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.auteur} • {dayjs(record.dateCreation).format('DD/MM/YYYY HH:mm')}
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
          'comportement': 'green',
          'travail': 'blue',
          'information': 'orange',
          'urgent': 'red'
        };
        const labels = {
          'comportement': 'Comportement',
          'travail': 'Travail',
          'information': 'Information',
          'urgent': 'Urgent'
        };
        return <Tag color={colors[type]}>{labels[type]}</Tag>;
      },
      responsive: ['sm', 'md', 'lg', 'xl']
    },
    {
      title: 'Contenu',
      dataIndex: 'message',
      key: 'message',
      render: (text) => (
        <Text ellipsis style={{ maxWidth: '300px' }}>
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
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            title="Supprimer"
            style={{ color: '#ff4d4f' }}
          />
        </Space>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>Cahier de Liaison</Title>
        <Text style={{ color: '#666' }}>Gérez les communications avec les parents d'élèves</Text>
      </div>

      {/* Sélecteurs */}
      <Card style={{ marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                <TeamOutlined style={{ marginRight: '8px' }} />
                Sélectionner une classe :
              </Text>
              <div className="select-with-icon-html">
                <TeamOutlined className="select-icon-html" />
                <select
                  className="modern-select-html"
                  style={{ height: '40px' }}
                  value={selectedClasse || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedClasse(value ? parseInt(value) : null);
                  }}
                  disabled={loading}
                >
                  <option value="">Choisir une classe</option>
                  {classes.map(classe => (
                    <option key={classe.id} value={classe.id}>
                      {classe.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                <UserOutlined style={{ marginRight: '8px' }} />
                Sélectionner un élève :
              </Text>
              <div className="select-with-icon-html">
                <UserOutlined className="select-icon-html" />
                <select
                  className="modern-select-html"
                  style={{ height: '40px' }}
                  value={selectedEleve?.id || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const eleve = eleves.find(e => e.id === parseInt(value));
                    setSelectedEleve(eleve || null);
                  }}
                  disabled={!selectedClasse || loadingEleves}
                >
                  <option value="">Choisir un élève</option>
                  {eleves.map(eleve => (
                    <option key={eleve.id} value={eleve.id}>
                      {eleve.prenom} {eleve.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={24} md={8}>
            {selectedEleve && (
              <div style={{
                padding: '12px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae7ff',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <Avatar size={40} icon={<UserOutlined />} style={{ marginBottom: '8px' }} />
                <div>
                  <Text strong>{selectedEleve.prenom} {selectedEleve.nom}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {selectedEleve.dateNaissance && `Né(e) le ${dayjs(selectedEleve.dateNaissance).format('DD/MM/YYYY')}`}
                  </Text>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Card>



      {/* Interface principale */}
      {selectedEleve ? (
        <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>
              Messages pour {selectedEleve.prenom} {selectedEleve.nom}
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Nouveau Message
            </Button>
          </div>

          {/* Tableau */}
          <Table
            columns={columns}
            dataSource={messages}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} messages`
            }}
            scroll={{ x: 1000 }}
            loading={loadingMessages}
            locale={{
              emptyText: (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <Text style={{ fontSize: '16px', color: '#666' }}>
                    Aucun message trouvé pour cet élève
                  </Text>
                  <div style={{ marginTop: '8px' }}>
                    <Text style={{ fontSize: '12px', color: '#999' }}>
                      Créez le premier message pour commencer
                    </Text>
                  </div>
                </div>
              )
            }}
          />
        </Card>
      ) : (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <BookOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={3} style={{ color: '#999' }}>Sélectionnez une classe et un élève</Title>
          <Text style={{ color: '#666' }}>
            Choisissez d'abord une classe, puis un élève pour voir et gérer ses messages du cahier de liaison.
          </Text>
        </Card>
      )}

      {/* Modal de création/modification */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageOutlined />
            <span>{editingMessage ? 'Modifier le Message' : 'Nouveau Message'}</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingMessage(null);
          setSelectedType('');
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '16px' }}
        >
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                name="titre"
                label="Titre du Message"
                rules={[
                  { required: true, message: 'Le titre est requis' },
                  { max: 100, message: 'Le titre ne peut pas dépasser 100 caractères' }
                ]}
              >
                <Input
                  size="large"
                  placeholder="Ex: Comportement en classe"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="type"
                label="Type de Message"
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
                    <option value="comportement">🌟 Comportement</option>
                    <option value="travail">📚 Travail</option>
                    <option value="information">ℹ️ Information</option>
                    <option value="urgent">⚠️ Urgent</option>
                  </select>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="message"
            label="Contenu du Message"
            rules={[
              { required: true, message: 'Le contenu est requis' },
              { min: 10, message: 'Le contenu doit contenir au moins 10 caractères' }
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Rédigez votre message aux parents..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          {selectedEleve && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae7ff',
              borderRadius: '6px'
            }}>
              <Text style={{ fontSize: '12px', color: '#0050b3' }}>
                📧 <strong>Destinataire :</strong> Parents de {selectedEleve.prenom} {selectedEleve.nom}
              </Text>
            </div>
          )}

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
                setEditingMessage(null);
                setSelectedType('');
              }}
            >
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={editingMessage ? <EditOutlined /> : <SendOutlined />}
            >
              {editingMessage ? 'Mettre à Jour' : 'Envoyer le Message'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Drawer pour les détails */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageOutlined />
            <span>Détails du Message</span>
          </div>
        }
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={600}
      >
        {selectedMessage && (
          <div>
            {/* En-tête du message */}
            <Card size="small" style={{ marginBottom: '16px', background: '#f6f8fa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Title level={4} style={{ margin: 0, marginBottom: '8px' }}>
                    {selectedMessage.titre}
                  </Title>
                  <Space size="small" wrap>
                    <Tag color={
                      selectedMessage.type === 'urgent' ? 'red' :
                      selectedMessage.type === 'comportement' ? 'green' :
                      selectedMessage.type === 'travail' ? 'blue' : 'orange'
                    }>
                      {selectedMessage.type === 'urgent' ? 'Urgent' :
                       selectedMessage.type === 'comportement' ? 'Comportement' :
                       selectedMessage.type === 'travail' ? 'Travail' : 'Information'}
                    </Tag>
                    <Text type="secondary">
                      {dayjs(selectedMessage.dateCreation).format('DD/MM/YYYY à HH:mm')}
                    </Text>
                    {!selectedMessage.lu && <Tag color="red" size="small">Non lu</Tag>}
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
                  <Text>{selectedMessage.auteur}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Élève :</Text>
                  <br />
                  <Text>{selectedEleve?.prenom} {selectedEleve?.nom}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Type :</Text>
                  <br />
                  <Tag color={
                    selectedMessage.type === 'urgent' ? 'red' :
                    selectedMessage.type === 'comportement' ? 'green' :
                    selectedMessage.type === 'travail' ? 'blue' : 'orange'
                  }>
                    {selectedMessage.type === 'urgent' ? 'Urgent' :
                     selectedMessage.type === 'comportement' ? 'Comportement' :
                     selectedMessage.type === 'travail' ? 'Travail' : 'Information'}
                  </Tag>
                </Col>
                <Col span={12}>
                  <Text strong>Statut :</Text>
                  <br />
                  <Tag color={selectedMessage.lu ? 'green' : 'red'}>
                    {selectedMessage.lu ? 'Lu' : 'Non lu'}
                  </Tag>
                </Col>

              </Row>
            </Card>

            {/* Contenu */}
            <Card title="Contenu du Message" size="small" style={{ marginBottom: '16px' }}>
              <div style={{
                padding: '12px',
                backgroundColor: '#fafafa',
                borderRadius: '6px',
                lineHeight: '1.6'
              }}>
                <Text>{selectedMessage.message}</Text>
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
                  handleEdit(selectedMessage);
                }}
              >
                Modifier
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  handleDelete(selectedMessage);
                }}
              >
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
