const formidable = require("formidable");
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const https = require("https");
const PaytmChecksum = require("paytmchecksum");
const Invoice = require("../models/invoice");
const { Order } = require("../models/order");
const { getUserById } = require("../controllers/user");


router.post("/callback", (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, file) => {
    paytmChecksum = fields.CHECKSUMHASH;
    delete fields.CHECKSUMHASH;

    var isVerifySignature = PaytmChecksum.verifySignature(
      fields,
      process.env.PAYTM_MERCHANT_KEY,
      paytmChecksum
    );
    if (isVerifySignature) {
      var paytmParams = {};
      paytmParams["MID"] = fields.MID;
      paytmParams["ORDERID"] = fields.ORDERID;

      /*
       * Generate checksum by parameters we have
       * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
       */
      PaytmChecksum.generateSignature(
        paytmParams,
        process.env.PAYTM_MERCHANT_KEY
      ).then(function (checksum) {
        paytmParams["CHECKSUMHASH"] = checksum;

        var post_data = JSON.stringify(paytmParams);

        var options = {
          /* for Staging */
          hostname: "securegw-stage.paytm.in",

          /* for Production */
          // hostname: 'securegw.paytm.in',

          port: 443,
          path: "/order/status",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": post_data.length,
          },
        };

        var response = "";
        var post_req = https.request(options, function (post_res) {
          post_res.on("data", function (chunk) {
            response += chunk;
          });

          post_res.on("end", function () {
            let result = JSON.parse(response);
            if (result.STATUS === "TXN_SUCCESS") {
              //store in db
              console.log("Result");
              console.log(result);
              const date = new Date();

              let currentDay = String(date.getDate()).padStart(2, "0");

              let currentMonth = String(date.getMonth() + 1).padStart(2, "0");

              let currentYear = date.getFullYear();


              let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;

              const order = new Order({
                productCart: req.body.productCart,
                transaction_id: result.TXNID,
                address: req.body.address,
				email: req.body.email,
                contact_no: req.body.contact_no,
                user: req.profile._id,
                billingName: req.body.billingName,
				update: currentDate
              });
			  order.save((err, order) => {
				    if (err) {
				      return res.status(400).json({
				        error: "Not able to save order in DB"
				      });
				    }
				    const invoice = new Invoice({
						sender: req.profile._id,
						order: order._id,
						transaction_details: result
					  });
					  invoice.save((err, invoice) => {
						    if (err) {
						      return res.status(400).json({
						        error: "Not able to save invoice in DB"
						      });
						    }
						    return res.status(200).json({ 
								order: order,
								invoice: invoice
							 });
						  });
				  });
            }

            return res.status(200).json({
              result: result,
            });
          });
        });

        post_req.write(post_data);
        post_req.end();
      });
    } else {
      console.log("Checksum Mismatched");
    }
  });
});

router.post("/payment/:userId",getUserById, (req, res) => {
  const { amount, email } = req.body;

  /* import checksum generation utility */
  const totalAmount = JSON.stringify(amount);
  var params = {};

  /* initialize an array */
  (params["MID"] = process.env.PAYTM_MID),
    (params["WEBSITE"] = process.env.PAYTM_WEBSITE),
    (params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID),
    (params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE_ID),
    (params["ORDER_ID"] = uuidv4()),
    (params["CUST_ID"] = process.env.PAYTM_CUST_ID),
    (params["TXN_AMOUNT"] = totalAmount),
    (params["CALLBACK_URL"] = "http://localhost:8000/api/callback"),
    (params["EMAIL"] = email),
    (params["MOBILE_NO"] = "8850417577");

  /**
   * Generate checksum by parameters we have
   * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
   */
  var paytmChecksum = PaytmChecksum.generateSignature(
    params,
    process.env.PAYTM_MERCHANT_KEY
  );
  paytmChecksum
    .then(function (checksum) {
      let paytmParams = {
        ...params,
        CHECKSUMHASH: checksum,
      };
      res.json(paytmParams);
    })
    .catch(function (error) {
      console.log(error);
    });
});

module.exports = router;
