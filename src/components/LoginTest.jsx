import React, { useState } from 'react';
import { Button, Card, Typography, Space, Alert } from 'antd';
import { ExperimentOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const LoginTest = ({ onTestLogin }) => {
  const [testResults, setTestResults] = useState({});
  const [running, setRunning] = useState(false);

  const testCases = [
    {
      name: 'Test Parent - Adjoua Kouassi',
      data: {
        schoolId: '2',
        email: 'adjoua.kouassi@email.com',
        password: 'Adjoua2024!'
      },
      expectedRole: 'Parent'
    },
    {
      name: 'Test École Invalide',
      data: {
        schoolId: '999',
        email: 'test@email.com',
        password: 'password123'
      },
      expectedError: true
    },
    {
      name: 'Test Email Invalide',
      data: {
        schoolId: '2',
        email: 'invalid-email',
        password: 'password123'
      },
      expectedError: true
    }
  ];

  const runTest = async (testCase) => {
    setRunning(true);
    setTestResults(prev => ({ ...prev, [testCase.name]: { status: 'running' } }));

    try {
      const result = await onTestLogin(testCase.data);
      
      if (result.success) {
        setTestResults(prev => ({ 
          ...prev, 
          [testCase.name]: { 
            status: 'success', 
            message: `Connexion réussie - Rôle: ${result.data?.user?.roles?.join(', ')}` 
          } 
        }));
      } else {
        setTestResults(prev => ({ 
          ...prev, 
          [testCase.name]: { 
            status: 'error', 
            message: result.message || 'Erreur de connexion' 
          } 
        }));
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [testCase.name]: { 
          status: 'error', 
          message: error.message || 'Erreur inattendue' 
        } 
      }));
    } finally {
      setRunning(false);
    }
  };

  const runAllTests = async () => {
    for (const testCase of testCases) {
      await runTest(testCase);
      // Attendre un peu entre les tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'running':
        return <div className="animate-spin">⏳</div>;
      default:
        return null;
    }
  };

  return (
    <Card 
      title={
        <Space>
          <ExperimentOutlined />
          <span>Tests de Connexion</span>
        </Space>
      }
      className="mt-4"
    >
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Button 
            type="primary" 
            onClick={runAllTests}
            disabled={running}
            icon={<ExperimentOutlined />}
          >
            Lancer tous les tests
          </Button>
        </div>

        {testCases.map((testCase) => (
          <div key={testCase.name} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <Text strong>{testCase.name}</Text>
              <Space>
                {getStatusIcon(testResults[testCase.name]?.status)}
                <Button 
                  size="small" 
                  onClick={() => runTest(testCase)}
                  disabled={running}
                >
                  Tester
                </Button>
              </Space>
            </div>
            
            {testResults[testCase.name]?.message && (
              <Alert
                message={testResults[testCase.name].message}
                type={testResults[testCase.name].status === 'success' ? 'success' : 'error'}
                showIcon
                size="small"
              />
            )}
            
            <div className="mt-2 text-xs text-gray-500">
              <Text code>
                {JSON.stringify(testCase.data, null, 2)}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LoginTest; 