import React, { useState } from 'react';
import { useParams, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Users, UsersRound, Plus, Trash2, Shield, ShieldPlus, ShieldMinus } from 'lucide-react';
import CompanyUsersSection from '../components/CompanyUsersSection';
import CompanyTeamsSection from '../components/CompanyTeamsSection';
import CompanyRolesSection from '../components/CompanyRolesSection';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const CompanySettingsPage: React.FC = () => {
  const { companyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections: Section[] = [
    {
      id: 'users',
      title: 'Управление пользователями',
      icon: <Users className="w-6 h-6" />,
      description: 'Добавление пользователей и назначение ролей'
    },
    {
      id: 'teams',
      title: 'Управление командами',
      icon: <UsersRound className="w-6 h-6" />,
      description: 'Создание и управление командами'
    },
    {
      id: 'roles',
      title: 'Управление ролями',
      icon: <Shield className="w-6 h-6" />,
      description: 'Создание и удаление ролей компании'
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    // Если мы на подстранице, возвращаемся к основному разделу
    if (isSubPage) {
      navigate(`/companies/${companyId}/settings`);
    }
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'users':
        return companyId ? <CompanyUsersSection companyId={companyId} /> : null;

      case 'teams':
        return companyId ? <CompanyTeamsSection companyId={companyId} /> : null;

      case 'roles':
        return companyId ? <CompanyRolesSection companyId={companyId} /> : null;

      default:
        return null;
    }
  };

  // Проверяем, находимся ли мы на странице участников команды, ролей команды или ролей пользователя
  const isSubPage = location.pathname.includes('/teams/') && 
    (location.pathname.includes('/members') || location.pathname.includes('/roles')) ||
    location.pathname.includes('/users/') && location.pathname.includes('/roles');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Настройки компании</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleSectionClick(section.id)}
            className={`p-6 rounded-lg border transition-all ${
              activeSection === section.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${
                activeSection === section.id ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {section.icon}
              </div>
              <div className="text-left">
                <h3 className="font-semibold">{section.title}</h3>
                <p className="text-sm text-gray-500">{section.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {isSubPage ? (
        <Outlet />
      ) : (
        activeSection && (
          <div className="mt-8">
            {renderSection(activeSection)}
          </div>
        )
      )}
    </div>
  );
};

export default CompanySettingsPage; 