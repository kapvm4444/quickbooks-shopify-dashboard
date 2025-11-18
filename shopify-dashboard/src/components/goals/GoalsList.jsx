import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

const staticGoals = [
  {
    id: "1",
    title: "Increase Q4 Revenue by 20%",
    target_value: 1500000,
    current_value: 1250000,
    deadline: "2025-12-31",
    status: "on_track",
    description: "Drive sales through new marketing campaigns and promotions.",
  },
  {
    id: "2",
    title: "Reduce Customer Churn to 5%",
    target_value: 5,
    current_value: 7,
    deadline: "2025-12-31",
    status: "at_risk",
    description: "Improve customer support and onboarding processes.",
  },
  {
    id: "3",
    title: "Launch New Product Line",
    target_value: 1,
    current_value: 1,
    deadline: "2025-11-30",
    status: "achieved",
    description: "Successfully launch the new 'Eco-Friendly' product line.",
  },
];

const statusConfig = {
  on_track: { label: "On Track", color: "bg-blue-500" },
  at_risk: { label: "At Risk", color: "bg-yellow-500" },
  off_track: { label: "Off Track", color: "bg-red-500" },
  achieved: { label: "Achieved", color: "bg-green-500" },
};

export const GoalsList = () => {
  const goals = staticGoals;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal) => {
        const progress =
          goal.target_value > 0
            ? (goal.current_value / goal.target_value) * 100
            : 0;
        const config = statusConfig[goal.status] || {
          label: "Unknown",
          color: "bg-gray-400",
        };

        return (
          <Card key={goal.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {goal.title}
                </CardTitle>
                <Badge
                  style={{ backgroundColor: config.color }}
                  className="text-white"
                >
                  {config.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground pt-2">
                {goal.description}
              </p>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-bold">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} />
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-semibold">
                      {goal.id === "2"
                        ? `${goal.current_value}%`
                        : `$${goal.current_value.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Target</p>
                    <p className="font-semibold">
                      {goal.id === "2"
                        ? `${goal.target_value}%`
                        : `$${goal.target_value.toLocaleString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Target className="w-4 h-4 mr-2" />
                  <span>Deadline: {goal.deadline}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
