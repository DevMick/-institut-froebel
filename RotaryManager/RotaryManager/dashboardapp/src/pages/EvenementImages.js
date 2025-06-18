import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Row, Col, Statistic, Select, Upload, Spin, Image, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, PictureOutlined, CalendarOutlined, SearchOutlined, EyeOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { evenementImageService } from '../services/evenementImageService';
import { evenementService } from '../api/evenementService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import '../styles/table.css';

const { Panel } = Collapse;

const EvenementImages = () => {
    const [images, setImages] = useState([]);
    const [evenements, setEvenements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingEvenements, setLoadingEvenements] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
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

    // Fonction utilitaire pour convertir une image en base64 avec authentification
    const fetchImageAsBase64 = async (url) => {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const fetchImages = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            const { images, totalCount } = await evenementImageService.getImages({
                page: params.page || pagination.current,
                pageSize: params.pageSize || pagination.pageSize,
                ...params
            });
            // Pour chaque image, récupérer la version base64
            const imagesWithBase64 = await Promise.all(images.map(async (img) => {
                let base64 = '';
                try {
                    base64 = await fetchImageAsBase64(img.imageUrl);
                } catch (e) {
                    base64 = '';
                }
                return { ...img, imageUrl: base64 };
            }));
            setImages(imagesWithBase64);
            setPagination(prev => ({
                ...prev,
                total: totalCount,
                current: params.page || prev.current,
            }));
        } catch (error) {
            console.error('Erreur lors du chargement des images:', error);
            message.error('Erreur lors du chargement des images');
            setImages([]);
            setPagination(prev => ({ ...prev, total: 0, current: 1 }));
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize]);

    useEffect(() => {
        fetchEvenements();
    }, [fetchEvenements]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
        fetchImages({ page: newPagination.current, pageSize: newPagination.pageSize });
    };

    // Filtrage des images selon le champ de recherche
    const filteredImages = images.filter(img => {
        return (
            (img.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (img.evenementLibelle || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Grouper les images par événement
    const imagesGroupeesParEvenement = filteredImages.reduce((acc, image) => {
        const evenementLibelle = image.evenementLibelle || 'Événement non défini';
        if (!acc[evenementLibelle]) {
            acc[evenementLibelle] = [];
        }
        acc[evenementLibelle].push(image);
        return acc;
    }, {});

    // Statistiques calculées à partir des images filtrées
    const totalImages = filteredImages.length;
    const totalSize = filteredImages.reduce((sum, img) => sum + (img.tailleImage || 0), 0);
    const averageSize = totalImages > 0 ? (totalSize / totalImages) : 0;
    const uniqueEvenements = new Set(filteredImages.map(img => img.evenementId)).size;

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Colonnes pour le tableau des images dans chaque événement
    const imagesColumns = [
        {
            title: 'Image',
            key: 'image',
            width: 120,
            render: (_, record) => (
                <Image
                    src={record.imageUrl}
                    alt="Image"
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover', cursor: 'pointer', borderRadius: '8px' }}
                    preview={false}
                    onClick={() => {
                        setPreviewImage(record.imageUrl);
                        setPreviewVisible(true);
                    }}
                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZjVmNSIvPgogIDx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPg=="
                />
            ),
        },
        {
            title: 'Description',
            key: 'description',
            width: 200,
            render: (_, record) => (
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-purple-100 text-purple-600">
                        <PictureOutlined />
                    </div>
                    <div style={{ maxWidth: 160 }}>
                        <div className="font-medium text-gray-900 ellipsis-cell" style={{ maxWidth: 160 }} title={record.description || 'Aucune description'}>
                            {record.description || 'Aucune description'}
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
            dataIndex: 'tailleImage',
            key: 'tailleImage',
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
                        title="Êtes-vous sûr de vouloir supprimer cette image ?"
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
        setEditingImage(record);
        setModalVisible(true);
        if (record) {
            form.setFieldsValue({
                description: record.description,
                evenementId: record.evenementId
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ 
                description: '',
                evenementId: undefined
            });
        }
        setSelectedFiles([]);
    };

    const openDetailModal = async (record) => {
        try {
            setSelectedImage(record);
            setDetailModalVisible(true);
        } catch (error) {
            message.error("Erreur lors du chargement des détails");
        }
    };

    const closeDetailModal = () => {
        setDetailModalVisible(false);
        setSelectedImage(null);
    };

    const handleDownload = async (id) => {
        try {
            const blob = await evenementImageService.downloadImage(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `image_${id}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            message.success('Image téléchargée avec succès');
        } catch (error) {
            message.error('Erreur lors du téléchargement de l\'image');
        }
    };

    const handleDelete = async (id) => {
        try {
            await evenementImageService.deleteImage(id);
            message.success('Image supprimée avec succès');
            fetchImages();
        } catch (error) {
            message.error('Erreur lors de la suppression de l\'image: ' + (error.response?.data?.message || error.message));
        }
    };

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
    };

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = ({ fileList }) => {
        setSelectedFiles(fileList);
    };

    const handleSubmit = async (values) => {
        try {
            if (!editingImage && selectedFiles.length === 0) {
                message.error('Veuillez sélectionner au moins une image');
                return;
            }

            const formData = new FormData();
            formData.append('EvenementId', values.evenementId);
            if (values.description) {
                formData.append('Description', values.description);
            }

            if (editingImage) {
                if (selectedFiles.length > 0) {
                    formData.append('Image', selectedFiles[0].originFileObj);
                }
                await evenementImageService.updateImage(editingImage.id, formData);
                message.success('Image modifiée avec succès');
            } else {
                selectedFiles.forEach((file, index) => {
                    formData.append('Image', file.originFileObj);
                });
                await evenementImageService.createImage(formData);
                message.success('Images ajoutées avec succès');
            }

            setModalVisible(false);
            setEditingImage(null);
            form.resetFields();
            setSelectedFiles([]);
            fetchImages();
        } catch (error) {
            message.error(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
        }
    };

    // Calculer les statistiques pour un événement spécifique
    const getEvenementStats = (images) => {
        const totalSize = images.reduce((sum, img) => sum + (img.tailleImage || 0), 0);
        return { totalSize, count: images.length };
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
                                    Images d'Événements
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
                                    title="Total Images"
                                    value={totalImages}
                                    prefix={<PictureOutlined />}
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
                            Ajouter des images
                        </Button>
                        <Input
                            placeholder="Rechercher par description ou événement..."
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
                                <p className="mt-4">Chargement des images...</p>
                            </div>
                        ) : Object.keys(imagesGroupeesParEvenement).length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Aucune image trouvée</p>
                            </div>
                        ) : (
                            <Collapse 
                                defaultActiveKey={Object.keys(imagesGroupeesParEvenement)} 
                                className="image-collapse"
                            >
                                {Object.entries(imagesGroupeesParEvenement).map(([evenementLibelle, images]) => {
                                    const stats = getEvenementStats(images);
                                    
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
                                                            {images.length} image{images.length > 1 ? 's' : ''}
                                                        </span>
                                                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                                            Taille: {formatFileSize(stats.totalSize)}
                                                        </span>
                                                    </div>
                                                </div>
                                            } 
                                            key={evenementLibelle}
                                            className="mb-4"
                                        >
                                            <Table
                                                columns={imagesColumns}
                                                dataSource={images}
                                                rowKey="id"
                                                pagination={false}
                                                size="middle"
                                                className="image-table"
                                                scroll={{ x: 'max-content' }}
                                            />
                                        </Panel>
                                    );
                                })}
                            </Collapse>
                        )}

                        {/* Modal d'ajout/modification */}
                        <Modal
                            title={editingImage ? 'Modifier l\'Image' : 'Ajouter des Images'}
                            open={modalVisible}
                            onCancel={() => { 
                                setModalVisible(false); 
                                setEditingImage(null); 
                                form.resetFields(); 
                                setSelectedFiles([]);
                            }}
                            footer={null}
                            destroyOnClose
                            width={isMobile ? '95%' : 600}
                            centered={isMobile}
                        >
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSubmit}
                                initialValues={editingImage ? undefined : {
                                    description: '',
                                    evenementId: undefined
                                }}
                            >
                                <Form.Item
                                    name="evenementId"
                                    label="Événement"
                                    rules={[
                                        { required: true, message: 'L\'événement est obligatoire' }
                                    ]}
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
                                    >
                                        {evenements.map(evenement => (
                                            <Select.Option key={evenement.id} value={evenement.id}>
                                                {evenement.libelle}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="description"
                                    label="Description"
                                    rules={[
                                        { max: 200, message: 'La description ne peut pas dépasser 200 caractères' }
                                    ]}
                                >
                                    <Input 
                                        placeholder="Saisissez une description (optionnel)"
                                        prefix={<PictureOutlined />}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="images"
                                    label="Images"
                                    rules={[{ 
                                        required: !editingImage, 
                                        message: 'Veuillez sélectionner au moins une image',
                                        validator: (_, value) => {
                                            if (!editingImage && selectedFiles.length === 0) {
                                                return Promise.reject('Veuillez sélectionner au moins une image');
                                            }
                                            return Promise.resolve();
                                        }
                                    }]}
                                >
                                    <Upload
                                        multiple={!editingImage}
                                        listType="picture-card"
                                        fileList={selectedFiles}
                                        beforeUpload={() => false}
                                        onChange={handleFileChange}
                                        onPreview={handlePreview}
                                        accept="image/*"
                                    >
                                        {selectedFiles.length >= (editingImage ? 1 : 8) ? null : (
                                            <div>
                                                <PlusOutlined />
                                                <div style={{ marginTop: 8 }}>
                                                    {editingImage ? 'Remplacer' : 'Ajouter'}
                                                </div>
                                            </div>
                                        )}
                                    </Upload>
                                    {editingImage && selectedFiles.length === 0 && (
                                        <div style={{ marginTop: 8, color: '#666' }}>
                                            Image actuelle conservée (laissez vide pour ne pas modifier)
                                        </div>
                                    )}
                                </Form.Item>

                                <Form.Item>
                                    <Space className="w-full justify-end">
                                        <Button type="primary" htmlType="submit">
                                            {editingImage ? "Mettre à jour" : "Ajouter"}
                                        </Button>
                                        <Button onClick={() => {
                                            setModalVisible(false);
                                            setEditingImage(null);
                                            form.resetFields();
                                            setSelectedFiles([]);
                                        }}>
                                            Annuler
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </Modal>

                        {/* Modal de détails */}
                        <Modal
                            title="Détails de l'Image"
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
                            {selectedImage && (
                                <div>
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24}>
                                            <Card size="small" title="Aperçu">
                                                <Image
                                                    src={selectedImage.imageUrl}
                                                    alt="Image"
                                                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }}
                                                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZjVmNSIvPgogIDx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPg=="
                                                />
                                            </Card>
                                        </Col>
                                        <Col xs={24} sm={24} md={12}>
                                            <Card size="small" title="Description">
                                                <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
                                                    <PictureOutlined style={{ marginRight: 8 }} />
                                                    {selectedImage.description || 'Aucune description'}
                                                </p>
                                            </Card>
                                        </Col>
                                        <Col xs={24} sm={24} md={12}>
                                            <Card size="small" title="Événement">
                                                <p>
                                                    <CalendarOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                                                    {selectedImage.evenementLibelle}
                                                </p>
                                            </Card>
                                        </Col>
                                        <Col xs={24} sm={24} md={12}>
                                            <Card size="small" title="Date d'ajout">
                                                <p>
                                                    {selectedImage.dateAjout ? 
                                                        format(new Date(selectedImage.dateAjout), 'dd MMMM yyyy à HH:mm', { locale: fr }) : 
                                                        'Non spécifiée'
                                                    }
                                                </p>
                                            </Card>
                                        </Col>
                                        <Col xs={24} sm={24} md={12}>
                                            <Card size="small" title="Taille du fichier">
                                                <p style={{ fontWeight: 'bold', color: '#52c41a' }}>
                                                    <CloudUploadOutlined style={{ marginRight: 8 }} />
                                                    {formatFileSize(selectedImage.tailleImage)}
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
                                                            handleDownload(selectedImage.id);
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

                        {/* Modal d'aperçu d'image */}
                        <Modal
                            open={previewVisible}
                            title="Aperçu de l'image"
                            footer={null}
                            onCancel={() => setPreviewVisible(false)}
                            centered
                            width={800}
                        >
                            <img 
                                alt="Aperçu" 
                                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }} 
                                src={previewImage} 
                            />
                        </Modal>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EvenementImages;