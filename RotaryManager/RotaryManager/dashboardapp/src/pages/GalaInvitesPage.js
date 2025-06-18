import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Select, Upload, Card, Row, Col, Typography, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, TableOutlined, UserOutlined, InboxOutlined, CheckCircleOutlined, UsergroupAddOutlined, UserDeleteOutlined, TeamOutlined, EyeOutlined } from '@ant-design/icons';
import { getInvitesByGala, createInvite, updateInvite, deleteInvite, affecterTable, retirerTable, importInvitesExcel } from '../api/galaInvitesService';
import galaService from '../api/galaService';
import Sidebar from '../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/table.css';

const { Title } = Typography;
const { Dragger } = Upload;

const GalaInvitesPage = () => {
  const [galas, setGalas] = useState([]);
  const [selectedGalaId, setSelectedGalaId] = useState(null);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInvite, setEditingInvite] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const navigate = useNavigate();

  // Récupérer le clubId depuis le localStorage
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const clubId = userInfo?.clubId;

  const fetchInvites = useCallback(async () => {
    if (!selectedGalaId) return;
    setLoading(true);
    try {
      const data = await getInvitesByGala(selectedGalaId, searchTerm);
      console.log('Données brutes reçues de l\'API:', data);
      
      const mappedData = (data || []).map(invite => {
        console.log('Invité avant mapping:', invite);
        const mappedInvite = {
          ...invite,
          Nom_Prenom: invite.Nom_Prenom || invite.nom_Prenom || invite.nom_prenom || invite.nomPrenom || '',
          TableAffectee: invite.TableAffectee || invite.tableAffectee || invite.table_affectee || ''
        };
        console.log('Invité après mapping:', mappedInvite);
        return mappedInvite;
      });
      
      console.log('Données mappées finales:', mappedData);
      setInvites(mappedData);
      setPagination(prev => ({
        ...prev,
        total: mappedData.length,
        current: 1,
      }));
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Votre session a expiré. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }
      message.error("Erreur lors du chargement des invités");
    } finally {
      setLoading(false);
    }
  }, [selectedGalaId, searchTerm, navigate]);

  // Responsive sidebar
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

  // Charger les galas au montage du composant
  useEffect(() => {
    const fetchGalas = async () => {
      try {
        setLoading(true);
        const response = await galaService.getAllGalas(clubId);
        setGalas(response.data);
        if (response.data.length > 0 && !selectedGalaId) {
          setSelectedGalaId(response.data[0].id || response.data[0].Id);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          message.error("Votre session a expiré. Veuillez vous reconnecter.");
          navigate('/login');
          return;
        }
        message.error("Erreur lors du chargement des galas");
      } finally {
        setLoading(false);
      }
    };
    fetchGalas();
  }, [navigate, clubId]);

  // Charger les invités quand le gala sélectionné change
  useEffect(() => {
    if (selectedGalaId) {
      fetchInvites();
    }
  }, [selectedGalaId, searchTerm, fetchInvites]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des invités selon le champ de recherche
  const filteredInvites = invites.filter(invite => {
    return (
      (invite.Nom_Prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invite.TableAffectee || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const openModal = (invite = null) => {
    setEditingInvite(invite);
    setModalVisible(true);
    if (invite) {
      form.setFieldsValue({
        Nom_Prenom: invite.Nom_Prenom,
        GalaId: invite.GalaId,
      });
    } else {
      form.resetFields();
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      message.error("ID invalide pour la suppression");
      return;
    }
    try {
      await deleteInvite(id);
      message.success('Invité supprimé');
      await fetchInvites();
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Votre session a expiré. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }
      message.error(error.response?.data?.message || error.message || "Erreur lors de la suppression");
    }
  };

  const handleSubmit = async (values) => {
    if (!selectedGalaId) {
      message.error("Veuillez sélectionner un gala.");
      return;
    }
    try {
      const payload = {
        GalaId: selectedGalaId,
        Nom_Prenom: values.Nom_Prenom
      };
      if (editingInvite) {
        await updateInvite(editingInvite.Id, { Nom_Prenom: values.Nom_Prenom });
        message.success('Invité modifié');
      } else {
        await createInvite(payload);
        message.success('Invité ajouté');
      }
      setModalVisible(false);
      setEditingInvite(null);
      form.resetFields();
      await fetchInvites();
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Votre session a expiré. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }
      message.error(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleAffecterTable = async (invite) => {
    Modal.confirm({
      title: `Affecter une table à ${invite.Nom_Prenom}`,
      content: (
        <Select
          showSearch
          placeholder="Sélectionner une table"
          style={{ width: '100%' }}
          onChange={async (tableId) => {
            try {
              await affecterTable(invite.Id, tableId);
              message.success('Table affectée');
              await fetchInvites();
              Modal.destroyAll();
            } catch (error) {
              if (error.response?.status === 401) {
                message.error("Votre session a expiré. Veuillez vous reconnecter.");
                navigate('/login');
                return;
              }
              message.error(error.response?.data?.message || error.message || "Erreur lors de l'affectation");
            }
          }}
        >
          {/* Les options de tables seront chargées dynamiquement si besoin */}
          {/* Pour l'instant, on laisse vide, à compléter si besoin */}
        </Select>
      ),
      okButtonProps: { style: { display: 'none' } },
      cancelText: 'Fermer',
    });
  };

  const handleRetirerTable = async (invite) => {
    try {
      await retirerTable(invite.Id);
      message.success('Affectation retirée');
      await fetchInvites();
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Votre session a expiré. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }
      message.error(error.response?.data?.message || error.message || "Erreur lors du retrait");
    }
  };

  const handleImport = async () => {
    if (!selectedGalaId) {
      message.error("Veuillez sélectionner un gala.");
      return;
    }
    if (!selectedFile) {
      message.error("Aucun fichier sélectionné.");
      return;
    }
    setImportLoading(true);
    try {
      const file = selectedFile;
      const result = await importInvitesExcel(selectedGalaId, file);
      setImportResult(result);
      message.success(result.Resume || 'Import terminé');
      setImportModalVisible(false);
      setSelectedFile(null);
      await fetchInvites();
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Votre session a expiré. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }
      message.error(error.response?.data?.message || error.message || "Erreur lors de l'import");
    } finally {
      setImportLoading(false);
    }
  };

  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

  const handleToggleCollapse = (collapsed) => {
    setIsCollapsed(collapsed);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openDetailModal = (invite) => {
    setSelectedInvite(invite);
    setDetailModalVisible(true);
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedInvite(null);
  };

  const columns = [
    {
      title: 'Invité',
      dataIndex: 'Nom_Prenom',
      key: 'Nom_Prenom',
      render: (text) => (
        <div className="flex items-center">
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span className="ellipsis-cell" style={{ maxWidth: 200 }} title={text}>
            {text}
          </span>
        </div>
      ),
    },
    {
      title: 'Table affectée',
      dataIndex: 'TableAffectee',
      key: 'TableAffectee',
      render: (text, record) => {
        console.log('Rendu de la colonne Table affectée:', { text, record });
        return (
          <div className="flex items-center">
            <TableOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span className="ellipsis-cell" style={{ maxWidth: 100 }} title={text || 'Non affecté'}>
              {text || 'Non affecté'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        console.log('Record dans Actions:', record);
        const inviteId = record.Id || record.id;
        if (!inviteId) {
          console.error('ID manquant pour l\'invité:', record);
          return null;
        }
        return (
          <Space>
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => openDetailModal(record)} 
              title="Voir les détails"
            />
            <Popconfirm 
              title="Supprimer cet invité ?" 
              onConfirm={() => handleDelete(inviteId)} 
              okText="Oui" 
              cancelText="Non"
            >
              <Button icon={<DeleteOutlined />} danger title="Supprimer l'invité" />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // Statistiques calculées à partir des invités filtrés
  const totalInvites = filteredInvites.length;
  const invitesSansTable = filteredInvites.filter(i => !i.TableAffectee).length;
  const invitesAvecTable = filteredInvites.filter(i => i.TableAffectee).length;

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
                  Gestion des Invités
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8} md={8} lg={8}>
              <Card>
                <Statistic
                  title="Total invités"
                  value={totalInvites}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} md={8} lg={8}>
              <Card>
                <Statistic
                  title="Affectés à une table"
                  value={invitesAvecTable}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} md={8} lg={8}>
              <Card>
                <Statistic
                  title="Sans table"
                  value={invitesSansTable}
                  prefix={<UserDeleteOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => openModal()}
            >
              Ajouter un invité
            </Button>
            <Button icon={<UploadOutlined />} onClick={() => setImportModalVisible(true)}>
              Import Excel
            </Button>
            <Input
              placeholder="Rechercher un invité..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
              allowClear
            />
            <Select
              showSearch
              placeholder="Sélectionner un gala"
              value={selectedGalaId}
              onChange={setSelectedGalaId}
              style={{ width: '100%', maxWidth: 300 }}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {galas.map(gala => (
                <Select.Option key={gala.id || gala.Id} value={gala.id || gala.Id}>
                  {gala.libelle || gala.Libelle}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredInvites}
              rowKey="Id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredInvites.length,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                responsive: true,
                showQuickJumper: isMobile ? false : true,
                showTotal: (total, range) => isMobile ? `${range[0]}-${range[1]} / ${total}` : `${range[0]}-${range[1]} sur ${total} éléments`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 'max-content' }}
              size="middle"
              className="responsive-table"
            />

            {/* Modal d'ajout/modification */}
            <Modal
              title={editingInvite ? 'Modifier l\'invité' : 'Ajouter un invité'}
              open={modalVisible}
              onCancel={() => { setModalVisible(false); setEditingInvite(null); form.resetFields(); }}
              footer={null}
              destroyOnClose
              width={isMobile ? '95%' : 400}
              centered={isMobile}
            >
              <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ GalaId: selectedGalaId }}>
                <Form.Item
                  name="GalaId"
                  label="Gala"
                  rules={[{ required: true, message: 'Veuillez sélectionner un gala' }]}
                >
                  <Select
                    showSearch
                    placeholder="Sélectionner un gala"
                    value={form.getFieldValue('GalaId')}
                    onChange={value => form.setFieldsValue({ GalaId: value })}
                    optionFilterProp="children"
                    filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                  >
                    {galas.map(gala => (
                      <Select.Option key={gala.id || gala.Id} value={gala.id || gala.Id}>
                        {gala.libelle || gala.Libelle}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="Nom_Prenom"
                  label="Nom & Prénom"
                  rules={[{ required: true, message: 'Le nom et prénom est obligatoire' }, { max: 200, message: '200 caractères max.' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Nom et prénom de l'invité" maxLength={200} />
                </Form.Item>
                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit">{editingInvite ? 'Mettre à jour' : 'Ajouter'}</Button>
                    <Button onClick={() => { setModalVisible(false); setEditingInvite(null); form.resetFields(); }}>Annuler</Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal d'import Excel */}
            <Modal
              title="Import d'invités par Excel"
              open={importModalVisible}
              onCancel={() => { setImportModalVisible(false); setImportResult(null); setSelectedFile(null); }}
              footer={null}
              destroyOnClose
              width={isMobile ? '95%' : 400}
              centered={isMobile}
            >
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">Gala</label>
                <Select
                  showSearch
                  placeholder="Sélectionner un gala"
                  value={selectedGalaId}
                  onChange={setSelectedGalaId}
                  style={{ width: '100%' }}
                  optionFilterProp="children"
                  filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                >
                  {galas.map(gala => (
                    <Select.Option key={gala.id || gala.Id} value={gala.id || gala.Id}>
                      {gala.libelle || gala.Libelle}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <Upload.Dragger
                name="file"
                multiple={false}
                beforeUpload={file => { setSelectedFile(file); return false; }}
                showUploadList={selectedFile ? [{ name: selectedFile.name }] : false}
                accept=".xlsx,.xls,.csv"
                fileList={selectedFile ? [selectedFile] : []}
                onRemove={() => setSelectedFile(null)}
                disabled={importLoading}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Cliquez ou glissez un fichier Excel ici</p>
              </Upload.Dragger>
              <div className="mt-4 flex justify-end gap-2">
                <Button onClick={() => { setImportModalVisible(false); setImportResult(null); setSelectedFile(null); }}>
                  Annuler
                </Button>
                <Button type="primary" onClick={handleImport} loading={importLoading} disabled={!selectedFile}>
                  Importer
                </Button>
              </div>
              {importResult && (
                <div className="mt-4">
                  <b>Résultat :</b>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{importResult.Resume}</pre>
                  {importResult.Erreurs && importResult.Erreurs.length > 0 && (
                    <ul style={{ color: 'red' }}>
                      {importResult.Erreurs.map((err, idx) => <li key={idx}>{err}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </Modal>

            {/* Modal de détails */}
            <Modal
              title="Détails de l'invité"
              open={detailModalVisible}
              onCancel={closeDetailModal}
              footer={[
                <Button key="close" onClick={closeDetailModal}>
                  Fermer
                </Button>
              ]}
              width={isMobile ? '95%' : 400}
              centered={isMobile}
            >
              {selectedInvite && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Card size="small" title="Nom & Prénom">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <UserOutlined style={{ marginRight: 8 }} />
                          {selectedInvite.Nom_Prenom}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24}>
                      <Card size="small" title="Table affectée">
                        <p>
                          <TableOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {selectedInvite.TableAffectee || 'Aucune'}
                        </p>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}
            </Modal>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GalaInvitesPage;