import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Страницы
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import CompanyLayout from './components/CompanyLayout';

// Компонент для защищённых маршрутов
const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
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
          </Route>
          {/* Другие защищённые маршруты сюда */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
