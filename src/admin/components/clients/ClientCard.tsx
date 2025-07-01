// src/components/clients/ClientCard.tsx
import React from 'react';

interface ClientCardProps {
  name: string;
  email: string;
  lastSession: string | null; // ISO string or null
}

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatDate = (isoString: string) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
};

const ClientCard: React.FC<ClientCardProps> = ({ name, email, lastSession }) => {
  const initials = getInitials(name);

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* Avatar / Initials circle */}
      <div className="flex-shrink-0">
        <div className="h-12 w-12 rounded-full bg-olive-500 flex items-center justify-center text-white font-semibold text-lg">
          {initials}
        </div>
      </div>

      {/* Name, Email, Last Session */}
      <div className="flex-1 space-y-0.5">
        <p className="text-lg font-semibold text-gray-800">{name}</p>
        <p className="text-sm text-gray-500">{email}</p>
        {lastSession ? (
          <p className="text-sm text-gray-600">
            Last Session: <span className="font-medium">{formatDate(lastSession)}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">No past sessions</p>
        )}
      </div>
    </div>
  );
};

export default ClientCard;
