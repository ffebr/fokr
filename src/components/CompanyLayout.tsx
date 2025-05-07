import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import CompanySidebar from './CompanySidebar';
import CompanyTopBar from './CompanyTopBar';
import api from '../api/axios';

interface Role {
  name: string;
  description: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface CompanyDetail {
  id: string;
  name: string;
  createdBy: string;
  roles: Role[];
  users: User[];
}

const CompanyLayout: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    api.get<CompanyDetail>(`/companies/${companyId}`)
      .then(res => setCompany(res.data))
      .catch(err => setError(err.response?.data?.message || 'Не удалось загрузить данные'))
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) return <div className="p-6 text-center">Загрузка...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!company) return <div className="p-6 text-center">Компания не найдена.</div>;

  const localUser = JSON.parse(localStorage.getItem('user') || '{}') as { id?: string; name?: string; email?: string };
  const userDetail = company.users.find(u => u.id === localUser.id) || { name: localUser.name || '', email: localUser.email || '', roles: [] };
  const isCreator = company.createdBy === localUser.id;

  const onNavigate = (path: string) => {
    navigate(path.startsWith('/') ? path : `/companies/${companyId}/${path}`);
  };
  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <CompanySidebar isCreator={isCreator} onNavigate={onNavigate} onLogout={onLogout} />

      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <CompanyTopBar name={userDetail.name} email={userDetail.email} roles={userDetail.roles} />

        {/* Main Content */}
        <div className="p-6 flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CompanyLayout;
