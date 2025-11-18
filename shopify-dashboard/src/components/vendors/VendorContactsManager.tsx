import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  User,
  Crown
} from 'lucide-react';
import {
  useVendorContacts,
  useCreateVendorContact,
  useUpdateVendorContact,
  useDeleteVendorContact,
  VendorContact,
  CreateVendorContactData,
  getRoleDisplayName,
  getRoleColorClass,
} from '@/hooks/useVendorContacts';

interface VendorContactsManagerProps {
  vendorId: string;
  vendorName: string;
}

interface ContactFormData {
  name: string;
  role: VendorContact['role'];
  email: string;
  phone: string;
  title: string;
  department: string;
  is_primary: boolean;
  notes: string;
}

const defaultFormData: ContactFormData = {
  name: '',
  role: 'other',
  email: '',
  phone: '',
  title: '',
  department: '',
  is_primary: false,
  notes: '',
};

interface ContactFormProps {
  formData: ContactFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContactFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  onCancel: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  submitText, 
  onCancel 
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter contact name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value: VendorContact['role']) => setFormData(prev => ({ ...prev, role: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primary Contact</SelectItem>
            <SelectItem value="billing">Billing Contact</SelectItem>
            <SelectItem value="technical">Technical Contact</SelectItem>
            <SelectItem value="sales">Sales Contact</SelectItem>
            <SelectItem value="support">Support Contact</SelectItem>
            <SelectItem value="procurement">Procurement Contact</SelectItem>
            <SelectItem value="quality">Quality Contact</SelectItem>
            <SelectItem value="logistics">Logistics Contact</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="Enter phone number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Job title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          value={formData.department}
          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
          placeholder="Department"
        />
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <Switch
        id="is_primary"
        checked={formData.is_primary}
        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_primary: checked }))}
      />
      <Label htmlFor="is_primary">Primary Contact</Label>
    </div>

    <div className="space-y-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        value={formData.notes}
        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        placeholder="Additional notes..."
        rows={3}
      />
    </div>

    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit">
        {submitText}
      </Button>
    </div>
  </form>
);

export const VendorContactsManager: React.FC<VendorContactsManagerProps> = ({
  vendorId,
  vendorName,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>(defaultFormData);
  const [editingContact, setEditingContact] = useState<VendorContact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<VendorContact | null>(null);

  const { data: contacts = [], isLoading } = useVendorContacts(vendorId);
  const createContact = useCreateVendorContact();
  const updateContact = useUpdateVendorContact();
  const deleteContact = useDeleteVendorContact();

  const handleAddContact = () => {
    setFormData({ ...defaultFormData, is_primary: contacts.length === 0 });
    setIsAddDialogOpen(true);
  };

  const handleEditContact = (contact: VendorContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      role: contact.role,
      email: contact.email || '',
      phone: contact.phone || '',
      title: contact.title || '',
      department: contact.department || '',
      is_primary: contact.is_primary,
      notes: contact.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteContact = (contact: VendorContact) => {
    setContactToDelete(contact);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const contactData: CreateVendorContactData = {
      vendor_id: vendorId,
      name: formData.name.trim(),
      role: formData.role,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      title: formData.title.trim() || undefined,
      department: formData.department.trim() || undefined,
      is_primary: formData.is_primary,
      notes: formData.notes.trim() || undefined,
    };

    try {
      await createContact.mutateAsync(contactData);
      setIsAddDialogOpen(false);
      setFormData(defaultFormData);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact || !formData.name.trim()) return;

    try {
      await updateContact.mutateAsync({
        id: editingContact.id,
        vendor_id: vendorId,
        name: formData.name.trim(),
        role: formData.role,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        title: formData.title.trim() || undefined,
        department: formData.department.trim() || undefined,
        is_primary: formData.is_primary,
        notes: formData.notes.trim() || undefined,
      });
      setIsEditDialogOpen(false);
      setEditingContact(null);
      setFormData(defaultFormData);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return;

    try {
      await deleteContact.mutateAsync({
        id: contactToDelete.id,
        vendorId,
      });
      setIsDeleteDialogOpen(false);
      setContactToDelete(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCancel = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setFormData(defaultFormData);
    setEditingContact(null);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading contacts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Contacts ({contacts.length})</h3>
        <Button onClick={handleAddContact} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add contacts for this vendor to manage relationships.
            </p>
            <div className="mt-6">
              <Button onClick={handleAddContact}>
                <Plus className="w-4 h-4 mr-1" />
                Add First Contact
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-black">{contact.name}</h4>
                      {contact.is_primary && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                      <Badge className={getRoleColorClass(contact.role)}>
                        {getRoleDisplayName(contact.role)}
                      </Badge>
                    </div>
                    
                    {contact.title && (
                      <p className="text-sm text-gray-600">{contact.title}</p>
                    )}
                    
                    {contact.department && (
                      <p className="text-sm text-gray-600">{contact.department}</p>
                    )}

                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      {contact.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {contact.notes && (
                      <p className="text-sm text-gray-600 mt-2">{contact.notes}</p>
                    )}
                  </div>

                  <div className="flex gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditContact(contact)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteContact(contact)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Contact for {vendorName}</DialogTitle>
          </DialogHeader>
          <ContactForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmitAdd} 
            submitText="Add Contact"
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <ContactForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmitEdit} 
            submitText="Update Contact"
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {contactToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};