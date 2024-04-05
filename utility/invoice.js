const easyinvoice = require('easyinvoice');
const fs = require("fs");
const path = require("path");
const util = require("util");
const writeFileAsync = util.promisify(fs.writeFile);

module.exports = {
  order: async (order) => {
  var data = {

            "customize": {
            },

            "images": {
                "logo": fs.readFileSync(path.join(__dirname, '..', 'public', 'images', 'screenshot--272-removebgpreview-1@2x.png'), 'base64'),


            },
            "sender": {
                "company": "TICKER",
                "address": "ASHOKAPURAM",
                "zip": "673001",
                "city": "Calicut",
                "country": "Kerala"
            },
            "client": {

            },
            "information": {
                "number": order._id,
                "date": order.OrderedDate,
                "due-date": order.OrderedDate
            },
            "products": order.Items.map((product) => ({
                "quantity": product.Quantity,
                "description": product.ProductId.ProductName, 
                "tax-rate": 0,
                "price": product.ProductId.DiscountAmount
            })),

            "bottom-notice": "Thank You For Your Purchase",
            "settings": {
                "currency": "USD",
                "tax-notation": "vat",
                "currency": "INR",
                "tax-notation": "GST",
                "margin-top": 50,
                "margin-right": 50,
                "margin-left": 50,
                "margin-bottom": 25
            },

        "translate": {
 
        }
    }

    //Create your invoice! Easy!

      // Create a Promise to handle the asynchronous file writing
      return new Promise(async (resolve, reject) => {
        try {
            const result = await easyinvoice.createInvoice(data);


            const filePath = path.join(__dirname, '..', 'public', 'pdf', `${order._id}.pdf`);
            await writeFileAsync(filePath, result.pdf, 'base64');

            resolve(filePath);
 } catch (error) {
            console.log(error)
            reject(error);
        }
    });
    }
};