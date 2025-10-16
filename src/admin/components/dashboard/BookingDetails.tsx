import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO, isValid } from 'date-fns';
import {
  Mail,
  Phone,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// ─────────── BookingDoc Interface ───────────
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
    date: string;       // ISO string, e.g. "2025-05-31T00:00:00.000Z"
    timeSlot: string;   // e.g. "10:00 AM"
    duration: number;   // in minutes
    notes?: string;
  };
  status: string;       // e.g. "pending payment", "confirmed"
  paymentId?: string;
  createdAt: string;    // ISO
  updatedAt: string;    // ISO
}

// ─────── Location State Interface ───────
interface LocationState {
  booking?: BookingDoc;
  dashboardDate?: string; // "YYYY-MM-DD"
}

const EditSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState };

  // ───── Booking + Loading/Error ─────
  const [booking, setBooking] = useState<BookingDoc | null>(state?.booking || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ── Form Inputs ──
  const [notesInput, setNotesInput] = useState<string>('');
  const [durationInput, setDurationInput] = useState<number>(60);
  const [dateInput, setDateInput] = useState<string>(''); // "YYYY-MM-DD"
  const [timeInput, setTimeInput] = useState<string>(''); // "10:00 AM"
  const [saving, setSaving] = useState<boolean>(false);

  // ── Availability Slots ──
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // ───────────────────────────────
  // 1) Fetch the booking if not passed via location.state
  // ───────────────────────────────
  useEffect(() => {
    async function fetchBooking() {
      setLoading(true);
      setError(null);

      try {
        if (booking) {
          setLoading(false);
          return;
        }
        const { data } = await axios.get<BookingDoc>(`/api/bookings/admin/${id}`, {
          withCredentials: true,
        });
        setBooking(data);
      } catch (error) {
        console.error('Error fetching booking:', error);
        if (axios.isAxiosError<{ message?: string }>(error)) {
          setError(error.response?.data?.message || 'Could not load booking');
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Could not load booking');
        }
      }
      setLoading(false);
    }
    fetchBooking();
  }, [id, booking]);

  // ─────────────────────────────────────
  // 2) Populate form fields once booking is loaded
  // ─────────────────────────────────────
  useEffect(() => {
    if (!booking) return;

    setNotesInput(booking.session.notes || '');
    setDurationInput(booking.session.duration || 60);
    const dt = new Date(booking.session.date);
    const isoDate = format(dt, 'yyyy-MM-dd');
    setDateInput(isoDate);
    setTimeInput(booking.session.timeSlot);
  }, [booking]);

  // ────────────────────────────────────────────────
  // 3) Fetch availability whenever dateInput changes
  // ────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAvailability() {
      if (!dateInput) {
        setAvailableSlots([]);
        return;
      }
      const parsed = parseISO(dateInput);
      if (!isValid(parsed)) {
        setSlotsError('Invalid date');
        setAvailableSlots([]);
        return;
      }

      setSlotsLoading(true);
      setSlotsError(null);

      try {
        const { data } = await axios.get<
          Array<{ date: string; slots: Array<{ time: string; isAvailable: boolean; slotType: string }> }>
        >('/api/schedule/availability', {
          params: { start: dateInput, end: dateInput },
          withCredentials: true,
        });

        const matching = data.find((doc) => {
          const docISO = new Date(doc.date).toISOString().slice(0, 10);
          return docISO === dateInput;
        });

        if (!matching) {
          setAvailableSlots([]);
        } else {
          const times = matching.slots
            .filter((slot) => slot.isAvailable)
            .map((slot) => slot.time);
          const existing = booking?.session.timeSlot;
          let merged = times;
          if (existing && !merged.includes(existing)) {
            merged = [existing, ...merged];
          }
          setAvailableSlots(merged);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
        if (axios.isAxiosError<{ message?: string }>(error)) {
          setSlotsError(error.response?.data?.message || 'Could not load availability');
        } else if (error instanceof Error) {
          setSlotsError(error.message);
        } else {
          setSlotsError('Could not load availability');
        }
        setAvailableSlots([]);
      }

      setSlotsLoading(false);
    }
    fetchAvailability();
  }, [dateInput, booking]);

  // ────────────────────────────────────────────
  // 4) Handle Save Changes → PATCH /api/bookings/admin/:id
  // ────────────────────────────────────────────
  const handleSaveChanges = async () => {
    if (!booking) return;
    setSaving(true);

    const payload: {
      newDate?: string;
      newTimeSlot?: string;
      newDuration?: number;
      newNotes?: string;
    } = {};

    const oldDateISO = new Date(booking.session.date).toISOString().slice(0, 10);
    if (dateInput && dateInput !== oldDateISO) {
      payload.newDate = dateInput;
    }
    if (timeInput && timeInput !== booking.session.timeSlot) {
      payload.newTimeSlot = timeInput;
    }
    if (durationInput !== booking.session.duration) {
      payload.newDuration = durationInput;
    }
    if (notesInput !== (booking.session.notes || '')) {
      payload.newNotes = notesInput;
    }

    if (Object.keys(payload).length === 0) {
      setSaving(false);
      navigate(-1);
      return;
    }

    try {
      await axios.patch(
        `/api/bookings/admin/${booking._id}`,
        payload,
        { withCredentials: true }
      );
      navigate(-1);
    } catch (error) {
      console.error('Error updating booking:', error);
      if (axios.isAxiosError<{ message?: string }>(error)) {
        alert(error.response?.data?.message || 'Failed to save changes');
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to save changes');
      }
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────
  // 5) Render loading / error / form UI
  // ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading session details…</p>
      </div>
    );
  }
  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500">{error || 'Booking not found.'}</p>
      </div>
    );
  }

  const clientName = `${booking.user.firstName} ${booking.user.lastName}`;
  const clientEmail = booking.user.email;
  const clientPhone = booking.user.phone || '—';
  const sessionDateFormatted = format(new Date(booking.session.date), 'MMM do, yyyy');
  const modeLabel = booking.session.mode === 'online' ? 'Video Call' : 'In-person';
  const statusIcon =
    booking.status.toLowerCase().includes('pending') ? (
      <XCircle className="w-6 h-6 text-yellow-500 mr-2" />
    ) : (
      <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
    );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-row">
        {/* Left Column: Client Info */}
        <div className="w-1/3 bg-olive-700 p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center mb-6">
              <CalendarIcon className="w-7 h-7 mr-2 text-white" /> Client Info
            </h2>
            <div className="space-y-5">
              <div>
                <p className="text-gray-200 font-medium text-lg">Name:</p>
                <p className="text-white text-xl font-semibold">{clientName}</p>
              </div>
              <div>
                <p className="text-gray-200 font-medium text-lg">Email:</p>
                <p className="flex items-center text-white text-xl">
                  <Mail className="w-6 h-6 mr-2 text-indigo-200" /> {clientEmail}
                </p>
              </div>
              <div>
                <p className="text-gray-200 font-medium text-lg">Phone:</p>
                <p className="flex items-center text-white text-xl">
                  <Phone className="w-6 h-6 mr-2 text-indigo-200" /> {clientPhone}
                </p>
              </div>
              <div className="flex items-center">
                {statusIcon}
                <p className="text-gray-200 font-medium text-lg">Status:</p>
                <span className="ml-3 text-white text-lg font-semibold">{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <p className="text-gray-200 text-lg">
              Originally scheduled:
            </p>
            <p className="text-white font-semibold text-xl">
              {sessionDateFormatted}, {booking.session.timeSlot} ({booking.session.duration} min)
            </p>
            <p className="text-gray-200 text-lg mt-4">
              Mode:
            </p>
            <p className="text-white font-semibold text-xl">{modeLabel}</p>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="w-2/3 p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Edit Session Details</h2>
          <div className="space-y-8">
            {/* Notes */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Notes
              </label>
              <textarea
                rows={5}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full px-6 py-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                placeholder="Add or update notes…"
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Duration */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Duration (minutes)
                </label>
                <select
                  value={durationInput}
                  onChange={(e) => setDurationInput(Number(e.target.value))}
                  className="w-full px-6 py-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg"
                  disabled={saving}
                >
                  <option value={30}>30</option>
                  <option value={45}>45</option>
                  <option value={50}>50</option>
                  <option value={90}>90</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Session Date
                </label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full px-6 py-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Session Time
              </label>
              {slotsLoading ? (
                <p className="text-gray-500 italic">Loading slots…</p>
              ) : slotsError ? (
                <p className="text-red-500 text-lg">{slotsError}</p>
              ) : (
                <select
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  className="w-full px-6 py-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg"
                  disabled={saving}
                >
                  {!dateInput && (
                    <option value="">
                      Select a date first
                    </option>
                  )}
                  {dateInput && availableSlots.length === 0 && (
                    <option value="">
                      No available slots on this date
                    </option>
                  )}
                  {availableSlots.map((slotTime, idx) => (
                    <option key={`${slotTime}-${idx}`} value={slotTime}>
                      {slotTime}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-6">
              <button
                onClick={() => navigate(-1)}
                className="px-8 py-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className={`px-8 py-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg ${
                  saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSessionPage;
