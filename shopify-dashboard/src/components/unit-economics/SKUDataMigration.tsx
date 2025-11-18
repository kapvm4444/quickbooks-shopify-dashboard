import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessData } from '@/hooks/business/useBusinessData';
import { Database, Upload, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const SKUDataMigration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { skuList, isLoading } = useBusinessData();
  const [isMigrating, setIsMigrating] = useState(false);

  // Count SKUs from different sources
  const databaseSKUs = skuList?.filter(sku => sku.id?.startsWith('sku_')) || [];
  const nonDatabaseSKUs = skuList?.filter(sku => !sku.id?.startsWith('sku_')) || [];

  const handleMigrateSKUs = async () => {
    if (!user || !nonDatabaseSKUs.length) return;

    setIsMigrating(true);
    try {
      // Migrate non-database SKUs to the skus table
      const skuInserts = nonDatabaseSKUs.map(sku => ({
        user_id: user.id,
        sku: sku.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: sku.name || 'Imported SKU',
        category: sku.category || 'Uncategorized',
        price: sku.price || 0,
        cost: sku.cost || 0,
        margin: sku.margin || 0,
        quantity: sku.quantity || 0,
        stock: sku.stock || 0,
        status: sku.status || 'active',
        current_po_number: sku.current_po_number || null
      }));

      const { data, error } = await supabase
        .from('skus')
        .insert(skuInserts)
        .select();

      if (error) throw error;

      toast({
        title: "Migration Complete!",
        description: `Successfully migrated ${data.length} SKUs to the database`,
      });

      // Data will be automatically refreshed via real-time subscriptions
    } catch (error) {
      console.error('Error migrating SKUs:', error);
      toast({
        title: "Migration Failed",
        description: "Failed to migrate SKUs to database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading SKU data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          SKU Data Migration & Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Database SKUs */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Database SKUs</p>
                  <p className="text-2xl font-bold">{databaseSKUs.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                SKUs stored in database with PO linking capability
              </p>
            </CardContent>
          </Card>

          {/* External SKUs */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">External SKUs</p>
                  <p className="text-2xl font-bold">{nonDatabaseSKUs.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                From Shopify/Sheets, need migration for PO linking
              </p>
            </CardContent>
          </Card>

          {/* Total SKUs */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total SKUs</p>
                  <p className="text-2xl font-bold">{skuList?.length || 0}</p>
                </div>
                <Info className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                All SKUs from all sources combined
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status and Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Migration Status</h3>
              <p className="text-sm text-muted-foreground">
                {nonDatabaseSKUs.length > 0 
                  ? `${nonDatabaseSKUs.length} SKUs need to be migrated to enable PO linking`
                  : 'All SKUs are in the database and ready for PO linking'
                }
              </p>
            </div>
            
            {nonDatabaseSKUs.length > 0 ? (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                Migration Needed
              </Badge>
            ) : (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            )}
          </div>

          {nonDatabaseSKUs.length > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">What happens during migration:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• SKUs from Shopify and Google Sheets will be copied to the database</li>
                <li>• This enables PO linking functionality in Unit Economics</li>
                <li>• Your original data sources remain unchanged</li>
                <li>• You can then link these SKUs to purchase orders</li>
              </ul>
              
              <div className="mt-4">
                <Button 
                  onClick={handleMigrateSKUs}
                  disabled={isMigrating}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isMigrating ? 'Migrating SKUs...' : `Migrate ${nonDatabaseSKUs.length} SKUs to Database`}
                </Button>
              </div>
            </div>
          )}

          {nonDatabaseSKUs.length === 0 && databaseSKUs.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-800">All Set!</h4>
              </div>
              <p className="text-sm text-green-700">
                All your SKUs are in the database and ready for PO linking. 
                Go to the Purchase Orders page to link SKUs to purchase orders, 
                then return to the PO Reference tab to see the connections.
              </p>
            </div>
          )}

          {skuList?.length === 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-800">No SKUs Found</h4>
              </div>
              <p className="text-sm text-blue-700">
                No SKUs were found in your system. You can:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Upload SKU data via Google Sheets integration</li>
                <li>• Connect Shopify to import product data</li>
                <li>• Manually add SKUs in the SKU management section</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};