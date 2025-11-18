import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PricingScenariosListSkeleton } from "./PricingSkeletons";
import { 
  Plus, 
  Copy, 
  Trash2, 
  Edit, 
  Bot,
  Calendar,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { usePricingData } from "@/hooks/usePricingData";
import { toast } from "sonner";

interface PricingScenariosProps {
  mode: 'ai' | 'custom';
}

export const PricingScenarios = React.memo(({ mode }: PricingScenariosProps) => {
  const { 
    scenarios, 
    createScenario, 
    cloneScenario, 
    deleteScenario,
    scenariosLoading 
  } = usePricingData();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newScenario, setNewScenario] = useState({
    name: '',
    description: ''
  });

  const handleCreateScenario = () => {
    if (!newScenario.name.trim()) {
      toast.error('Please enter a scenario name');
      return;
    }

    createScenario.mutate(newScenario, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        setNewScenario({ name: '', description: '' });
      }
    });
  };

  const handleCloneScenario = (scenarioId: string) => {
    cloneScenario.mutate(scenarioId);
  };

  const handleDeleteScenario = (scenarioId: string) => {
    if (confirm('Are you sure you want to delete this scenario?')) {
      deleteScenario.mutate(scenarioId);
    }
  };

  const filteredScenarios = scenarios.filter(scenario => 
    mode === 'ai' ? scenario.is_ai_generated : !scenario.is_ai_generated
  );

  if (scenariosLoading) {
    return <PricingScenariosListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {mode === 'ai' ? 'AI-Generated Scenarios' : 'Custom Scenarios'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mode === 'ai' 
              ? 'Scenarios created by AI optimization recommendations'
              : 'User-created pricing scenarios for comparison'
            }
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              New Scenario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Pricing Scenario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Scenario Name</Label>
                <Input
                  id="name"
                  value={newScenario.name}
                  onChange={(e) => setNewScenario(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Premium Pricing Strategy"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newScenario.description}
                  onChange={(e) => setNewScenario(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your pricing strategy..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateScenario}
                  disabled={createScenario.isPending}
                >
                  {createScenario.isPending ? 'Creating...' : 'Create Scenario'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scenarios Grid */}
      {filteredScenarios.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              {mode === 'ai' ? (
                <Bot className="h-12 w-12 text-muted-foreground" />
              ) : (
                <TrendingUp className="h-12 w-12 text-muted-foreground" />
              )}
              <div>
                <h3 className="text-lg font-medium">No scenarios yet</h3>
                <p className="text-muted-foreground">
                  {mode === 'ai' 
                    ? 'Generate AI recommendations to create optimized pricing scenarios'
                    : 'Create your first custom pricing scenario to start comparing strategies'
                  }
                </p>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Create First Scenario
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScenarios.map((scenario) => (
            <Card key={scenario.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {scenario.is_ai_generated && (
                        <Bot className="h-4 w-4 text-primary" />
                      )}
                      {scenario.name}
                    </CardTitle>
                    {scenario.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {scenario.description}
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={scenario.is_ai_generated ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {scenario.is_ai_generated ? 'AI' : 'Custom'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Created {new Date(scenario.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Multiple SKUs
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCloneScenario(scenario.id)}
                      disabled={cloneScenario.isPending}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteScenario(scenario.id)}
                      disabled={deleteScenario.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});