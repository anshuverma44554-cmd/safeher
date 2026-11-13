import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { db, TrustedContact } from '../db/database.js';

const contactSchema = z.object({
  name: z.string().min(2, 'Contact name required'),
  relationship: z.string().min(2, 'Relationship required (e.g. Mother, Sister, Friend)'),
  phone: z.string().min(6, 'Valid phone number required'),
  email: z.string().email().optional().or(z.literal('')),
  is_primary: z.boolean().default(false),
  notify_on_sos: z.boolean().default(true),
  notify_on_journey: z.boolean().default(true),
});

export async function getContacts(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  const contacts = db.contacts.filter(c => c.traveller_id === user.id);

  res.json({
    success: true,
    contacts
  });
}

export async function addContact(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  const data = contactSchema.parse(req.body);

  // If this is set as primary, unmark existing primary
  if (data.is_primary) {
    db.contacts.forEach(c => {
      if (c.traveller_id === user.id) c.is_primary = false;
    });
  }

  const newContact: TrustedContact = {
    id: 'tc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    traveller_id: user.id,
    name: data.name,
    relationship: data.relationship,
    phone: data.phone,
    email: data.email || undefined,
    is_primary: data.is_primary,
    notify_on_sos: data.notify_on_sos,
    notify_on_journey: data.notify_on_journey,
    created_at: new Date().toISOString()
  };

  db.contacts.push(newContact);
  db.save();
  db.logActivity(user.id, 'TRUSTED_CONTACT_ADDED', { name: data.name, relationship: data.relationship });

  res.status(201).json({
    success: true,
    contact: newContact,
    message: 'Trusted contact added.'
  });
}

export async function updateContact(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const user = req.user!;
  const data = contactSchema.partial().parse(req.body);

  const contact = db.contacts.find(c => c.id === id && c.traveller_id === user.id);
  if (!contact) {
    res.status(404).json({ success: false, error: 'Contact not found' });
    return;
  }

  if (data.is_primary) {
    db.contacts.forEach(c => {
      if (c.traveller_id === user.id) c.is_primary = false;
    });
  }

  Object.assign(contact, data);
  db.save();

  res.json({
    success: true,
    contact,
    message: 'Trusted contact updated.'
  });
}

export async function deleteContact(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const user = req.user!;

  const index = db.contacts.findIndex(c => c.id === id && c.traveller_id === user.id);
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Contact not found' });
    return;
  }

  db.contacts.splice(index, 1);
  db.save();
  db.logActivity(user.id, 'TRUSTED_CONTACT_REMOVED', { contactId: id });

  res.json({
    success: true,
    message: 'Contact removed successfully.'
  });
}

