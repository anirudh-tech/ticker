const Product = require('../models/productSchema')

module.exports = {
    getProduct:(req,res)=>{
        res.render("admin/adminShowProducts")
    },

    getAddProduct: (req,res)=>{
        res.render("admin/addProduct")
    },

    postAddProduct: async (req, res) => {
        console.log(req.body);
        console.log(req.files);
        try {
            const productType = req.body.productType;
            const variations = [];

        if (productType === 'watches') {
            const watchColors = req.body.watches;
            variations.push({  value: watchColors });
        } else if (productType === 'perfumes') {
            const perfumeQuantity = req.body.perfumes;
            variations.push({  value: perfumeQuantity });
        }
            req.body.Variation = variations[0].value
            req.body.images = req.files.map(val => val.filename)
            req.body.Status = 'In stock';
            req.body.Display = 'Active';
            req.body.UpdatedOn = new Date();
            const uploaded = await Product.create(req.body)
            res.redirect('/admin/product')
        } catch (error) {
            console.log(`An error happened ${error}`);
        }
    },
}