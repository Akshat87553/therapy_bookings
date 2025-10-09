// src/components/dashboard/AppointmentList.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Video,
  Mail,
  Phone,
  Calendar,
  Clipboard,
  CheckCircle,
  XCircle,
  Plus, // ← import a “+” icon
} from 'lucide-react';

interface AppointmentListProps {
  date: Date;
}
interface BookingDoc {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    dob?: string;
    phone?: string;
  };
  session: {
    mode: 'in-person' | 'online';
    date: string;
    timeSlot: string;
    notes?: string;
  };
  status: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ date }) => {
  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      const isoDate = format(date, 'yyyy-MM-dd');
      try {
        const { data } = await axios.get<BookingDoc[]>(
          '/api/bookings/admin',
          {
            params: { date: isoDate },
            withCredentials: true,
          }
        );
        setBookings(data);
      } catch (err: any) {
        console.error('Error fetching admin bookings:', err);
        setError(
          err.response?.data?.message ||
            'Could not load bookings. Please try again.'
        );
      }
      setLoading(false);
    };
    fetchBookings();
  }, [date]);

  const handleCreate = () => {
    // Navigate to the “create” page, passing the current date
     const isoDate = format(date, 'yyyy-MM-dd');
  const path = `/admin/bookings/create?date=${isoDate}`;
  console.log('Trying to navigate to:', path);
  navigate(path);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading sessions…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* ─── “Create a session” Button ───────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={handleCreate}
          className="inline-flex items-center space-x-1 px-4 py-2 bg-olive-700 hover:bg-olive-800 text-white rounded-md"
        >
          <Plus className="w-4 h-4" />
          <span>Create a session</span>
        </button>
      </div>

      {/* ─── If no bookings exist on this date, show message ─── */}
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No sessions scheduled for {format(date, 'MMMM do, yyyy')}.
          </p>
        </div>
      ) : (
        bookings.map((bk) => {
          const clientName = `${bk.user.firstName} ${bk.user.lastName}`;
          const clientEmail = bk.user.email;
          const clientPhone = bk.user.phone || '—';
          const sessionDate = format(new Date(bk.session.date), 'MMM do, yyyy');
          const sessionTime = bk.session.timeSlot;
          const modeLabel =
            bk.session.mode === 'online' ? 'Video Call' : 'In-person';
          const locationLabel =
            bk.session.mode === 'online' ? (
              <span className="flex items-center text-sm text-gray-600">
                <Video className="w-4 h-4 mr-1" /> Online
              </span>
            ) : (
              <span className="flex items-center text-sm text-gray-600">
                <Home className="w-4 h-4 mr-1" /> In-studio
              </span>
            );
          const notes = bk.session.notes || '—';
          const status = bk.status;
          const statusIcon =
            status.toLowerCase().includes('pending') ? (
              <XCircle className="w-4 h-4 text-yellow-500 mr-1" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            );

          return (
            <div
              key={bk._id}
              className="border-b border-gray-100 pb-6 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() =>
                navigate(`/admin/bookings/edit/${bk._id}`, {
                  state: {
                    booking: bk,
                    dashboardDate: format(date, 'yyyy-MM-dd'),
                  },
                })
              }
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">
                    {clientName}
                  </h4>
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" /> {clientEmail}
                    </span>
                    <span className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" /> {clientPhone}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    {statusIcon}
                    <span className="text-sm font-medium text-gray-700">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    {sessionDate}, {sessionTime}
                  </p>
                  <p className="mt-1 text-gray-600">{modeLabel}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200"></div>
              <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center">
                  <Clipboard className="w-4 h-4 mr-1" />
                  Notes: {notes}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Booked on {format(new Date(bk.createdAt), 'MMM do, yyyy')}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AppointmentList;
