import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Search, Link, Unlink } from 'lucide-react';

interface SKU {
  id: string;
  sku: string;
  name: string;
  category?: string;
  price?: number;
  quantity?: number;
  current_po_number?: string;
}

interface SKUPOLinkerProps {
  isOpen: boolean;
  onClose: () => void;
  poNumber: string;
  availableSKUs: SKU[];
  onSKULinked?: () => void;
}

export const SKUPOLinker: React.FC<SKUPOLinkerProps> = ({ 
  isOpen, 
  onClose, 
  poNumber, 
  availableSKUs = [], 
  onSKULinked 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSKUs, setSelectedSKUs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter SKUs based on search term
  const filteredSKUs = availableSKUs.filter(sku => 
    sku.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sku.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sku.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleSKUToggle = (skuId: string) => {
    setSelectedSKUs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skuId)) {
        newSet.delete(skuId);
      } else {
        newSet.add(skuId);
      }
      return newSet;
    });
  };

  const handleLinkSKUs = async () => {
    if (!user || selectedSKUs.size === 0) return;

    setIsSubmitting(true);
    try {
      // Update each selected SKU with the PO number
      const updates = Array.from(selectedSKUs).map(skuId => 
        supabase
          .from('skus')
          .update({ current_po_number: poNumber })
          .eq('id', skuId)
          .eq('user_id', user.id)
      );

      await Promise.all(updates);

      toast({
        title: "Success!",
        description: `${selectedSKUs.size} SKU(s) linked to PO ${poNumber}`,
      });

      onSKULinked?.();
      onClose();
      setSelectedSKUs(new Set());
    } catch (error) {
      console.error('Error linking SKUs to PO:', error);
      toast({
        title: "Error",
        description: "Failed to link SKUs to purchase order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlinkSKU = async (skuId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('skus')
        .update({ current_po_number: null })
        .eq('id', skuId)
        .eq('user_id', user.id);

      toast({
        title: "Success!",
        description: "SKU unlinked from purchase order",
      });

      onSKULinked?.();
    } catch (error) {
      console.error('Error unlinking SKU:', error);
      toast({
        title: "Error",
        description: "Failed to unlink SKU",
        variant: "destructive",
      });
    }
  };

  const unlinkedSKUs = filteredSKUs.filter(sku => !sku.current_po_number);
  const linkedSKUs = filteredSKUs.filter(sku => sku.current_po_number === poNumber);
  const otherLinkedSKUs = filteredSKUs.filter(sku => sku.current_po_number && sku.current_po_number !== poNumber);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Link SKUs to PO #{poNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search SKUs by SKU code, name, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Currently Linked SKUs */}
          {linkedSKUs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Currently Linked to PO #{poNumber} ({linkedSKUs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linkedSKUs.map((sku) => (
                      <TableRow key={sku.id}>
                        <TableCell className="font-medium">{sku.sku}</TableCell>
                        <TableCell>{sku.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{sku.category || 'Uncategorized'}</Badge>
                        </TableCell>
                        <TableCell>${sku.price?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnlinkSKU(sku.id)}
                          >
                            <Unlink className="h-3 w-3 mr-1" />
                            Unlink
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Available SKUs to Link */}
          {unlinkedSKUs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available SKUs to Link ({unlinkedSKUs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unlinkedSKUs.map((sku) => (
                      <TableRow key={sku.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedSKUs.has(sku.id)}
                            onCheckedChange={() => handleSKUToggle(sku.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{sku.sku}</TableCell>
                        <TableCell>{sku.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{sku.category || 'Uncategorized'}</Badge>
                        </TableCell>
                        <TableCell>${sku.price?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{sku.quantity || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* SKUs Linked to Other POs */}
          {otherLinkedSKUs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-muted-foreground">
                  SKUs Linked to Other POs ({otherLinkedSKUs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Current PO</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otherLinkedSKUs.map((sku) => (
                      <TableRow key={sku.id} className="opacity-60">
                        <TableCell className="font-medium">{sku.sku}</TableCell>
                        <TableCell>{sku.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">PO #{sku.current_po_number}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUnlinkSKU(sku.id)}
                          >
                            <Unlink className="h-3 w-3 mr-1" />
                            Unlink
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {filteredSKUs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No SKUs found matching your search.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {selectedSKUs.size > 0 && (
              <Button 
                onClick={handleLinkSKUs}
                disabled={isSubmitting}
              >
                Link {selectedSKUs.size} SKU{selectedSKUs.size > 1 ? 's' : ''} to PO
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};