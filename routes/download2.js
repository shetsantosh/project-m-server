const custom = require('../invoicepdf/pdfController2')
const express = require('express');
const router = express.Router();
const Invoice = require('../model/invoice.model'); 
const fs = require('fs');
const path = require('path'); 

router.get('/:id', async (req, res) => {
  var invoiceId = req.params.id;
  try {
    const result = await Invoice.findById(invoiceId);
  
    // Throw error if no result
    if (!result) {
      throw { name: 'Error' };
    } 

    // var companyid = result.companydetails.companyid;
   // Continue process if result is returned
    await custom.generatePdf(
      { filename: invoiceId, format: 'A4' },
      result,
      async (fileLocation) => {
        return res.download(fileLocation, (error) => {
          if (error)
            res.status(500).json({
              success: false,
              result: null,
              message: "Couldn't find file",
              error: error.message,
            });
        });
      }
    ); 
} catch (error) {
  // If error is thrown from DB
  if (error.name == 'Error') {
    return res.status(400).json({
      success: false,
      result: null,
      error: error.message,
      message: 'Data not available',
    });
  } else if (error.name == 'BSONTypeError') {
 
    return res.status(400).json({
      success: false,
      result: null,
      error: error.message,
      message: 'Invalid ID',
    });
  } else {
    // Server Error
    console.log(error);
    return res.status(500).json({
      success: false,
      result: null,
      error: error.message,
      message: error.message,
    });
  }
}

});
router.get('/pdf/:id', async (req, res) => {
  const invoiceId = req.params.id;
  const fileLocation = path.join(__dirname, `../public/download2/${invoiceId}.pdf`);

  // Check if the file exists
  if (fs.existsSync(fileLocation)) {
    // Read the PDF file and send it as a response
    const fileStream = fs.createReadStream(fileLocation);
    fileStream.pipe(res);
  } else {
    // If the file does not exist, send a 404 response
    res.status(404).json({
      success: false,
      result: null,
      message: "Couldn't find file",
      error: 'File not found',
    });
  }
});
module.exports = router;


