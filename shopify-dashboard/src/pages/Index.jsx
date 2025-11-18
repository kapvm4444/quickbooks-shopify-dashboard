import { DashboardLayout } from "@/components/DashboardLayout";
import { DataConnectPrompt } from "@/components/business/DataConnectPrompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Activity, ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary bg-clip-text mb-4">
            Welcome to Your Business Analytics Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get comprehensive insights into your business performance by
            connecting your data sources
          </p>
        </div>

        {/* Data Connection Prompt */}
        <DataConnectPrompt />

        {/* Quick Setup Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-financial-primary" />
                Financial Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor revenue, expenses, and profitability in real-time
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/revenue">
                  Set Up Finance Tracking{" "}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-financial-revenue" />
                Goals & KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Set and track your business objectives and key metrics
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/goals">
                  Create Your Goals <Plus className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-financial-accent" />
                Operational Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Track inventory, vendors, and operational metrics
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/inventory">
                  Manage Inventory <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Index;
