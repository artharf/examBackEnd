const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const util = require('util');
const { uploader } = require('./helper/uploader');
const fs = require('fs')
const multer = require('multer');


const db = mysql.createConnection({
    host : 'localhost',
    user : 'artharf',
    password : 'root',
    database : 'backend',
    port : 3306
});

const query = util.promisify(db.query).bind(db);

app.use(bodyParser());

app.get('/',(req,res) => {
    res.status(200).send('<center><h1>Welcome to My API</h1></center>')
})


// PRODUCT

app.post('/add-product', async (req,res) => {
    let {nama, harga, imagePath } = req.body;
    let sql = await `INSERT INTO product (nama, harga, imagePath) values ("${nama}",${harga},"${imagePath}")`
    try{
        let respond =  query(sql);
        res.status(200).send({
            status : "created",
            message : "Data has been created"

        })
    }catch{
        res.status(500).send(err.message)
    }
})

app.get('/product', async (req,res) => {
    let sql = `SELECT * FROM product`;
    try{
        let respond = await query(sql);
        res.status(200).send(respond)
    }catch(err){
        res.status(500).send(err.message)
    }
})

//STORE

app.post('/add-store', async (req,res) => {
    let {branch_name } = req.body;
    let sql = await `INSERT INTO store (branch_name) values ("${branch_name}")`
    try{
        let respond =  query(sql);
        res.status(200).send({
            status : "created",
            message : "Data has been created"

        })
    }catch{
        res.status(500).send(err.message)
    }
})

app.get('/store', async (req,res) => {
    let sql = `SELECT * FROM store`;
    try{
        let respond = await query(sql);
        res.status(200).send(respond)
    }catch(err){
        res.status(500).send(err.message)
    }
})

// INVENTORY

app.post('/add-inventory', async(req,res) => {
    let {product_id, store_id, inventory} = req.body;
    let sql = `INSERT INTO inventory (product_id, store_id, inventory) values (${product_id}, ${store_id}, ${inventory})`
    try{
        let respond =  await query(sql, req.body);
        res.status(200).send({
            status : "created",
            message : "Data has been created",
            respond
        })
    }catch{
        res.status(500).send(err.message)
    }
})

app.get('/inventory', async(req,res) => {
    let sql = `SELECT * FROM inventory`

    try{
        let respond = await query(sql);
        res.status(200).send(respond)
    }catch{
        res.status(500).send(err.message)
    }

})


// CRUD with STORE

app.get('/get-toko', async(req,res) => {
    let sql = `SELECT * FROM product p JOIN store s`

    try{
        let respond = await query(sql);
        res.status(200).send(respond)
    }catch{
        res.status(500).send(err.message)
    }

})
app.post('/add-image', (req, res) => {
    try{
        const path = '/images';
        const upload = uploader(path, 'TDO').fields([{ name : 'image' }]) //TDD1231231 TDO123123123
        upload(req,res, (err) => {
            const { image } = req.files;
            console.log(image)
            const imagePath = image ? `${path}/${image[0].filename}` : null
            // public/images/TDO123123123123
            console.log(imagePath) // simpen di database

            let sql = `INSERT INTO photo (imagePath) VALUES ('${imagePath}')`;
            db.query(sql, req.files, (err,results) => {
                if(err){
                    fs.unlinkSync(`./public${imagePath}`)
                    res.status(500).send(err.message)
                }
                res.status(201).send({
                    status : 'created',
                    message : 'Data Created!' 
                })
            })
        })
    }catch(err){
        res.status(500).send(err.message)
    }
})



// ENDPOINT FOR UI

app.get('/get-store', async(req,res) => {
    let sql = `
        Select 
            i.inventory_id AS "#",
            p.nama AS "Nama Product",
            s.branch_name AS "Branch Name",
            i.inventory AS "Stock"
        from Inventory i 
        join product p on i.product_id = p.product_id
        join store s on i.store_id = s.store_id;`
    try{
        let respond = await query(sql);
        res.status(200).send(respond)
    }catch{
        res.status(500).send(err.message)
    }

})

app.delete('/delete-inventory/:inventory_id', async(req,res) => {
    let { inventory_id } = req.params;
    let sql = `DELETE FROM inventory WHERE inventory_id = ${inventory_id}`
    try{
        await query(sql, req.body);
        let result = `SELECT * FROM inventory`;
        let final = await query(result);
        res.status(200).send({
            status : "deleted",
            message : "data has been remove",
            hasil : final
        })
    }catch(err){
        res.status(500).send(err.message)
    }
})

app.patch('/edit-store/:inventory_id', async(req,res) => {
    let { inventory_id } = req.params;
    let sql = `UPDATE inventory set ? where inventory_id = ${inventory_id}`;
    try{
       let edited = await query(sql, req.body);
       let result = `SELECT * FROM inventory`;
       let final = await query(result); 
       res.status(200).send({
            status : "changed",
            message : "data has been changed",    
            edit : req.body,     
            hasil : final
        })

    }catch{
        res.status(500).send(err.message)
    }
})


const port = 2000

app.listen(port, () => console.log(`API active at port ${port}`));