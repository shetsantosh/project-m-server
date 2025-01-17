require("dotenv").config();

const express = require("express");
const app = express();
const ejs = require("ejs");
const pdf = require("html-pdf");
const path = require("path");
const qr = require("qrcode");
const fs = require("fs");
const moment = require("moment");
const commaNumber = require("comma-number");
const { ToWords } = require("to-words");
var AWS = require("aws-sdk");
var s3 = new AWS.S3({
  signatureVersion: "v4",
});

app.use(express.static("public"));

var API = `https://www.thegapindustries.com/`;
// expiry hrs set 12 as per client requirement 20-02-2024 by kalpana
const expirationTimeInSeconds = 60 * 60 * 12; // Expiration time in seconds (6 hour in this example)
const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      name: "Rupee",
      plural: "Rupees",
      symbol: "₹",
      fractionalUnit: {
        name: "Paisa",
        plural: "Paise",
        symbol: "",
      },
    },
  },
});

exports.generatePdf = async (result, callback) => {
  const resultId = result._id;
  const filename = resultId + ".pdf";
  const logoLocation = `./public/logo/logo.jpg`;
  const publicFolder = path.join(__dirname, "..");
  const logoPath = path.join(publicFolder, logoLocation);
  const responseObject = {};

  try {
    // Generate QR code and get base64 string
    const qrCodeData = `${API}pdf/${resultId}`;
    const qrCodeBase64 = await generateQRCodeBase64(qrCodeData);

    // Render PDF HTML
    ejs.renderFile(
      "./views/pdf/report-template.ejs",
      {
        invoiceData: result,
        imagePath: qrCodeBase64,
        logoPath: `data:image/jpeg;base64,${fs.readFileSync(logoPath, {
          encoding: "base64",
        })}`,
        moment: moment,
        commaNumber: commaNumber,
        toWords: toWords,
      },
      function (err, res) {
        // console.log("pdfcontroller "+res);
        if (res) {
          const html = res;
          let options = {
            format: "A4",
            childProcessOptions: {
              env: {
                OPENSSL_CONF: "/dev/null",
              },
            },
          };

          pdf.create(html, options).toStream(function (err, stream) {
            stream.pipe(fs.createWriteStream(filename));
            if (err) {
              console.log("Error", err);
            } else {
              AWS.config.update({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              });

              var params = {
                Body: stream,
                ACL: "public-read",
                Bucket: process.env.AWS_SOURCE_BUCKET_NAME,
                Key: filename,
                ContentType: "application/pdf",
              };
              s3.upload(params, (err, data) => {
                if (err) {
                  res.status(500).send({ err: err }); // if we get any error while uploading, error message will be returned.
                }
                responseObject.pdfUrl = data.Location;

                // Set the source and destination bucket and object key
                const sourceBucket = data.Bucket;
                const sourceObjectKey = data.Key;
                const destinationBucket = process.env.AWS_DEST_BUCKET_NAME;
                const destinationObjectKey = data.Key;

                // Create parameters for the copy operation
                const copyParams = {
                  Bucket: destinationBucket,
                  CopySource: `/${sourceBucket}/${sourceObjectKey}`,
                  Key: destinationObjectKey,
                };

                s3.copyObject(copyParams, (err, data) => {
                  if (err) {
                    console.error("Error copying object:", err);
                    res.status(500).send({ err: err });
                  } else {
                    s3.getSignedUrl(
                      "getObject",
                      {
                        Bucket: destinationBucket,
                        Key: destinationObjectKey,
                        Expires: expirationTimeInSeconds,
                        ResponseContentDisposition: "inline",
                        ResponseContentType: "application/pdf",
                      },
                      (err, signedUrl) => {
                        console.log("error", err, "url", signedUrl);
                        if (err) res.status(500).send({ err: err });
                        responseObject.preSignedUrl = signedUrl;
                        callback(responseObject);
                      }
                    );
                  }
                });
              });
            }
          });
        } else {
          return console.error("An error occurred during render ejs:", err);
        }
      }
    );
  } catch (err) {
    throw new Error(err);
    // if (callback) callback(null, error);
  }
};

const generateQRCodeBase64 = async (data) => {
  try {
    const qrCodeData = await qr.toDataURL(data);
    console.log("QR code string generated successfully");
    return qrCodeData;
  } catch (error) {
    console.error("Error generating QR code string:", error);
    throw error;
  }
};
