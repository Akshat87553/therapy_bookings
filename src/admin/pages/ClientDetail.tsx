// src/pages/ClientSessions.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Session {
  id: string;
  mode: 'in-person' | 'online';
  date: string;      // ISO string coming from back end
  time: string;      // e.g. "12:30 PM"
  duration: number;  // e.g. 50
  notes: string;
}

const ClientSessions: React.FC = () => {
  // Grab “email” from the route: /admin/clients/:email/sessions
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      setError('No client email provided in URL.');
      setLoading(false);
      return;
    }

    const fetchSessions = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/bookings/client/${encodeURIComponent(email)}`,
          { credentials: 'include' }
        );

        if (res.status === 401) {
          setError('Unauthorized. Please log in.');
          setLoading(false);
          return;
        }
        if (!res.ok) {
          throw new Error(`Failed to fetch sessions for ${email}`);
        }

        const data: Session[] = await res.json();
        setSessions(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading sessions.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [email]);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/admin/clients')}
        className="px-4 py-2 bg-olive-600 text-white rounded-md hover:bg-olive-700 transition"
      >
        ← Back to Clients
      </button>

      <h2 className="text-2xl font-semibold text-gray-800">
        Sessions for: <span className="font-medium">{email}</span>
      </h2>

      {loading && <p className="text-center py-4">Loading sessions...</p>}
      {error && !loading && <p className="text-red-600 text-center">{error}</p>}

      {!loading && !error && sessions.length === 0 && (
        <p className="text-gray-500 text-center">No sessions found for this client.</p>
      )}

      {!loading && !error && sessions.length > 0 && (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">
                    {formatDate(session.date)} @ {session.time}
                  </p>
                  <p className="text-sm text-gray-600">
                    Mode:{' '}
                    <span className="font-medium capitalize">{session.mode}</span> | 
                    Duration: <span className="font-medium">{session.duration} min</span>
                  </p>
                </div>
              </div>
              {session.notes && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Notes:</span> {session.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientSessions;
