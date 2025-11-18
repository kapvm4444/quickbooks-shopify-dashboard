import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ARTransaction,
  APTransaction,
  useUpdateARTransaction,
  useUpdateAPTransaction,
} from "@/hooks/useARAPData";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatters/numberFormatters";
import { CalendarIcon, Edit, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface TransactionTableProps {
  data: ARTransaction[] | APTransaction[];
  type: "ar" | "ap";
  isLoading: boolean;
}

interface EditingRow {
  id: string;
  customerName?: string;
  vendorName?: string;
  invoiceNumber: string;
  amount: string;
  transactionDate: string;
  dueDate: string;
  description: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "overdue":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "outstanding":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

export const TransactionTable: React.FC<TransactionTableProps> = ({
  data,
  type,
  isLoading,
}) => {
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const updateARTransaction = useUpdateARTransaction();
  const updateAPTransaction = useUpdateAPTransaction();
  const { toast } = useToast();

  const handleStatusChange = async (id: string, status: string) => {
    try {
      if (type === "ar") {
        await updateARTransaction.mutateAsync({ id, status: status as any });
      } else {
        await updateAPTransaction.mutateAsync({ id, status: status as any });
      }
    } catch (error) {
      console.error("Error updating transaction status:", error);
    }
  };

  const startEditing = (transaction: ARTransaction | APTransaction) => {
    const transactionDate =
      transaction.transaction_date || (transaction as any).issue_date;
    setEditingRow({
      id: transaction.id,
      customerName:
        type === "ar"
          ? (transaction as ARTransaction).customer_name
          : undefined,
      vendorName:
        type === "ap" ? (transaction as APTransaction).vendor_name : undefined,
      invoiceNumber: transaction.invoice_number || "",
      amount: transaction.amount.toString(),
      transactionDate: transactionDate ? transactionDate.split("T")[0] : "",
      dueDate: transaction.due_date ? transaction.due_date.split("T")[0] : "",
      description: transaction.description || "",
    });
  };

  const cancelEditing = () => {
    setEditingRow(null);
  };

  const saveChanges = async () => {
    if (!editingRow) return;

    try {
      const updateData = {
        id: editingRow.id,
        ...(type === "ar" && { customer_name: editingRow.customerName }),
        ...(type === "ap" && { vendor_name: editingRow.vendorName }),
        invoice_number: editingRow.invoiceNumber,
        amount: parseFloat(editingRow.amount),
        transaction_date: editingRow.transactionDate
          ? `${editingRow.transactionDate}T12:00:00.000Z`
          : undefined,
        due_date: editingRow.dueDate
          ? `${editingRow.dueDate}T12:00:00.000Z`
          : null,
        description: editingRow.description,
      };

      if (type === "ar") {
        await updateARTransaction.mutateAsync(updateData);
      } else {
        await updateAPTransaction.mutateAsync(updateData);
      }

      toast({ title: "Transaction updated successfully" });
      setEditingRow(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update transaction",
        description: error.message,
      });
    }
  };

  const updateEditingField = (field: keyof EditingRow, value: string) => {
    if (!editingRow) return;
    setEditingRow({ ...editingRow, [field]: value });
  };

  const renderDatePicker = (
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
  ) => {
    const date = value ? new Date(value + "T12:00:00") : undefined;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(date!, "MMM dd, yyyy") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(
                  2,
                  "0",
                );
                const day = String(selectedDate.getDate()).padStart(2, "0");
                onChange(`${year}-${month}-${day}`);
              }
            }}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No {type === "ar" ? "accounts receivable" : "accounts payable"}{" "}
        transactions found.
        <br />
        Add your first transaction using the form above.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{type === "ar" ? "Customer" : "Vendor"}</TableHead>
            <TableHead>Invoice #</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Transaction Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((transaction) => {
            const isEditing = editingRow?.id === transaction.id;
            const transactionDate =
              transaction.transaction_date || (transaction as any).issue_date;

            return (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {isEditing ? (
                    <Input
                      value={
                        type === "ar"
                          ? editingRow.customerName || ""
                          : editingRow.vendorName || ""
                      }
                      onChange={(e) =>
                        updateEditingField(
                          type === "ar" ? "customerName" : "vendorName",
                          e.target.value,
                        )
                      }
                      className="min-w-[150px]"
                    />
                  ) : type === "ar" ? (
                    (transaction as ARTransaction).customer_name
                  ) : (
                    (transaction as APTransaction).vendor_name
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={editingRow.invoiceNumber}
                      onChange={(e) =>
                        updateEditingField("invoiceNumber", e.target.value)
                      }
                      className="min-w-[120px]"
                    />
                  ) : (
                    transaction.invoice_number || "-"
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editingRow.amount}
                      onChange={(e) =>
                        updateEditingField("amount", e.target.value)
                      }
                      className="min-w-[100px]"
                    />
                  ) : (
                    formatCurrency(transaction.amount)
                  )}
                </TableCell>
                <TableCell>
                  {isEditing
                    ? renderDatePicker(
                        editingRow.transactionDate,
                        (value) => updateEditingField("transactionDate", value),
                        "Select date",
                      )
                    : transactionDate
                      ? format(new Date(transactionDate), "MMM dd, yyyy")
                      : "-"}
                </TableCell>
                <TableCell>
                  {isEditing
                    ? renderDatePicker(
                        editingRow.dueDate,
                        (value) => updateEditingField("dueDate", value),
                        "Select due date",
                      )
                    : transaction.due_date
                      ? format(new Date(transaction.due_date), "MMM dd, yyyy")
                      : "-"}
                </TableCell>
                <TableCell>
                  <Select
                    value={transaction.status}
                    onValueChange={(value) =>
                      handleStatusChange(transaction.id, value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <Badge
                        variant="secondary"
                        className={getStatusColor(transaction.status)}
                      >
                        <SelectValue />
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outstanding">Outstanding</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="max-w-xs">
                  {isEditing ? (
                    <Input
                      value={editingRow.description}
                      onChange={(e) =>
                        updateEditingField("description", e.target.value)
                      }
                      className="min-w-[150px]"
                      placeholder="Description"
                    />
                  ) : (
                    <span className="truncate block">
                      {transaction.description || "-"}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={saveChanges}
                        disabled={
                          updateARTransaction.isPending ||
                          updateAPTransaction.isPending
                        }
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing(transaction)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
