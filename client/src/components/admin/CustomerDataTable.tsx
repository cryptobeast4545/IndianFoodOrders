import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCustomers, useExportCustomers, useCustomerOrders } from "@/hooks/useOrders";
import { Customer } from "@/types";
import { Search, FileSpreadsheet, Eye, Trash, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

export default function CustomerDataTable() {
  const { toast } = useToast();
  const { data: customers, isLoading } = useCustomers();
  const exportCustomers = useExportCustomers();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const { data: customerOrders } = useCustomerOrders(viewingCustomer ? viewingCustomer.id : null);
  const customersPerPage = 5;

  // Filter customers by search query
  const getFilteredCustomers = () => {
    if (!customers) return [];
    
    if (!searchQuery) return customers;
    
    const query = searchQuery.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.phoneNumber.includes(query) ||
        customer.id.toString().includes(query)
    );
  };

  // Pagination controls
  const filteredCustomers = getFilteredCustomers();
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
  
  const getCurrentCustomers = () => {
    const startIndex = (currentPage - 1) * customersPerPage;
    return filteredCustomers.slice(startIndex, startIndex + customersPerPage);
  };

  // Handle Excel export
  const handleExportExcel = () => {
    try {
      exportCustomers();
      toast({
        title: "Export Started",
        description: "Customer data is being exported to Excel."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export customer data.",
        variant: "destructive"
      });
    }
  };

  // View customer details
  const handleViewCustomer = (customer: Customer) => {
    setViewingCustomer(customer);
  };

  // Delete customer (this would be implemented in a real app)
  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  // Calculate customer statistics
  const calculateCustomerStats = (customerId: number) => {
    if (!customerOrders) return { orderCount: 0, totalSpent: 0 };
    
    const orders = customerOrders;
    const orderCount = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    return { orderCount, totalSpent };
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading text-xl text-neutral-darker flex items-center">
          <Users className="mr-2 text-primary h-5 w-5" />
          Customer Data
        </h3>
        <div className="flex gap-2">
          <Button className="bg-primary text-white" onClick={handleExportExcel}>
            <FileSpreadsheet size={16} className="mr-1" /> Export Excel
          </Button>
          <Button variant="outline">
            <Filter size={16} className="mr-1" /> Filter
          </Button>
        </div>
      </div>
      
      {/* Customer Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search customers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-dark h-4 w-4" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-light">
                <TableHead className="text-left text-sm font-medium text-neutral-darker">ID</TableHead>
                <TableHead className="text-left text-sm font-medium text-neutral-darker">Name</TableHead>
                <TableHead className="text-left text-sm font-medium text-neutral-darker">Phone Number</TableHead>
                <TableHead className="text-left text-sm font-medium text-neutral-darker">Orders</TableHead>
                <TableHead className="text-left text-sm font-medium text-neutral-darker">Total Spent</TableHead>
                <TableHead className="text-left text-sm font-medium text-neutral-darker">Last Order</TableHead>
                <TableHead className="text-left text-sm font-medium text-neutral-darker">Actions</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-2"></div>
                    <p className="text-neutral-dark">Loading customer data...</p>
                  </TableCell>
                </TableRow>
              ) : getCurrentCustomers().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-neutral-dark">No customers found</p>
                    {searchQuery && (
                      <p className="text-sm mt-2">Try adjusting your search query</p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentCustomers().map((customer) => {
                  // In a real implementation, we would fetch order data for each customer
                  // For now, we'll create mock data based on customer ID
                  const totalOrders = customer.id % 10 + 1;
                  const totalSpent = (customer.id % 10 + 1) * 500;
                  const lastOrderDate = new Date();
                  lastOrderDate.setHours(lastOrderDate.getHours() - (customer.id % 24));
                  
                  return (
                    <TableRow key={customer.id} className="hover:bg-neutral-light">
                      <TableCell className="py-3 px-4 text-sm">#{customer.id}</TableCell>
                      <TableCell className="py-3 px-4 text-sm">{customer.name}</TableCell>
                      <TableCell className="py-3 px-4 text-sm">{customer.phoneNumber}</TableCell>
                      <TableCell className="py-3 px-4 text-sm">{totalOrders}</TableCell>
                      <TableCell className="py-3 px-4 text-sm font-medium">₹{totalSpent.toFixed(2)}</TableCell>
                      <TableCell className="py-3 px-4 text-sm">
                        {format(lastOrderDate, "PPp")}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-opacity-80 h-8 w-8 p-0"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#F44336] hover:text-opacity-80 h-8 w-8 p-0"
                            onClick={() => handleDeleteCustomer(customer)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-dark">
                Showing {((currentPage - 1) * customersPerPage) + 1}-
                {Math.min(currentPage * customersPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
              </p>
              <div className="flex">
                <Button 
                  variant="outline"
                  size="sm"
                  className="px-3 py-1 rounded-l-md"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Customer Details Dialog */}
      <Dialog open={!!viewingCustomer} onOpenChange={(open) => !open && setViewingCustomer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Customer Details</DialogTitle>
          </DialogHeader>
          
          {viewingCustomer && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-neutral-dark">Customer ID</p>
                  <p className="font-medium">#{viewingCustomer.id}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-dark">Joined</p>
                  <p className="font-medium">
                    {format(new Date(viewingCustomer.createdAt), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-dark">Name</p>
                  <p className="font-medium">{viewingCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-dark">Phone Number</p>
                  <p className="font-medium">{viewingCustomer.phoneNumber}</p>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-lg mb-2">Order Statistics</h4>
                
                {customerOrders ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-light p-3 rounded-md">
                      <p className="text-sm text-neutral-dark">Total Orders</p>
                      <p className="font-bold text-lg">{customerOrders.length}</p>
                    </div>
                    <div className="bg-neutral-light p-3 rounded-md">
                      <p className="text-sm text-neutral-dark">Total Spent</p>
                      <p className="font-bold text-lg">
                        ₹{customerOrders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-2"></div>
                    <p className="text-sm text-neutral-dark">Loading order data...</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Recent Orders</h4>
                  
                  {customerOrders && customerOrders.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {customerOrders.slice(0, 5).map(order => (
                        <div key={order.id} className="border p-2 rounded-md text-sm">
                          <div className="flex justify-between">
                            <span>Order #{order.id}</span>
                            <span className="font-medium">₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-neutral-dark">
                            <span>{format(new Date(order.createdAt), "PPp")}</span>
                            <span className="capitalize">{order.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : customerOrders && customerOrders.length === 0 ? (
                    <p className="text-sm text-neutral-dark text-center py-2">
                      No orders found for this customer
                    </p>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-neutral-dark">Loading orders...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Customer Dialog */}
      <AlertDialog 
        open={!!customerToDelete} 
        onOpenChange={(open) => !open && setCustomerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {customerToDelete?.name}'s account and all associated data? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-[#F44336] hover:bg-[#F44336]/90"
              onClick={() => {
                toast({
                  title: "Feature Not Implemented",
                  description: "Customer deletion is not implemented in this demo.",
                });
                setCustomerToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
