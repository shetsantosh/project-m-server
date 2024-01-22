const express = require('express');
const router = express.Router();
const Party = require('../model/party.model');

const multer = require('multer');
const csv = require('csvtojson');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
	try {
		const parties = await Party.find(); // Rename the variable here
		res.json(parties);
	} catch (err) {
		res.status(500).json({ error: 'Error retrieving Party' });
	}
});

router.post('/', async (req, res) => {
	const { partyname, partyrefno } = req.body;

	try {
		const newParty = new Party({ partyname, partyrefno });
		const savedParty = await newParty.save();
		res.status(201).json(savedParty);
	} catch (err) {
		res.status(400).json({ error: 'Error creating Party' });
	}
});
router.post('/upload', upload.single('file'), async (req, res) => {
	try {
		// Use csvtojson to convert CSV buffer to JSON
		const jsonData = await csv().fromString(req.file.buffer.toString());

		// Iterate through the JSON data and create buyers
		const createdParties = await Promise.all(
			jsonData.map(async (partyData) => {
				const newParty = new Buyer(partyData);
				return await newParty.save();
			})
		);

		res.status(201).json(createdParties);
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: 'Error uploading and creating parties' });
	}
});

router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { partyname, partyrefno } = req.body;

	try {
		const updatedParty = await Party.findByIdAndUpdate(
			id,
			{ partyname, partyrefno },
			{ new: true }
		);

		if (!updatedParty) {
			res.status(404).json({ error: 'Party not found' });
		} else {
			res.json(updatedParty);
		}
	} catch (err) {
		res.status(500).json({ error: 'Error updating Party' });
	}
});

router.delete('/:id', async (req, res) => {
	const { id } = req.params;

	try {
		const deletedParty = await Party.findByIdAndDelete(id);

		if (!deletedParty) {
			res.status(404).json({ error: 'Party not found' });
		} else {
			res.json(deletedParty);
		}
	} catch (err) {
		res.status(500).json({ error: 'Error deleting Party' });
	}
});

module.exports = router;
