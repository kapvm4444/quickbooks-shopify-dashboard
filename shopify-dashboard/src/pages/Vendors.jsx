import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  Users,
  Plus,
  Search,
  Filter,
  Star,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Package,
  TrendingUp,
} from "lucide-react";
import { AddVendorDialog } from "@/components/vendors/AddVendorDialog";
import { VendorDetailsDialog } from "@/components/vendors/VendorDetailsDialog";

const staticVendors = [
  {
    id: "1",
    name: "Tech Solutions Inc.",
    category: "Electronics",
    rating: 4.8,
    on_time_delivery: 98,
    quality_score: 95,
    status: "active",
  },
  {
    id: "2",
    name: "Office Supplies Co.",
    category: "Office",
    rating: 4.5,
    on_time_delivery: 92,
    quality_score: 93,
    status: "active",
  },
  {
    id: "3",
    name: "Creative Designs",
    category: "Marketing",
    rating: 4.9,
    on_time_delivery: 100,
    quality_score: 98,
    status: "inactive",
  },
];

const Vendors = () => {
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce the search term to improve performance
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const vendors = staticVendors;
  const isLoading = false;
  const error = null;

  // Filter vendors based on debounced search term
  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (vendor.category &&
        vendor.category
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())),
  );

  // Calculate summary metrics
  const totalVendors = vendors.length;
  const avgRating =
    vendors.length > 0
      ? vendors.reduce((sum, vendor) => sum + (vendor.rating || 0), 0) /
        vendors.filter((v) => v.rating).length
      : 0;
  const avgOnTime =
    vendors.length > 0
      ? vendors.reduce(
          (sum, vendor) => sum + (vendor.on_time_delivery || 0),
          0,
        ) / vendors.filter((v) => v.on_time_delivery).length
      : 0;

  // Group vendors by category for spending calculation
  const spendingByCategory = vendors.reduce((acc, vendor) => {
    const category = vendor.category || "Other";
    if (!acc[category]) {
      acc[category] = { amount: 0, count: 0 };
    }
    acc[category].count += 1;
    return acc;
  }, {});

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading vendors...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">Error loading vendors</div>
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
            <h1 className="text-3xl font-bold text-black">
              Vendors & Partners
            </h1>
            <p className="text-black mt-1">
              Manage supplier relationships and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="text-black border-black hover:bg-muted/50"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
            <Button
              className="bg-financial-primary text-white hover:bg-financial-primary/90"
              onClick={() => setAddVendorOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Vendor
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-card-custom">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">
                    Total Vendors
                  </p>
                  <p className="text-2xl font-bold text-black">
                    {totalVendors}
                  </p>
                </div>
                <Users className="h-8 w-8 text-financial-primary" />
              </div>
              <p className="text-xs text-black mt-2">Total active vendors</p>
            </CardContent>
          </Card>

          <Card className="shadow-card-custom">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">Avg. Rating</p>
                  <p className="text-2xl font-bold text-black">
                    {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
                  </p>
                </div>
                <Star className="h-8 w-8 text-financial-revenue" />
              </div>
              <p className="text-xs text-black mt-2">Based on ratings</p>
            </CardContent>
          </Card>

          <Card className="shadow-card-custom">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">
                    Active Vendors
                  </p>
                  <p className="text-2xl font-bold text-black">
                    {vendors.filter((v) => v.status === "active").length}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-financial-expense" />
              </div>
              <p className="text-xs text-black mt-2">Currently active</p>
            </CardContent>
          </Card>

          <Card className="shadow-card-custom">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">
                    On-Time Delivery
                  </p>
                  <p className="text-2xl font-bold text-black">
                    {avgOnTime > 0 ? avgOnTime.toFixed(0) + "%" : "N/A"}
                  </p>
                </div>
                <Package className="h-8 w-8 text-financial-accent" />
              </div>
              <p className="text-xs text-black mt-2">Delivery performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-card-custom">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black">Vendor Directory</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-black" />
                  <Input
                    placeholder="Search vendors..."
                    className="pl-8 w-64 text-black border-black"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredVendors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No vendors found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {vendors.length === 0
                    ? "Get started by adding your first vendor."
                    : "Try adjusting your search terms."}
                </p>
                {vendors.length === 0 && (
                  <div className="mt-6">
                    <Button onClick={() => setAddVendorOpen(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Vendor
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-black">
                          {vendor.name}
                        </h3>
                        <Badge variant="outline" className="text-black mt-1">
                          {vendor.category || "Uncategorized"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-black">
                          {vendor.rating ? vendor.rating.toFixed(1) : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-black">
                      <Badge variant="outline" className="text-black">
                        Manage multiple contacts with roles in the details view
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-3">
                      {vendor.on_time_delivery && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-black">On-Time Delivery</span>
                            <span className="text-black">
                              {vendor.on_time_delivery}%
                            </span>
                          </div>
                          <Progress
                            value={vendor.on_time_delivery}
                            className="h-2"
                          />
                        </div>
                      )}

                      {vendor.quality_score && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-black">Quality Score</span>
                            <span className="text-black">
                              {vendor.quality_score}%
                            </span>
                          </div>
                          <Progress
                            value={vendor.quality_score}
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className={
                          vendor.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {vendor.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-black border-black hover:bg-muted"
                        onClick={() => handleViewDetails(vendor)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <TrendingUp className="h-5 w-5 text-financial-primary" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendors
                .filter((v) => v.rating)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 3)
                .map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-sm text-black">
                        {vendor.name}
                      </p>
                      <p className="text-xs text-black">
                        {vendor.category || "Uncategorized"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-black">
                        {vendor.rating?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
              {vendors.filter((v) => v.rating).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No rated vendors yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <DollarSign className="h-5 w-5 text-financial-expense" />
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(spendingByCategory).length > 0 ? (
                Object.entries(spendingByCategory).map(([category, data]) => {
                  const percentage =
                    totalVendors > 0 ? (data.count / totalVendors) * 100 : 0;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-black">{category}</span>
                        <span className="text-sm font-medium text-black">
                          {data.count} vendors
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No vendor categories yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Package className="h-5 w-5 text-financial-accent" />
                Vendor Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendors.length > 0 ? (
                <>
                  {/* Best performer */}
                  {(() => {
                    const topVendor = vendors
                      .filter((v) => v.rating)
                      .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];

                    return topVendor ? (
                      <div className="p-3 rounded-lg bg-financial-revenue/10">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-financial-revenue" />
                          <span className="text-sm font-medium text-black">
                            Best Partnership
                          </span>
                        </div>
                        <p className="text-xs text-black">
                          {topVendor.name}: {topVendor.rating?.toFixed(1)}★
                          rating
                          {topVendor.on_time_delivery &&
                            ` with ${topVendor.on_time_delivery}% on-time delivery`}
                        </p>
                      </div>
                    ) : null;
                  })()}

                  <div className="p-3 rounded-lg bg-financial-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-financial-primary" />
                      <span className="text-sm font-medium text-black">
                        Vendor Network
                      </span>
                    </div>
                    <p className="text-xs text-black">
                      Managing {totalVendors} vendor relationships across{" "}
                      {Object.keys(spendingByCategory).length} categories
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-financial-accent/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-financial-accent" />
                      <span className="text-sm font-medium text-black">
                        Performance Overview
                      </span>
                    </div>
                    <p className="text-xs text-black">
                      {vendors.filter((v) => v.status === "active").length}{" "}
                      active vendors with average{" "}
                      {avgRating > 0 ? avgRating.toFixed(1) : "unrated"}{" "}
                      performance
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-black">
                      Getting Started
                    </span>
                  </div>
                  <p className="text-xs text-black">
                    Add your first vendor to start tracking performance and
                    building partnerships
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AddVendorDialog open={addVendorOpen} onOpenChange={setAddVendorOpen} />

      <VendorDetailsDialog
        vendor={selectedVendor}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
};

export default Vendors;
