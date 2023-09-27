const Product = require('../models/productSchema')

module.exports = {
    getProduct: async (req,res)=>{
        try {
            const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 10; // Number of items per page
            const skip = (page - 1) * perPage;
        
            // Query the database for products, skip and limit based on the pagination
            const products = await Product.find()
              .skip(skip)
              .limit(perPage).lean();
        
            const totalCount = await Product.countDocuments(); 
        
            res.render('admin/adminShowProducts', {
              products,
              currentPage: page,
              perPage,
              totalCount,
              totalPages: Math.ceil(totalCount / perPage),
            });
          } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
          }
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