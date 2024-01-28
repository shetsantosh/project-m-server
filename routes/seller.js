const express = require('express');
const router = express.Router();
const Seller = require('../model/seller.model');
const multer = require('multer');
const csv = require('csvtojson');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// GET: Retrieve all sellers
router.get('/', async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving sellers' });
  }
});

// POST: Create a new seller
router.post('/', async (req, res) => {
  const {
    //sellerid,
    sellercompanyname,
    sellercompanygstno,
    sellercompanyaddress,
    sellercompanystatename,
    sellercompanystatecode,
  } = req.body;

  try {
    const newSeller = new Seller({
    //  sellerid,
      sellercompanyname,
      sellercompanygstno,
      sellercompanyaddress,
      sellercompanystatename,
      sellercompanystatecode,
    });
    const savedSeller = await newSeller.save();
    res.status(201).json(savedSeller);
  } catch (err) {
    res.status(400).json({ error: 'Error creating seller' });
  }
});

// PUT: Update a seller by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
   // sellerid,
    sellercompanyname,
    sellercompanygstno,
    sellercompanyaddress,
    sellercompanystatename,
    sellercompanystatecode,
  } = req.body;

  try {
    const updatedSeller = await Seller.findByIdAndUpdate(
      id,
      {
      //  sellerid,
        sellercompanyname,
        sellercompanygstno,
        sellercompanyaddress,
        sellercompanystatename,
        sellercompanystatecode,
      },
      { new: true }
    );

    if (!updatedSeller) {
      res.status(404).json({ error: 'Seller not found' });
    } else {
      res.json(updatedSeller);
    }
  } catch (err) {
    res.status(500).json({ error: 'Error updating seller' });
  }
});

// DELETE: Delete a seller by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSeller = await Seller.findByIdAndDelete(id);

    if (!deletedSeller) {
      res.status(404).json({ error: 'Seller not found' });
    } else {
      res.json(deletedSeller);
    }
  } catch (err) {
    res.status(500).json({ error: 'Error deleting seller' });
  }
});

// POST: Upload sellers from CSV file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const jsonData = await csv().fromString(req.file.buffer.toString());
    const processedSellers = jsonData.map((sellerData) => {
      // Capitalize state names
      sellerData.sellercompanystatename = sellerData.sellercompanystatename.toUpperCase();

      // Pad state codes with leading zeros if they are in the range 1 to 9
      const stateCode = parseInt(sellerData.sellercompanystatecode);
      if (!isNaN(stateCode) && stateCode >= 1 && stateCode <= 9) {
        sellerData.sellercompanystatecode = stateCode.toString().padStart(2, '0');
      }

      return sellerData;
    });

    const createdSellers = await Promise.all(
      jsonData.map(async (sellerData) => {
        const newSeller = new Seller(sellerData);
        return await newSeller.save();
      })
    );

    res.status(201).json(createdSellers);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Error uploading and creating sellers' });
  }
});

module.exports = router;
