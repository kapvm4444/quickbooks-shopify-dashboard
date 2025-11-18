import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Upload, Link, FileSpreadsheet } from 'lucide-react';

interface DataConnectPromptProps {
  title?: string;
  description?: string;
}

export const DataConnectPrompt: React.FC<DataConnectPromptProps> = ({
  title = "Connect Your Data",
  description = "Get started by connecting your business data sources"
}) => {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Database className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
            <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <div className="font-medium">Google Sheets</div>
              <div className="text-xs text-muted-foreground">Import from spreadsheets</div>
            </div>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
            <Link className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <div className="font-medium">QuickBooks</div>
              <div className="text-xs text-muted-foreground">Connect accounting data</div>
            </div>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <div className="font-medium">Upload Files</div>
              <div className="text-xs text-muted-foreground">Import Excel/CSV files</div>
            </div>
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Your dashboard will populate with real-time insights once data is connected
          </p>
        </div>
      </CardContent>
    </Card>
  );
};