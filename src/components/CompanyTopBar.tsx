import React from 'react';

interface CompanyTopBarProps {
  name: string;
  email: string;
  roles: string[];
}

const CompanyTopBar: React.FC<CompanyTopBarProps> = ({ name, email, roles }) => (
  <div className="w-full bg-white shadow px-6 py-4 flex items-center justify-between">
    <div>
      <p className="font-medium">{name}</p>
      <p className="text-gray-500 text-sm">{email}</p>
    </div>
    <div>
      <p className="text-gray-700 text-sm">Роли: {roles.join(', ')}</p>
    </div>
  </div>
);

export default CompanyTopBar;