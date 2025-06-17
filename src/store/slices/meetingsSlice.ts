import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Meeting {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface MeetingsState {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
}

const initialState: MeetingsState = {
  meetings: [
    {
      id: '1',
      title: 'Réunion Hebdomadaire',
      date: '2024-03-20T10:00:00',
      location: 'Hôtel Royal',
      attendees: ['1', '2', '3'],
      status: 'upcoming',
    },
    {
      id: '2',
      title: 'Assemblée Générale',
      date: '2024-04-15T14:00:00',
      location: 'Salle des Fêtes',
      attendees: [],
      status: 'upcoming',
    },
  ],
  loading: false,
  error: null,
};

const meetingsSlice = createSlice({
  name: 'meetings',
  initialState,
  reducers: {
    setMeetings: (state, action: PayloadAction<Meeting[]>) => {
      state.meetings = action.payload;
    },
    addMeeting: (state, action: PayloadAction<Meeting>) => {
      state.meetings.push(action.payload);
    },
    updateMeeting: (state, action: PayloadAction<Meeting>) => {
      const index = state.meetings.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.meetings[index] = action.payload;
      }
    },
    deleteMeeting: (state, action: PayloadAction<string>) => {
      state.meetings = state.meetings.filter(m => m.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setMeetings,
  addMeeting,
  updateMeeting,
  deleteMeeting,
  setLoading,
  setError,
} = meetingsSlice.actions;

export default meetingsSlice.reducer; 