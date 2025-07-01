import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Video, Home, Edit3, Check, X } from 'lucide-react';

interface Booking {
  id: string;
  mode: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
}

interface ClientBookingNoteProps {
  booking: Booking;
}

const ClientBookingNote: React.FC<ClientBookingNoteProps> = ({ booking }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [noteText, setNoteText] = useState(booking.notes || '');
  const [editing, setEditing] = useState(false);
  const [tempText, setTempText] = useState(booking.notes || '');
  const [actionError, setActionError] = useState<string | null>(null);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
    setEditing(false);
    setTempText(noteText);
    setActionError(null);
  };

  const startEditing = () => {
    setTempText(noteText);
    setEditing(true);
    setActionError(null);
  };

  const cancelEditing = () => {
    setTempText(noteText);
    setEditing(false);
    setActionError(null);
  };

  const saveNote = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${booking.id}/note`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notes: tempText.trim() }),
        }
      );
      if (response.status === 401) {
        setActionError('Unauthorized. Please log in.');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to update note');
      }
      setNoteText(tempText.trim());
      setEditing(false);
      setActionError(null);
    } catch (err) {
      console.error(err);
      setActionError('Error saving note');
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="flex justify-between items-center p-4 cursor-pointer bg-gray-50"
        onClick={toggleExpand}
      >
        <div className="flex items-center space-x-3">
          {booking.mode === 'online' ? (
            <Video className="w-5 h-5 text-gray-600" />
          ) : (
            <Home className="w-5 h-5 text-gray-600" />
          )}
          <div>
            <p className="font-medium text-gray-800">
              Session on {new Date(booking.date).toLocaleDateString()}, {booking.time}
            </p>
            <p className="text-sm text-gray-500">
              {booking.duration} mins • {booking.mode === 'online' ? 'Online' : 'In-person'}
            </p>
          </div>
        </div>
        <button className="text-gray-400">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
          {actionError && <p className="text-red-600 mb-2 text-sm">{actionError}</p>}

          {editing ? (
            <div className="space-y-2">
              <textarea
                value={tempText}
                onChange={(e) => setTempText(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-olive-500"
              />
              <div className="flex space-x-2">
                <button
                  onClick={saveNote}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" /> Save
                </button>
                <button
                  onClick={cancelEditing}
                  className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <p className="flex-1 text-gray-600">
                {noteText || <em>No notes yet.</em>}
              </p>
              <button
                onClick={startEditing}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="Edit note"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientBookingNote;
