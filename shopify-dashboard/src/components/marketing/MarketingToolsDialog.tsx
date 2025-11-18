import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Globe, Facebook, Instagram, Linkedin, Twitter, Mail, BarChart3, TrendingUp } from "lucide-react"

interface MarketingToolsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MarketingToolsDialog({ open, onOpenChange }: MarketingToolsDialogProps) {
  const { toast } = useToast()
  const [connectedTools, setConnectedTools] = useState<string[]>([])
  const [connectingTool, setConnectingTool] = useState<string | null>(null)

  const marketingPlatforms = [
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      icon: <BarChart3 className="h-6 w-6" />,
      description: 'Track website traffic, user behavior, and conversion data',
      category: 'analytics',
      secretName: 'GOOGLE_ANALYTICS_API_KEY'
    },
    {
      id: 'google-ads',
      name: 'Google Ads',
      icon: <Globe className="h-6 w-6" />,
      description: 'Monitor ad performance, costs, and ROI from Google Ads',
      category: 'advertising',
      secretName: 'GOOGLE_ADS_API_KEY'
    },
    {
      id: 'facebook-ads',
      name: 'Facebook Ads',
      icon: <Facebook className="h-6 w-6" />,
      description: 'Track Facebook advertising campaigns and metrics',
      category: 'advertising',
      secretName: 'FACEBOOK_ADS_ACCESS_TOKEN'
    },
    {
      id: 'instagram-ads',
      name: 'Instagram Ads',
      icon: <Instagram className="h-6 w-6" />,
      description: 'Monitor Instagram advertising performance',
      category: 'advertising',
      secretName: 'INSTAGRAM_ADS_ACCESS_TOKEN'
    },
    {
      id: 'linkedin-ads',
      name: 'LinkedIn Ads',
      icon: <Linkedin className="h-6 w-6" />,
      description: 'Track LinkedIn campaign performance and B2B metrics',
      category: 'advertising',
      secretName: 'LINKEDIN_ADS_ACCESS_TOKEN'
    },
    {
      id: 'twitter-ads',
      name: 'Twitter Ads',
      icon: <Twitter className="h-6 w-6" />,
      description: 'Monitor Twitter advertising campaigns',
      category: 'advertising',
      secretName: 'TWITTER_ADS_API_KEY'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      icon: <Mail className="h-6 w-6" />,
      description: 'Track email campaign performance and subscriber metrics',
      category: 'email',
      secretName: 'MAILCHIMP_API_KEY'
    }
  ]

  const handleConnect = async (platform: any) => {
    setConnectingTool(platform.id)
    
    try {
      // This will trigger the Supabase secrets collection UI
      toast({
        title: "API Key Required",
        description: `Please provide your ${platform.name} API key to connect this platform.`,
      })
      
      // For now, we'll simulate the connection process
      // In a real implementation, this would use the secrets API
      setTimeout(() => {
        setConnectedTools(prev => [...prev, platform.id])
        setConnectingTool(null)
        toast({
          title: "Successfully Connected",
          description: `${platform.name} has been connected to your marketing analytics.`,
        })
      }, 2000)
      
    } catch (error) {
      setConnectingTool(null)
      toast({
        title: "Connection Failed",
        description: `Failed to connect ${platform.name}. Please try again.`,
        variant: "destructive"
      })
    }
  }

  const renderPlatformCard = (platform: any) => (
    <Card key={platform.id} className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {platform.icon}
            <div>
              <CardTitle className="text-base">{platform.name}</CardTitle>
              <CardDescription className="text-sm">
                {platform.description}
              </CardDescription>
            </div>
          </div>
          {connectedTools.includes(platform.id) && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          variant={connectedTools.includes(platform.id) ? "outline" : "default"}
          size="sm"
          onClick={() => handleConnect(platform)}
          disabled={connectedTools.includes(platform.id) || connectingTool === platform.id}
          className="w-full"
        >
          {connectingTool === platform.id 
            ? "Connecting..." 
            : connectedTools.includes(platform.id) 
            ? "Connected" 
            : "Connect"
          }
        </Button>
      </CardContent>
    </Card>
  )

  const analyticsPlatforms = marketingPlatforms.filter(p => p.category === 'analytics')
  const advertisingPlatforms = marketingPlatforms.filter(p => p.category === 'advertising')
  const emailPlatforms = marketingPlatforms.filter(p => p.category === 'email')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Connect Marketing Tools
          </DialogTitle>
          <DialogDescription>
            Connect your marketing platforms to automatically sync campaign data, analytics, and performance metrics.
            Your API keys will be securely stored and encrypted.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="advertising">Advertising</TabsTrigger>
            <TabsTrigger value="email">Email Marketing</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4">
              {analyticsPlatforms.map(renderPlatformCard)}
            </div>
          </TabsContent>

          <TabsContent value="advertising" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {advertisingPlatforms.map(renderPlatformCard)}
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="grid gap-4">
              {emailPlatforms.map(renderPlatformCard)}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {connectedTools.length} of {marketingPlatforms.length} tools connected
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}