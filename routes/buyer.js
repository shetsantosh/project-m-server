const express = require('express');
const router = express.Router();
const Buyer = require('../model/buyer.model'); // Import your Buyer model here

const multer = require('multer');
const csv = require('csvtojson');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// GET: Retrieve all buyers
router.get('/', async (req, res) => {
  try {
    const buyers = await Buyer.find();
    res.json(buyers);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving buyers' });
  }
});

// POST: Create a new buyer
router.post('/', async (req, res) => {
  const {
    //buyerid,
    buyercompanyname,
    buyercompanygstno,
    buyercompanyaddress,
    buyercompanystatename,
    buyercompanystatecode,
  } = req.body;

  try {
    const newBuyer = new Buyer({
    //  buyerid,
      buyercompanyname,
      buyercompanygstno,
      buyercompanyaddress,
      buyercompanystatename,
      buyercompanystatecode,
    });
    const savedBuyer = await newBuyer.save();
    res.status(201).json(savedBuyer);
  } catch (err) {
    res.status(400).json({ error: 'Error creating buyer' });
  }
});
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Use csvtojson to convert CSV buffer to JSON
    const jsonData = await csv().fromString(req.file.buffer.toString());

    // Iterate through the JSON data and create buyers
    const createdBuyers = await Promise.all(
      jsonData.map(async (buyerData) => {
        const newBuyer = new Buyer(buyerData);
        return await newBuyer.save();
      })
    );

    res.status(201).json(createdBuyers);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Error uploading and creating buyers' });
  }
});
// PUT: Update a buyer by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
   // buyerid,
    buyercompanyname,
    buyercompanygstno,
    buyercompanyaddress,
    buyercompanystatename,
    buyercompanystatecode,
  } = req.body;

  try {
    const updatedBuyer = await Buyer.findByIdAndUpdate(
      id,
      {
       // buyerid,
        buyercompanyname,
        buyercompanygstno,
        buyercompanyaddress,
        buyercompanystatename,
        buyercompanystatecode,
      },
      { new: true }
    );

    if (!updatedBuyer) {
      res.status(404).json({ error: 'Buyer not found' });
    } else {
      res.json(updatedBuyer);
    }
  } catch (err) {
    res.status(500).json({ error: 'Error updating buyer' });
  }
});

// DELETE: Delete a buyer by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBuyer = await Buyer.findByIdAndDelete(id);

    if (!deletedBuyer) {
      res.status(404).json({ error: 'Buyer not found' });
    } else {
      res.json(deletedBuyer);
    }
  } catch (err) {
    res.status(500).json({ error: 'Error deleting buyer' });
  }
});

module.exports = router;
