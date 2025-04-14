import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { FullOrder, OrderStatus } from "@/types";
import { format } from "date-fns";
import OrderTracking from "../order/OrderTracking";

interface OrderTableProps {
  orders: FullOrder[];
}

export default function OrderTable({ orders }: OrderTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingOrder, setViewingOrder] = useState<number | null>(null);
  const ordersPerPage = 4;

  // Calculate total pages
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // Get current orders for pagination
  const getCurrentOrders = () => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    return orders.slice(startIndex, endIndex);
  };

  // Handle pagination
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Delete order
  const deleteOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete order');
      }
      // Refresh the orders list (handled by react-query)
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case OrderStatus.NEW:
        return "bg-[#FF9800] text-white";
      case OrderStatus.PREPARING:
        return "bg-[#2196F3] text-white";
      case OrderStatus.READY:
        return "bg-[#4CAF50] text-white";
      case OrderStatus.COMPLETED:
        return "bg-neutral-dark text-white";
      case OrderStatus.CANCELLED:
        return "bg-[#F44336] text-white";
      default:
        return "bg-neutral-medium text-white";
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-light">
                <TableHead className="text-left font-medium text-neutral-darker">Order ID</TableHead>
                <TableHead className="text-left font-medium text-neutral-darker">Customer</TableHead>
                <TableHead className="text-left font-medium text-neutral-darker">Table</TableHead>
                <TableHead className="text-left font-medium text-neutral-darker">Items</TableHead>
                <TableHead className="text-left font-medium text-neutral-darker">Amount</TableHead>
                <TableHead className="text-left font-medium text-neutral-darker">Status</TableHead>
                <TableHead className="text-left font-medium text-neutral-darker">Time</TableHead>
                <TableHead className="text-left font-medium text-neutral-darker">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCurrentOrders().map((order) => (
                <TableRow key={order.id} className="hover:bg-neutral-light">
                  <TableCell className="py-3 px-4 text-sm">#{order.id}</TableCell>
                  <TableCell className="py-3 px-4 text-sm">{order.customer.name}</TableCell>
                  <TableCell className="py-3 px-4 text-sm">{order.tableNumber}</TableCell>
                  <TableCell className="py-3 px-4 text-sm">{order.items.length} items</TableCell>
                  <TableCell className="py-3 px-4 text-sm font-medium">₹{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="py-3 px-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm">
                    {format(new Date(order.createdAt), "h:mm a")}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        className="text-primary hover:text-opacity-80 p-1 h-auto"
                        onClick={() => setViewingOrder(order.id)}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-700 p-1 h-auto"
                        onClick={() => deleteOrder(order.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-neutral-dark">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-dark">
                Showing {((currentPage - 1) * ordersPerPage) + 1}-
                {Math.min(currentPage * ordersPerPage, orders.length)} of {orders.length} orders
              </p>
              <div className="flex">
                <Button 
                  variant="outline"
                  size="sm"
                  className="px-3 py-1 rounded-l-md"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </Button>
                
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                  // Show pages around current page
                  let pageToShow = currentPage - 1 + i;
                  if (currentPage === 1) {
                    pageToShow = i + 1;
                  } else if (currentPage === totalPages) {
                    pageToShow = totalPages - 2 + i;
                  }
                  
                  // Make sure page numbers are valid
                  if (pageToShow < 1) pageToShow = 1;
                  if (pageToShow > totalPages) pageToShow = totalPages;
                  
                  return (
                    <Button
                      key={pageToShow}
                      variant={pageToShow === currentPage ? "default" : "outline"}
                      size="sm"
                      className={`px-3 py-1 border-x-0 ${
                        pageToShow === currentPage ? "bg-primary text-white" : "text-neutral-dark"
                      }`}
                      onClick={() => setCurrentPage(pageToShow)}
                    >
                      {pageToShow}
                    </Button>
                  );
                })}
                
                <Button 
                  variant="outline"
                  size="sm"
                  className="px-3 py-1 rounded-r-md"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order details modal */}
      {viewingOrder !== null && (
        <OrderTracking
          isOpen={true}
          onClose={() => setViewingOrder(null)}
          orderId={viewingOrder}
        />
      )}
    </>
  );
}
