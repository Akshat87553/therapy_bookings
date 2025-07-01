// src/admin/pages/AdminCreateSessionPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO, isValid } from 'date-fns';

interface CreatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dob?: string;
  mode: 'in-person' | 'online';
  date: string;       // "YYYY-MM-DD"
  timeSlot: string;   // e.g. "10:00 AM"
  duration: number;
  notes?: string;
}

const AdminCreateSessionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get('date') || '';
  const navigate = useNavigate();

  // ─── Form state ─────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [mode, setMode] = useState<'in-person' | 'online'>('in-person');
  const [dateInput, setDateInput] = useState(initialDate); // "YYYY-MM-DD"
  const [timeSlot, setTimeSlot] = useState('');
  const [duration, setDuration] = useState(50);
  const [notes, setNotes] = useState('');

  // ─── Availability slots ──────────────────────
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // ─── Fetch availability whenever dateInput changes ─────────
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
        >('http://localhost:5000/api/schedule/availability', {
          params: { start: dateInput, end: dateInput },
          withCredentials: true,
        });
        const matching = data.find((doc) => {
          return new Date(doc.date).toISOString().slice(0, 10) === dateInput;
        });
        if (!matching) {
          setAvailableSlots([]);
        } else {
          setAvailableSlots(
            matching.slots
              .filter((slot) => slot.isAvailable)
              .map((slot) => slot.time)
          );
        }
      } catch (err: any) {
        console.error('Error fetching availability:', err);
        setSlotsError(err.response?.data?.message || 'Could not load slots');
        setAvailableSlots([]);
      }
      setSlotsLoading(false);
    }
    fetchAvailability();
  }, [dateInput]);

  // ─── Submit handler ─────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!firstName || !lastName || !email || !dateInput || !timeSlot) {
      alert('Please fill in all required fields.');
      return;
    }

    const payload: CreatePayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      dob: dob ? dob : undefined,            // keep as "YYYY-MM-DD"
      mode,
      date: dateInput,
      timeSlot,
      duration,
      notes: notes.trim() || undefined,
    };

    try {
      // POST to new admin‐create endpoint
      await axios.post(
        'http://localhost:5000/api/bookings/admin',
        payload,
        { withCredentials: true }
      );
      // On success, go back to dashboard (or to the same date view)
      navigate(`/admin/dashboard?date=${dateInput}`);
    } catch (err: any) {
      console.error('Error creating session:', err);
      alert(err.response?.data?.message || 'Failed to create session');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Create a Session
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1) First & Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client First Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Last Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Doe"
            />
          </div>

          {/* 2) Email, Phone, DOB (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 3) Mode (online / in-person) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Mode<span className="text-red-500">*</span>
            </label>
            <select
              value={mode}
              onChange={(e) =>
                setMode(e.target.value as 'in-person' | 'online')
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="in-person">In-person</option>
              <option value="online">online</option>
            </select>
          </div>

          {/* 4) Date (pre-populated from query or blank) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Date<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 5) Time Slot (dropdown from availability) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Time<span className="text-red-500">*</span>
            </label>
            {slotsLoading ? (
              <p className="text-gray-500 italic">Loading slots…</p>
            ) : slotsError ? (
              <p className="text-red-500 text-sm">{slotsError}</p>
            ) : (
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {!dateInput && (
                  <option value="">Select a date first</option>
                )}
                {dateInput && availableSlots.length === 0 && (
                  <option value="">No available slots</option>
                )}
                {availableSlots.map((slotTime) => (
                  <option key={slotTime} value={slotTime}>
                    {slotTime}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 6) Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)<span className="text-red-500">*</span>
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value={30}>30</option>
              <option value={45}>45</option>
              <option value={50}>50</option>
              <option value={60}>60</option>
              <option value={90}>90</option>
            </select>
          </div>

          {/* 7) Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Any special instructions…"
            />
          </div>

          {/* 8) Submit / Cancel */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-olive-700 hover:bg-olive-800 text-white"
            >
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateSessionPage;
