// src/pages/BookingHistory.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
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

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  // Handler to send a “reschedule” notification
  const handleReschedule = async (bookingId: string) => {
    try {
      // 1) Let the user know their request is sent
      window.alert('your request to reschedule has been sent to Nainika');

      // 2) POST to /api/notifications/reschedule (cookie-based auth)
      await axios.post(
        'http://localhost:5000/api/notifications/reschedule',
        { bookingId },
        { withCredentials: true }
      );
      // No need to alter local UI state; admin panel will pick it up
    } catch (e) {
      console.error('Error sending reschedule request', e);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get<Booking[]>(
          'http://localhost:5000/api/bookings/history',
          { withCredentials: true }
        );
        setBookings(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'in-person':
        return <Users className="text-indigo-600" size={20} />;
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
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Bookings</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">You haven't made any bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking.bookingId}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Session with Nainika
                      </h3>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Mail className="mr-1" size={16} />
                        <span className="text-sm">Nainika@gmail.com</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadgeColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="mr-2" size={20} />
                      <span>{format(new Date(booking.date), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="mr-2" size={20} />
                      <span>{booking.timeSlot}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      {getSessionIcon(booking.sessionType)}
                      <span className="ml-2 capitalize">{booking.sessionType} session</span>
                    </div>
                    <div className="text-gray-600">
                      Booked on {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => handleReschedule(booking.bookingId)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg"
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
