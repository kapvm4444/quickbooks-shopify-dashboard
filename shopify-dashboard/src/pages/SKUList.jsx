import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatExactCurrency } from "@/utils/formatters/numberFormatters";

const staticSkuList = [
  {
    id: "sku1",
    sku: "SKU001",
    description: "Wireless Mouse",
    category: "Electronics",
    price: 29.99,
    cost: 15.5,
    quantity: 150,
    status: "Active",
    margin: 48.3,
  },
  {
    id: "sku2",
    sku: "SKU002",
    description: "Mechanical Keyboard",
    category: "Electronics",
    price: 129.99,
    cost: 75.0,
    quantity: 50,
    status: "Active",
    margin: 42.3,
  },
  {
    id: "sku3",
    sku: "SKU003",
    description: "A4 Paper Ream",
    category: "Office Supplies",
    price: 5.99,
    cost: 2.5,
    quantity: 500,
    status: "Active",
    margin: 58.3,
  },
  {
    id: "sku4",
    sku: "SKU004",
    description: "Desk Chair",
    category: "Furniture",
    price: 249.99,
    cost: 150.0,
    quantity: 20,
    status: "Low Stock",
    margin: 40.0,
  },
];

const staticUnitEconomics = {
  avgGrossMargin: 47.2,
  skuEconomics: staticSkuList.map((sku) => ({
    sku_id: sku.id,
    selling_price: sku.price,
    total_landed_cost: sku.cost,
    gross_margin_percent: sku.margin,
  })),
};

const SKUList = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    price: "",
    cost: "",
    quantity: "",
    category: "",
    status: "Active",
  });
  const [addForm, setAddForm] = useState({
    sku: "",
    description: "",
    category: "",
    price: "",
    cost: "",
    quantity: "",
    status: "Active",
  });

  const skuList = useMemo(() => staticSkuList, []);
  const totalSKUs = skuList.length;
  const totalInventoryValue = useMemo(
    () => skuList.reduce((sum, item) => sum + item.cost * item.quantity, 0),
    [skuList],
  );
  const totalUnits = useMemo(
    () => skuList.reduce((sum, item) => sum + item.quantity, 0),
    [skuList],
  );
  const unitEconomics = staticUnitEconomics;
  const isLoading = false;

  const avgMargin = unitEconomics.avgGrossMargin;

  const displaySkuList = useMemo(() => {
    return unitEconomics.skuEconomics.map((sku) => {
      const originalSku = skuList.find((s) => s.id === sku.sku_id);
      return {
        ...sku,
        id: sku.sku_id,
        sku: originalSku?.sku,
        description: originalSku?.description,
        price: sku.selling_price,
        cost: sku.total_landed_cost,
        margin: sku.gross_margin_percent,
        status: originalSku?.status || "Active",
        quantity: originalSku?.quantity || 0,
      };
    });
  }, [unitEconomics.skuEconomics, skuList]);

  const handleEdit = (item) => {
    setSelectedSku(item);
    setEditForm({
      price: item.price?.toString() || "",
      cost: item.cost?.toString() || "",
      quantity: item.quantity?.toString() || "",
      category: item.category || "",
      status: item.status || "Active",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (item) => {
    setSelectedSku(item);
    setDeleteDialogOpen(true);
  };

  const saveEdit = () => {
    if (!selectedSku || isSaving) return;
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      setEditDialogOpen(false);
    }, 1000);
  };

  const confirmDelete = () => {
    if (!selectedSku) return;
    // Simulate delete
    setDeleteDialogOpen(false);
  };

  const handleAdd = () => {
    setIsSaving(true);
    // Simulate add
    setTimeout(() => {
      setIsSaving(false);
      setAddDialogOpen(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">SKU Management</h1>
            <p className="text-black mt-1">
              Track and manage all your Stock Keeping Units
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add SKU
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSKUs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Inventory Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatExactCurrency(totalInventoryValue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUnits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Margin
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgMargin.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* SKU Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All SKUs</CardTitle>
              <div className="flex items-center gap-2">
                <Input placeholder="Search SKU" className="w-64" />
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displaySkuList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <td className="text-right p-2">
                      {formatExactCurrency(item.price)}
                    </td>
                    <td className="text-right p-2">
                      {formatExactCurrency(item.cost)}
                    </td>
                    <td className="text-right p-2">
                      {item.margin.toFixed(1)}%
                    </td>
                    <td className="text-right p-2">{item.quantity}</td>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "Active" ? "default" : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit SKU: {selectedSku?.sku}</DialogTitle>
              <DialogDescription>
                Update the details for this SKU.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({ ...editForm, price: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">
                  Cost
                </Label>
                <Input
                  id="cost"
                  value={editForm.cost}
                  onChange={(e) =>
                    setEditForm({ ...editForm, cost: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  value={editForm.quantity}
                  onChange={(e) =>
                    setEditForm({ ...editForm, quantity: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={saveEdit} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New SKU</DialogTitle>
              <DialogDescription>
                Enter the details for the new SKU.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sku" className="text-right">
                  SKU
                </Label>
                <Input
                  id="sku"
                  value={addForm.sku}
                  onChange={(e) =>
                    setAddForm({ ...addForm, sku: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={addForm.description}
                  onChange={(e) =>
                    setAddForm({ ...addForm, description: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  value={addForm.category}
                  onChange={(e) =>
                    setAddForm({ ...addForm, category: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  value={addForm.price}
                  onChange={(e) =>
                    setAddForm({ ...addForm, price: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">
                  Cost
                </Label>
                <Input
                  id="cost"
                  value={addForm.cost}
                  onChange={(e) =>
                    setAddForm({ ...addForm, cost: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  value={addForm.quantity}
                  onChange={(e) =>
                    setAddForm({ ...addForm, quantity: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={addForm.status}
                  onValueChange={(value) =>
                    setAddForm({ ...addForm, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" /> : "Add SKU"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                SKU: {selectedSku?.sku}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
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

export default SKUList;
