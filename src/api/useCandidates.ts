import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export interface Candidate {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  skills: string;
  experience_years: number;
  education: string;
  match_score: number;
  created_at: string;
}

export const useCandidates = (search?: string) => {
  return useQuery({
    queryKey: ['candidates', search],
    queryFn: async () => {
      const response = await apiClient.get<Candidate[]>('/candidates', {
        params: { search }
      });
      return response.data;
    },
  });
};

export const useCandidate = (id: number) => {
  return useQuery({
    queryKey: ['candidates', id],
    queryFn: async () => {
      const response = await apiClient.get<Candidate>(`/candidates/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/candidates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
};
