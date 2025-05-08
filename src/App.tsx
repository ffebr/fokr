import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import api from './api/axios';

// Страницы
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import CompanyLayout from './components/CompanyLayout';
import TeamsPage from './pages/TeamsPage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import TeamDetailPage from './pages/TeamDetailPage';
import OKRCheckInsPage from './pages/OKRCheckInsPage';
import CompanySettingsPage from './pages/CompanySettingsPage';
import TeamMembersPage from './pages/TeamMembersPage';
import TeamRolesPage from './pages/TeamRolesPage';
import UserRolesPage from './pages/UserRolesPage';
import CompanyTeamsSection from './components/CompanyTeamsSection';
import CompanyOKRPage from './pages/CompanyOKRPage';

// Компонент для защищённых маршрутов
const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

// Компонент для проверки прав доступа к настройкам компании
const CompanySettingsRoute: React.FC = () => {
  const { companyId } = useParams();
  const [isCreator, setIsCreator] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCreatorAccess = async () => {
      try {
        // Получаем данные пользователя из localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setIsCreator(false);
          return;
        }
        const user = JSON.parse(userStr);

        // Получаем данные компании
        const response = await api.get(`/companies/${companyId}`);
        const company = response.data;

        // Проверяем, является ли пользователь создателем
        setIsCreator(company.createdBy === user.id);
      } catch (error) {
        console.error('Error checking creator access:', error);
        setIsCreator(false);
      } finally {
        setLoading(false);
      }
    };

    checkCreatorAccess();
  }, [companyId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isCreator) {
    return <Navigate to={`/companies/${companyId}`} replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registr" element={<RegisterPage />} />

        {/* Защищённые маршруты */}
        <Route element={<ProtectedRoute />}>  
          <Route path="/" element={<CompaniesPage />} />
          <Route path="/companies/:companyId" element={<CompanyLayout />}>
            {/* обзор компании */}
            <Route index element={<CompanyDetailPage />} />
            {/* прочие секции */}
            <Route path="teams" element={<TeamsPage />} />
            <Route path="teams/:teamId" element={<TeamDetailPage />} />
            <Route path="teams/:teamId/okrs/:okrId" element={<OKRCheckInsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="okrs" element={<CompanyOKRPage />} />
            
            {/* Защищённые маршруты настроек */}
            <Route element={<CompanySettingsRoute />}>
              <Route path="settings" element={<CompanySettingsPage />}>
                <Route path="teams" element={<CompanyTeamsSection companyId={useParams().companyId || ''} />} />
                <Route path="teams/:teamId/members" element={<TeamMembersPage />} />
                <Route path="teams/:teamId/roles" element={<TeamRolesPage />} />
                <Route path="users/:userId/roles" element={<UserRolesPage />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
