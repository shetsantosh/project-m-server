const custom = require("../invoicepdf/pdfController");
const express = require("express");
const router = express.Router();
const Invoice = require("../model/invoice.model");

router.put("/pdf/:id", async (req, res) => {
  var invoiceId = req.params.id;
  try {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ msg: "Invoice not found" });
    }

    // Continue process if result is returned
    await custom.generatePdf(invoice, async (data) => {
      console.log("S3 object data:", data);

      invoice.pdfUrl = data.Location;
      await invoice
        .save()
        .then((result) => {
          res.status(200).json({
            success: true,
            message: "success",
            result: result,
          });
        })
        .catch((err) => {
          res.send({ message: err });
        });
    });
  } catch (error) {
    // Handle errors
    if (error.name == "Error") {
      return res.status(400).json({
        success: false,
        result: null,
        error: error.message,
        message: "Data not available",
      });
    } else if (error.name == "BSONTypeError") {
      return res.status(400).json({
        success: false,
        result: null,
        error: error.message,
        message: "Invalid ID",
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

module.exports = router;
