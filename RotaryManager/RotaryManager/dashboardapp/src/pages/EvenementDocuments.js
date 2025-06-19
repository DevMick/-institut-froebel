import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select, Upload, Spin, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, FileTextOutlined, CalendarOutlined, SearchOutlined, EyeOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { evenementService } from '../api/evenementService';
import { evenementDocumentService } from '../services/evenementDocumentService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import '../styles/table.css';

const { Panel } = Collapse;

const EvenementDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [evenements, setEvenements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingEvenements, setLoadingEvenements] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

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

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleToggleCollapse = useCallback((collapsed) => {
        setIsCollapsed(collapsed);
    }, []);

    const sidebarWidth = isCollapsed ? '4rem' : '18rem';

    const fetchEvenements = useCallback(async () => {
        try {
            setLoadingEvenements(true);
            console.log('=== DÉBUT fetchEvenements ===');
            
            const response = await evenementService.getEvenements();
            console.log('Données reçues du serveur:', response);
            
            if (response && response.data) {
                const evenementsData = Array.isArray(response.data) ? response.data : [];
                console.log('Nombre d\'événements reçus:', evenementsData.length);
                console.log('Premier événement:', evenementsData[0]);
                setEvenements(evenementsData);
                console.log('État mis à jour avec les événements');
            } else {
                console.error('Les données reçues ne sont pas valides:', response);
                setEvenements([]);
            }
        } catch (error) {
            console.error('=== ERREUR DÉTAILLÉE ===');
            console.error('Message d\'erreur:', error.message);
            console.error('Stack trace:', error.stack);
            message.error(error.message || 'Erreur lors du chargement des événements');
            setEvenements([]);
        } finally {
            setLoadingEvenements(false);
            console.log('=== FIN fetchEvenements ===');
        }
    }, []);

    const fetchDocuments = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            const { documents, totalCount } = await evenementDocumentService.getDocuments({
                page: params.page || pagination.current,
                pageSize: params.pageSize || pagination.pageSize,
                ...params
            });
            setDocuments(documents);
            setPagination(prev => ({
                ...prev,
                total: totalCount,
                current: params.page || prev.current,
            }));
        } catch (error) {
            console.error('Erreur lors du chargement des documents:', error);
            message.error('Erreur lors du chargement des documents');
            setDocuments([]);
            setPagination(prev => ({ ...prev, total: 0, current: 1 }));
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize]);

    useEffect(() => {
        fetchEvenements();
    }, [fetchEvenements]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    useEffect(() => {
        console.log('État des événements mis à jour:', evenements);
    }, [evenements]);

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
        fetchDocuments({ page: newPagination.current, pageSize: newPagination.pageSize });
    };

    // Filtrage des documents selon le champ de recherche
    const filteredDocuments = documents.filter(doc => {
        return (
            (doc.libelle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.evenementLibelle || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Grouper les documents par événement
    const documentsGroupesParEvenement = filteredDocuments.reduce((acc, document) => {
        const evenementLibelle = document.evenementLibelle || 'Événement non défini';
        if (!acc[evenementLibelle]) {
            acc[evenementLibelle] = [];
        }
        acc[evenementLibelle].push(document);
        return acc;
    }, {});

    // Statistiques calculées à partir des documents filtrés
    const totalDocuments = filteredDocuments.length;
    const totalSize = filteredDocuments.reduce((sum, doc) => sum + (doc.tailleDocument || 0), 0);
    const averageSize = totalDocuments > 0 ? (totalSize / totalDocuments) : 0;
    const uniqueEvenements = new Set(filteredDocuments.map(doc => doc.evenementId)).size;

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Colonnes pour le tableau des documents dans chaque événement
    const documentsColumns = [
        {
            title: 'Document',
            key: 'document',
            width: 200,
            render: (_, record) => (
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
                        <FileTextOutlined />
                    </div>
                    <div style={{ maxWidth: 160 }}>
                        <div className="font-medium text-gray-900 ellipsis-cell" style={{ maxWidth: 160 }} title={record.libelle}>
                            {record.libelle}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Date d\'ajout',
            dataIndex: 'dateAjout',
            key: 'dateAjout',
            render: (date) => {
                const formatted = date ? format(new Date(date), 'dd/MM/yyyy', { locale: fr }) : '';
                return <span title={formatted}>{formatted}</span>;
            },
        },
        {
            title: 'Taille',
            dataIndex: 'tailleDocument',
            key: 'tailleDocument',
            render: (size) => (
                <span style={{ color: '#52c41a', fontWeight: 'bold' }} title={formatFileSize(size)}>
                    <CloudUploadOutlined style={{ marginRight: 8 }} />
                    {formatFileSize(size)}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(record.id)}
                        title="Télécharger"
                    />
                    <Button 
                        icon={<EyeOutlined />} 
                        onClick={() => openDetailModal(record)} 
                        title="Voir les détails"
                    />
                    <Popconfirm
                        title="Êtes-vous sûr de vouloir supprimer ce document ?"
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
        if (record) {
            form.setFieldsValue({
                libelle: record.libelle,
                evenementId: record.evenementId
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ 
                libelle: '',
                evenementId: undefined
            });
        }
        setSelectedFile(null);
    };

    const openDetailModal = async (record) => {
        try {
            setSelectedDocument(record);
            setDetailModalVisible(true);
        } catch (error) {
            message.error("Erreur lors du chargement des détails");
        }
    };

    const closeDetailModal = () => {
        setDetailModalVisible(false);
        setSelectedDocument(null);
    };

    const handleDownload = async (id) => {
        try {
            const blob = await evenementDocumentService.downloadDocument(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `document_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            message.success('Document téléchargé avec succès');
        } catch (error) {
            message.error('Erreur lors du téléchargement du document');
        }
    };

    const handleDelete = async (id) => {
        try {
            await evenementDocumentService.deleteDocument(id);
            message.success('Document supprimé avec succès');
            fetchDocuments();
        } catch (error) {
            message.error('Erreur lors de la suppression du document: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleFileChange = (info) => {
        console.log('=== DÉBUT handleFileChange ===');
        console.log('Info complète:', info);
        console.log('File:', info.file);
        console.log('FileList:', info.fileList);
        console.log('File type:', typeof info.file);
        console.log('File properties:', Object.keys(info.file));
        
        if (info.file.status === 'removed') {
            console.log('Fichier supprimé');
            setSelectedFile(null);
            return;
        }
        
        const file = info.file;
        console.log('Nouveau fichier sélectionné:', file);
        console.log('Fichier originFileObj:', file.originFileObj);
        console.log('Type du fichier:', file.type);
        console.log('Taille du fichier:', file.size);
        
        setSelectedFile(file);
        console.log('=== FIN handleFileChange ===');
    };

    const handleSubmit = async (values) => {
        console.log('=== DÉBUT handleSubmit ===');
        console.log('Values du formulaire:', values);
        console.log('SelectedFile complet:', selectedFile);
        
        try {
            if (!editingDocument && !selectedFile) {
                console.log('ERREUR: Aucun fichier sélectionné');
                message.error('Veuillez sélectionner un fichier');
                return;
            }

            const formData = new FormData();
            formData.append('EvenementId', values.evenementId);
            formData.append('Libelle', values.libelle);
            
            if (selectedFile) {
                const fileToUpload = selectedFile.originFileObj || selectedFile;
                formData.append('Document', fileToUpload);
            }

            if (editingDocument) {
                console.log('Mise à jour du document:', editingDocument.id);
                await evenementDocumentService.replaceDocument(editingDocument.id, formData);
                message.success('Document mis à jour avec succès');
            } else {
                console.log('Création d\'un nouveau document');
                await evenementDocumentService.createDocument(formData);
                message.success('Document créé avec succès');
            }

            setModalVisible(false);
            form.resetFields();
            setSelectedFile(null);
            setEditingDocument(null);
            fetchDocuments();
        } catch (error) {
            console.error('=== ERREUR DÉTAILLÉE ===');
            console.error('Message d\'erreur:', error.message);
            message.error(error.response?.data?.message || error.message || 'Erreur lors de l\'enregistrement du document');
        }
    };

    // Calculer les statistiques pour un événement spécifique
    const getEvenementStats = (documents) => {
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
                                    Documents d'Événements
                                </h1>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-8 max-w-full">
                    {/* Statistiques principales */}
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Card>
                                <Statistic
                                    title="Total Documents"
                                    value={totalDocuments}
                                    prefix={<FileTextOutlined />}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Card>
                                <Statistic
                                    title="Taille Totale"
                                    value={formatFileSize(totalSize)}
                                    prefix={<CloudUploadOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Card>
                                <Statistic
                                    title="Taille Moyenne"
                                    value={formatFileSize(averageSize)}
                                    prefix={<CloudUploadOutlined />}
                                    valueStyle={{ color: '#f59e0b' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Card>
                                <Statistic
                                    title="Événements"
                                    value={uniqueEvenements}
                                    prefix={<CalendarOutlined />}
                                    valueStyle={{ color: '#722ed1' }}
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
                            Ajouter un document
                        </Button>
                        <Input
                            placeholder="Rechercher par libellé ou événement..."
                            prefix={<SearchOutlined />}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%', maxWidth: 300 }}
                            allowClear
                        />
                    </div>

                    {/* Affichage groupé par événement */}
                    <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow">
                        {loading ? (
                            <div className="text-center py-8">
                                <Spin size="large" />
                                <p className="mt-4">Chargement des documents...</p>
                            </div>
                        ) : Object.keys(documentsGroupesParEvenement).length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Aucun document trouvé</p>
                            </div>
                        ) : (
                            <Collapse 
                                defaultActiveKey={Object.keys(documentsGroupesParEvenement)} 
                                className="document-collapse"
                            >
                                {Object.entries(documentsGroupesParEvenement).map(([evenementLibelle, documents]) => {
                                    const stats = getEvenementStats(documents);
                                    
                                    return (
                                        <Panel 
                                            header={
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <CalendarOutlined style={{ marginRight: 12, color: '#1890ff', fontSize: '16px' }} />
                                                        <span className="font-semibold text-lg">{evenementLibelle}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                            {documents.length} document{documents.length > 1 ? 's' : ''}
                                                        </span>
                                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                            Taille: {formatFileSize(stats.totalSize)}
                                                        </span>
                                                    </div>
                                                </div>
                                            } 
                                            key={evenementLibelle}
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

                        {/* Modal d'ajout/modification */}
                        <Modal
                            title={editingDocument ? "Modifier le document" : "Ajouter un document"}
                            open={modalVisible}
                            onCancel={() => {
                                setModalVisible(false);
                                setEditingDocument(null);
                                form.resetFields();
                                setSelectedFile(null);
                            }}
                            footer={null}
                            destroyOnClose
                            width={isMobile ? '95%' : 600}
                            centered={isMobile}
                        >
                            <Form
                                form={form}
                                onFinish={handleSubmit}
                                layout="vertical"
                                initialValues={editingDocument ? undefined : {
                                    libelle: '',
                                    evenementId: undefined
                                }}
                            >
                                <Form.Item
                                    name="evenementId"
                                    label="Événement"
                                    rules={[{ required: true, message: 'Veuillez sélectionner un événement' }]}
                                >
                                    <Select
                                        placeholder="Sélectionnez un événement"
                                        loading={loadingEvenements}
                                        notFoundContent={loadingEvenements ? <Spin size="small" /> : "Aucun événement trouvé"}
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                        allowClear
                                        disabled={loadingEvenements}
                                        onChange={(value) => {
                                            console.log('Événement sélectionné:', value);
                                            console.log('Événement correspondant:', evenements.find(e => e.id === value));
                                        }}
                                    >
                                        {evenements.map(evenement => (
                                            <Select.Option key={evenement.id} value={evenement.id}>
                                                {evenement.libelle}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="libelle"
                                    label="Libellé"
                                    rules={[
                                        { required: true, message: 'Veuillez saisir un libellé' },
                                        { max: 200, message: 'Le libellé ne peut pas dépasser 200 caractères' }
                                    ]}
                                >
                                    <Input 
                                        placeholder="Saisissez le libellé du document"
                                        prefix={<FileTextOutlined />}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="document"
                                    label="Document"
                                    rules={[{ 
                                        required: !editingDocument, 
                                        message: 'Veuillez sélectionner un document',
                                        validator: (_, value) => {
                                            if (!editingDocument && !selectedFile) {
                                                return Promise.reject('Veuillez sélectionner un document');
                                            }
                                            return Promise.resolve();
                                        }
                                    }]}
                                >
                                    <Upload
                                        beforeUpload={() => {
                                            console.log('beforeUpload appelé');
                                            return false;
                                        }}
                                        maxCount={1}
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        fileList={selectedFile ? [{
                                            uid: selectedFile.uid || '-1',
                                            name: selectedFile.name,
                                            status: 'done',
                                        }] : []}
                                    >
                                        <Button icon={<UploadOutlined />}>
                                            {editingDocument ? 'Remplacer le fichier' : 'Sélectionner un fichier'}
                                        </Button>
                                    </Upload>
                                    {editingDocument && !selectedFile && (
                                        <div style={{ marginTop: 8, color: '#666' }}>
                                            Fichier actuel conservé (laissez vide pour ne pas modifier)
                                        </div>
                                    )}
                                </Form.Item>

                                <Form.Item>
                                    <Space className="w-full justify-end">
                                        <Button type="primary" htmlType="submit">
                                            {editingDocument ? "Mettre à jour" : "Créer"}
                                        </Button>
                                        <Button onClick={() => {
                                            setModalVisible(false);
                                            setEditingDocument(null);
                                            form.resetFields();
                                            setSelectedFile(null);
                                        }}>
                                            Annuler
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </Modal>

                        {/* Modal de détails */}
                        <Modal
                            title="Détails du Document"
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
                            {selectedDocument && (
                                <div>
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} sm={24} md={12}>
                                            <Card size="small" title="Libellé">
                                                <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                                                    <FileTextOutlined style={{ marginRight: 8 }} />
                                                    {selectedDocument.libelle}
                                                </p>
                                            </Card>
                                        </Col>
                                        <Col xs={24} sm={24} md={12}>
                                            <Card size="small" title="Événement">
                                                <p>
                                                    <CalendarOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                                                    {selectedDocument.evenementLibelle}
                                                </p>
                                            </Card>
                                        </Col>
                                        <Col xs={24} sm={24} md={12}>
                                            <Card size="small" title="Date d'ajout">
                                                <p>
                                                    {selectedDocument.dateAjout ? 
                                                        format(new Date(selectedDocument.dateAjout), 'dd MMMM yyyy à HH:mm', { locale: fr }) : 
                                                        'Non spécifiée'
                                                    }
                                                </p>
                                            </Card>
                                        </Col>
                                        <Col xs={24} sm={24} md={12}>
                                            <Card size="small" title="Taille du fichier">
                                                <p style={{ fontWeight: 'bold', color: '#52c41a' }}>
                                                    <CloudUploadOutlined style={{ marginRight: 8 }} />
                                                    {formatFileSize(selectedDocument.tailleDocument)}
                                                </p>
                                            </Card>
                                        </Col>
                                        <Col xs={24}>
                                            <Card size="small" title="Actions disponibles">
                                                <Space>
                                                    <Button 
                                                        type="primary"
                                                        icon={<DownloadOutlined />}
                                                        onClick={() => {
                                                            handleDownload(selectedDocument.id);
                                                        }}
                                                    >
                                                        Télécharger
                                                    </Button>
                                                </Space>
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

export default EvenementDocuments;