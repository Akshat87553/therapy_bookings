// src/admin/pages/Fees.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Info } from 'lucide-react';

interface PackageSettings {
  price30: number;
  price50: number;
  single30: boolean;
  single50: boolean;
  package30: boolean;
  package50: boolean;
}

interface FeesResponse {
  online?: PackageSettings;
  inPerson?: PackageSettings;
  offerCouplesTherapy?: boolean;
}

const defaultPackage: PackageSettings = {
  price30: 900,
  price50: 1800,
  single30: true,
  single50: true,
  package30: true,
  package50: true,
};

const Fees: React.FC = () => {
  // Initialize with defaults so the form always appears
  const [online, setOnline] = useState<PackageSettings>({ ...defaultPackage });
  const [inPerson, setInPerson] = useState<PackageSettings>({ ...defaultPackage });
  const [offerCouplesTherapy, setOfferCouplesTherapy] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch existing fees on mount; if successful, overwrite defaults
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const { data } = await axios.get<FeesResponse>('/api/fees', {
          withCredentials: true,
        });

        if (data.online) {
          setOnline(data.online);
        }
        if (data.inPerson) {
          setInPerson(data.inPerson);
        }
        if (typeof data.offerCouplesTherapy === 'boolean') {
          setOfferCouplesTherapy(data.offerCouplesTherapy);
        }
      } catch (error) {
        console.error('Error fetching fees:', error);
        if (axios.isAxiosError<{ message?: string }>(error)) {
          setError(error.response?.data?.message || 'Failed to load fees');
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to load fees');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  // Handlers for changing individual fields
  const onOnlineChange = (
    field: keyof PackageSettings,
    value: number | boolean
  ) => {
    setOnline((prev) => ({ ...prev, [field]: value }));
  };
  const onInPersonChange = (
    field: keyof PackageSettings,
    value: number | boolean
  ) => {
    setInPerson((prev) => ({ ...prev, [field]: value }));
  };

  // Save changes back to the server
  const saveChanges = async () => {
    setSaving(true);
    setError(null);
    try {
      await axios.post(
        '/api/fees',
        { online, inPerson, offerCouplesTherapy },
        { withCredentials: true }
      );
      // Optionally show a “success” toast here
    } catch (error) {
      console.error('Error saving fees:', error);
      if (axios.isAxiosError<{ message?: string }>(error)) {
        setError(error.response?.data?.message || 'Failed to save fees');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to save fees');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading fee settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Fees & Payment</h2>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
        {/* Online Packages */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Online Packages</h3>
          <div className="grid grid-cols-3 gap-6">
            <div></div>
            <div className="text-center">
              <span className="block text-sm font-medium text-gray-700">
                30 min Sessions
              </span>
            </div>
            <div className="text-center">
              <span className="block text-sm font-medium text-gray-700">
                50 min Sessions
              </span>
            </div>

            <div>
              <span className="block text-sm text-gray-600">Per Session Price</span>
            </div>
            <div>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-olive-500"
                value={online.price30}
                onChange={(e) =>
                  onOnlineChange('price30', Number(e.target.value))
                }
              />
            </div>
            <div>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-olive-500"
                value={online.price50}
                onChange={(e) =>
                  onOnlineChange('price50', Number(e.target.value))
                }
              />
            </div>

            <div>
              <span className="block text-sm text-gray-600">Single Session</span>
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                className="w-5 h-5 text-olive-600"
                checked={online.single30}
                onChange={(e) => onOnlineChange('single30', e.target.checked)}
              />
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                className="w-5 h-5 text-olive-600"
                checked={online.single50}
                onChange={(e) => onOnlineChange('single50', e.target.checked)}
              />
            </div>

            <div>
              <span className="block text-sm text-gray-600">
                6 Paid + 1 Free Package
              </span>
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                className="w-5 h-5 text-olive-600"
                checked={online.package30}
                onChange={(e) => onOnlineChange('package30', e.target.checked)}
              />
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                className="w-5 h-5 text-olive-600"
                checked={online.package50}
                onChange={(e) => onOnlineChange('package50', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* In-Person Packages */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">In-Person Packages</h3>
          <div className="grid grid-cols-3 gap-6">
            <div></div>
            <div className="text-center">
              <span className="block text-sm font-medium text-gray-700">
                30 min Sessions
              </span>
            </div>
            <div className="text-center">
              <span className="block text-sm font-medium text-gray-700">
                50 min Sessions
              </span>
            </div>

            <div>
              <span className="block text-sm text-gray-600">Per Session Price</span>
            </div>
            <div>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-olive-500"
                value={inPerson.price30}
                onChange={(e) =>
                  onInPersonChange('price30', Number(e.target.value))
                }
              />
            </div>
            <div>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-olive-500"
                value={inPerson.price50}
                onChange={(e) =>
                  onInPersonChange('price50', Number(e.target.value))
                }
              />
            </div>

            <div>
              <span className="block text-sm text-gray-600">Single Session</span>
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                className="w-5 h-5 text-olive-600"
                checked={inPerson.single30}
                onChange={(e) =>
                  onInPersonChange('single30', e.target.checked)
                }
              />
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                className="w-5 h-5 text-olive-600"
                checked={inPerson.single50}
                onChange={(e) =>
                  onInPersonChange('single50', e.target.checked)
                }
              />
            </div>

            <div>
              <span className="block text-sm text-gray-600">
                6 Paid + 1 Free Package
              </span>
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                className="w-5 h-5 text-olive-600"
                checked={inPerson.package30}
                onChange={(e) =>
                  onInPersonChange('package30', e.target.checked)
                }
              />
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                className="w-5 h-5 text-olive-600"
                checked={inPerson.package50}
                onChange={(e) =>
                  onInPersonChange('package50', e.target.checked)
                }
              />
            </div>
          </div>
        </div>

        {/* Additional Services */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Services</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="w-5 h-5 text-olive-600"
              checked={offerCouplesTherapy}
              onChange={(e) => setOfferCouplesTherapy(e.target.checked)}
            />
            <label className="text-sm text-gray-700">
              I also offer Couple's Therapy
            </label>
            <button className="text-gray-400 hover:text-gray-600">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveChanges}
            disabled={saving}
            className={`px-4 py-2 rounded-md text-white transition-colors ${
              saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-olive-700 hover:bg-olive-800'
            }`}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default Fees;
