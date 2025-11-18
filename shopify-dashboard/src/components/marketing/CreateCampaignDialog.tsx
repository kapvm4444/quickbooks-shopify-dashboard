import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface CreateCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCampaignDialog({ open, onOpenChange }: CreateCampaignDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    platform: "",
    budget: "",
    objective: "",
    description: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name || !formData.platform || !formData.budget) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    // For now, just show success message
    toast({
      title: "Campaign Created",
      description: `Campaign "${formData.name}" has been created successfully.`,
    })
    
    // Reset form and close dialog
    setFormData({
      name: "",
      platform: "",
      budget: "",
      objective: "",
      description: ""
    })
    onOpenChange(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Marketing Campaign</DialogTitle>
          <DialogDescription>
            Set up a new marketing campaign to track performance and ROI.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Holiday Sale 2024"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select value={formData.platform} onValueChange={(value) => handleInputChange("platform", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select advertising platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google-ads">Google Ads</SelectItem>
                <SelectItem value="facebook-ads">Facebook Ads</SelectItem>
                <SelectItem value="instagram-ads">Instagram Ads</SelectItem>
                <SelectItem value="linkedin-ads">LinkedIn Ads</SelectItem>
                <SelectItem value="twitter-ads">Twitter Ads</SelectItem>
                <SelectItem value="tiktok-ads">TikTok Ads</SelectItem>
                <SelectItem value="email">Email Marketing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget *</Label>
            <Input
              id="budget"
              type="number"
              placeholder="1000"
              value={formData.budget}
              onChange={(e) => handleInputChange("budget", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective">Campaign Objective</Label>
            <Select value={formData.objective} onValueChange={(value) => handleInputChange("objective", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select campaign objective" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                <SelectItem value="lead-generation">Lead Generation</SelectItem>
                <SelectItem value="sales">Sales/Conversions</SelectItem>
                <SelectItem value="traffic">Website Traffic</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="app-installs">App Installs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the campaign goals and strategy..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Campaign</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}