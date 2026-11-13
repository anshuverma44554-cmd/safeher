import { Router } from 'express';
import { getContacts, addContact, updateContact, deleteContact } from '../controllers/contactController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', getContacts);
router.post('/', addContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;

