import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMenuItems, useCategories, useDeleteMenuItem } from "@/hooks/useMenuItems";
import AddMenuItemModal from "./AddMenuItemModal";
import { MenuItem } from "@/types";
import { Search, Plus, Edit, Trash, Check, X, ChevronLeft, ChevronRight, Utensils } from "lucide-react";
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

export default function MenuItemTable() {
  const { toast } = useToast();
  const { data: menuItems, isLoading } = useMenuItems(false);
  const { data: categories } = useCategories();
  const { mutate: deleteMenuItem, isPending: isDeleting } = useDeleteMenuItem();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter menu items
  const getFilteredItems = () => {
    if (!menuItems) return [];
    
    let filtered = [...menuItems];
    
    // Apply category filter
    if (selectedCategory !== "all") {
      const categoryId = parseInt(selectedCategory);
      filtered = filtered.filter(item => item.categoryId === categoryId);
    }
    
    // Apply active/inactive filter
    if (activeFilter === "active") {
      filtered = filtered.filter(item => item.isActive);
    } else if (activeFilter === "inactive") {
      filtered = filtered.filter(item => !item.isActive);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories?.find(c => c.id === categoryId);
    return category ? category.name : "Unknown";
  };

  // Pagination controls
  const filteredItems = getFilteredItems();
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  };

  // Handle item deletion
  const handleDeleteItem = (item: MenuItem) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    deleteMenuItem(itemToDelete.id, {
      onSuccess: () => {
        toast({
          title: "Item Deleted",
          description: `${itemToDelete.name} has been removed from the menu.`
        });
        setShowDeleteDialog(false);
        setItemToDelete(null);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to delete item: ${error.message}`,
          variant: "destructive"
        });
      }
    });
  };

  // Handle item edit
  const handleEditItem = (item: MenuItem) => {
    setItemToEdit(item);
    setShowModal(true);
  };

  // Reset pagination when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="font-heading text-xl text-neutral-darker flex items-center">
          <Utensils className="mr-2 text-primary h-5 w-5" />
          Menu Management
        </h3>
        <Button 
          className="bg-primary text-white" 
          onClick={() => {
            setItemToEdit(null);
            setShowModal(true);
          }}
        >
          <Plus size={16} className="mr-1" /> Add Item
        </Button>
      </div>
      
      {/* Category Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            className={selectedCategory === "all" ? "bg-primary" : ""}
            onClick={() => {
              setSelectedCategory("all");
              resetPagination();
            }}
          >
            All Categories
          </Button>
          
          {categories?.map((category) => (
            <Button 
              key={category.id} 
              variant={selectedCategory === category.id.toString() ? "default" : "outline"}
              size="sm"
              className={selectedCategory === category.id.toString() ? "bg-primary" : ""}
              onClick={() => {
                setSelectedCategory(category.id.toString());
                resetPagination();
              }}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Menu Items Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="relative w-64">
            <Input 
              type="text" 
              placeholder="Search menu items..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                resetPagination();
              }}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-dark h-4 w-4" />
          </div>
          <div className="flex items-center">
            <span className="text-sm mr-2">Show:</span>
            <Select 
              value={activeFilter} 
              onValueChange={(value) => {
                setActiveFilter(value);
                resetPagination();
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-light">
                <TableHead className="text-left text-sm font-medium text-neutral-darker">ID</TableHead>
                <TableHead className="text-left text-sm font-medium text-neutral-darker">Name</TableHead>
                <TableHead className="text-left text-sm font-medium text-neutral-darker">Category</TableHead>
                <TableHead className="text-left text-sm font-medium text-neutral-darker">Price (₹)</TableHead>
                <TableHead className="text-left text-sm font-medium text-neutral-darker">Customizable</TableHead>
                <TableHead className="text-left text-sm font-medium text-neutral-darker">Status</TableHead>
                <TableHead className="text-left text-sm font-medium text-neutral-darker">Actions</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-2"></div>
                    <p className="text-neutral-dark">Loading menu items...</p>
                  </TableCell>
                </TableRow>
              ) : getCurrentItems().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-neutral-dark">No menu items found</p>
                    {searchQuery && (
                      <p className="text-sm mt-2">Try adjusting your search or filters</p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentItems().map((item) => (
                  <TableRow key={item.id} className="hover:bg-neutral-light">
                    <TableCell className="py-3 px-4 text-sm">#{item.id}</TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-md overflow-hidden mr-3">
                          <img 
                            src={item.imageUrl || "https://via.placeholder.com/80x80?text=No+Image"} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm">{getCategoryName(item.categoryId)}</TableCell>
                    <TableCell className="py-3 px-4 text-sm">{item.price.toFixed(2)}</TableCell>
                    <TableCell className="py-3 px-4 text-sm">
                      {item.isCustomizable ? (
                        <Check className="text-[#4CAF50]" size={18} />
                      ) : (
                        <X className="text-neutral-dark" size={18} />
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm">
                      <span className={`${
                        item.isActive 
                          ? "bg-[#4CAF50] text-white" 
                          : "bg-neutral-dark text-white"
                        } px-2 py-0.5 rounded-full text-xs`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-opacity-80 h-8 w-8 p-0"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="text-[#F44336] hover:text-opacity-80 h-8 w-8 p-0"
                          onClick={() => handleDeleteItem(item)}
                          disabled={isDeleting}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-dark">
                Showing {((currentPage - 1) * itemsPerPage) + 1}-
                {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
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
      
      {/* Add/Edit Item Modal */}
      <AddMenuItemModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editItem={itemToEdit}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-[#F44336] hover:bg-[#F44336]/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
