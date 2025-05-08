import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, UserCircle } from 'lucide-react';
import api from '../api/axios';

interface Team {
  _id: string;
  name: string;
  description: string;
  requiredRoles: string[];
  members: { userId: string }[];
}

const TeamCard: React.FC<{ team: Team }> = ({ team }) => {
  const navigate = useNavigate();
  const { companyId } = useParams();

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/companies/${companyId}/teams/${team._id}`)}
    >
      <h3 className="text-lg font-semibold mb-2">{team.name}</h3>
      {team.description && (
        <p className="text-gray-600 text-sm mb-4">{team.description}</p>
      )}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Требуемые роли:</h4>
        <div className="flex flex-wrap gap-2">
          {team.requiredRoles.map((role) => (
            <span
              key={role}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {role}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center text-gray-600">
        <Users className="w-4 h-4 mr-2" />
        <span className="text-sm">Участников: {team.members.length}</span>
      </div>
    </div>
  );
};

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { companyId } = useParams();

  useEffect(() => {
    console.log(companyId);
    const fetchTeams = async () => {
      if (!companyId) {
        console.error('Требуется ID компании');
        setTeams([]);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/teams?companyId=${companyId}`);
        const teamsData = response.data.teams || [];
        setTeams(teamsData);
      } catch (error) {
        console.error('Ошибка при загрузке команд:', error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Команды</h2>
      {teams.length === 0 ? (
        <div className="text-center text-gray-500">Команды не найдены</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard key={team._id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsPage; 