import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Unlink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuickBooksConnection {
  id: string;
  company_id: string;
  company_name: string;
  environment: string;
  connected_at: string;
  last_sync_at?: string;
}

interface QuickBooksOAuthProps {
  onConnectionChange: (
    connected: boolean,
    connection?: QuickBooksConnection,
  ) => void;
}

export function QuickBooksOAuth({ onConnectionChange }: QuickBooksOAuthProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connection, setConnection] = useState<QuickBooksConnection | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkExistingConnection().then();
  }, []);

  const checkExistingConnection = async () => {
    setIsLoading(true);
    try {
      // Use the updated RPC function that filters by user
      const { data, error } = await supabase.rpc(
        "get_quickbooks_connection_public",
      );

      if (error) {
        console.error("Error checking connection:", error);
        setConnection(null);
        onConnectionChange(false);
        return;
      }

      // Handle the response - the RPC function now returns a table
      if (data && data.length > 0) {
        const conn = data[0];
        const connectionData = {
          id: conn.id,
          company_id: conn.company_id,
          company_name: conn.company_name,
          environment: conn.environment,
          connected_at: conn.connected_at,
          last_sync_at: conn.last_sync_at,
        };

        setConnection(connectionData);
        onConnectionChange(true, connectionData);
        console.log("Found QuickBooks connection for user:", conn.company_name);
      } else {
        // No connection found for this user
        setConnection(null);
        onConnectionChange(false);
      }
    } catch (error) {
      console.error("Error checking connection:", error);
      setConnection(null);
      onConnectionChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Get current session to pass JWT for user authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No valid session found. Please log in.");
      }

      const { data, error } = await supabase.functions.invoke(
        "quickbooks-oauth-url",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (error) throw error;

      if (data?.authUrl) {
        // Store a reference that we're expecting an OAuth callback and CSRF state
        localStorage.setItem("quickbooks_oauth_pending", "true");
        if (data.state) {
          localStorage.setItem("quickbooks_oauth_state", data.state);
        }
        window.location.href = data.authUrl;
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (error) {
      console.error("Error starting OAuth:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start QuickBooks connection. Please try again.";
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;

    try {
      const { error } = await supabase.rpc("disconnect_quickbooks_connection", {
        _id: connection.id,
      });

      if (error) throw error;

      setConnection(null);
      onConnectionChange(false);

      toast({
        title: "Disconnected",
        description: "QuickBooks connection has been removed.",
      });
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-financial-accent" />
          QuickBooks Online Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {connection ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Connected to QuickBooks</span>
              <Badge variant="secondary">{connection.environment}</Badge>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                Company: {connection.company_name || connection.company_id}
              </div>
              <div>
                Connected:{" "}
                {new Date(connection.connected_at).toLocaleDateString()}
              </div>
              {connection.last_sync_at && (
                <div>
                  Last Sync:{" "}
                  {new Date(connection.last_sync_at).toLocaleDateString()}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="w-full"
            >
              <Unlink className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <span>Not connected to QuickBooks</span>
            </div>

            <div className="text-sm text-muted-foreground">
              Connect your QuickBooks Online account to automatically sync your
              financial data.
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Connect to QuickBooks
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
