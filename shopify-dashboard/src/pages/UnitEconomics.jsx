import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SKUCostManagement } from "@/components/unit-economics/SKUCostManagement";
import { CostAnalysis } from "@/components/unit-economics/CostAnalysis";
import { POReference } from "@/components/unit-economics/POReference";
import { SKUDataMigration } from "@/components/unit-economics/SKUDataMigration";

export const UnitEconomics = () => {
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Unit Economics</h1>
          <Badge variant="secondary">Real-time Cost Management</Badge>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Cost Analysis</TabsTrigger>
            <TabsTrigger value="cost-management">
              SKU Cost Management
            </TabsTrigger>
            <TabsTrigger value="po-reference">PO Reference</TabsTrigger>
            <TabsTrigger value="setup">Data Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            <CostAnalysis />
          </TabsContent>

          <TabsContent value="cost-management" className="space-y-6">
            <SKUCostManagement />
          </TabsContent>

          <TabsContent value="po-reference" className="space-y-6">
            <POReference />
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <SKUDataMigration />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default UnitEconomics;
