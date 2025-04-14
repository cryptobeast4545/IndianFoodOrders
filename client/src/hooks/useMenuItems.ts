import { useQuery, useMutation } from "@tanstack/react-query";
import { type MenuItem, type Category } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export function useMenuItems(activeOnly: boolean = true) {
  return useQuery<MenuItem[]>({
    queryKey: ['/api/menu-items', { activeOnly }],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const res = await fetch(`/api/menu-items?activeOnly=${(params as any).activeOnly}`);
      if (!res.ok) throw new Error('Failed to fetch menu items');
      return res.json();
    }
  });
}

export function useMenuItemsByCategory(categoryId: number | null) {
  return useQuery<MenuItem[]>({
    queryKey: ['/api/categories', categoryId, 'menu-items'],
    queryFn: async () => {
      if (!categoryId) return [];
      const res = await fetch(`/api/categories/${categoryId}/menu-items`);
      if (!res.ok) throw new Error('Failed to fetch menu items by category');
      return res.json();
    },
    enabled: categoryId !== null
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
}

export function useAddMenuItem() {
  return useMutation({
    mutationFn: async (menuItem: Omit<MenuItem, 'id'>) => {
      const res = await apiRequest('POST', '/api/menu-items', menuItem);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
    }
  });
}

export function useUpdateMenuItem() {
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<MenuItem>) => {
      const res = await apiRequest('PATCH', `/api/menu-items/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
    }
  });
}

export function useDeleteMenuItem() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/menu-items/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
    }
  });
}

export function useAddCategory() {
  return useMutation({
    mutationFn: async (category: Omit<Category, 'id'>) => {
      const res = await apiRequest('POST', '/api/categories', category);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    }
  });
}
