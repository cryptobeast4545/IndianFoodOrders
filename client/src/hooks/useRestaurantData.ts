import { useQuery, useMutation } from "@tanstack/react-query";
import { type RestaurantSettings } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export function useRestaurantSettings() {
  return useQuery<RestaurantSettings>({
    queryKey: ['/api/settings'],
  });
}

export function useUpdateRestaurantSettings() {
  const mutation = useMutation({
    mutationFn: async (settings: Partial<RestaurantSettings>) => {
      const res = await apiRequest('PATCH', '/api/settings', settings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    }
  });

  return mutation;
}
