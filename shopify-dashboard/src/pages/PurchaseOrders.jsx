import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/formatters/numberFormatters";
import {
  ShoppingCart,
  Plus,
  Search,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Link,
} from "lucide-react";
import { PurchaseOrderDetailsDialog } from "@/components/purchase-orders/PurchaseOrderDetailsDialog";
import { SKUPOLinker } from "@/components/purchase-orders/SKUPOLinker";
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

const staticPurchaseOrders = [
  {
    id: "po1",
    po_number: "PO-001",
    vendor_name: "Supplier A",
    order_date: "2025-10-20",
    delivery_date: "2025-11-15",
    total_amount: 5000,
    paid_to_date: 2500,
    items_count: 5,
    status: "In Transit",
  },
  {
    id: "po2",
    po_number: "PO-002",
    vendor_name: "Supplier B",
    order_date: "2025-10-25",
    delivery_date: "2025-11-20",
    total_amount: 12000,
    paid_to_date: 12000,
    items_count: 10,
    status: "Delivered",
  },
  {
    id: "po3",
    po_number: "PO-003",
    vendor_name: "Supplier C",
    order_date: "2025-11-01",
    delivery_date: "2025-12-01",
    total_amount: 7500,
    paid_to_date: 0,
    items_count: 3,
    status: "Processing",
  },
];

const staticVendors = [
  { id: "v1", name: "Supplier A" },
  { id: "v2", name: "Supplier B" },
  { id: "v3", name: "Supplier C" },
];

const getStatusBadge = (status) => {
  const statusConfig = {
    Delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    "In Transit": { color: "bg-blue-100 text-blue-800", icon: Truck },
    Processing: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    "In Production": { color: "bg-orange-100 text-orange-800", icon: Clock },
    Tooling: { color: "bg-purple-100 text-purple-800", icon: Clock },
    Pending: { color: "bg-gray-100 text-gray-800", icon: Clock },
    Overdue: { color: "bg-red-100 text-red-800", icon: AlertCircle },
  };

  const config = statusConfig[status];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <Badge className={config.color}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  );
};

const calculatePaymentPercentage = (paidAmount, totalAmount) => {
  if (!totalAmount || totalAmount === 0) return 0;
  return Math.min((paidAmount / totalAmount) * 100, 100);
};

const getPaymentColor = (percentage) => {
  if (percentage >= 100) return "bg-green-500";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

const PurchaseOrders = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState(staticPurchaseOrders);
  const [vendors] = useState(staticVendors);
  const [formData, setFormData] = useState({
    po_number: "",
    vendor_id: "",
    vendor_name: "",
    order_date: undefined,
    delivery_date: undefined,
    total_amount: "",
    payment_terms: "",
    paid_to_date: "",
    items_count: "",
    status: "Pending",
    notes: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPO, setSelectedPO] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLinkerOpen, setIsLinkerOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const loading = false;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (id === "vendor_id") {
      const vendor = vendors.find((v) => v.id === value);
      if (vendor) {
        setFormData((prev) => ({ ...prev, vendor_name: vendor.name }));
      }
    }
  };

  const handleDateChange = (id, date) => {
    setFormData((prev) => ({ ...prev, [id]: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      const newPO = {
        id: `po${purchaseOrders.length + 1}`,
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        paid_to_date: parseFloat(formData.paid_to_date),
        items_count: parseInt(formData.items_count),
        order_date: format(formData.order_date, "yyyy-MM-dd"),
        delivery_date: formData.delivery_date
          ? format(formData.delivery_date, "yyyy-MM-dd")
          : undefined,
      };
      setPurchaseOrders([...purchaseOrders, newPO]);
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }, 1000);
  };

  const handleDelete = () => {
    if (selectedPO) {
      setPurchaseOrders(purchaseOrders.filter((po) => po.id !== selectedPO.id));
      setIsDeleteConfirmOpen(false);
      setSelectedPO(null);
    }
  };

  const filteredPOs = purchaseOrders.filter(
    (po) =>
      po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "All" || po.status === statusFilter),
  );

  const summaryStats = {
    total: purchaseOrders.length,
    inTransit: purchaseOrders.filter((po) => po.status === "In Transit").length,
    processing: purchaseOrders.filter((po) => po.status === "Processing")
      .length,
    delivered: purchaseOrders.filter((po) => po.status === "Delivered").length,
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Purchase Orders</h1>
            <p className="text-black mt-1">
              Manage and track all your purchase orders
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create PO
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total POs</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.inTransit}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryStats.processing}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.delivered}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Purchase Orders</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by PO number"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="In Transit">In Transit</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">PO Number</th>
                    <th className="text-left p-2">Vendor</th>
                    <th className="text-left p-2">Order Date</th>
                    <th className="text-left p-2">Delivery Date</th>
                    <th className="text-right p-2">Total Amount</th>
                    <th className="text-left p-2">Payment Status</th>
                    <th className="text-center p-2">Status</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center p-4">
                        Loading...
                      </td>
                    </tr>
                  ) : (
                    filteredPOs.map((po) => {
                      const paymentPercentage = calculatePaymentPercentage(
                        po.paid_to_date,
                        po.total_amount,
                      );
                      return (
                        <tr key={po.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{po.po_number}</td>
                          <td className="p-2">{po.vendor_name}</td>
                          <td className="p-2">{po.order_date}</td>
                          <td className="p-2">{po.delivery_date || "-"}</td>
                          <td className="p-2 text-right">
                            {formatCurrency(po.total_amount)}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={paymentPercentage}
                                className={`h-2 w-24 ${getPaymentColor(
                                  paymentPercentage,
                                )}`}
                              />
                              <span className="text-xs">
                                {paymentPercentage.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            {getStatusBadge(po.status)}
                          </td>
                          <td className="p-2 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedPO(po);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedPO(po);
                                setIsLinkerOpen(true);
                              }}
                            >
                              <Link className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedPO(po);
                                setIsDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <PurchaseOrderDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          purchaseOrder={selectedPO}
          onUpdate={() => {
            // No-op since we are not connected to a backend
          }}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="po_number">PO Number</Label>
                  <Input
                    id="po_number"
                    value={formData.po_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor_id">Vendor</Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("vendor_id", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_date">Order Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.order_date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.order_date ? (
                          format(formData.order_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.order_date}
                        onSelect={(date) =>
                          handleDateChange("order_date", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_date">Expected Delivery</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.delivery_date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.delivery_date ? (
                          format(formData.delivery_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.delivery_date}
                        onSelect={(date) =>
                          handleDateChange("delivery_date", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Amount</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    value={formData.total_amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paid_to_date">Paid to Date</Label>
                  <Input
                    id="paid_to_date"
                    type="number"
                    value={formData.paid_to_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="items_count">Number of Items</Label>
                  <Input
                    id="items_count"
                    type="number"
                    value={formData.items_count}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                    defaultValue="Pending"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create PO"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {selectedPO && (
          <SKUPOLinker
            isOpen={isLinkerOpen}
            setIsOpen={setIsLinkerOpen}
            purchaseOrder={selectedPO}
            skuList={[]}
          />
        )}

        <AlertDialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                purchase order.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default PurchaseOrders;
