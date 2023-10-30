const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const cron = require('node-cron')

cron.schedule('* */1 * * *', async ()=>{
    console.log('Cron job is running...');
    try {
        const currentDate = new Date()
        const categories = await Category.find({
            DiscountAmount: { $gt: 0 },
            ExpiryDate: { $gte: currentDate}
        })
        for (let category of categories) {
            let products = await Product.find({CategoryId: category._id})
            if(products && products.length > 0){
                for (let product of products) {
                    const updatedPrice = product?.DiscountAmount - category.DiscountAmount
                    product.DiscountAmount = updatedPrice >= 0 ? updatedProduct: 0;
                    await product.save()
                }
                console.log(`Updated prices for products in category: ${category.Name}`);
            }
        }
    } catch (error) {
        console.error('Error in the cron job:', error);
    }
})
