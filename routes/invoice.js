const express = require('express');
const router = express.Router();
const Invoice = require('../model/invoice.model');
const custom = require('../invoicepdf/pdfController');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
	signatureVersion: 'v4',
});

// GET: Retrieve all invoices
router.get('/', async (req, res) => {
	try {
		const invoices = await Invoice.find();
		res.json(invoices);
	} catch (err) {
		res.status(500).json({ error: 'Error retrieving invoices' });
	}
});
// GET: Retrieve an invoice by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const invoice = await Invoice.findById(id);

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(invoice);
    } catch (err) {
        console.error('Error finding invoice:', err);
        res.status(500).json({ error: 'Error finding invoice' });
    }
});

// POST: Create a new invoice
router.post('/', async (req, res) => {
	const {
		companydetails,
		sellerdetails,
		buyerdetails,
		vehicledetails,
		consignmentdetails,
		invoicedetails,
		boardingdetails,
		loadingdetails,
	} = req.body;

	try {
		const newInvoice = new Invoice({
			companydetails,
			sellerdetails,
			buyerdetails,
			vehicledetails,
			consignmentdetails,
			invoicedetails: {
				...invoicedetails,
				invoiceno: undefined,
				invoicedate: new Date(),
			}, // Set invoiceno in the schema
			boardingdetails,
			loadingdetails,
			pdfUrl: undefined,
			preSignedUrl: undefined,
		});

		const savedInvoice = await newInvoice.save();
		const currentYear = new Date().getFullYear().toString().slice(-2);
		const counter = await Invoice.countDocuments({
			'invoicedetails.invoiceno': {
				$regex: new RegExp(`${currentYear}\\d{7}`),
			},
		}).exec();
		savedInvoice.invoicedetails.invoiceno = `${currentYear}${(counter + 1)
			.toString()
			.padStart(7, '0')}`;

		// Generate PDF and update S3 URL
		await custom.generatePdf(savedInvoice, async (data) => {
			savedInvoice.pdfUrl = data.pdfUrl;
			savedInvoice.preSignedUrl = data.preSignedUrl;
			await savedInvoice
				.save()
				.then((result) => {
					res.status(201).json(result);
				})
				.catch((err) => {
					res.status(400).json({ error: 'Error creating invoice ' + err });
				});
		});
	} catch (err) {
		res.status(400).json({ error: 'Error creating invoice ' + err });
	}
});

// PUT: Update an invoice by ID
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const updatedInvoiceData = req.body;

	try {
		// Generate PDF and update S3 URL
		await custom.generatePdf(updatedInvoiceData, async (data) => {
			updatedInvoiceData.pdfUrl = data.pdfUrl;
			updatedInvoiceData.preSignedUrl = data.preSignedUrl;
		});

		const updatedInvoice = await Invoice.findByIdAndUpdate(
			id,
			updatedInvoiceData,
			{ new: true }
		);

		if (!updatedInvoice) {
			res.status(404).json({ error: 'Invoice not found' });
		} else {
			res.json(updatedInvoice);
		}
	} catch (err) {
		res.status(500).json({ error: 'Error updating invoice' });
	}
});

// DELETE: Delete an invoice by ID
router.delete('/:id', async (req, res) => {
	const { id } = req.params;

	try {
		const invoice = await Invoice.findById(id);

		if (!invoice) {
			return res.status(404).json({ error: 'Invoice not found' });
		}

		// Check if the PDF exists in the first AWS S3 bucket
		const paramsBucket1 = {
			Bucket: process.env.AWS_SOURCE_BUCKET_NAME,
			Key: `${id}.pdf`, // Assuming there's a key to identify the PDF file in S3
		};

		s3.getObject(paramsBucket1, async (err, data) => {
			if (err && err.code === 'NoSuchKey') {
				// PDF does not exist in the first bucket
				console.log('PDF not found in the first bucket');
			} else if (err) {
				console.error('Error checking PDF existence in first bucket:', err);
				return res
					.status(500)
					.json({ error: 'Error checking PDF existence in first bucket' });
			} else {
				// PDF exists in the first bucket, proceed with deletion
				// console.log('deleted from first bucket');
				s3.deleteObject(paramsBucket1, async (err, data) => {
					if (err) {
						console.error('Error deleting PDF from first bucket:', err);
						return res
							.status(500)
							.json({ error: 'Error deleting PDF from first bucket' });
					}
					console.log('PDF deleted from the first bucket successfully');
				});
			}

			// Check if the PDF exists in the second AWS S3 bucket
			const paramsBucket2 = {
				Bucket: process.env.AWS_DEST_BUCKET_NAME,
				Key: `${id}.pdf`, // Assuming there's a key to identify the PDF file in S3
			};

			s3.getObject(paramsBucket2, async (err, data) => {
				if (err && err.code === 'NoSuchKey') {
					// PDF does not exist in the second bucket
					console.log('PDF not found in the second bucket');
				} else if (err) {
					console.error('Error checking PDF existence in second bucket:', err);
					return res
						.status(500)
						.json({ error: 'Error checking PDF existence in second bucket' });
				} else {
					// PDF exists in the second bucket, proceed with deletion
					// console.log('deleted from second bucket');
					s3.deleteObject(paramsBucket2, async (err, data) => {
						if (err) {
							console.error('Error deleting PDF from second bucket:', err);
							return res
								.status(500)
								.json({ error: 'Error deleting PDF from second bucket' });
						}
						console.log('PDF deleted from the second bucket successfully');
					});
				}

				// Delete invoice from the database regardless of whether the PDF existed in the second bucket or not
				try {
					const deletedInvoice = await Invoice.findByIdAndDelete(id);
					res.json(deletedInvoice);
					console.log('PDF deleted successfully');
				} catch (err) {
					console.error('Error deleting invoice:', err);
					res.status(500).json({ error: 'Error deleting invoice' });
				}
			});
		});
	} catch (err) {
		console.error('Error finding invoice:', err);
		res.status(500).json({ error: 'Error finding invoice' });
	}
});

module.exports = router;
