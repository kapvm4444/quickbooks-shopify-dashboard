import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function QuickBooksCallback() {
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Processing QuickBooks connection...");

  useEffect(() => {
    // Simulate the callback process
    setTimeout(() => {
      setMessage("Connection successful! Redirecting...");
      setStatus("success");
      setTimeout(() => {
        // In a real app, you would navigate to the dashboard
        // For this static version, we'll just stay on this page
      }, 2000);
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            {status === "processing" && (
              <Loader2 className="w-6 h-6 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="w-6 h-6 text-green-500" />
            )}
            {status === "error" && (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )}
            Connecting to QuickBooks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
