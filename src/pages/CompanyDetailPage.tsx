import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CompanyTopBar from '../components/CompanyTopBar';
import CompanySidebar from '../components/CompanySidebar';
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

const CompanyDetailPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Навигация и выход
  const onNavigate = (path: string) => {
    navigate(path.startsWith('/') ? path : `/companies/${companyId}/${path}`);
  };
  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!companyId) return;
      setLoading(true);
      setError('');
      try {
        const res = await api.get<CompanyDetail>(`/companies/${companyId}`);
        setCompany(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Не удалось загрузить данные компании');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [companyId]);

  if (loading) return <div className="p-6 text-center">Загрузка данных...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!company) return <div className="p-6 text-center">Компания не найдена.</div>;

  // Данные текущего пользователя
  const localUser = JSON.parse(localStorage.getItem('user') || '{}') as { id?: string; name?: string; email?: string };
  const userDetail = company.users.find(u => u.id === localUser.id) || { name: localUser.name || '', email: localUser.email || '', roles: [] };
  const isCreator = company.createdBy === localUser.id;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Боковая панель */}


        {/* Основной контент */}
        <div className="p-6 flex-1 overflow-auto">
          {/* Здесь остальной контент страницы */}
        </div>
      </div>
  );
};

export default CompanyDetailPage;
