import React from 'react';
import { Users, UsersRound, Shield, Target, BarChart2 } from 'lucide-react';

interface CompanySidebarProps {
  isCreator: boolean;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const CompanySidebar: React.FC<CompanySidebarProps> = ({ isCreator, onNavigate, onLogout }) => (
  <div className="w-60 bg-white h-full shadow-lg flex flex-col justify-between">
    {/* Навигация */}
    <nav className="mt-6">
      <ul>
        <li>
          <button
            onClick={() => onNavigate('okrs')}
            className="block w-full text-left px-6 py-2 hover:bg-gray-100 flex items-center"
          >
            <Target className="w-5 h-5 mr-3" />
            OKR
          </button>
        </li>
        {isCreator ? (
          <>
            <li>
              <button
                onClick={() => onNavigate('users')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100 flex items-center"
              >
                <Users className="w-5 h-5 mr-3" />
                Участники
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('teams')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100 flex items-center"
              >
                <UsersRound className="w-5 h-5 mr-3" />
                Команды
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('roles')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100 flex items-center"
              >
                <Shield className="w-5 h-5 mr-3" />
                Роли
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('statistics')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100 flex items-center"
              >
                <BarChart2 className="w-5 h-5 mr-3" />
                Статистика
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <button
                onClick={() => onNavigate('users')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100 flex items-center"
              >
                <Users className="w-5 h-5 mr-3" />
                Участники
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('teams')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100 flex items-center"
              >
                <UsersRound className="w-5 h-5 mr-3" />
                Команды
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('statistics')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100 flex items-center"
              >
                <BarChart2 className="w-5 h-5 mr-3" />
                Моя статистика
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>

    {/* Утилиты */}
    <div className="mb-6">
      <button
        onClick={() => onNavigate('/')}
        className="block w-full text-left px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
      >
        Сменить компанию
      </button>

      {isCreator && (
        <button
          onClick={() => onNavigate('settings')}
          className="block w-full text-left px-6 py-2 hover:bg-gray-100 mb-2"
        >
          Настройки компании
        </button>
      )}

      <button
        onClick={onLogout}
        className="block w-full text-left px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Выход
      </button>
    </div>
  </div>
);

export default CompanySidebar;
