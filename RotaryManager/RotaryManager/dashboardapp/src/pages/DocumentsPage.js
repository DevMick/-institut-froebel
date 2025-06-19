import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Spin, Upload, Select, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, FileOutlined, SearchOutlined, EyeOutlined, UploadOutlined, FolderOutlined } from '@ant-design/icons';
import { documentService } from '../api/documentService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/table.css';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const DocumentsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [noClubSelected, setNoClubSelected] = useState(false);
  const [formData, setFormData] = useState({ categories: [], typesDocument: [] });

  // Récupérer le clubId depuis le contexte d'authentification
  const clubId = user?.clubId;
  console.log('Informations utilisateur complètes:', user);
  console.log('Club ID:', clubId);

  useEffect(() => {
    if (!isAuthenticated() || !clubId) {
      setNoClubSelected(true);
      message.error("Veuillez vous connecter et sélectionner un club pour accéder à cette page");
      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setNoClubSelected(false);
    }
  }, [clubId, navigate, isAuthenticated]);

  const fetchFormData = useCallback(async () => {
    if (!clubId) return;
    
    try {
      console.log('Début du chargement des données du formulaire pour le club:', clubId);
      const [categories, typesDocument] = await Promise.all([
        documentService.getCategories(clubId),
        documentService.getTypesDocument(clubId)
      ]);
      console.log('Catégories reçues:', categories);
      console.log('Types de document reçus:', typesDocument);
      setFormData({ categories, typesDocument });
    } catch (error) {
      console.error('Erreur lors du chargement des données du formulaire:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      message.error("Erreur lors du chargement des données du formulaire");
    }
  }, [clubId]);

  const fetchDocuments = useCallback(async () => {
    if (!clubId) return;
    
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        recherche: searchTerm
      };

      const result = await documentService.getDocuments(clubId, params);
      setDocuments(result.documents);
      setPagination(prev => ({
        ...prev,
        total: result.pagination.total,
        current: result.pagination.current,
        pageSize: result.pagination.pageSize,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      message.error("Erreur lors du chargement des documents");
    } finally {
      setLoading(false);
    }
  }, [clubId, pagination.current, pagination.pageSize, searchTerm]);

  const fetchStats = useCallback(async () => {
    if (!clubId) return;
    
    try {
      const statsData = await documentService.getStatistiques(clubId);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      message.error("Erreur lors du chargement des statistiques");
    }
  }, [clubId]);

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
    console.log('useEffect déclenché avec clubId:', clubId);
    if (clubId) {
      console.log('Chargement des données pour le club:', clubId);
      fetchDocuments();
      fetchStats();
      fetchFormData();
    } else {
      console.warn('Aucun clubId trouvé dans le localStorage');
    }
  }, [clubId, fetchDocuments, fetchStats, fetchFormData]);

  useEffect(() => {
    console.log('État actuel des données du formulaire:', formData);
  }, [formData]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des documents selon le champ de recherche
  const filteredDocuments = documents.filter(doc => {
    return (
      (doc.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.categorieLibelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.typeDocumentLibelle || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Grouper les documents par catégorie
  const documentsGroupesParCategorie = filteredDocuments.reduce((acc, document) => {
    const categorieLibelle = document.categorieLibelle || 'Catégorie non définie';
    if (!acc[categorieLibelle]) {
      acc[categorieLibelle] = [];
    }
    acc[categorieLibelle].push(document);
    return acc;
  }, {});

  // Colonnes pour le tableau des documents dans chaque catégorie
  const documentsColumns = [
    {
      title: 'Document',
      key: 'document',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
            <FileOutlined />
          </div>
          <div style={{ maxWidth: 160 }}>
            <div className="font-medium text-gray-900 ellipsis-cell" style={{ maxWidth: 160 }} title={record.nom}>
              {record.nom}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Description',
      key: 'description',
      width: 200,
      render: (_, record) => (
        <span className="ellipsis-cell" style={{ maxWidth: 180 }} title={record.description || 'Aucune description'}>
          {record.description || 'Aucune description'}
        </span>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      render: (_, record) => (
        <span>
          <FileOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          {record.typeDocumentLibelle}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => openViewModal(record)} 
            title="Voir les détails"
          />
          <Button 
            icon={<DownloadOutlined />} 
            onClick={() => handleDownload(record.id, record.nom)}
            title="Télécharger"
          />
          <Popconfirm 
            title="Supprimer ce document ?" 
            onConfirm={() => handleDelete(record.id)} 
            okText="Oui" 
            cancelText="Non"
            description="Cette action est irréversible."
          >
            <Button icon={<DeleteOutlined />} danger title="Supprimer" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const openModal = (record = null) => {
    setEditingDocument(record);
    setModalVisible(true);
    setFileList([]);
    if (record) {
      form.setFieldsValue({
        nom: record.nom,
        description: record.description,
        categorieId: record.categorieId,
        typeDocumentId: record.typeDocumentId
      });
    } else {
      form.resetFields();
    }
  };

  const openViewModal = (record) => {
    setViewingDocument(record);
    setViewModalVisible(true);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
    setViewingDocument(null);
  };

  const handleDelete = async (id) => {
    try {
      await documentService.deleteDocument(clubId, id);
      message.success('Document supprimé');
      fetchDocuments();
      fetchStats();
    } catch (error) {
      message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDownload = async (id, nom) => {
    try {
      const blob = await documentService.downloadDocument(clubId, id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nom;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      message.error("Erreur lors du téléchargement: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    if (!fileList.length && !editingDocument) {
      message.error('Veuillez sélectionner un fichier');
      return;
    }

    try {
      setUploading(true);
      const documentData = {
        ...values,
        fichier: fileList[0]?.originFileObj
      };

      if (editingDocument) {
        await documentService.updateDocument(clubId, editingDocument.id, documentData);
        message.success('Document modifié');
      } else {
        await documentService.createDocument(clubId, documentData);
        message.success('Document ajouté');
      }
      setModalVisible(false);
      setEditingDocument(null);
      form.resetFields();
      setFileList([]);
      fetchDocuments();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleCollapse = useCallback((collapsed) => {
    setIsCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

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
                  Gestion des Documents
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {noClubSelected ? (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Aucun club sélectionné
              </h2>
              <p className="text-gray-600">
                Veuillez sélectionner un club dans le menu pour accéder à la gestion des documents.
              </p>
            </div>
          ) : (
            <>
              {/* Statistiques globales */}
              {stats && (
                <Row gutter={[16, 16]} className="mb-6">
                  <Col xs={24} sm={24} md={12} lg={12}>
                    <Card>
                      <Statistic
                        title="Nombre Total de Documents"
                        value={stats.nombreTotalDocuments}
                        prefix={<FileOutlined />}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12}>
                    <Card>
                      <Statistic
                        title="Taille Totale des Documents"
                        value={(stats.tailleTotaleDocuments / (1024 * 1024)).toFixed(2)}
                        precision={2}
                        valueStyle={{ color: '#1890ff' }}
                        suffix=" MB"
                      />
                    </Card>
                  </Col>
                </Row>
              )}

              {/* Filtres et actions */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                  Ajouter un document
                </Button>
                <Input
                  placeholder="Rechercher un document..."
                  prefix={<SearchOutlined />}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', maxWidth: 300 }}
                  allowClear
                />
              </div>

              {/* Affichage groupé par catégorie */}
              <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
                {loading ? (
                  <div className="text-center py-8">
                    <Spin size="large" />
                    <p className="mt-4">Chargement des documents...</p>
                  </div>
                ) : Object.keys(documentsGroupesParCategorie).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun document trouvé</p>
                  </div>
                ) : (
                  <Collapse 
                    defaultActiveKey={Object.keys(documentsGroupesParCategorie)} 
                    className="document-collapse"
                  >
                    {Object.entries(documentsGroupesParCategorie).map(([categorieLibelle, documents]) => (
                      <Panel 
                        header={
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FolderOutlined style={{ marginRight: 12, color: '#1890ff', fontSize: '16px' }} />
                              <span className="font-semibold text-lg">{categorieLibelle}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {documents.length} document{documents.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        } 
                        key={categorieLibelle}
                        className="mb-4"
                      >
                        <Table
                          columns={documentsColumns}
                          dataSource={documents}
                          rowKey="id"
                          pagination={false}
                          size="middle"
                          className="document-table"
                          scroll={{ x: 'max-content' }}
                        />
                      </Panel>
                    ))}
                  </Collapse>
                )}

                {/* Modal d'ajout/modification */}
                <Modal
                  title={editingDocument ? 'Modifier le document' : 'Ajouter un document'}
                  open={modalVisible}
                  onCancel={() => { setModalVisible(false); setEditingDocument(null); form.resetFields(); setFileList([]); }}
                  footer={null}
                  destroyOnClose
                  width={isMobile ? '95%' : 600}
                  centered={isMobile}
                >
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                  >
                    <Form.Item
                      name="nom"
                      label="Nom"
                      rules={[
                        { required: true, message: 'Le nom est obligatoire' },
                        { max: 200, message: 'Le nom ne peut pas dépasser 200 caractères' }
                      ]}
                    >
                      <Input placeholder="Entrez le nom du document" />
                    </Form.Item>

                    <Form.Item
                      name="description"
                      label="Description"
                      rules={[
                        { max: 1000, message: 'La description ne peut pas dépasser 1000 caractères' }
                      ]}
                    >
                      <TextArea placeholder="Entrez la description du document" rows={4} />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="categorieId"
                          label="Catégorie"
                          rules={[{ required: true, message: 'La catégorie est obligatoire' }]}
                        >
                          <Select placeholder="Sélectionnez une catégorie">
                            {formData.categories.map(cat => (
                              <Option key={cat.id} value={cat.id}>{cat.libelle}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="typeDocumentId"
                          label="Type de document"
                          rules={[{ required: true, message: 'Le type de document est obligatoire' }]}
                        >
                          <Select placeholder="Sélectionnez un type de document">
                            {formData.typesDocument.map(type => (
                              <Option key={type.id} value={type.id}>{type.libelle}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    {!editingDocument && (
                      <Form.Item
                        label="Fichier"
                        required
                        rules={[{ required: true, message: 'Le fichier est obligatoire' }]}
                      >
                        <Upload
                          beforeUpload={() => false}
                          fileList={fileList}
                          onChange={({ fileList }) => setFileList(fileList)}
                          maxCount={1}
                        >
                          <Button icon={<UploadOutlined />}>Sélectionner un fichier</Button>
                        </Upload>
                      </Form.Item>
                    )}

                    <Form.Item>
                      <Space className="w-full justify-end">
                        <Button type="primary" htmlType="submit" loading={uploading}>
                          {editingDocument ? 'Mettre à jour' : 'Ajouter'}
                        </Button>
                        <Button onClick={() => { setModalVisible(false); setEditingDocument(null); form.resetFields(); setFileList([]); }}>
                          Annuler
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Modal>

                {/* Modal de détails */}
                <Modal
                  title="Détails du document"
                  open={viewModalVisible}
                  onCancel={closeViewModal}
                  footer={[
                    <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={() => handleDownload(viewingDocument?.id, viewingDocument?.nom)}>
                      Télécharger
                    </Button>,
                    <Button key="close" onClick={closeViewModal}>
                      Fermer
                    </Button>,
                  ]}
                  width={isMobile ? '95%' : 600}
                  centered={isMobile}
                >
                  {viewingDocument && (
                    <div>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={12}>
                          <Card size="small" title="Nom">
                            <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                              <FileOutlined style={{ marginRight: 8 }} />
                              {viewingDocument.nom}
                            </p>
                          </Card>
                        </Col>
                        <Col xs={24} sm={24} md={12}>
                          <Card size="small" title="Catégorie">
                            <p>
                              <FolderOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                              {viewingDocument.categorieLibelle}
                            </p>
                          </Card>
                        </Col>
                        <Col xs={24} sm={24} md={12}>
                          <Card size="small" title="Type">
                            <p>
                              <FileOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                              {viewingDocument.typeDocumentLibelle}
                            </p>
                          </Card>
                        </Col>
                        <Col xs={24} sm={24} md={12}>
                          <Card size="small" title="Taille">
                            <p>
                              <FileOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                              {(viewingDocument.tailleFichier / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </Card>
                        </Col>
                        {viewingDocument.description && (
                          <Col xs={24}>
                            <Card size="small" title="Description">
                              <p style={{ whiteSpace: 'pre-wrap' }}>
                                <FileOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
                                {viewingDocument.description}
                              </p>
                            </Card>
                          </Col>
                        )}
                      </Row>
                    </div>
                  )}
                </Modal>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DocumentsPage;