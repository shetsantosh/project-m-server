const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
	companydetails: {
		companyname: String,
		companyregistrationtype: String,
		companypartytype: String,
		companygstno: String,
		companycontact: String,
		companystate: String,
		companypincode: String,
		companyofficeaddress: String,
	},
	sellerdetails: {
		sellercompanyname: String,
		sellercompanygstno: String,
		sellercompanyaddress: String,
		sellercompanystatename: String,
		sellercompanystatecode: String,
	},
	buyerdetails: {
		buyercompanyname: String,
		buyercompanygstno: String,
		buyercompanyaddress: String,
		buyercompanystatename: String,
		buyercompanystatecode: String,
	},
	vehicledetails: {
		drivernumber: Number,
		vechiclenumber: String,
		vechiclemodel: String,
	},
	consignmentdetails: {
		itemdetails: [
			{
				itemname: String,
				itemdesc: String,
				itemquantity: Number,
				itemhsn: String,
				itemprice: Number,
				itemtaxrate: Number,
				itemweight: Number,
			},
		],
	},

	invoicedetails: {
		invoiceno: {
			type: String,
			default: function () {
				const currentYear = new Date().getFullYear().toString().slice(-2);
				const counter = this.constructor
					.countDocuments({
						'invoicedetails.invoiceno': {
							$regex: new RegExp(`${currentYear}\\d{7}`),
						},
					})
					.exec();
				return `${currentYear}${counter + 1}`.padStart(9, '0'); // Generate invoice number with leading zeros
			},
		},
		invoicedate: Date,
		invoicecreatedate: Date,
		invoicemakername: String,
		invoiceid: String,
	},

	boardingdetails: {
		dateofloading: Date,
		watermark: String,
		partyname: String,
		partyref: String,
		partyrate: Number,
	},
	loadingdetails: {
		startstate: String,
		endstate: String,
		rate: String,
		startpoint: String,
		endpoint: String,
		// transportationcost: Number,
	},
	pdfUrl: {
		type: String,
	},
	preSignedUrl: {
		type: String,
	},
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
