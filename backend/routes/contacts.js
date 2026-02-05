const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const fs = require('fs');
const multer = require('multer');
const csv = require('csvtojson');
const XLSX = require('xlsx');
const ImportHistory = require('../models/ImportHistory');
const upload = multer({ dest: 'uploads/' });

/* ================================
   GET CONTACTS (pagination + tag filter)
================================ */
router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const tag = req.query.tag;

    const filter = tag ? { tags: tag } : {};

    const contacts = await Contact.find(filter)
      .populate('tags')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    res.json({ contacts, total });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch contacts' });
  }
});

/* ================================
   ADD CONTACT
================================ */
router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.json(contact);
  } catch {
    res.status(500).json({ msg: 'Failed to add contact' });
  }
});

/* ================================
   UPDATE CONTACT
================================ */
router.put('/:id', async (req, res) => {
  try {
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({ msg: 'Failed to update contact' });
  }
});

/* ================================
   DELETE CONTACT
================================ */
router.delete('/delete-all', async (req, res) => {
  await Contact.deleteMany({});
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ msg: 'Failed to delete contact' });
  }
});

/* ================================
   BULK DELETE
================================ */
router.post('/bulk-delete', async (req, res) => {
  try {
    await Contact.deleteMany({ _id: { $in: req.body.ids } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ msg: 'Bulk delete failed' });
  }
});

/* ================================
   IMPORT CSV / EXCEL (FIXED)
================================ */
router.post('/import', async (req, res) => {
  try {
    const { contacts } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ msg: 'No contacts provided' });
    }

    // 1. Create Import Record
    const importRecord = new ImportHistory({
      filename: `Import  ${new Date().toLocaleString()}`, // Frontend doesn't send filename in body currently, can be added later
      count: 0
    });
    await importRecord.save();

    const cleanContacts = contacts.map(c => {
      // Frontend sends { name, phone, email, tags }
      const phoneRaw = c.phone;
      if (!phoneRaw) return null;

      return {
        name: c.name || '',
        email: c.email || '',
        phone: String(phoneRaw).replace(/\D/g, ''),
        tags: Array.isArray(c.tags) ? c.tags : [],
        importId: importRecord._id
      };
    }).filter(Boolean);

    if (cleanContacts.length === 0) {
      return res.status(400).json({ msg: 'No valid contacts found' });
    }

    try {
      await Contact.insertMany(cleanContacts, { ordered: false });
    } catch (e) {
      if (e.code !== 11000 && (!e.writeErrors || e.writeErrors.some(w => w.code !== 11000))) {
        console.warn("Bulk insert error (ignoring duplicates):", e.message);
      }
    }

    // 2. Update count
    importRecord.count = cleanContacts.length;
    await importRecord.save();

    res.json({ success: true, count: cleanContacts.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Import failed' });
  }
});

/* ================================
   EXPORT CSV
================================ */
router.get('/export', async (req, res) => {
  try {
    const contacts = await Contact.find().lean();
    const filePath = 'contacts.csv';
    const ws = fs.createWriteStream(filePath);

    csv.write(contacts, { headers: true }).pipe(ws);

    ws.on('finish', () => res.download(filePath));
  } catch {
    res.status(500).json({ msg: 'Export failed' });
  }
});

/* ================================
   BULK ASSIGN TAG
================================ */
router.post('/assign-tag', async (req, res) => {
  const { tagId, contactIds, allSelected } = req.body;

  if (allSelected) {
    await Contact.updateMany({}, { $addToSet: { tags: tagId } });
  } else {
    await Contact.updateMany(
      { _id: { $in: contactIds } },
      { $addToSet: { tags: tagId } }
    );
  }

  res.json({ success: true });
});

/* ================================
   REMOVE TAG FROM CONTACT
================================ */
router.post('/remove-tag', async (req, res) => {
  try {
    const { contactId, tagId } = req.body;

    await Contact.updateOne(
      { _id: contactId },
      { $pull: { tags: tagId } }
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ msg: 'Failed to remove tag' });
  }
});

module.exports = router;
