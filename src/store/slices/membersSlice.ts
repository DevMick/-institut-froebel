import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  joinDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

interface MembersState {
  members: Member[];
  loading: boolean;
  error: string | null;
}

const initialState: MembersState = {
  members: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@rotary.org',
      phone: '+33 6 12 34 56 78',
      role: 'member',
      joinDate: '2020-01-15',
      status: 'active',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@rotary.org',
      phone: '+33 6 23 45 67 89',
      role: 'president',
      joinDate: '2018-06-01',
      status: 'active',
    },
  ],
  loading: false,
  error: null,
};

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setMembers: (state, action: PayloadAction<Member[]>) => {
      state.members = action.payload;
    },
    addMember: (state, action: PayloadAction<Member>) => {
      state.members.push(action.payload);
    },
    updateMember: (state, action: PayloadAction<Member>) => {
      const index = state.members.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = action.payload;
      }
    },
    deleteMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter(m => m.id !== action.payload);
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
  setMembers,
  addMember,
  updateMember,
  deleteMember,
  setLoading,
  setError,
} = membersSlice.actions;

export default membersSlice.reducer; 