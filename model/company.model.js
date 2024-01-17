const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    companyid: String,
    companyname: String,
    companyregistrationtype: String,
    companypartytype: String,
    companygstno: String,
    companycontact: Number,
    companycountry: String,
    companystate: String,
    companyofficeaddress: String,
    companypincode: String,
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;