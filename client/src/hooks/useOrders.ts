import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import {
  type FullOrder,
  type Order,
  type OrderStatusType,
  type Customer,
  type CartItem
} from "@/types";

// Get all orders
export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ['/api/orders'],
    refetchInterval: 10000, // Poll every 10 seconds for real-time updates
  });
}

// Get full orders with customer and items
export function useFullOrders() {
  return useQuery<FullOrder[]>({
    queryKey: ['/api/orders/full'],
    refetchInterval: 10000, // Poll every 10 seconds for real-time updates
  });
}

// Get orders by status
export function useOrdersByStatus(status: OrderStatusType) {
  return useQuery<Order[]>({
    queryKey: ['/api/orders', { status }],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const res = await fetch(`/api/orders?status=${(params as any).status}`);
      if (!res.ok) throw new Error('Failed to fetch orders by status');
      return res.json();
    },
    refetchInterval: 10000, // Poll every 10 seconds for real-time updates
  });
}

// Get order by ID
export function useOrder(id: number | null) {
  return useQuery<Order>({
    queryKey: ['/api/orders', id],
    queryFn: async () => {
      if (!id) throw new Error('Order ID is required');
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      return res.json();
    },
    enabled: id !== null,
    refetchInterval: 10000, // Poll every 10 seconds for real-time updates
  });
}

// Get full order details by ID
export function useFullOrder(id: number | null) {
  return useQuery<FullOrder>({
    queryKey: ['/api/orders', id, 'full'],
    queryFn: async () => {
      if (!id) throw new Error('Order ID is required');
      const res = await fetch(`/api/orders/${id}/full`);
      if (!res.ok) throw new Error('Failed to fetch full order');
      return res.json();
    },
    enabled: id !== null,
    refetchInterval: 10000, // Poll every 10 seconds for real-time updates
  });
}

// Create new order
export function useCreateOrder() {
  return useMutation({
    mutationFn: async ({
      customer,
      cart,
      tableNumber,
      specialInstructions,
    }: {
      customer: Omit<Customer, 'id' | 'createdAt'>;
      cart: CartItem[];
      tableNumber?: number;
      specialInstructions?: string;
    }) => {
      // First create or get customer
      const customerRes = await apiRequest('POST', '/api/customers', customer);
      const customerData = await customerRes.json();

      // Calculate total amount
      const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);

      // Prepare order data
      const orderData = {
        order: {
          customerId: customerData.id,
          totalAmount,
          tableNumber: tableNumber || 1,
          specialInstructions,
        },
        items: cart.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          price: item.totalPrice,
          customizations: item.customizations.length > 0 ? JSON.stringify(item.customizations) : undefined,
        })),
      };

      const orderRes = await apiRequest('POST', '/api/orders', orderData);
      return orderRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });
}

// Update order status
export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: OrderStatusType }) => {
      const res = await apiRequest('PATCH', `/api/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });
}

// Get orders by customer
export function useCustomerOrders(customerId: number | null) {
  return useQuery<Order[]>({
    queryKey: ['/api/customers', customerId, 'orders'],
    queryFn: async () => {
      if (!customerId) return [];
      const res = await fetch(`/api/customers/${customerId}/orders`);
      if (!res.ok) throw new Error('Failed to fetch customer orders');
      return res.json();
    },
    enabled: customerId !== null,
  });
}

// Get all customers
export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });
}

// Export customer data to Excel
export function useExportCustomers() {
  return () => {
    window.open('/api/export/customers', '_blank');
  };
}
