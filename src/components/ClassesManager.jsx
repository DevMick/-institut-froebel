import React, { useState } from 'react';
import { Card, Select, Button, Table, Alert, Statistic, Row, Col, Tag, Spin } from 'antd';
import { ReloadOutlined, BookOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import { useClasses } from '../hooks/useClasses';

const { Option } = Select;

const ClassesManager = () => {
  const [selectedEcole, setSelectedEcole] = useState(1);
  
  const {
    classes,
    loading,
    error,
    stats,
    fetchClasses,
    refresh,
    changeEcole,
    getClassesByNiveau,
    hasData,
    isEmpty,
    hasError,
    lastFetch
  } = useClasses(selectedEcole, true);

  const handleEcoleChange = (ecoleId) => {
    setSelectedEcole(ecoleId);
    changeEcole(ecoleId);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Nom de la classe',
      dataIndex: 'nom',
      key: 'nom',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Niveau',
      dataIndex: 'niveau',
      key: 'niveau',
      render: (niveau) => {
        const color = niveau === 'Maternelle' ? 'green' : 
                     niveau === 'Primaire' ? 'blue' : 'default';
        return <Tag color={color}>{niveau}</Tag>;
      },
    },
    {
      title: 'Effectif',
      dataIndex: 'effectif',
      key: 'effectif',
      render: (effectif) => (
        <span>
          <TeamOutlined style={{ marginRight: 4 }} />
          {effectif || 0}
        </span>
      ),
    },
  ];

  const getNiveauColor = (niveau) => {
    switch (niveau) {
      case 'Maternelle': return '#52c41a';
      case 'Primaire': return '#1890ff';
      default: return '#d9d9d9';
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Card title="Gestionnaire des Classes" style={{ marginBottom: 20 }}>
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <label style={{ marginRight: 8, fontWeight: 'bold' }}>École:</label>
            <Select
              value={selectedEcole}
              onChange={handleEcoleChange}
              style={{ width: '100%' }}
              loading={loading}
            >
              <Option value={1}>Institut Froebel (ID: 1)</Option>
              <Option value={2}>Institut Froebel LA TULIPE (ID: 2)</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Button 
              icon={<ReloadOutlined />}
              onClick={refresh}
              loading={loading}
            >
              Actualiser
            </Button>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            {lastFetch && (
              <small style={{ color: '#666' }}>
                Dernière mise à jour: {lastFetch.toLocaleTimeString()}
              </small>
            )}
          </Col>
        </Row>

        {hasError && (
          <Alert
            message="Erreur"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              Chargement des classes...
            </div>
          </div>
        )}

        {hasData && (
          <>
            {/* Statistiques */}
            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Total Classes"
                    value={stats.total}
                    prefix={<BookOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Total Élèves"
                    value={stats.totalEffectif}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Moyenne/Classe"
                    value={stats.moyenneEffectif}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, color: '#666' }}>Niveaux</div>
                    <div style={{ marginTop: 8 }}>
                      {stats.niveaux.map(niveau => (
                        <Tag 
                          key={niveau} 
                          color={getNiveauColor(niveau)}
                          style={{ margin: 2 }}
                        >
                          {niveau}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Tableau des classes */}
            <Table
              dataSource={classes}
              columns={columns}
              rowKey="id"
              size="middle"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} sur ${total} classes`,
              }}
            />
          </>
        )}

        {isEmpty && !loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            <BookOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>Aucune classe trouvée pour cette école</div>
          </div>
        )}
      </Card>

      {/* Informations de débogage */}
      <Card title="Informations de débogage" size="small">
        <div style={{ fontSize: 12, color: '#666' }}>
          <div><strong>Endpoint:</strong> GET /api/ecoles/{selectedEcole}/classes</div>
          <div><strong>Headers:</strong> Accept: application/json</div>
          <div><strong>État:</strong> {loading ? 'Chargement...' : hasData ? 'Données chargées' : 'Aucune donnée'}</div>
        </div>
      </Card>
    </div>
  );
};

export default ClassesManager;
