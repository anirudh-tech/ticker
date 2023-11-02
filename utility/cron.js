const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Offer = require("../models/offerSchema");
const cron = require("node-cron");

// cron.schedule('* */1 * * *', async ()=>{
//     console.log('Cron job is running...');
//     try {
//         const currentDate = new Date()
//         const categories = await Category.find({
//             DiscountAmount: { $gt: 0 },
//             ExpiryDate: { $gte: currentDate}
//         })
//         for (let category of categories) {
//             let products = await Product.find({CategoryId: category._id})
//             if(products && products.length > 0){
//                 for (let product of products) {
//                     const updatedPrice = product?.DiscountAmount - category.DiscountAmount
//                     product.DiscountAmount = updatedPrice >= 0 ? updatedProduct: 0;
//                     await product.save()
//                 }
//                 console.log(`Updated prices for products in category: ${category.Name}`);
//             }
//         }
//     } catch (error) {
//         console.error('Error in the cron job:', error);
//     }
// })

const checkCategoryOffers = async () => {
  console.log("running cron");
  try {
    const currentDate = new Date();
    const InvalidCategoryOffers = await Offer.find({
      status: "Inactive",
    });
    if (InvalidCategoryOffers && InvalidCategoryOffers.length > 0) {
      for (let offer of InvalidCategoryOffers) {
        console.log(offer)
        const category = await Category.find({Name: offer.categoryName})

        await Product.updateMany({Category: category[0]._id},[
            {
              $set: {
                DiscountAmount: '$Price'
              }
            }
          ])
          console.log(`Updated prices for products with invalid offers`);
        }
      }
  } catch (error) {
    console.error("Error in the cron job:", error);
    throw error;
  }
};

// cron.schedule("*/10 * * * * *", checkCategoryOffers);

// module.exports = { checkCategoryOffers };
