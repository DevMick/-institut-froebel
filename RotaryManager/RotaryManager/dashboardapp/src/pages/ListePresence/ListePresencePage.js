import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, Card, Row, Col, Statistic, message, Modal, Form, Select, Popconfirm, Space, Tag, Typography, Input, Spin, Collapse } from 'antd';
import { PlusOutlined, UserOutlined, UserDeleteOutlined, EyeOutlined, BarChartOutlined, CheckCircleOutlined, CloseCircleOutlined, SearchOutlined, CalendarOutlined, TeamOutlined, MailOutlined } from '@ant-design/icons';
import Sidebar from '../../components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';
import axios from 'axios';
import '../../styles/table.css';
import { getClubMembers } from '../../api/memberService';

const { Option } = Select;
const { Panel } = Collapse;

const ListePresencePage = () => {
  const { clubId } = useParams();
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form] = Form.useForm();
  const [reunions, setReunions] = useState([]);
  const [selectedReunionForForm, setSelectedReunionForForm] = useState(null);
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [membresAbsents, setMembresAbsents] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [presenceDetail, setPresenceDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [membresAbsentsParReunion, setMembresAbsentsParReunion] = useState({});
  const [membres, setMembres] = useState([]);

  const fetchReunions = useCallback(async () => {
    if (!clubId) {
      console.log('fetchReunions: clubId is missing');
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/reunions`);
      console.log('Réunions chargées:', response.data);
      setReunions(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des réunions:', error);
      message.error("Erreur lors du chargement des réunions");
    }
  }, [clubId]);

  const fetchPresences = useCallback(async () => {
    if (!clubId) {
      console.log('fetchPresences: clubId manquant');
      setPresences([]);
      setMembresAbsentsParReunion({});
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }
    if (reunions.length === 0) {
      console.log("fetchPresences: Aucune réunion chargée, impossible de récupérer les présences.");
      setPresences([]);
      setMembresAbsentsParReunion({});
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
      return;
    }

    setLoading(true);
    try {
      console.log('Début fetchPresences - Réunions à traiter:', reunions);
      const allDataPromises = reunions.map(reunion => {
        console.log(`Traitement de la réunion ${reunion.id}:`, reunion);
        return axios.get(`${API_BASE_URL}/api/clubs/${clubId}/reunions/${reunion.id}/presences`)
          .then(response => {
            console.log(`Réponse pour la réunion ${reunion.id}:`, response.data);
            const presencesWithReunionId = (response.data.presences || []).map(p => ({
              ...p,
              reunionId: reunion.id
            }));
            return {
              reunionId: reunion.id,
              presences: presencesWithReunionId,
              membresAbsents: response.data.membresAbsents || []
            };
          })
          .catch(error => {
            console.error(`Erreur lors du chargement des données pour la réunion ${reunion.id}:`, error);
            return { reunionId: reunion.id, presences: [], membresAbsents: [] };
          });
      });

      const results = await Promise.all(allDataPromises);
      console.log('Résultats de toutes les requêtes:', results);
      
      const mergedPresences = results.flatMap(result => result.presences);
      console.log('Présences fusionnées:', mergedPresences);
      
      const absentsByReunion = results.reduce((acc, result) => {
        acc[result.reunionId] = result.membresAbsents;
        return acc;
      }, {});

      console.log('Membres absents par réunion:', absentsByReunion);

      setPresences(mergedPresences);
      setMembresAbsentsParReunion(absentsByReunion);
      
      setPagination(prev => ({
        ...prev,
        total: mergedPresences.length,
        current: 1,
      }));

    } catch (error) {
      console.error('Erreur globale lors du chargement des présences:', error);
      message.error("Erreur globale lors du chargement des présences");
      setPresences([]);
      setMembresAbsentsParReunion({});
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    } finally {
      setLoading(false);
    }
  }, [clubId, reunions]);

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
      fetchReunions();
    }
  }, [clubId, fetchReunions]);

  useEffect(() => {
    if (clubId && reunions.length > 0) {
      fetchPresences();
    } else if (clubId && reunions.length === 0) {
    }
  }, [clubId, reunions, fetchPresences]);

  useEffect(() => {
    const fetchMembres = async () => {
      if (!clubId) return;
      try {
        const membresData = await getClubMembers(clubId);
        setMembres(membresData);
        console.log('Membres du club chargés:', membresData);
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error);
        message.error("Erreur lors du chargement des membres");
      }
    };
    fetchMembres();
  }, [clubId]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Filtrage des présences selon le champ de recherche
  const filteredPresences = presences.filter(p => {
    console.log('Filtrage de la présence:', p);
    const reunion = reunions.find(r => r.id === p.reunionId);
    console.log('Réunion trouvée:', reunion);
    const reunionInfo = reunion ? `${new Date(reunion.date).toLocaleDateString('fr-FR')} ${reunion.typeReunionLibelle}` : '';
    return (
      (p.nomCompletMembre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.emailMembre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      reunionInfo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Grouper les présences par réunion
  const presencesGroupeesParReunion = filteredPresences.reduce((acc, presence) => {
    const reunion = reunions.find(r => r.id === presence.reunionId);
    const reunionKey = reunion 
      ? `${new Date(reunion.date).toLocaleDateString('fr-FR')} - ${reunion.typeReunionLibelle}`
      : 'Réunion non définie';
    
    if (!acc[reunionKey]) {
      acc[reunionKey] = [];
    }
    acc[reunionKey].push(presence);
    return acc;
  }, {});

  console.log('Présences filtrées:', filteredPresences);

  // Statistiques calculées à partir des présences filtrées
  const totalPresences = filteredPresences.length;
  const presencesActifs = filteredPresences.filter(p => p.estActifMembre).length;
  const presencesInactifs = totalPresences - presencesActifs;
  const reunionsAvecPresence = new Set(filteredPresences.map(p => p.reunionId)).size;

  // Colonnes pour le tableau des présences dans chaque réunion
  const presencesColumns = [
    {
      title: 'Membre',
      key: 'membre',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
            <UserOutlined />
          </div>
          <div style={{ maxWidth: 200 }}>
            <div className="font-medium text-gray-900 ellipsis-cell" style={{ maxWidth: 200 }} title={record.nomCompletMembre}>
              {record.nomCompletMembre}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      key: 'email',
      render: (_, record) => (
        <span>
          <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {record.emailMembre}
        </span>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'estActifMembre',
      key: 'estActifMembre',
      render: (actif) => actif ? (
        <Tag color="green" icon={<CheckCircleOutlined />}>Actif</Tag>
      ) : (
        <Tag color="red" icon={<CloseCircleOutlined />}>Inactif</Tag>
      ),
      sorter: (a, b) => (a.estActifMembre ? 1 : 0) - (b.estActifMembre ? 1 : 0),
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
          <Popconfirm 
            title="Retirer cette présence ?" 
            onConfirm={() => handleDelete(record.id)} 
            okText="Oui" 
            cancelText="Non"
            description="Cette action est irréversible."
          >
            <Button icon={<UserDeleteOutlined />} danger title="Retirer" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleDelete = async (id) => {
    try {
      // Trouver la présence à supprimer pour obtenir l'ID de la réunion
      const presence = presences.find(p => p.id === id);
      if (!presence) {
        message.error("Présence non trouvée");
        return;
      }

      await axios.delete(`${API_BASE_URL}/api/clubs/${clubId}/reunions/${presence.reunionId}/presences/${id}`);
      message.success('Présence supprimée');
      fetchPresences();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      message.error("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
    }
  };

  const handleReunionChangeForForm = (value) => {
    setSelectedReunionForForm(value);
    form.setFieldsValue({ reunionId: value });
    setSelectedMembre(null);
    form.setFieldsValue({ membreId: undefined });
    console.log('Réunion sélectionnée dans le formulaire:', value);
    console.log('Membres absents pour cette réunion:', membresAbsentsParReunion[value]);
  };

  const handleMembreChange = (value) => {
    form.setFieldsValue({ membreId: value });
    const absentsPourReunionSelectionnee = membresAbsentsParReunion[selectedReunionForForm] || [];
    const membre = absentsPourReunionSelectionnee.find(m => m.id === value);
    setSelectedMembre(membre || null);
  };

  const handleAddPresence = async (values) => {
    if (!clubId) {
      message.error("Erreur d'authentification.");
      return;
    }
    console.log('Ajout d\'une présence avec les valeurs:', values);
    setAdding(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/clubs/${clubId}/reunions/${values.reunionId}/presences`, { MembreId: values.membreId });
      console.log('Réponse de l\'ajout de présence:', response.data);
      message.success('Présence ajoutée');
      setModalVisible(false);
      form.resetFields();
      setSelectedMembre(null);
      setSelectedReunionForForm(null);
      fetchPresences();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la présence:', error);
      if (error.response && error.response.status === 400) {
        message.error(error.response.data);
      } else {
        message.error(error.response?.data?.message || error.message || "Erreur lors de l'ajout de la présence");
      }
    } finally {
      setAdding(false);
    }
  };

  const openDetailModal = async (id) => {
    setDetailModalVisible(true);
    setDetailLoading(true);
    try {
      const presence = presences.find(p => p.id === id);
      if (!presence) {
        throw new Error('Présence non trouvée');
      }
      const reunion = reunions.find(r => r.id === presence.reunionId);
      setPresenceDetail({
        ...presence,
        reunionInfo: reunion ? {
          date: reunion.date,
          type: reunion.typeReunionLibelle,
          heure: reunion.heure
        } : null
      });
    } catch (error) {
      message.error("Erreur lors du chargement du détail de la présence");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setPresenceDetail(null);
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
  const getReunionStats = (presences) => {
    const actifs = presences.filter(p => p.estActifMembre).length;
    const inactifs = presences.length - actifs;
    return { actifs, inactifs, total: presences.length };
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
                  Liste de présence
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* Statistiques principales */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Total présences"
                  value={totalPresences}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Membres actifs"
                  value={presencesActifs}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Membres inactifs"
                  value={presencesInactifs}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Réunions concernées"
                  value={reunionsAvecPresence}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              Marquer un membre présent
            </Button>
            <Input
              placeholder="Rechercher par nom, email ou réunion..."
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
                <p className="mt-4">Chargement des présences...</p>
              </div>
            ) : Object.keys(presencesGroupeesParReunion).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune présence trouvée</p>
              </div>
            ) : (
              <Collapse 
                defaultActiveKey={Object.keys(presencesGroupeesParReunion)} 
                className="presence-collapse"
              >
                {Object.entries(presencesGroupeesParReunion).map(([reunionInfo, presences]) => {
                  const stats = getReunionStats(presences);
                  const reunion = reunions.find(r => 
                    presences.length > 0 && r.id === presences[0].reunionId
                  );
                  
                  return (
                    <Panel 
                      header={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CalendarOutlined style={{ marginRight: 12, color: '#1890ff', fontSize: '16px' }} />
                            <div>
                              <span className="font-semibold text-lg">{reunionInfo}</span>
                              {reunion && (
                                <div className="text-sm text-gray-500">
                                  <TeamOutlined style={{ marginRight: 4 }} />
                                  {reunion.heure && reunion.heure.substring(0,5)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {presences.length} présent{presences.length > 1 ? 's' : ''}
                            </span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              {stats.actifs} actif{stats.actifs > 1 ? 's' : ''}
                            </span>
                            {stats.inactifs > 0 && (
                              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                {stats.inactifs} inactif{stats.inactifs > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      } 
                      key={reunionInfo}
                      className="mb-4"
                    >
                      <Table
                        columns={presencesColumns}
                        dataSource={presences}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        className="presence-table"
                        scroll={{ x: 'max-content' }}
                      />
                    </Panel>
                  );
                })}
              </Collapse>
            )}

            {/* Modal d'ajout */}
            <Modal
              title="Marquer un membre présent"
              open={modalVisible}
              onCancel={() => { setModalVisible(false); form.resetFields(); setSelectedMembre(null); setSelectedReunionForForm(null); }}
              footer={null}
              destroyOnClose
              width={isMobile ? '95%' : 600}
              centered={isMobile}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleAddPresence}
              >
                <Form.Item
                  name="reunionId"
                  label="Sélectionner la réunion"
                  rules={[{ required: true, message: 'La réunion est obligatoire' }]}
                >
                  <Select
                    showSearch
                    placeholder="Sélectionnez une réunion"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={handleReunionChangeForForm}
                    value={selectedReunionForForm}
                  >
                    {reunions.map(r => (
                      <Option key={r.id} value={r.id}>
                        {`${new Date(r.date).toLocaleDateString('fr-FR')} - ${r.typeReunionLibelle}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="membreId"
                  label="Sélectionner un membre"
                  rules={[{ required: true, message: 'Le membre est obligatoire' }]}
                >
                  <Select
                    showSearch
                    placeholder="Sélectionner un membre"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={handleMembreChange}
                    value={form.getFieldValue('membreId')}
                  >
                    {membres.map(m => (
                      <Option key={m.id} value={m.id}>
                        {`${m.nomComplet || (m.firstName + ' ' + m.lastName)} (${m.email})`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Space className="w-full justify-end">
                    <Button type="primary" htmlType="submit" loading={adding}>
                      Marquer présent
                    </Button>
                    <Button onClick={() => { setModalVisible(false); form.resetFields(); setSelectedMembre(null); setSelectedReunionForForm(null); }}>
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* Modal de détails */}
            <Modal
              title="Détails de la présence"
              open={detailModalVisible}
              onCancel={closeDetailModal}
              footer={[
                <Button key="close" onClick={closeDetailModal}>
                  Fermer
                </Button>
              ]}
              width={isMobile ? '95%' : 600}
              centered={isMobile}
            >
              {detailLoading ? (
                <div className="text-center py-8">
                  <Spin size="large" />
                  <p className="mt-4">Chargement des détails...</p>
                </div>
              ) : presenceDetail ? (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Membre">
                        <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          <UserOutlined style={{ marginRight: 8 }} />
                          {presenceDetail.nomCompletMembre}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Email">
                        <p>
                          <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          {presenceDetail.emailMembre}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Statut">
                        <p>
                          {presenceDetail.estActifMembre ? (
                            <Tag color="green" icon={<CheckCircleOutlined />}>Actif</Tag>
                          ) : (
                            <Tag color="red" icon={<CloseCircleOutlined />}>Inactif</Tag>
                          )}
                        </p>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" title="Réunion">
                        <p>
                          <CalendarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                          {presenceDetail.reunionInfo ? (
                            <>
                              {new Date(presenceDetail.reunionInfo.date).toLocaleDateString('fr-FR')}
                              {presenceDetail.reunionInfo.heure && ` à ${presenceDetail.reunionInfo.heure.substring(0, 5)}`}
                              <br />
                              <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                              {presenceDetail.reunionInfo.type}
                            </>
                          ) : 'Réunion non définie'}
                        </p>
                      </Card>
                    </Col>
                  </Row>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun détail disponible</p>
                </div>
              )}
            </Modal>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListePresencePage;