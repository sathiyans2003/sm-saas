router.post('/assign', async (req, res) => {
  const { contactIds, tagId } = req.body;

  if (contactIds === 'ALL') {
    await Contact.updateMany({}, { $addToSet: { tags: tagId } });
  } else {
    await Contact.updateMany(
      { _id: { $in: contactIds } },
      { $addToSet: { tags: tagId } }
    );
  }

  res.json({ success: true });
});
