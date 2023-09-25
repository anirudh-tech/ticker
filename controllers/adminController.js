module.exports = {
    showProducts:(req,res)=>{
        res.render("admin/adminShowProducts")
    },
    addProduct:(req,res)=>{
        res.render("admin/addProduct")
    }
}