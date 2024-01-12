const express = require('express');
const router = express.Router();
const Loading = require('../model/loading.model');

router.get('/', async (req, res) => {
  try {
    const loadings = await Loading.find();
    res.json(loadings);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving loading' });
  }
});

router.post('/', async (req, res) => {
  const { startpoint, endpoint ,rate } = req.body;

  try {
    const newLoading = new Loading({ startstate, endstate ,rate });
    const savedLoading = await newLoading.save();
    res.status(201).json(savedLoading);
  } catch (err) {
    res.status(400).json({ error: 'Error creating loading' });
  }
});
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { startpoint, endpoint ,rate } = req.body;

  try {
    const updatedLoading = await Loading.findByIdAndUpdate(
      id,
      { startpoint, endpoint ,rate },
      { new: true }
    );

    if (!updatedLoading) {
      res.status(404).json({ error: 'Loading not found' });
    } else {
      res.json(updatedLoading);
    }
  } catch (err) {
    res.status(500).json({ error: 'Error updating loading' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedLoading = await Loading.findByIdAndDelete(id);

    if (!deletedLoading) {
      res.status(404).json({ error: 'Loading not found' });
    } else {
      res.json(deletedLoading);
    }
  } catch (err) {
    res.status(500).json({ error: 'Error deleting loading' });
  }
});

module.exports = router;
