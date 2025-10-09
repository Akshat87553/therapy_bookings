// src/pages/BookingHistory.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, startOfDay } from 'date-fns';
import { Calendar, Clock, Video, Users, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Booking {
  bookingId: string;
  date: string;
  timeSlot: string;
  sessionType: 'in-person' | 'online';
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
}

// --------- Minimal env-based base URL (Vite) ----------
const API_BASE = (import.meta as any).env?.VITE_API_BASE as string | undefined;
// -------------------------------------------------------

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  // Handler to send a “reschedule” notification
  const handleReschedule = async (bookingId: string) => {
    try {
      // 1) Let the user know their request is sent
      window.alert('Your request to reschedule has been sent to Nainika.');

      // 2) POST to /api/notifications/reschedule (cookie-based auth)
      await axios.post(`${API_BASE}/api/notifications/reschedule`, { bookingId }, { withCredentials: true });
      // No need to alter local UI state; admin panel will pick it up
    } catch (e) {
      console.error('Error sending reschedule request', e);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get<Booking[]>(`${API_BASE}/api/bookings/history`, { withCredentials: true });
        setBookings(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'in-person':
        return <Users className="text-indigo-600" size={20} />;
      case 'online':
      case 'video':
        return <Video className="text-indigo-600" size={20} />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper: true if booking date is today or later
  const isTodayOrFuture = (dateStr: string) => {
    try {
      const bookingDate = new Date(dateStr);
      const bookingStart = startOfDay(bookingDate).getTime();
      const todayStart = startOfDay(new Date()).getTime();
      return bookingStart >= todayStart;
    } catch {
      return false;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
            <p className="text-gray-600">You need to be logged in to view your bookings.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Bookings</h2>

          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">You haven't made any bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => {
                const bookingDate = new Date(booking.date);
                const canReschedule = isTodayOrFuture(booking.date);
                return (
                  <div
                    key={booking.bookingId}
                    className="border rounded-lg p-0 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Session with Nainika</h3>
                        <div className="flex items-center text-gray-500 mt-1 text-sm">
                          <Mail className="mr-2" size={16} />
                          <span>Nainika@gmail.com</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadgeColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                        <div className="text-right text-sm text-gray-500">
                          <div>Booked on</div>
                          <div className="font-medium text-gray-700">{format(new Date(booking.createdAt), 'MMM d, yyyy')}</div>
                        </div>
                      </div>
                    </div>

                    {/* body */}
                    <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="mr-3 text-indigo-600" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">Date</div>
                          <div className="font-medium text-gray-700">{format(bookingDate, 'MMMM d, yyyy')}</div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Clock className="mr-3 text-indigo-600" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">Time</div>
                          <div className="font-medium text-gray-700">{booking.timeSlot}</div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600">
                        {getSessionIcon(booking.sessionType)}
                        <div className="ml-3">
                          <div className="text-sm text-gray-500">Type</div>
                          <div className="font-medium text-gray-700 capitalize">{booking.sessionType} session</div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <div>
                          <div className="text-sm text-gray-500">Reference</div>
                          <div className="font-mono text-sm text-gray-700">{booking.bookingId}</div>
                        </div>
                      </div>
                    </div>

                    {/* actions */}
                    <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                      <div className="text-sm text-gray-600">Need to change your session? Request a reschedule.</div>

                      {canReschedule ? (
                        <button
                          onClick={() => handleReschedule(booking.bookingId)}
                          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
                        >
                          Reschedule
                        </button>
                      ) : (
                        <div className="text-sm text-gray-400 italic">Past session</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
