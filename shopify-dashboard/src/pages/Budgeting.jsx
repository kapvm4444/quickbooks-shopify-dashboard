import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Rocket } from "lucide-react";
import { CreateProjectDialog } from "@/components/budgeting/CreateProjectDialog";
import { BudgetProjectCard } from "@/components/budgeting/BudgetProjectCard";
import { EditProjectDialog } from "@/components/budgeting/EditProjectDialog";
import { ProjectDetailView } from "@/components/budgeting/ProjectDetailView";
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

const staticProjects = [
  {
    id: "proj1",
    name: "Website Redesign",
    total_budget: 50000,
    status: "active",
    start_date: "2025-09-01",
    end_date: "2025-12-31",
    description: "Complete overhaul of the company website.",
  },
  {
    id: "proj2",
    name: "Q4 Marketing Campaign",
    total_budget: 75000,
    status: "active",
    start_date: "2025-10-01",
    end_date: "2025-12-31",
    description: "Digital marketing campaign for the holiday season.",
  },
  {
    id: "proj3",
    name: "New Office Setup",
    total_budget: 120000,
    status: "completed",
    start_date: "2025-06-01",
    end_date: "2025-08-31",
    description: "Setting up the new branch office.",
  },
];

const staticLineItems = [
  // Project 1
  {
    id: "li1",
    project_id: "proj1",
    category: "Design",
    budget_amount: 15000,
    actual_amount: 16500,
    variance: -1500,
  },
  {
    id: "li2",
    project_id: "proj1",
    category: "Development",
    budget_amount: 25000,
    actual_amount: 24000,
    variance: 1000,
  },
  {
    id: "li3",
    project_id: "proj1",
    category: "Content",
    budget_amount: 10000,
    actual_amount: 9500,
    variance: 500,
  },
  // Project 2
  {
    id: "li4",
    project_id: "proj2",
    category: "Ad Spend",
    budget_amount: 50000,
    actual_amount: 55000,
    variance: -5000,
  },
  {
    id: "li5",
    project_id: "proj2",
    category: "Influencers",
    budget_amount: 15000,
    actual_amount: 14000,
    variance: 1000,
  },
  {
    id: "li6",
    project_id: "proj2",
    category: "Creative",
    budget_amount: 10000,
    actual_amount: 10000,
    variance: 0,
  },
  // Project 3
  {
    id: "li7",
    project_id: "proj3",
    category: "Rent",
    budget_amount: 60000,
    actual_amount: 60000,
    variance: 0,
  },
  {
    id: "li8",
    project_id: "proj3",
    category: "Furniture",
    budget_amount: 40000,
    actual_amount: 38000,
    variance: 2000,
  },
  {
    id: "li9",
    project_id: "proj3",
    category: "IT Setup",
    budget_amount: 20000,
    actual_amount: 22000,
    variance: -2000,
  },
];

const Budgeting = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentView, setCurrentView] = useState("list");

  const [projects, setProjects] = useState(staticProjects);
  const [lineItems, setLineItems] = useState(staticLineItems);
  const loading = false;

  const handleDeleteProject = () => {
    if (selectedProject) {
      setProjects(projects.filter((p) => p.id !== selectedProject.id));
      setLineItems(
        lineItems.filter((li) => li.project_id !== selectedProject.id),
      );
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    }
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setCurrentView("detail");
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedProject(null);
  };

  const totalBudget = projects.reduce(
    (sum, project) => sum + project.total_budget,
    0,
  );

  const totalSpent = lineItems.reduce(
    (sum, item) => sum + item.actual_amount,
    0,
  );

  const activeProjects = projects.filter((p) => p.status === "active").length;

  // Show project detail view if selected
  if (currentView === "detail" && selectedProject) {
    return (
      <>
        <ProjectDetailView
          project={selectedProject}
          onBack={handleBackToList}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Project Budgeting
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage budgets for all your projects and initiatives
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Budget
          </Button>
        </div>

        {/* Summary Stats */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Projects
                  </p>
                  <p className="text-2xl font-bold">{activeProjects}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">
                    ${totalBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">
                    ${totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Budget Projects Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first budget project to start tracking expenses and
              managing project budgets.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Budget
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <BudgetProjectCard
                key={project.id}
                project={project}
                lineItems={lineItems.filter(
                  (li) => li.project_id === project.id,
                )}
                onClick={() => handleViewProject(project)}
                onEdit={() => handleEditProject(project)}
                onDelete={() => {
                  setSelectedProject(project);
                  setDeleteDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Create Project Dialog */}
        <CreateProjectDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        {/* Edit Project Dialog */}
        <EditProjectDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          project={selectedProject}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this budget project? This action
                cannot be undone and will also delete all associated line items.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedProject(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProject}
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

export default Budgeting;
