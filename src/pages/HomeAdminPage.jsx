import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  message,
  Spin,
  Row,
  Col,
  Upload,
  Image,
  Popconfirm,
  Alert,
  Collapse,
  List,
  Modal
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  UndoOutlined,
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import {
  fetchHomeData,
  saveHomeData,
  resetHomeData,
  uploadImage,
  validateVideoUrl
} from '../services/homeApi';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

const HomeAdminPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  // Détecter les changements dans le formulaire
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchHomeData();
      if (result.success) {
        setData(result.data);
        // Remplir le formulaire avec les données
        form.setFieldsValue({
          // Hero section
          heroTitle: result.data.hero?.title,
          heroVideoUrl: result.data.hero?.videoUrl,
          heroMessages: result.data.hero?.messages?.join('\n'),
          
          // Cartes infos
          carte1Titre: result.data.cartesInfos?.[0]?.titre,
          carte1SousTitre: result.data.cartesInfos?.[0]?.sousTitre,
          carte1Lien: result.data.cartesInfos?.[0]?.lien,
          carte2Titre: result.data.cartesInfos?.[1]?.titre,
          carte2SousTitre: result.data.cartesInfos?.[1]?.sousTitre,
          carte2Lien: result.data.cartesInfos?.[1]?.lien,
          
          // Présentation Bienvenue
          presentationTitle: result.data.presentationBienvenue?.title,
          presentationDescription: result.data.presentationBienvenue?.description,
          
          // Galerie
          galerieTitle: result.data.galeriePhoto?.title,
          galerieDescription: result.data.galeriePhoto?.description
        });
        setHasChanges(false);
      } else {
        message.error('Erreur lors du chargement des données');
      }
    } catch (error) {
      message.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarde de la section Hero
  const handleSaveHero = async () => {
    try {
      const values = form.getFieldsValue(['heroTitle', 'heroVideoUrl', 'heroMessages']);
      setLoading(true);

      // Valider l'URL de la vidéo si fournie
      if (values.heroVideoUrl) {
        const validation = validateVideoUrl(values.heroVideoUrl);
        if (!validation.isValid) {
          message.error(validation.message);
          return;
        }
      }

      const updatedData = {
        ...data,
        hero: {
          ...data.hero,
          title: values.heroTitle || data.hero?.title,
          videoUrl: values.heroVideoUrl || data.hero?.videoUrl,
          messages: values.heroMessages ? 
            values.heroMessages.split('\n').map(m => m.trim()).filter(m => m.length > 0) : 
            data.hero?.messages
        }
      };

      const result = await saveHomeData(updatedData);
      if (result.success) {
        message.success('Section Hero sauvegardée !');
        setData(updatedData);
        setHasChanges(false);
      } else {
        message.error('Erreur lors de la sauvegarde : ' + result.error);
      }
    } catch (error) {
      message.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarde des cartes infos
  const handleSaveCartesInfos = async () => {
    try {
      const values = form.getFieldsValue([
        'carte1Titre', 'carte1SousTitre', 'carte1Lien',
        'carte2Titre', 'carte2SousTitre', 'carte2Lien'
      ]);
      setLoading(true);

      const updatedData = {
        ...data,
        cartesInfos: [
          {
            ...data.cartesInfos[0],
            titre: values.carte1Titre || data.cartesInfos[0]?.titre,
            sousTitre: values.carte1SousTitre || data.cartesInfos[0]?.sousTitre,
            lien: values.carte1Lien || data.cartesInfos[0]?.lien
          },
          {
            ...data.cartesInfos[1],
            titre: values.carte2Titre || data.cartesInfos[1]?.titre,
            sousTitre: values.carte2SousTitre || data.cartesInfos[1]?.sousTitre,
            lien: values.carte2Lien || data.cartesInfos[1]?.lien
          }
        ]
      };

      const result = await saveHomeData(updatedData);
      if (result.success) {
        message.success('Cartes d\'information sauvegardées !');
        setData(updatedData);
        setHasChanges(false);
      } else {
        message.error('Erreur lors de la sauvegarde : ' + result.error);
      }
    } catch (error) {
      message.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarde de la section Présentation
  const handleSavePresentation = async () => {
    try {
      const values = form.getFieldsValue(['presentationTitle', 'presentationDescription']);
      setLoading(true);

      const updatedData = {
        ...data,
        presentationBienvenue: {
          ...data.presentationBienvenue,
          title: values.presentationTitle || data.presentationBienvenue?.title,
          description: values.presentationDescription || data.presentationBienvenue?.description
        }
      };

      const result = await saveHomeData(updatedData);
      if (result.success) {
        message.success('Section Présentation sauvegardée !');
        setData(updatedData);
        setHasChanges(false);
      } else {
        message.error('Erreur lors de la sauvegarde : ' + result.error);
      }
    } catch (error) {
      message.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarde de la galerie
  const handleSaveGalerie = async () => {
    try {
      const values = form.getFieldsValue(['galerieTitle', 'galerieDescription']);
      setLoading(true);

      const updatedData = {
        ...data,
        galeriePhoto: {
          ...data.galeriePhoto,
          title: values.galerieTitle || data.galeriePhoto?.title,
          description: values.galerieDescription || data.galeriePhoto?.description
        }
      };

      const result = await saveHomeData(updatedData);
      if (result.success) {
        message.success('Section Galerie sauvegardée !');
        setData(updatedData);
        setHasChanges(false);
      } else {
        message.error('Erreur lors de la sauvegarde : ' + result.error);
      }
    } catch (error) {
      message.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'upload d'images
  const handleImageUpload = async (file, section, index = null) => {
    try {
      setLoading(true);
      const result = await uploadImage(file);

      if (result.success) {
        // Mettre à jour les données avec la nouvelle image
        const updatedData = { ...data };

        if (section === 'cartes' && index !== null) {
          updatedData.cartesInfos[index].imageUrl = result.imageUrl;
        } else if (section === 'niveaux' && index !== null) {
          updatedData.presentationBienvenue.niveaux[index].imageUrl = result.imageUrl;
        } else if (section === 'galerie' && index !== null) {
          updatedData.galeriePhoto.photos[index].imageUrl = result.imageUrl;
        }

        // Sauvegarder automatiquement
        const saveResult = await saveHomeData(updatedData);
        if (saveResult.success) {
          setData(updatedData);
          message.success('Image mise à jour avec succès !');
        }
      } else {
        message.error('Erreur lors de l\'upload : ' + result.error);
      }
    } catch (error) {
      message.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setLoading(false);
    }

    return false; // Empêcher l'upload automatique d'Ant Design
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const result = await resetHomeData();
      if (result.success) {
        message.success('Données réinitialisées aux valeurs par défaut');
        await loadData();
      } else {
        message.error('Erreur lors de la réinitialisation');
      }
    } catch (error) {
      message.error('Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (imageUrl, title) => {
    setPreviewImage(imageUrl);
    setPreviewTitle(title);
    setPreviewVisible(true);
  };

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>
        <EditOutlined /> Administration - Page d'Accueil
      </Title>
      
      <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '24px' }}>
        Gérez le contenu, les images et vidéos de la page d'accueil de votre site web.
      </Text>

      {hasChanges && (
        <Alert
          message="Modifications non sauvegardées"
          description="Vous avez des modifications non sauvegardées. N'oubliez pas de sauvegarder chaque section."
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Boutons d'action globaux */}
      <Card style={{ marginBottom: '24px' }}>
        <Space size="middle">
          <Button
            icon={<ReloadOutlined />}
            onClick={loadData}
            loading={loading}
          >
            Recharger
          </Button>
          <Popconfirm
            title="Réinitialiser aux valeurs par défaut"
            description="Cette action supprimera toutes vos modifications. Êtes-vous sûr ?"
            onConfirm={handleReset}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              danger
              icon={<UndoOutlined />}
              loading={loading}
            >
              Réinitialiser
            </Button>
          </Popconfirm>
        </Space>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={() => setHasChanges(true)}
      >
        {/* Section Hero */}
        <Card 
          title="Section Hero (Bannière principale)" 
          style={{ marginBottom: '24px' }}
          extra={
            <Button
              type="primary"
              size="small"
              icon={<SaveOutlined />}
              onClick={handleSaveHero}
              loading={loading}
            >
              Sauvegarder
            </Button>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name="heroTitle"
                label="Titre principal"
              >
                <Input
                  placeholder="Ex: L'ÉDUCATION D'AUJOURD'HUI, LES LEADERS DE DEMAIN."
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="heroVideoUrl"
                label="URL de la vidéo de fond"
                help="Utilisez une URL Cloudinary, YouTube ou Vimeo"
              >
                <Input
                  placeholder="https://res.cloudinary.com/..."
                  addonBefore="🎥"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="heroMessages"
                label="Messages défilants (un par ligne)"
              >
                <TextArea
                  rows={4}
                  placeholder="Cultivons l'excellence ensemble&#10;Épanouissement et apprentissage&#10;Innovation pédagogique"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Section Cartes d'Information */}
        <Card
          title="Cartes d'Information"
          style={{ marginBottom: '24px' }}
          extra={
            <Button
              type="primary"
              size="small"
              icon={<SaveOutlined />}
              onClick={handleSaveCartesInfos}
              loading={loading}
            >
              Sauvegarder
            </Button>
          }
        >
          <Row gutter={[24, 24]}>
            {/* Carte 1 */}
            <Col xs={24} lg={12}>
              <Card size="small" title="Carte 1 - Qui sommes-nous" type="inner">
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Form.Item
                      name="carte1Titre"
                      label="Titre"
                    >
                      <Input placeholder="Ex: QUI SOMMES-NOUS" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      name="carte1SousTitre"
                      label="Sous-titre"
                    >
                      <Input placeholder="Ex: Découvrez notre histoire et nos valeurs" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      name="carte1Lien"
                      label="Lien de destination"
                    >
                      <Input placeholder="Ex: /presentation" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label="Image de la carte">
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Upload
                          beforeUpload={(file) => handleImageUpload(file, 'cartes', 0)}
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />}>
                            Changer l'image
                          </Button>
                        </Upload>
                        {data?.cartesInfos?.[0]?.imageUrl && (
                          <Button
                            icon={<EyeOutlined />}
                            onClick={() => handlePreview(data.cartesInfos[0].imageUrl, 'Carte 1')}
                          >
                            Aperçu
                          </Button>
                        )}
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Carte 2 */}
            <Col xs={24} lg={12}>
              <Card size="small" title="Carte 2 - Nos écoles" type="inner">
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Form.Item
                      name="carte2Titre"
                      label="Titre"
                    >
                      <Input placeholder="Ex: NOS ÉCOLES" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      name="carte2SousTitre"
                      label="Sous-titre"
                    >
                      <Input placeholder="Ex: Explorez nos établissements" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      name="carte2Lien"
                      label="Lien de destination"
                    >
                      <Input placeholder="Ex: #ecoles" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label="Image de la carte">
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Upload
                          beforeUpload={(file) => handleImageUpload(file, 'cartes', 1)}
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />}>
                            Changer l'image
                          </Button>
                        </Upload>
                        {data?.cartesInfos?.[1]?.imageUrl && (
                          <Button
                            icon={<EyeOutlined />}
                            onClick={() => handlePreview(data.cartesInfos[1].imageUrl, 'Carte 2')}
                          >
                            Aperçu
                          </Button>
                        )}
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Section Présentation Bienvenue */}
        <Card
          title="Section Présentation Bienvenue"
          style={{ marginBottom: '24px' }}
          extra={
            <Button
              type="primary"
              size="small"
              icon={<SaveOutlined />}
              onClick={handleSavePresentation}
              loading={loading}
            >
              Sauvegarder
            </Button>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name="presentationTitle"
                label="Titre de la section"
              >
                <Input
                  placeholder="Ex: BIENVENUE À L'INSTITUT FROEBEL"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="presentationDescription"
                label="Description"
              >
                <TextArea
                  rows={3}
                  placeholder="Description de l'institut..."
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Niveaux scolaires */}
          <Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>
            Niveaux Scolaires
          </Title>
          <Row gutter={[16, 16]}>
            {data?.presentationBienvenue?.niveaux?.map((niveau, index) => (
              <Col xs={24} lg={8} key={niveau.id}>
                <Card size="small" title={niveau.titre} type="inner">
                  <p><strong>Description:</strong> {niveau.description}</p>
                  <div style={{ marginTop: '12px' }}>
                    <Upload
                      beforeUpload={(file) => handleImageUpload(file, 'niveaux', index)}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />} size="small">
                        Changer l'image
                      </Button>
                    </Upload>
                    {niveau.imageUrl && (
                      <Button
                        icon={<EyeOutlined />}
                        size="small"
                        style={{ marginLeft: '8px' }}
                        onClick={() => handlePreview(niveau.imageUrl, niveau.titre)}
                      >
                        Aperçu
                      </Button>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Section Galerie Photo */}
        <Card
          title="Section Galerie Photo"
          style={{ marginBottom: '24px' }}
          extra={
            <Button
              type="primary"
              size="small"
              icon={<SaveOutlined />}
              onClick={handleSaveGalerie}
              loading={loading}
            >
              Sauvegarder
            </Button>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="galerieTitle"
                label="Titre de la galerie"
              >
                <Input
                  placeholder="Ex: GALERIE PHOTO"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="galerieDescription"
                label="Description"
              >
                <Input
                  placeholder="Ex: Découvrez nos espaces d'apprentissage et de vie"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Photos de la galerie */}
          <Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>
            Photos de la Galerie
          </Title>
          <Row gutter={[16, 16]}>
            {data?.galeriePhoto?.photos?.map((photo, index) => (
              <Col xs={24} sm={12} lg={8} key={photo.id}>
                <Card
                  size="small"
                  title={photo.titre}
                  type="inner"
                  actions={[
                    <Upload
                      key="upload"
                      beforeUpload={(file) => handleImageUpload(file, 'galerie', index)}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />} size="small">
                        Changer
                      </Button>
                    </Upload>,
                    <Button
                      key="preview"
                      icon={<EyeOutlined />}
                      size="small"
                      onClick={() => handlePreview(photo.imageUrl, photo.titre)}
                    >
                      Aperçu
                    </Button>
                  ]}
                >
                  <p style={{ fontSize: '12px', margin: 0 }}>{photo.description}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Form>

      {/* Modal de prévisualisation */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <Image
          alt="Prévisualisation"
          style={{ width: '100%' }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

export default HomeAdminPage;
