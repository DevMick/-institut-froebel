import React, { useState } from 'react';
import { Button, Card, Alert, Spin, Table, Select, Divider } from 'antd';
import authApi from '../services/authApi';
import ecolesApi from '../services/ecolesApi';

const { Option } = Select;

const ClassesTest = () => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedEcole, setSelectedEcole] = useState(1);

  const fetchClasses = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Test de récupération des classes pour l\'école:', selectedEcole);
      const result = await authApi.getClasses(selectedEcole);
      
      console.log('Résultat des classes:', result);
      setClasses(result);
      setSuccess(`${result.length} classes récupérées avec succès`);
    } catch (err) {
      console.error('Erreur lors du test des classes:', err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Nom de la classe',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Niveau',
      dataIndex: 'niveau',
      key: 'niveau',
    },
    {
      title: 'Effectif',
      dataIndex: 'effectif',
      key: 'effectif',
    },
  ];

  return (
    <Card 
      title="Test API Classes" 
      style={{ margin: '20px 0' }}
      size="small"
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ marginRight: 8 }}>École:</label>
          <Select
            value={selectedEcole}
            onChange={setSelectedEcole}
            style={{ width: 200, marginRight: 8 }}
          >
            <Option value={1}>Institut Froebel (ID: 1)</Option>
            <Option value={2}>Institut Froebel LA TULIPE (ID: 2)</Option>
          </Select>
        </div>
        
        <Button 
          type="primary" 
          onClick={fetchClasses}
          loading={loading}
          size="small"
        >
          Tester l'endpoint Classes
        </Button>
      </div>

      {error && (
        <Alert
          message="Erreur"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {success && (
        <Alert
          message="Succès"
          description={success}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin size="large" />
          <div style={{ marginTop: 8 }}>
            Récupération des classes...
          </div>
        </div>
      )}

      {classes.length > 0 && (
        <div>
          <h4>Classes récupérées:</h4>
          <Table
            dataSource={classes}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={false}
          />
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
        <strong>Endpoint testé:</strong> GET http://localhost:5000/api/ecoles/{selectedEcole}/classes
        <br />
        <strong>Headers:</strong> Accept: application/json
      </div>
    </Card>
  );
};

export default ClassesTest;
