import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { GoalsList } from "@/components/goals/GoalsList";
import { useState } from "react";
import { GoalForm } from "@/components/goals/GoalForm";

const Goals = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Goals & Objectives
            </h1>
            <p className="text-muted-foreground mt-1">
              Track progress towards your strategic business objectives
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-4 py-2">
              <Calendar className="w-4 h-4 mr-2" />
              2025 Goals
            </Badge>
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
          </div>
        </div>

        {/* Goals List */}
        <GoalsList />

        {/* Goal Form Modal */}
        <GoalForm open={showForm} onOpenChange={setShowForm} />
      </div>
    </>
  );
};

export default Goals;
