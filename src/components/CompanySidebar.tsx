import React from 'react';

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
        {isCreator ? (
          <>
            <li>
              <button
                onClick={() => onNavigate('okr')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100"
              >
                OKR
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('participants')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100"
              >
                Участники
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('teams')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100"
              >
                Команды
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('roles')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100"
              >
                Роли
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('statistics')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100"
              >
                Статистика
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <button
                onClick={() => onNavigate('okr')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100"
              >
                Мои OKR
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('participants')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100"
              >
                Участники
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('teams')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100"
              >
                Команды
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('statistics')}
                className="block w-full text-left px-6 py-2 hover:bg-gray-100"
              >
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
