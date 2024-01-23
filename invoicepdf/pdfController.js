const express = require('express');
const app = express();
const ejs = require('ejs');
const pdf = require('html-pdf');
const path = require('path');
const qr = require('qrcode');
const fs = require('fs');
const moment = require('moment');
const commaNumber = require('comma-number');
const { ToWords } = require('to-words');

app.use(express.static('public'));

var API = `https://project-m-client.vercel.app/`;

const toWords = new ToWords({
	localeCode: 'en-IN',
	converterOptions: {
		currency: true,
		ignoreDecimal: false,
		ignoreZeroCurrency: false,
		doNotAddOnly: false,
		currencyOptions: {
			name: 'Rupee',
			plural: 'Rupees',
			symbol: '₹',
			fractionalUnit: {
				name: 'Paisa',
				plural: 'Paise',
				symbol: '',
			},
		},
	},
});

exports.generatePdf = async (
	info = { filename: 'pdf_file', format: 'A4' },
	result,
	callback
) => {
	const resultid = result._id;
	const fileId = result._id + '.pdf';
	const targetLocation = `./public/download/${fileId}`;
	const imageLocation = `./public/qrImages/`;
	const logoLocation = `./public/logo/logo.jpg`;
	const publicFolder = path.join(__dirname, '..');
	const logoPath = path.join(publicFolder, logoLocation);

	try {
		// If PDF already exists, delete it and create a new PDF
		if (fs.existsSync(targetLocation)) {
			fs.unlinkSync(targetLocation);
		}

		const qrCodeFilename = result.invoicedetails.invoiceno + '.png';
		const currentDirectory = __dirname;
		const publicFolder = path.join(currentDirectory, '..');
		const imagePath = path.join(publicFolder, imageLocation, qrCodeFilename);

		// Generate QR code and get base64 string
		const qrCodeData = `${API}pdf/${resultid}`;
		const qrCodeBase64 = await generateQRCodeBase64(qrCodeData);
		const qrCodeBase64_duplicate = await generateQRCodeBase64(qrCodeData);

		// Render PDF HTML
		ejs.renderFile(
			'./views/pdf/report-template.ejs',
			{
				invoiceData: result,
				imagePath: qrCodeBase64,
				imagePath1: qrCodeBase64_duplicate,
				logoPath: `data:image/jpeg;base64,${fs.readFileSync(logoPath, {
					encoding: 'base64',
				})}`,
				moment: moment,
				commaNumber: commaNumber,
				toWords: toWords,
			},
			function (err, result) {
				if (result) {
					const html2 = result;
					let options2 = {
						// "height": "12.25in",
						// "width": "11.25in",
						// "header": { "height": "0mm" },
						// "footer": { "height": "0mm" },
						format: 'A4',
						childProcessOptions: {
							env: {
								OPENSSL_CONF: '/dev/null',
							},
						},
					};

					pdf.create(html2, options2).toFile(targetLocation, function (error) {
						if (error) {
							console.error('Error creating PDF:', error);
							if (callback) callback(null, error);
						} else {
							console.log('PDF created successfully.');
							if (callback) callback(targetLocation);
						}
					});
				} else {
					console.error('An error occurred during render ejs:', err);
					if (callback) callback(null, err);
				}
			}
		);
	} catch (error) {
		console.error('Error:', error);
		if (callback) callback(null, error);
	}
};

const generateQRCodeBase64 = async (data) => {
	try {
		const qrCodeData = await qr.toDataURL(data);
		console.log('QR code string generated successfully');
		return qrCodeData;
	} catch (error) {
		console.error('Error generating QR code string:', error);
		throw error;
	}
};
