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
  Modal,
  Tabs,
  Divider,
  Tag,
  Avatar
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  UndoOutlined,
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  HomeOutlined,
  UserOutlined,
  HistoryOutlined,
  BankOutlined,
  HeartOutlined,
  CameraOutlined,
  PlayCircleOutlined,
  PictureOutlined
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
const { TabPane } = Tabs;

const HomeAdminPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [activeTab, setActiveTab] = useState('hero');

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
        // Remplir le formulaire avec toutes les données des sections
        form.setFieldsValue({
          // Hero section
          heroTitle: result.data.hero?.title,
          heroVideoUrl: result.data.hero?.videoUrl,
          heroMessages: result.data.hero?.messages?.join('\n'),
          heroBadge1: result.data.hero?.badges?.[0]?.text,
          heroBadge2: result.data.hero?.badges?.[1]?.text,

          // Directrice Message
          directriceTitle: result.data.directriceMessage?.title,
          directriceSubtitle: result.data.directriceMessage?.subtitle,
          directriceNom: result.data.directriceMessage?.directriceInfo?.nom,
          directricePoste: result.data.directriceMessage?.directriceInfo?.poste,
          directriceParagraphe1: result.data.directriceMessage?.paragraphes?.[0],
          directriceParagraphe2: result.data.directriceMessage?.paragraphes?.[1],
          directriceParagraphe3: result.data.directriceMessage?.paragraphes?.[2],
          directriceCitation: result.data.directriceMessage?.citation,
          directriceSignatureNom: result.data.directriceMessage?.signature?.nom,
          directriceSignatureTitre: result.data.directriceMessage?.signature?.titre,

          // Notre Histoire
          histoireTitle: result.data.notreHistoire?.title,
          histoireVisionTitle: result.data.notreHistoire?.visionBlock?.title,
          histoireVisionDescription: result.data.notreHistoire?.visionBlock?.description,
          histoireVisionCitation: result.data.notreHistoire?.visionBlock?.citation,

          // Nos Établissements
          etablissementsTitle: result.data.nosEtablissements?.title,
          etablissementsDescription: result.data.nosEtablissements?.description,

          // Présentation Bienvenue
          presentationTitle: result.data.presentationBienvenue?.title,
          presentationDescription: result.data.presentationBienvenue?.description,

          // Activités Récentes
          activitesTitle: result.data.nosRecentesActivites?.title,

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
      const values = form.getFieldsValue(['heroTitle', 'heroVideoUrl', 'heroMessages', 'heroBadge1', 'heroBadge2']);
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
            data.hero?.messages,
          badges: [
            {
              icon: "fas fa-graduation-cap",
              text: values.heroBadge1 || data.hero?.badges?.[0]?.text
            },
            {
              icon: "fas fa-award",
              text: values.heroBadge2 || data.hero?.badges?.[1]?.text
            }
          ]
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

  // Sauvegarde de la section Directrice Message
  const handleSaveDirectriceMessage = async () => {
    try {
      const values = form.getFieldsValue([
        'directriceTitle', 'directriceSubtitle', 'directriceNom', 'directricePoste',
        'directriceParagraphe1', 'directriceParagraphe2', 'directriceParagraphe3',
        'directriceCitation', 'directriceSignatureNom', 'directriceSignatureTitre'
      ]);
      setLoading(true);

      const updatedData = {
        ...data,
        directriceMessage: {
          ...data.directriceMessage,
          title: values.directriceTitle || data.directriceMessage?.title,
          subtitle: values.directriceSubtitle || data.directriceMessage?.subtitle,
          directriceInfo: {
            ...data.directriceMessage?.directriceInfo,
            nom: values.directriceNom || data.directriceMessage?.directriceInfo?.nom,
            poste: values.directricePoste || data.directriceMessage?.directriceInfo?.poste
          },
          paragraphes: [
            values.directriceParagraphe1 || data.directriceMessage?.paragraphes?.[0],
            values.directriceParagraphe2 || data.directriceMessage?.paragraphes?.[1],
            values.directriceParagraphe3 || data.directriceMessage?.paragraphes?.[2]
          ].filter(p => p && p.trim().length > 0),
          citation: values.directriceCitation || data.directriceMessage?.citation,
          signature: {
            nom: values.directriceSignatureNom || data.directriceMessage?.signature?.nom,
            titre: values.directriceSignatureTitre || data.directriceMessage?.signature?.titre
          }
        }
      };

      const result = await saveHomeData(updatedData);
      if (result.success) {
        message.success('Section Directrice sauvegardée !');
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

  // Sauvegarde de la section Notre Histoire
  const handleSaveNotreHistoire = async () => {
    try {
      const values = form.getFieldsValue([
        'histoireTitle', 'histoireVisionTitle', 'histoireVisionDescription', 'histoireVisionCitation'
      ]);
      setLoading(true);

      const updatedData = {
        ...data,
        notreHistoire: {
          ...data.notreHistoire,
          title: values.histoireTitle || data.notreHistoire?.title,
          visionBlock: {
            ...data.notreHistoire?.visionBlock,
            title: values.histoireVisionTitle || data.notreHistoire?.visionBlock?.title,
            description: values.histoireVisionDescription || data.notreHistoire?.visionBlock?.description,
            citation: values.histoireVisionCitation || data.notreHistoire?.visionBlock?.citation
          }
        }
      };

      const result = await saveHomeData(updatedData);
      if (result.success) {
        message.success('Section Notre Histoire sauvegardée !');
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

  // Sauvegarde de la section Nos Établissements
  const handleSaveNosEtablissements = async () => {
    try {
      const values = form.getFieldsValue(['etablissementsTitle', 'etablissementsDescription']);
      setLoading(true);

      const updatedData = {
        ...data,
        nosEtablissements: {
          ...data.nosEtablissements,
          title: values.etablissementsTitle || data.nosEtablissements?.title,
          description: values.etablissementsDescription || data.nosEtablissements?.description
        }
      };

      const result = await saveHomeData(updatedData);
      if (result.success) {
        message.success('Section Nos Établissements sauvegardée !');
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

  // Sauvegarde de la section Présentation Bienvenue
  const handleSavePresentationBienvenue = async () => {
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
        message.success('Section Présentation Bienvenue sauvegardée !');
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

  // Sauvegarde de la section Activités Récentes
  const handleSaveActivitesRecentes = async () => {
    try {
      const values = form.getFieldsValue(['activitesTitle']);
      setLoading(true);

      const updatedData = {
        ...data,
        nosRecentesActivites: {
          ...data.nosRecentesActivites,
          title: values.activitesTitle || data.nosRecentesActivites?.title
        }
      };

      const result = await saveHomeData(updatedData);
      if (result.success) {
        message.success('Section Activités Récentes sauvegardée !');
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

  // Sauvegarde de la section Galerie Photo
  const handleSaveGaleriePhoto = async () => {
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
        message.success('Section Galerie Photo sauvegardée !');
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

  // Gestion de l'upload d'images pour toutes les sections
  const handleImageUpload = async (file, section, index = null, subSection = null) => {
    try {
      setLoading(true);
      const result = await uploadImage(file);

      if (result.success) {
        // Mettre à jour les données avec la nouvelle image
        const updatedData = { ...data };

        if (section === 'directrice') {
          updatedData.directriceMessage.directriceInfo.imageUrl = result.imageUrl;
        } else if (section === 'niveaux' && index !== null) {
          updatedData.presentationBienvenue.niveaux[index].imageUrl = result.imageUrl;
        } else if (section === 'galerie' && index !== null) {
          updatedData.galeriePhoto.photos[index].imageUrl = result.imageUrl;
        } else if (section === 'activites' && index !== null && subSection !== null) {
          updatedData.nosRecentesActivites.sections[subSection].medias[index].url = result.imageUrl;
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

  // Gestion de l'upload de vidéos pour les activités
  const handleVideoUpload = async (file, sectionIndex, mediaIndex) => {
    try {
      setLoading(true);
      const result = await uploadImage(file); // Utilise la même fonction mais pour vidéo

      if (result.success) {
        const updatedData = { ...data };
        updatedData.nosRecentesActivites.sections[sectionIndex].medias[mediaIndex].url = result.imageUrl;

        const saveResult = await saveHomeData(updatedData);
        if (saveResult.success) {
          setData(updatedData);
          message.success('Vidéo mise à jour avec succès !');
        }
      } else {
        message.error('Erreur lors de l\'upload : ' + result.error);
      }
    } catch (error) {
      message.error('Erreur lors de l\'upload de la vidéo');
    } finally {
      setLoading(false);
    }

    return false;
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
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Title level={2}>
        <EditOutlined /> Administration Complète - Page d'Accueil
      </Title>

      <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '24px' }}>
        Gérez TOUTES les sections de la page d'accueil : contenus, images, vidéos et médias.
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
            Recharger toutes les données
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
              Réinitialiser tout
            </Button>
          </Popconfirm>
        </Space>
      </Card>

      {/* Interface à onglets pour chaque section */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        style={{ marginBottom: '24px' }}
      >
        <TabPane
          tab={<span><HomeOutlined /> Hero</span>}
          key="hero"
        >
          {/* Section Hero */}
          <Card
            title="Section Hero (Bannière principale)"
            extra={
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveHero}
                loading={loading}
              >
                Sauvegarder Hero
              </Button>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onValuesChange={() => setHasChanges(true)}
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
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="heroBadge1"
                    label="Badge 1 (Graduation)"
                  >
                    <Input
                      placeholder="Ex: Maternelle • Primaire • Secondaire"
                      addonBefore="🎓"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="heroBadge2"
                    label="Badge 2 (Excellence)"
                  >
                    <Input
                      placeholder="Ex: Excellence Pédagogique"
                      addonBefore="🏆"
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
            </Form>
          </Card>
        </TabPane>

        <TabPane
          tab={<span><UserOutlined /> Directrice</span>}
          key="directrice"
        >
          {/* Section Mot de la Directrice */}
          <Card
            title="Section Mot de la Directrice Centrale"
            extra={
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveDirectriceMessage}
                loading={loading}
              >
                Sauvegarder Directrice
              </Button>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onValuesChange={() => setHasChanges(true)}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="directriceTitle"
                    label="Titre de la section"
                  >
                    <Input
                      placeholder="Ex: MOT DE LA DIRECTRICE CENTRALE"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="directriceSubtitle"
                    label="Sous-titre"
                  >
                    <Input
                      placeholder="Ex: Chers parents, chers partenaires de l'éducation"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="directriceNom"
                    label="Nom de la directrice"
                  >
                    <Input
                      placeholder="Ex: KADIO Dyana Roselyne"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="directricePoste"
                    label="Poste"
                  >
                    <Input
                      placeholder="Ex: Directrice Centrale"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Photo de la directrice">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Upload
                        beforeUpload={(file) => handleImageUpload(file, 'directrice')}
                        showUploadList={false}
                        accept="image/*"
                      >
                        <Button icon={<UploadOutlined />}>
                          Changer la photo
                        </Button>
                      </Upload>
                      {data?.directriceMessage?.directriceInfo?.imageUrl && (
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => handlePreview(data.directriceMessage.directriceInfo.imageUrl, 'Photo Directrice')}
                        >
                          Aperçu
                        </Button>
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="directriceParagraphe1"
                    label="Premier paragraphe"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Premier paragraphe du message..."
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="directriceParagraphe2"
                    label="Deuxième paragraphe"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Deuxième paragraphe du message..."
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="directriceParagraphe3"
                    label="Troisième paragraphe"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Troisième paragraphe du message..."
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="directriceCitation"
                    label="Citation en encadré"
                  >
                    <TextArea
                      rows={2}
                      placeholder="Ex: Bienvenue à l'Institut Froebel. Ensemble, faisons fleurir l'avenir de nos enfants."
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="directriceSignatureNom"
                    label="Nom pour la signature"
                  >
                    <Input
                      placeholder="Ex: KADIO Dyana Roselyne"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="directriceSignatureTitre"
                    label="Titre pour la signature"
                  >
                    <Input
                      placeholder="Ex: Directrice Centrale - Institut Froebel"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>

        <TabPane
          tab={<span><HistoryOutlined /> Notre Histoire</span>}
          key="histoire"
        >
          {/* Section Notre Histoire */}
          <Card
            title="Section Notre Histoire"
            extra={
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveNotreHistoire}
                loading={loading}
              >
                Sauvegarder Histoire
              </Button>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onValuesChange={() => setHasChanges(true)}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <Form.Item
                    name="histoireTitle"
                    label="Titre de la section"
                  >
                    <Input
                      placeholder="Ex: NOTRE HISTOIRE"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Divider>Bloc Vision Pédagogique</Divider>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="histoireVisionTitle"
                    label="Titre du bloc vision"
                  >
                    <Input
                      placeholder="Ex: Une Vision Pédagogique Révolutionnaire"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="histoireVisionDescription"
                    label="Description de la vision"
                  >
                    <TextArea
                      rows={4}
                      placeholder="Description de la vision pédagogique de l'institut..."
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="histoireVisionCitation"
                    label="Citation sur la fondatrice"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Citation en hommage à la fondatrice..."
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Divider>Timeline Historique</Divider>
                  <Alert
                    message="Timeline des événements"
                    description="La timeline historique est gérée automatiquement. Les dates et événements sont prédéfinis dans le système."
                    type="info"
                    showIcon
                  />
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>

        <TabPane
          tab={<span><BankOutlined /> Établissements</span>}
          key="etablissements"
        >
          {/* Section Nos Établissements */}
          <Card
            title="Section Nos Établissements"
            extra={
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveNosEtablissements}
                loading={loading}
              >
                Sauvegarder Établissements
              </Button>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onValuesChange={() => setHasChanges(true)}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <Form.Item
                    name="etablissementsTitle"
                    label="Titre de la section"
                  >
                    <Input
                      placeholder="Ex: NOS ÉTABLISSEMENTS"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="etablissementsDescription"
                    label="Description"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Description des établissements..."
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Alert
                    message="Liste des établissements"
                    description="La liste des établissements (La Tulipe, La Marguerite, La Rose, Les Orchidées, Le Lys) est gérée automatiquement avec leurs informations prédéfinies."
                    type="info"
                    showIcon
                  />
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>

        <TabPane
          tab={<span><HeartOutlined /> Bienvenue</span>}
          key="bienvenue"
        >
          {/* Section Présentation Bienvenue */}
          <Card
            title="Section Bienvenue à l'Institut Froebel"
            extra={
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSavePresentationBienvenue}
                loading={loading}
              >
                Sauvegarder Bienvenue
              </Button>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onValuesChange={() => setHasChanges(true)}
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
            </Form>

            {/* Niveaux scolaires */}
            <Divider>Niveaux Scolaires</Divider>
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
        </TabPane>

        <TabPane
          tab={<span><PlayCircleOutlined /> Activités</span>}
          key="activites"
        >
          {/* Section Nos Récentes Activités */}
          <Card
            title="Section Nos Récentes Activités"
            extra={
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveActivitesRecentes}
                loading={loading}
              >
                Sauvegarder Activités
              </Button>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onValuesChange={() => setHasChanges(true)}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <Form.Item
                    name="activitesTitle"
                    label="Titre de la section"
                  >
                    <Input
                      placeholder="Ex: NOS RÉCENTES ACTIVITÉS"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            {/* Sections d'activités */}
            <Divider>Sections d'Activités</Divider>
            <Collapse defaultActiveKey={['0']}>
              {data?.nosRecentesActivites?.sections?.map((section, sectionIndex) => (
                <Panel
                  header={
                    <Space>
                      <Tag color="blue">{section.medias?.length || 0} médias</Tag>
                      <span>{section.title}</span>
                    </Space>
                  }
                  key={sectionIndex}
                >
                  <Row gutter={[16, 16]}>
                    {section.medias?.map((media, mediaIndex) => (
                      <Col xs={24} sm={12} lg={6} key={media.id}>
                        <Card
                          size="small"
                          title={
                            <Space>
                              {media.type === 'video' ? <PlayCircleOutlined /> : <PictureOutlined />}
                              <span style={{ fontSize: '12px' }}>{media.titre}</span>
                            </Space>
                          }
                          type="inner"
                          actions={[
                            <Upload
                              key="upload"
                              beforeUpload={(file) =>
                                media.type === 'video'
                                  ? handleVideoUpload(file, sectionIndex, mediaIndex)
                                  : handleImageUpload(file, 'activites', mediaIndex, sectionIndex)
                              }
                              showUploadList={false}
                              accept={media.type === 'video' ? 'video/*' : 'image/*'}
                            >
                              <Button icon={<UploadOutlined />} size="small">
                                Changer
                              </Button>
                            </Upload>,
                            <Button
                              key="preview"
                              icon={<EyeOutlined />}
                              size="small"
                              onClick={() => handlePreview(media.url, media.titre)}
                            >
                              Aperçu
                            </Button>
                          ]}
                        >
                          <p style={{ fontSize: '11px', margin: 0 }}>{media.description}</p>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Panel>
              ))}
            </Collapse>
          </Card>
        </TabPane>

        <TabPane
          tab={<span><CameraOutlined /> Galerie</span>}
          key="galerie"
        >
          {/* Section Galerie Photo */}
          <Card
            title="Section Galerie Photo"
            extra={
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveGaleriePhoto}
                loading={loading}
              >
                Sauvegarder Galerie
              </Button>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onValuesChange={() => setHasChanges(true)}
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
            </Form>

            {/* Photos de la galerie */}
            <Divider>Photos de la Galerie</Divider>
            <Row gutter={[16, 16]}>
              {data?.galeriePhoto?.photos?.map((photo, index) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={photo.id}>
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
                    <p style={{ fontSize: '11px', margin: 0 }}>{photo.description}</p>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* Modal de prévisualisation */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
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
