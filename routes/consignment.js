const express = require('express');
const router = express.Router();
const Consignment = require('../model/consignment.model'); // Import your Company model here

// GET: Retrieve all companies
router.get('/', async (req, res) => {
	try {
		const consignments = await Consignment.find();
		res.json(consignments);
	} catch (err) {
		res.status(500).json({ error: 'Error retrieving consignments' });
	}
});

// POST: Create a new consigment
router.post('/', async (req, res) => {
	const { itemname, itemquantity, itemhsn, itemprice, itemtaxrate, itemdesc } =
		req.body;

	try {
		const newConsignment = new Consignment({
			itemname,
			itemquantity,
			itemhsn,
			itemprice,
			itemtaxrate,
			itemdesc,
		});
		const savedConsignment = await newConsignment.save();
		res.status(201).json(savedConsignment);
	} catch (err) {
		res.status(400).json({ error: `${err}Error creating consignment ` });
	}
});

// PUT: Update a consigment by ID
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { itemname, itemquantity, itemhsn, itemprice, itemtaxrate, itemdesc } =
		req.body;

	try {
		const updatedConsignment = await Consignment.findByIdAndUpdate(
			id,
			{
				itemname,
				itemquantity,
				itemhsn,
				itemprice,
				itemtaxrate,
				itemdesc,
			},
			{ new: true }
		);

		if (!updatedConsignment) {
			res.status(404).json({ error: 'Consignment not found' });
		} else {
			res.json(updatedConsignment);
		}
	} catch (err) {
		res.status(500).json({ error: 'Error updating consignment' });
	}
});

// DELETE: Delete a consigment by ID
router.delete('/:id', async (req, res) => {
	try {
		const deletedConsignment = await Consignment.findByIdAndDelete(
			req.params.id
		);

		if (!deletedConsignment) {
			res.status(404).json({ error: 'Consignment not found' });
		} else {
			res.json(deletedConsignment);
		}
	} catch (err) {
		res
			.status(500)
			.json({ error: `Error deleting consignment: ${err.message}` });
	}
});

module.exports = router;
