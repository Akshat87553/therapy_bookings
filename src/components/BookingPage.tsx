// src/admin/pages/BookingPage.tsx
import React, { useState, useEffect } from 'react';
import { format, addDays, parse, addMinutes } from 'date-fns';
import { ArrowLeft, ArrowRight, Monitor, Users, Check } from 'lucide-react';
import axios from 'axios';

type SessionMode = 'in-person' | 'online';
type BookingStep = 'session' | 'details' | 'payment' | 'confirmation';

interface PersonalDetails {
  firstName: string;
  lastName:  string;
  dob:       string;
  phone:     string;
}

/** Each “occupied” slot we’ll remember client-side (to hide it + its neighbor). */
interface OccupiedSlot {
  date: string;
  time: string;
}

interface Slot {
  time:        string;
  isAvailable: boolean;
  slotType:    string;
}

interface SlotData {
  date:  string | Date;
  slots: Slot[];
}

axios.defaults.withCredentials = true;
const adminId = '682fa52d899e328f422b6851';

// Strict env-only base URL
const API_BASE = import.meta.env.VITE_API_BASE;

const BookingPage: React.FC = () => {
  // ─── Session / UI state ──────────────────────────────────────────
  const [selectedMode, setSelectedMode] = useState<SessionMode>('in-person');
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<BookingStep>('session');
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    firstName: '',
    lastName:  '',
    dob:       '',
    phone:     '',
  });
  const [consentChecked, setConsentChecked] = useState<boolean>(false);

  // ─── Remember which slots this user has just booked (so we can hide them + the next slot) ────────────────────
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);

  // ─── Available slots state (raw data from API) ────────────────────────────────────────
  const [availableSlotsByDate, setAvailableSlotsByDate] = useState<{
    [date: string]: string[];
  }>({});

  // ─── Geolocation: detect user’s country code ─────────────────────────────────────────
  const [userCountry, setUserCountry] = useState<string>('');
  const [geoLoading, setGeoLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        setUserCountry(data.country_code || '');
      })
      .catch((err) => {
        console.error('Geolocation error:', err);
        setUserCountry('');
      })
      .finally(() => {
        setGeoLoading(false);
      });
  }, []);

  // ─── Fees state ─────────────────────────────────────────────────────────────────
  const [onlinePrice50, setOnlinePrice50] = useState<number>(0);
  const [inPersonPrice50, setInPersonPrice50] = useState<number>(0);
  const [feesLoading, setFeesLoading] = useState<boolean>(true);
  const [feesError, setFeesError] = useState<string | null>(null);

  useEffect(() => {
    if (geoLoading) return;

    const fetchFees = async () => {
      setFeesLoading(true);
      setFeesError(null);

      if (!API_BASE) {
        setFeesError('VITE_API_BASE is not set. Please add it to .env and restart the dev server.');
        setFeesLoading(false);
        return;
      }

      const regionParam = userCountry === 'IN' ? 'india' : 'intl';
      const url = `${API_BASE}/api/public/fees/${adminId}?region=${regionParam}`;

      try {
        const { data } = await axios.get(url);
        setOnlinePrice50(data.online.price50);
        setInPersonPrice50(data.inPerson.price50);
      } catch (error) {
        console.error('Error fetching fees:', error);
        if (axios.isAxiosError<{ message?: string }>(error)) {
          setFeesError(error.response?.data?.message || 'Failed to load fees');
        } else if (error instanceof Error) {
          setFeesError(error.message);
        } else {
          setFeesError('Failed to load fees');
        }
      } finally {
        setFeesLoading(false);
      }
    };

    fetchFees();
  }, [userCountry, geoLoading]);

  // ---------- Fetch available slots ----------
  const fetchAvailableSlots = async () => {
    if (!API_BASE) {
      console.error('VITE_API_BASE is not set — cannot fetch available slots.');
      setAvailableSlotsByDate({});
      return;
    }

    const start = format(new Date(), 'yyyy-MM-dd');
    const end = format(addDays(new Date(), 6), 'yyyy-MM-dd');

    try {
      const { data } = await axios.get<SlotData[]>(
        `${API_BASE}/api/schedule/available-slots`,
        { params: { start, end, adminId }, withCredentials: true }
      );

      const slotsByDate = (data || []).reduce((acc: Record<string, string[]>, item) => {
        let isoDate: string;
        if (typeof item.date === 'string') {
          isoDate = item.date.slice(0, 10);
        } else {
          isoDate = format(new Date(item.date), 'yyyy-MM-dd');
        }
        const times = (item.slots || []).filter((slot) => slot.isAvailable).map((slot) => slot.time);
        acc[isoDate] = times;
        return acc;
      }, {});
      setAvailableSlotsByDate(slotsByDate);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlotsByDate({});
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  // ─── Razorpay script loader ─────────────────────────────────────────────────────
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ─── Helper: next 30-min slot
  const getNextThirtyMinSlot = (time: string): string => {
    const parsed = parse(time, 'hh:mm a', new Date());
    const plusThirty = addMinutes(parsed, 30);
    return format(plusThirty, 'hh:mm a');
  };

  // ─── Minutes until a slot (used for disabling/warning)
  const minutesUntil = (dateStr: string, time: string): number => {
    try {
      const dt = parse(`${dateStr} ${time}`, 'yyyy-MM-dd hh:mm a', new Date());
      return Math.round((dt.getTime() - new Date().getTime()) / 60000);
    } catch {
      return Number.POSITIVE_INFINITY;
    }
  };

  // ─── Occupied filter
  const filterOutOccupied = (rawSlots: string[], forDate: string): string[] => {
    if (!occupiedSlots.length) return rawSlots;

    const toRemove = new Set<string>();
    occupiedSlots.forEach(({ date, time }) => {
      if (date !== forDate) return;
      toRemove.add(time);
      toRemove.add(getNextThirtyMinSlot(time));
    });

    return rawSlots.filter((slot) => !toRemove.has(slot));
  };

  // ─── Remove past times (today) and hide past dates
  const filterOutPastTimes = (slots: string[], dateStr: string): string[] => {
    if (!slots || slots.length === 0) return [];

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (dateStr > todayStr) return slots;
    if (dateStr < todayStr) return [];

    const now = new Date();
    return slots.filter((time) => {
      const parsed = parse(`${dateStr} ${time}`, 'yyyy-MM-dd hh:mm a', new Date());
      if (isNaN(parsed.getTime())) return true;
      return parsed.getTime() > now.getTime();
    });
  };

  // ─── categorize
  const categorizeSlots = (slots: string[]) => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    slots.forEach((time) => {
      const parsedTime = parse(time, 'hh:mm a', new Date());
      const hour = parsedTime.getHours();
      if (hour < 12) morning.push(time);
      else if (hour < 17) afternoon.push(time);
      else evening.push(time);
    });

    return { morning, afternoon, evening };
  };

  const generateDates = () => {
    const dates: { date: string; day: string; dayOfMonth: string; slots: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const raw = availableSlotsByDate[dateStr] || [];
      const afterTimeFilter = filterOutPastTimes(raw, dateStr);
      const afterOccupiedFilter = filterOutOccupied(afterTimeFilter, dateStr);

      dates.push({
        date: dateStr,
        day: format(date, 'EEE'),
        dayOfMonth: format(date, 'd MMM'),
        slots: afterOccupiedFilter.length,
      });
    }
    return dates;
  };

  // ─── handle personal details submit
  const handlePersonalDetailsSubmit = () => {
    if (!personalDetails.firstName || !personalDetails.lastName || !personalDetails.dob || !personalDetails.phone) {
      alert('Please fill in all required fields');
      return;
    }
    if (!consentChecked) {
      alert('You must agree to the consent before continuing.');
      return;
    }
    setCurrentStep('payment');
  };

  const sessionPrice = selectedMode === 'online' ? onlinePrice50 : inPersonPrice50;

  // ─── handle payment flow (uses API_BASE)
  const handlePayment = async () => {
    if (!API_BASE) {
      alert('Server base URL not configured. Please set VITE_API_BASE in your .env and restart dev server.');
      return;
    }

    try {
      const bookingData = {
        adminId,
        user: {
          firstName: personalDetails.firstName,
          lastName:  personalDetails.lastName,
          dob:       personalDetails.dob,
          phone:     personalDetails.phone,
        },
        session: {
          mode:     selectedMode,
          date:     selectedDate,
          timeSlot: selectedTime,
        },
        status: 'pending',
      };

      const bookingResp = await axios.post(`${API_BASE}/api/bookings`, bookingData, { withCredentials: true });
      const bookingId: string = bookingResp.data.bookingId;
      if (!bookingId) throw new Error('Booking creation failed: no bookingId returned');

      const { data } = await axios.post(
        `${API_BASE}/api/payments/create-order`,
        { bookingId, amount: sessionPrice },
        { withCredentials: true }
      );
      const orderId: string = data.orderId;
      if (!orderId) throw new Error('Create-order failed: no orderId returned');

      const options = {
        key:       'rzp_test_bJKekDM14mOARz',
        amount:    sessionPrice * 100,
        currency:  'INR',
        name:      'Pilates Booking',
        description: 'Session booking',
        order_id:  orderId,
        handler: async (resp: RazorpayResponse) => {
          try {
            const verifyResp = await axios.post(`${API_BASE}/api/payments/verify`, {
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_order_id:  resp.razorpay_order_id,
              razorpay_signature: resp.razorpay_signature,
              bookingId,
            }, { withCredentials: true });

            if (verifyResp.data.success) {
              setCurrentStep('confirmation');
              setOccupiedSlots((prev) => [...prev, { date: selectedDate, time: selectedTime }]);
              fetchAvailableSlots();
            } else {
              alert('Payment verification failed: ' + verifyResp.data.message);
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
            alert('Payment verification failed. Please try again.');
          }
        },
        prefill: { name: `${personalDetails.firstName} ${personalDetails.lastName}`, contact: personalDetails.phone },
        theme: { color: '#4F46E5' },
      };

      const RazorpayConstructor = window.Razorpay;
      if (!RazorpayConstructor) {
        alert('Payment gateway is unavailable. Please refresh the page and try again.');
        return;
      }

      new RazorpayConstructor(options).open();
    } catch (error) {
      console.error('Error in handlePayment:', error);
      if (error instanceof Error) {
        alert(`Failed to create booking or order: ${error.message}`);
      } else {
        alert('Failed to create booking or order.');
      }
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center mb-8">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'session' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
          <Check size={16} />
        </div>
        <div className="ml-3">Choose session details</div>
      </div>
      <div className="flex-1 h-px bg-gray-300 mx-4"></div>
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'details' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
          {currentStep === 'details' ? '2' : <Check size={16} />}
        </div>
        <div className="ml-3">Enter your details</div>
      </div>
      <div className="flex-1 h-px bg-gray-300 mx-4"></div>
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>3</div>
        <div className="ml-3">Complete booking</div>
      </div>
      <div className="flex-1 h-px bg-gray-300 mx-4"></div>
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'confirmation' ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>4</div>
        <div className="ml-3">Confirmation</div>
      </div>
    </div>
  );

  const renderPersonalDetailsStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="flex space-x-2">
            <input type="tel" value={personalDetails.phone} onChange={(e) => setPersonalDetails({ ...personalDetails, phone: e.target.value })} className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Enter your mobile number" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input type="text" value={personalDetails.firstName} onChange={(e) => setPersonalDetails({ ...personalDetails, firstName: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Enter your first name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input type="text" value={personalDetails.lastName} onChange={(e) => setPersonalDetails({ ...personalDetails, lastName: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Enter your last name" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input type="date" value={personalDetails.dob} onChange={(e) => setPersonalDetails({ ...personalDetails, dob: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center">
          <input id="consent" type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
          <label htmlFor="consent" className="ml-2 text-sm text-gray-700">I have read and agree to the <a href="/consent-form" className="text-indigo-600 underline">Consent Form</a></label>
        </div>
        <button onClick={handlePersonalDetailsSubmit} disabled={!personalDetails.firstName || !personalDetails.lastName || !personalDetails.dob || !personalDetails.phone || !consentChecked} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Continue to Payment</button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <p>Session with: {selectedInstructor.name}</p>
          <p>Date: {selectedDate}</p>
          <p>Time: {selectedTime}</p>
          <p>Mode: {selectedMode}</p>
          <p className="text-lg font-medium mt-4">Total Amount: ₹{sessionPrice}</p>
        </div>
      </div>
      <div className="space-y-4">
        <button onClick={handlePayment} className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700">Pay with Razorpay</button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-medium mb-4">Booking Confirmed!</h2>
      <p className="text-gray-600">Your session has been successfully booked.</p>
      <div className="mt-6">
        <button onClick={() => { setSelectedTime(''); setCurrentStep('session'); }} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">Book Another Session</button>
      </div>
    </div>
  );

  // Apply time & occupied filters
  const rawSlotsForDateBeforeFilters = availableSlotsByDate[selectedDate] || [];
  const rawSlotsForDateAfterTimeFilter = filterOutPastTimes(rawSlotsForDateBeforeFilters, selectedDate);
  const filteredSlotsForDate = filterOutOccupied(rawSlotsForDateAfterTimeFilter, selectedDate);

  const { morning, afternoon, evening } = categorizeSlots(filteredSlotsForDate);

  const [selectedInstructor] = useState({ name: 'Nainika Makhija', role: 'Senior Therapist' });

  if (geoLoading || feesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">Loading…</p></div>;
  }

  if (feesError) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">Error loading fees: {feesError}</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {renderStepIndicator()}

          <div className="flex items-center mb-8 pb-8 border-b border-gray-200">
            <img src="https://images.pexels.com/photos/5384534/pexels-photo-5384534.jpeg?auto=compress&cs=tinysrgb&w=1600" alt={selectedInstructor.name} className="w-12 h-12 rounded-full object-cover" />
            <div className="ml-4">
              <h2 className="text-lg font-medium">Therapy session with</h2>
              <p className="text-gray-600">{selectedInstructor.name}</p>
            </div>
          </div>

          {currentStep === 'session' && (
            <>
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Mode of Session</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button onClick={() => setSelectedMode('in-person')} className={`p-4 rounded-lg flex flex-col items-center justify-center border-2 transition-all ${selectedMode === 'in-person' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-600'}`}>
                    <Users className={selectedMode === 'in-person' ? 'text-indigo-600' : 'text-gray-500'} size={24} />
                    <span className={`mt-2 ${selectedMode === 'in-person' ? 'text-indigo-600' : 'text-gray-500'}`}>In-person</span>
                  </button>
                  <button onClick={() => setSelectedMode('online')} className={`p-4 rounded-lg flex flex-col items-center justify-center border-2 transition-all ${selectedMode === 'online' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-600'}`}>
                    <Monitor className={selectedMode === 'online' ? 'text-indigo-600' : 'text-gray-500'} size={24} />
                    <span className={`mt-2 ${selectedMode === 'online' ? 'text-indigo-600' : 'text-gray-500'}`}>Video call</span>
                  </button>
                </div>
                <p className="mt-4 text-gray-600">Session Price: ₹{sessionPrice}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Date and Time</h3>
                <div className="flex items-center justify-between mb-6">
                  <button className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
                  <div className="flex space-x-4">
                    {generateDates().map((date) => (
                      <button key={date.date} onClick={() => { setSelectedDate(date.date); setSelectedTime(''); }} className={`p-3 rounded-lg text-center min-w-[80px] transition-all ${selectedDate === date.date ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>
                        <div className="text-sm">{date.day}</div>
                        <div className="font-medium">{date.dayOfMonth}</div>
                        <div className="text-xs mt-1">{date.slots} slots available</div>
                      </button>
                    ))}
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full"><ArrowRight size={20} /></button>
                </div>

                <div className="space-y-6">
                  {morning.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Morning</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {morning.map((time) => {
                          const minsUntil = minutesUntil(selectedDate, time);
                          const within5 = minsUntil <= 5 && minsUntil >= 0;
                          const within30 = minsUntil <= 30 && minsUntil > 5;
                          const disabled = within5;
                          const warning = within30;

                          return (
                            <button key={time} onClick={() => !disabled && setSelectedTime(time)} disabled={disabled} className={`py-2 px-4 rounded-lg text-center border transition-all ${selectedTime === time ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 hover:border-indigo-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${warning && !disabled ? 'ring-2 ring-yellow-300' : ''}`} title={disabled ? 'This slot starts within 5 minutes and cannot be booked' : (warning ? 'This slot starts within 30 minutes' : '')}>{time}</button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {afternoon.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Afternoon</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {afternoon.map((time) => {
                          const minsUntil = minutesUntil(selectedDate, time);
                          const within5 = minsUntil <= 5 && minsUntil >= 0;
                          const within30 = minsUntil <= 30 && minsUntil > 5;
                          const disabled = within5;
                          const warning = within30;

                          return (
                            <button key={time} onClick={() => !disabled && setSelectedTime(time)} disabled={disabled} className={`py-2 px-4 rounded-lg text-center border transition-all ${selectedTime === time ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 hover:border-indigo-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${warning && !disabled ? 'ring-2 ring-yellow-300' : ''}`} title={disabled ? 'This slot starts within 5 minutes and cannot be booked' : (warning ? 'This slot starts within 30 minutes' : '')}>{time}</button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {evening.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Evening</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {evening.map((time) => {
                          const minsUntil = minutesUntil(selectedDate, time);
                          const within5 = minsUntil <= 5 && minsUntil >= 0;
                          const within30 = minsUntil <= 30 && minsUntil > 5;
                          const disabled = within5;
                          const warning = within30;

                          return (
                            <button key={time} onClick={() => !disabled && setSelectedTime(time)} disabled={disabled} className={`py-2 px-4 rounded-lg text-center border transition-all ${selectedTime === time ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 hover:border-indigo-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${warning && !disabled ? 'ring-2 ring-yellow-300' : ''}`} title={disabled ? 'This slot starts within 5 minutes and cannot be booked' : (warning ? 'This slot starts within 30 minutes' : '')}>{time}</button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {morning.length === 0 && afternoon.length === 0 && evening.length === 0 && (
                    <div className="text-center text-gray-500">No time slots available for the selected date.</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button disabled={!selectedMode || !selectedDate || !selectedTime} onClick={() => setCurrentStep('details')} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">Continue</button>
              </div>
            </>
          )}

          {currentStep === 'details' && renderPersonalDetailsStep()}
          {currentStep === 'payment' && renderPaymentStep()}
          {currentStep === 'confirmation' && renderConfirmationStep()}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
