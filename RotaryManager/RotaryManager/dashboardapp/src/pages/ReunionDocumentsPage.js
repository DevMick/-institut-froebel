import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, Card, Row, Col, Statistic, message, Modal, Form, Input, Upload, Popconfirm, Space, Select, Spin, Collapse } from 'antd';
import { PlusOutlined, FileOutlined, DownloadOutlined, DeleteOutlined, UploadOutlined, FileTextOutlined, BarChartOutlined, EyeOutlined, SearchOutlined, EditOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import '../styles/table.css';

const { Option } = Select;
const { Panel } = Collapse;

const ReunionDocumentsPage = () => {
  const { clubId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const [reunions, setReunions] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [documentDetail, setDocumentDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchDocuments = useCallback(async () => {
    if (!clubId) {
      setDocuments([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/ReunionDocument`);
      setDocuments(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.length,
        current: 1,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      message.error("Erreur lors du chargement des documents");
      setDocuments([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  const fetchStats = useCallback(async () => {
    if (!clubId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/ReunionDocument/statistiques`);
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      message.error("Erreur lors du chargement des statistiques");
    }
  }, [clubId]);

  const fetchReunions = useCallback(async () => {
    if (!clubId) {
      console.log('fetchReunions: clubId is missing');
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/reunions`);
      setReunions(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des réunions:', error);
      message.error("Erreur lors du chargement des réunions");
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
    if (clubId) {
      fetchDocuments();
      fetchStats();
      fetchReunions();
    }
  }, [clubId, fetchDocuments, fetchStats, fetchReunions]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des documents selon le champ de recherche
  const filteredDocuments = documents.filter(d => {
    const reunionInfo = d.reunionInfo ? `${new Date(d.reunionInfo.date).toLocaleDateString('fr-FR')} ${d.reunionInfo.heure}` : '';
    return (
      (d.libelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      reunionInfo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Grouper les documents par réunion
  const documentsGroupesParReunion = filteredDocuments.reduce((acc, document) => {
    const reunion = reunions.find(r => r.id === document.reunionId);
    const reunionKey = document.reunionInfo 
      ? `${new Date(document.reunionInfo.date).toLocaleDateString('fr-FR')} - ${reunion?.typeReunionLibelle || 'Type non défini'}`
      : 'Réunion non définie';
    
    if (!acc[reunionKey]) {
      acc[reunionKey] = [];
    }
    acc[reunionKey].push(document);
    return acc;
  }, {});

  // Colonnes pour le tableau des documents dans chaque réunion
  const documentsColumns = [
    {
      title: 'Document',
      key: 'document',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
            <FileTextOutlined />
          </div>
          <div style={{ maxWidth: 200 }}>
            <div className="font-medium text-gray-900 ellipsis-cell" style={{ maxWidth: 200 }} title={record.libelle}>
              {record.libelle}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Taille',
      dataIndex: 'tailleDocument',
      key: 'tailleDocument',
      render: (size) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          <FileOutlined style={{ marginRight: 8 }} />
          {(size/1024).toFixed(1)} Ko
        </span>
      ),
      sorter: (a, b) => (a.tailleDocument || 0) - (b.tailleDocument || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => openDetailModal(record.id)} 
            title="Voir les détails"
          />
          <Button 
            icon={<DownloadOutlined />} 
            onClick={() => handleDownload(record.id, record.libelle)} 
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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/ReunionDocument/${id}`);
      message.success('Document supprimé');
      fetchDocuments();
      fetchStats();
    } catch (error) {
      message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDownload = async (id, libelle) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/ReunionDocument/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', libelle);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error("Erreur lors du téléchargement: " + (error.response?.data?.message || error.message));
    }
  };

  const handleUpload = async (values) => {
    if (!clubId) {
      message.error("Erreur d'authentification.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('ReunionId', values.reunionId);
      formData.append('Libelle', values.libelle);
      const fileObj = values.file?.originFileObj || values.file;
      formData.append('File', fileObj);
      
      await axios.post(`${API_BASE_URL}/api/ReunionDocument/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Document ajouté');
      setModalVisible(false);
      form.resetFields();
      fetchDocuments();
      fetchStats();
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      message.error(error.response?.data?.message || error.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const openDetailModal = async (id) => {
    setDetailModalVisible(true);
    setDetailLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/ReunionDocument/${id}`);
      setDocumentDetail(response.data);
    } catch (error) {
      message.error("Erreur lors du chargement des détails du document");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setDocumentDetail(null);
  };

  // Pour éviter les re-créations inutiles
  const handleToggleCollapse = useCallback((collapsed) => {
    setIsCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Largeur dynamique selon l'état du sidebar
  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

  // Calculer les statistiques pour une réunion spécifique
  const getReunionStats = (documents) => {
    const totalSize = documents.reduce((sum, doc) => sum + (doc.tailleDocument || 0), 0);
    return { totalSize, count: documents.length };
  };

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
                  Documents de réunion
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques principales */}
          {stats && (
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card>
                  <Statistic
                    title="Nombre total"
                    value={stats.nombreTotal}
                    prefix={<FileOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card>
                  <Statistic
                    title="Taille totale"
                    value={(stats.tailleTotale/1024/1024).toFixed(2)}
                    suffix="Mo"
                    prefix={<BarChartOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card>
                  <Statistic
                    title="Taille moyenne"
                    value={(stats.tailleMoyenne/1024).toFixed(1)}
                    suffix="Ko"
                    prefix={<BarChartOutlined />}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card>
                  <Statistic
                    title="Taille max"
                    value={(stats.tailleMax/1024).toFixed(1)}
                    suffix="Ko"
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              Ajouter un document
            </Button>
            <Input
              placeholder="Rechercher par libellé ou réunion..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
          </div>

          {/* Affichage groupé par réunion */}
          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <p className="mt-4">Chargement des documents...</p>
              </div>
            ) : Object.keys(documentsGroupesParReunion).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun document trouvé</p>
              </div>
            ) : (
              <Collapse 
                defaultActiveKey={Object.keys(documentsGroupesParReunion)} 
                className="document-collapse"
              >
                {Object.entries(documentsGroupesParReunion).map(([reunionInfo, documents]) => {
                  const stats = getReunionStats(documents);
                  const reunion = documents[0]?.reunionInfo;
                  
                  return (
                    <Panel 
                      header={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CalendarOutlined style={{ marginRight: 12, color: '#1890ff', fontSize: '16px' }} />
                            <div>
                              <span className="font-semibold text-lg">{reunionInfo}</span>
                              {reunion && reunion.heure && (
                                <div className="text-sm text-gray-500">
                                  <TeamOutlined style={{ marginRight: 4 }} />
                                  {reunion.heure.substring(0,5)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {documents.length} document{documents.length > 1 ? 's' : ''}
                            </span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              {(stats.totalSize/1024).toFixed(1)} Ko
                            </span>
                          </div>
                        </div>
                      } 
                      key={reunionInfo}
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
                  );
                })}
              </Collapse>
            )}

            {/* Modal d'ajout */}
            <Modal
              title="Ajouter un document"
              open={modalVisible}
              onCancel={() => { setModalVisible(false); form.resetFields(); }}
              footer={null}
              destroyOnClose
              width={isMobile ? '95%' : 600}
              centered={isMobile}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpload}
              >
                <Form.Item
                  name="reunionId"
                  label="Réunion"
                  rules={[{ required: true, message: 'La réunion est obligatoire' }]}
                >
                  <Select
                    showSearch
                    placeholder="Sélectionnez la réunion"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {reunions.map(r => (
                      <Option key={r.id} value={r.id}>
                        {`${new Date(r.date).toLocaleDateString('fr-FR')} - ${r.typeReunionLibelle}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="libelle"
                  label="Libellé"
                  rules={[
                    { required: true, message: 'Le libellé est obligatoire' },
                    { max: 200, message: 'Le libellé ne peut pas dépasser 200 caractères' }
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="file"
                  label="Fichier"
                  valuePropName="file"
                  getValueFromEvent={e => e && e.fileList && e.fileList.length > 0 ? e.fileList[0] : null}
                  rules={[{ required: true, message: 'Le fichier est obligatoire' }]}
                >
                  <Upload beforeUpload={() => false} maxCount={1}>
                    <Button icon={<UploadOutlined />}>Sélectionner un fichier</Button>
                  </Upload>
                </Form.Item>
                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit" loading={uploading}>
                      Ajouter
                    </Button>
                    <Button onClick={() => { setModalVisible(false); form.resetFields(); }}>
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal de détails */}
            <Modal
              title="Détails du document"
              open={detailModalVisible}
              onCancel={closeDetailModal}
              footer={[
                <Button key="close" onClick={closeDetailModal}>
                  Fermer
                </Button>,
              ]}
              width={isMobile ? '95%' : 600}
              centered={isMobile}
            >
              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: 32 }}><Spin size="large" /></div>
              ) : documentDetail ? (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Libellé">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <FileTextOutlined style={{ marginRight: 8 }} />
                          {documentDetail.libelle}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Card size="small" title="Taille">
                        <p style={{ color: '#52c41a', fontWeight: 'bold' }}>
                          <FileOutlined style={{ marginRight: 8 }} />
                          {(documentDetail.tailleDocument/1024).toFixed(1)} Ko
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Réunion associée">
                        <p>
                          <CalendarOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                          {documentDetail.reunionInfo 
                            ? `${new Date(documentDetail.reunionInfo.date).toLocaleDateString('fr-FR')} à ${documentDetail.reunionInfo.heure.substring(0,5)}`
                            : 'Aucune réunion associée'
                          }
                        </p>
                      </Card>
                    </Col>
                  </Row>
                </div>
              ) : (
                <span>Aucune donnée</span>
              )}
            </Modal>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReunionDocumentsPage;