const columns = [
  {
    title: 'Membre',
    dataIndex: 'membre',
    key: 'membre',
    render: (_, record) => (
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <UserOutlined className="text-blue-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">{record.nomCompletMembre}</div>
        </div>
      </div>
    ),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render: (_, record) => (
      <span>
        <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        {record.emailMembre}
      </span>
    ),
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    render: (date) => new Date(date).toLocaleDateString('fr-FR'),
    sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  },
  {
    title: 'Type',
    dataIndex: 'typeReunionLibelle',
    key: 'typeReunionLibelle',
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <Space>
        <Button icon={<EyeOutlined />} onClick={() => openDetailModal(record.id)} />
        <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
        <Popconfirm title="Supprimer cette présence ?" onConfirm={() => handleDelete(record.id)} okText="Oui" cancelText="Non">
          <Button icon={<DeleteOutlined />} danger />
        </Popconfirm>
      </Space>
    ),
  },
]; 