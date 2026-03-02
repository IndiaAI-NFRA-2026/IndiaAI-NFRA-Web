import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type SearchState = {
  search: string;
  status: string;
  type: string;
  uploadDate: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  date?: string;
  userFilter?: string;
  actionTypeFilter?: string;
  tab?: string;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  setStatus: (status: string) => void;
  setType: (type: string) => void;
  setUploadDate: (uploadDate: string) => void;
  // Audit logs specific setters
  setDate: (date: string) => void;
  setUserFilter: (userFilter: string) => void;
  setActionTypeFilter: (actionTypeFilter: string) => void;
  resetPage: () => void;
};

export const useSearchStore = create<SearchState>()(
  devtools(
    (set) => ({
      search: '',
      status: '',
      type: '',
      uploadDate: '',
      page: 1,
      pageSize: 10,
      sortBy: undefined,
      sortOrder: undefined,
      date: undefined,
      userFilter: undefined,
      actionTypeFilter: undefined,

      setSearch: (search) => set({ search, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setType: (type) => set({ type, page: 1 }),
      setUploadDate: (uploadDate) => set({ uploadDate, page: 1 }),
      setDate: (date) => set({ date, page: 1 }),
      setUserFilter: (userFilter) => set({ userFilter, page: 1 }),
      setActionTypeFilter: (actionTypeFilter) => set({ actionTypeFilter, page: 1 }),
      resetPage: () => set({ page: 1 }),
    }),
    { name: 'search-store' }
  )
);
