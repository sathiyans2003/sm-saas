const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');
const Contact = require('../models/Contact');

/* ===============================
   GET ALL TAGS
================================ */
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find().sort({ createdAt: -1 });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch tags' });
  }
});

/* ===============================
   CREATE TAG
================================ */
router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ msg: 'Tag name required' });
    }

    const exists = await Tag.findOne({ name });
    if (exists) {
      return res.status(400).json({ msg: 'Tag already exists' });
    }

    const tag = new Tag({ name, color });
    await tag.save();

    res.json(tag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to create tag' });
  }
});

/* ===============================
   BULK ASSIGN TAG
================================ */
router.post('/assign', async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Tag assign failed' });
  }
});

module.exports = router;
