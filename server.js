let express = require ('express');
let app = express();
let multer = require ('multer');
let bodyParser = require('body-parser');
let cors = require('cors');
let mysql = require ('mysql');
const req = require('express/lib/request');
const crypto = require('crypto');
const { threadId } = require('worker_threads');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({ origin:[ 'http://localhost:4200', 'http://localhost:3000', 'http://localhost:8080']}));


app.get('/', (req, res) =>{
    return res.send({ 
        error: false, 
        message:'hello world',
        written_by: 'bebe soudalat',
        published_on:'http://milerdev.com'
        
    })
})

// Set Path and Name image saved
const fileStorageEngine = multer.diskStorage({ //manage Storage Parameter
    destination:(req,file,cb)=>{
        cb(null,'./image')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'--'+file.originalname)
    }
})
// Create variable to upload image
const upload = multer({storage :fileStorageEngine})


//connect database
let dbCon = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database:'clothing'
})
dbCon.connect();

//retrieve all books
app.get('/product_search', (req, res) => {
    let keyword = req.query.keyword
    console.log(keyword)

    dbCon.query('SELECT *, tb_suppliers.supName FROM tb_product INNER JOIN tb_updateprice ON tb_product.productID = tb_updateprice.productID LEFT JOIN tb_suppliers ON tb_product.supID=tb_suppliers.supID INNER JOIN tb_category ON tb_product.cateID = tb_category.cateID INNER JOIN tb_unit ON tb_product.unitID = tb_unit.unitID WHERE tb_updateprice.status = 1 and pro_std = 0 and product_code like "%' + keyword + '%"', (error, results, fields) => {
        if(error) throw error;

        let message = ""
        if (results === undefined || results.length == 0){
            message = "category table is empty";
        } else {
            message = "successfully retrieve category";
        }
        return res.send ({ error: false, data: results, message: message });
    })
})

app.get('/order_search', (req, res) => {
    let keyword = req.query.keyword
    console.log(keyword)

    dbCon.query('SELECT o.*,s.supName as supName FROM tb_order o INNER JOIN tb_suppliers s on o.supID = s.supID where orderID like "%' + keyword + '%"', (error, results, fields) => {
        if(error) throw error;

        let message = ""
        if (results === undefined || results.length == 0){
            message = "order table is empty";
        } else {
            message = "successfully retrieve order";
        }
        return res.send ({ error: false, data: results, message: message });
    })
})
app.get('/product_search/:keyword', (req, res) => {
    // let keyword = req.params;
    // console.log(keyword)
 
    dbCon.query('SELECT * FROM tb_product WHERE productName like "%' + req.params.keyword + '%"', (error, results, fields) => {
        if(error) throw error;

        let message = ""
        if (results === undefined || results.length == 0){
            message = "category table is empty";
        } else {
            message = "successfully retrieve category";
        }
        return res.send ({ error: false, data: results, message: message });
    })
})

//category
app.get('/category', (req,res) => {
    dbCon.query('select * from tb_category', (error, results, fields) =>{
        if (error) throw error;

        let message =""
        if (results === undefined || results.lenght == 0){
            message = "category table is empty";
        }else{
            message = "successfully retrive category";
        }
        return res.send ({ error: false, data: results, message:message});
    })
})

// add a new book
app.post('/add_category', (req, res) => {
   let cateName = req.body.cateName;

    //validation
    if(!cateName){
      return res.status(400).send({ error: true, message: "please provide category name"})  
    } else {
        dbCon.query('insert into tb_category (cateName) values(?)', [cateName], (error, results, fields) => {
           try {
            if (error) throw error;
            return res.send({ error:false, data: results, message:"category insert successfully"})
           } catch (error) {
               
           }
        })
    }
});

// retrieve
app.get('/category/:id', (req, res) => {
    let id = req.params.id;
    
    if (!id) {
        return res.status(400).send({ error: true, message:"please provide book id"})
    } else {
        dbCon.query('select * from tb_category where cateID = ?', id, (error, results, fields) =>{

            let message = "";
            if (results === undefined || results.lenght == 0) {
                message = "category not found";
            } else {
                message = "successfully";
            }
            return res.send({ error: error, data: results[0], message: message})
        })
    }
})

//update
app.put('/category_update', (req,res) => {
    let {cateID,cateName} = req.body;
   

    //validation
    if (!cateID || !cateName) {
        return res.status(400).send({ error: true, message:' please provide book id'})
    } else {
        dbCon.query('update tb_category set cateName = ? where cateID = ?', [cateName,cateID], (error, results, fields) => {
            if (error) throw error;

            let message = "";
            if ( results.changeRows === 0) {
                message = "cateName not found or data are same";
            } else {
                message = "cateName successfully updated";
            }

            return res.send({ error: false, data: results, message: message })
        })
    }

})


// delete
// app.post('/delete_category',(req, res) =>{
//     const {cateID} = req.body

//     if(!cateID){
//         return res.status(400).send({ error: true, message: " please provide category id"})
//     } else {
//         dbCon.query('DELETE FROM tb_category WHERE cateID = ?' , [cateID], (error, results, fields) => {
//             if (error) throw error;

//             let message = "";
//             if (results.affectedRows === 0){
//                 message = "category not found";
//             } else {
//                 message = " category successully deleted";
//             }

//             return res.send({ error: false, data: results, message: message})

//         })
//     }
// })

app.delete("/delete_category/:cateID",(req,res)=>{
    const {cateID} = req.params
    console.log(req.params)
    if (!cateID) {
        return res.status(400).send({error: true, message:"no id", status: 0})
    } else {
        dbCon.query('DELETE FROM tb_category WHERE tb_category.cateID = ?',[cateID],(error, results,fields)=>{
            try {
                if(error) throw error;
            return res.send({error:false,data:results,message:"success",staus:1})
            } catch (error) {
                
            }
        })
        
    }
})




//read table unit
app.get('/unit', (req,res) => {
    dbCon.query('select * from tb_unit', (error, results, fields) =>{
        if (error) throw error;

        let message =""
        if (results === undefined || results.lenght == 0){
            message = "unit table is empty";
        }else{
            message = "successfully retrive unit";
        }
        return res.send ({ error: false, data: results, message:message});
    })
})

//add unit 
app.post('/add_unit', (req,res) => {
    let unitName = req.body.unitName;

    if(!unitName){
        return res.status(400).send({error:true,message:"please provide unit name"})
    } else {
        dbCon.query('insert into tb_unit (unitName) values(?)', [unitName], (error, results, fields) => {
            if (error) throw error;
            return res.send ({error:false, data:results, message:"unit insert successfully"})
        })
    }
})


// edit unit
app.put('/unit_update', (req,res) => {
    let {unitID,unitName} = req.body;

    if(!unitID || !unitName){
        return res.status(400).send({ error: true, message:'please provide unit id'})
    } else{
       try {
        dbCon.query('update tb_unit set unitName = ? where unitID = ?', [unitName,unitID], (error, results, fields) => {
            if(error) throw error;

            let message =""
            if(results.changeRows === 0) {
                message = "unit name not found or data are same";
            } else {
                message = "unit name successfully updated";
            }
            return res.send({ error: false, data: results, message: message})
        })
       } catch (error) {
           
       }
    }

})



//delete unit 
app.delete('/unit_delete/:unitID', (req,res) => {
    const {unitID} = req.params;

    if(!unitID){
        return res.status(400).send({error: true, message:"please provide unit id"})
    } else {
        dbCon.query('delete from tb_unit where tb_unit.unitID = ?', [unitID], (error, results, fields) => {
            if(error) throw error;

            let message = ""
            if(results.affectedRows === 0){
                message = "unit not found";
            } else {
                message = " Delete unit successfully";
            }

            return res.send({error: false, data: results, message: message})
        })
    }
})


//show employee
app.get('/employee', (req,res) => {
    dbCon.query('SELECT * FROM tb_employee', (error, results, fields) => {
        if(error) throw error;

        let message = ""
        if(results === undefined || results.length == 0){
            message = "employee is empty";
        } else {
            message = "employee all retrieve";
        }

        return res.send({ error: false, data: results, message: message});
    })
})

// add employee 
app.post ('/add_employee', (req,res) => {
    let {emName,surname,date_of_birth,gender,address,tel,ID_card,user,password} = req.body;

    if(!emName || !surname || !date_of_birth || !gender || !address || !tel || !ID_card || !user || !password) {
        return res.status(200).send({error:true, message:"please provide employee information"})
    } else {
        dbCon.query('select user from tb_employee where user = ?', user, (error,results,fields) => {
            try {
                if (error) throw error;
                let message = ""
                if (results.length === 0) {
                    dbCon.query('insert into tb_employee (emName,surname,date_of_birth,gender,address,tel,ID_card,user,password) values (?,?,?,?,?,?,?,?,?)', [emName,surname,date_of_birth,gender,address,tel,ID_card,user,password] , (error, results, fields) => {
                        if(error) throw error;
                        message = "add employee successfully"
                        return res.send({error:false, data: results, message:message, status : 1})
                    })
                } else {
                    message = "add employee already exist"
                        return res.send({error:true, data: results, message:message, status : 0})
                }

            } catch (error) {
                
            }
        })

       
    }


})

// edit employee
app.put('/employee_edit',(req,res) => {
    
    let {emID,emName,surname,date_of_birth,gender,address,tel,ID_card,user,password} = req.body;
    console.log(req.body)

    if(!emID || !emName || !surname || !date_of_birth || !gender || !address || !tel || !ID_card || !user || !password) {
        return res.status(200).send({error: true, message: "please provide employee id"})
    } else {
        dbCon.query('update tb_employee set emName = ?, surname = ?, date_of_birth = ?, gender = ?, address = ?, tel = ?, ID_card = ?, user = ?, password = ? where emID = ?', [emName,surname,date_of_birth,gender,address,tel,ID_card,user,password,emID], (error, results, fields) => {
           try {
            if(error) throw error;

            let message = ""
            if(results.changeRows === 0){
                message = "employee not found";
            } else {
                message = "employee updated successfully"
            }
            return res.send({error: false, data: results, message:message})
            
           } catch (error) {
            
           }
        })
    }
})

//delete employee
app.delete('/employee_delete/:emID', (req,res) => {
    const {emID} = req.params;

    if(!emID){
        return res.status(200).send({erorr: true, message: " please provide employee id"})
    } else {
        dbCon.query('delete from tb_employee where tb_employee.emID = ?', [emID], (error, results, fields) => {
            if (error) throw error;

            let message = ""
            if(results.affectedRows === 0){
                message = "employee not found";
            } else {
                message = "Delete employee successfully"
            }
            return res.send({error: false, data: results, message:message})
        })
    }
})

// show supplier
// app.get('/supplier', (req,res) => {
//     dbCon.query('select * from tb_suppliers ', (error, results, fields) => {
//         if (error) throw error;
        
//         let message = ""
//         if(results == undefined || results.lenght === 0){
//             message = "table supllier is empty";
//         } else {
//             message = "successfully retreive supplier";
//         }
//         return res.send({error: false, data: results, message: message})
//     })
// })

app.get('/supplier', (req,res) => {
    dbCon.query('SELECT s.*, p.name_lao as province,d.name_lao as district,v.name_lao as village FROM tb_suppliers s INNER JOIN tb_province p ON s.id_province = p.id_province INNER JOIN tb_district d on s.id_district = d.id_district INNER JOIN tb_village v on s.id_village = v.id_village WHERE p.id_province = s.id_province and d.id_district = s.id_district and v.id_village = s.id_village ', (error, results, fields) => {
        if (error) throw error;
        
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "table supllier is empty";
        } else {
            message = "successfully retreive supplier";
        }
        return res.send({error: false, data: results, message: message})
    })
})

// add supplier 
app.post ('/add_supplier', (req,res) => {
    let {supName,id_village,id_district,id_province,tel} = req.body;
    console.log(req.body)
    if(!supName || !id_village || !id_district || !id_province || !tel ) {
        return res.status(200).send({error:true, message:"please provide supplier information"})
    } else {
        dbCon.query('insert into tb_suppliers (supName,id_village,id_district,id_province,tel) values (?,?,?,?,?)', [supName,id_village,id_district,id_province,tel] , (error, results, fields) => {
            if(error) throw error;
            return res.send({error:false, data: results, message:"supplier insert successfully"})
        })
    }
})

// edit supplier
app.put('/supplier_update',(req,res) => {
    let {supID,supName,id_village,id_district,id_province,tel} = req.body;

    if(!supID || !supName || !id_village || !id_district || !id_province || !tel ) {
        return res.status(200).send({error: true, message: "please provide supplier id"})
    } else {
        dbCon.query('update tb_suppliers set supName = ?, id_village = ?, id_district = ?, id_province = ?, tel = ? where supID = ?', [supName,id_village,id_district,id_province,tel,supID], (error, results, fields) => {
            if(error) throw error;

            let message = ""
            if(results.changeRows === 0){
                message = "supplier not found";
            } else {
                message = "supplier updated successfully"
            }
            return res.send({error: false, data: results, message:message})
        })
    }
})

//delete supplier
app.delete("/delete_supplier/:supID",(req,res)=>{
    const {supID} = req.params
    console.log(req.params)
    if (!supID) {
        return res.status(400).send({error: true, message:"no id", status: 0})
    } else {
        dbCon.query('DELETE FROM tb_suppliers WHERE tb_suppliers.supID = ?',[supID],(error, results,fields)=>{
            try {
                if(error) throw error;
            return res.send({error:false,data:results,message:"success",staus:1})
            } catch (error) {
                
            }
        })
    }
})
// show product
app.get('/product', (req,res) => {
    dbCon.query('SELECT *, tb_suppliers.supName FROM tb_product INNER JOIN tb_updateprice ON tb_product.productID = tb_updateprice.productID LEFT JOIN tb_suppliers ON tb_product.supID=tb_suppliers.supID INNER JOIN tb_category ON tb_product.cateID = tb_category.cateID INNER JOIN tb_unit ON tb_product.unitID = tb_unit.unitID WHERE tb_updateprice.status = 1 and pro_std = 0 order by tb_product.productID desc', (error, results, fields) => {
        if (error) throw error;
        
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "table product is empty";
        } else {
            message = "successfully retreive product";
        }
        return res.send({error: false, data: results, message: message})
    })
})

app.post ('/add_product', upload.single('image'),(req,res) => {
    let {product_code,cateID,unitID,supID,productName,buy_price,sell_price} = req.body;
    let image = req.file.filename;
    console.log(product_code,cateID,unitID,supID,productName)

    if( !product_code || !cateID || !unitID || !supID || !productName) {
        return res.status(200).send({error:true, message:"please provide product information"})
    } else {
        dbCon.query('select product_code from tb_product where product_code = ?', [product_code], (error,results,fields) =>{
            try {
                if (error) throw error;
                let message = ""
                if (results.length === 0){
                    dbCon.query('insert into tb_product (product_code,cateID,unitID,supID,productName,image) values (?,?,?,?,?,?)', [product_code,cateID,unitID,supID,productName, "http://localhost:3000/present/"+image] , (error, results, fields) => {
                    if(error) throw error;
                    dbCon.query('select max(productID) as productID from tb_product' , (error, results, fields) => {
                    if(error) throw error;
                    console.log(results[0].productID)
                    dbCon.query('insert into tb_updateprice (productID,buy_price,sell_price,status) values (?,?,?,1)', [results[0].productID,buy_price,sell_price], (error, results, fields) => {
                    if(error) throw error;
                        })
                    })
                })
                return res.send({error:false, data: results, message:"product insert successfully", status : 1})
                }else{
                    message = "this product_code is already exist";
                    return res.send({error : true, data: results, message:message, status : 0})
                }
                
            } catch (error) {
                
            }
        })
    } 
})

app.put('/edit_product', upload.single('image'), (req,res)=>{
    
    let {productID,cateID,unitID,supID,productName,Qty,buy_price,sell_price,description} = req.body;
    // console.log(req.body)
    console.log(req.file == null)

    if(!productID || !cateID || !unitID || !supID || !productName || !Qty || !buy_price || !sell_price ){
        return res.status(200).send({error:true, message:"please provide product ID"})
    }else{
       if (req.file != null) {
        let image = req.file.filename;
           console.log(image)
        try {
            dbCon.query('update tb_product set cateID = ?, unitID = ?, supID = ?, productName = ?, Qty = ?, image = ? where productID = ?', [cateID,unitID,supID,productName,Qty,"http://localhost:3000/present/"+image,productID], (error,results,fields) =>{
                if(error) throw error;
    
                let message = ""
                if(results.changeRows === 0){
                    message = "product not found";
                } else {
                    message = "product updated successfully"
                }
            })
            dbCon.query('update tb_updateprice set buy_price = ?, sell_price = ? where productID = ? and status = 1', [buy_price,sell_price,productID], (error,results,fields) =>{
                if(error) throw error;
    
                let message = ""
                if(results.changeRows === 0){
                    message = "product not found";
                } else {
                    message = "product updated successfully"
                }
                return res.send({error: false, data: results, message:message})
            })
        } catch (error) {
            
        }
       } else {
        console.log(" no image")
        try {
            dbCon.query('update tb_product set cateID = ?, unitID = ?, supID = ?, productName = ?, Qty = ? where productID = ?', [cateID,unitID,supID,productName,Qty,productID], (error,results,fields) =>{
                if(error) throw error;
    
                let message = ""
                if(results.changeRows === 0){
                    message = "product not found";
                } else {
                    message = "product updated successfully"
                }
            })
            dbCon.query('update tb_updateprice set buy_price = ?, sell_price = ? where productID = ? and status = 1', [buy_price,sell_price,productID], (error,results,fields) =>{
                if(error) throw error;
    
                let message = ""
                if(results.changeRows === 0){
                    message = "product not found";
                } else {
                    message = "product updated successfully"
                }
                return res.send({error: false, data: results, message:message})
            })
        } catch (error) {
            
        }
       }
    }
})

// app.delete("/delete_product/:productID",(req,res)=>{
//     const {productID} = req.params
//     console.log(req.params)
//     if (!productID) {
//         return res.status(400).send({error: true, message:"no id", status: 0})
//     } else {
//         dbCon.query('DELETE FROM tb_product WHERE tb_product.productID = ?',[productID],(error, results,fields)=>{
//             try {
//                 if(error) throw error;
//             return res.send({error:false,data:results,message:"success",staus:1})
//             } catch (error) {
                
//             }
//         })
//     }
// })

app.delete("/delete_product/:productID",(req,res)=>{
    const {productID} = req.params;
    console.log(req.params)
    if (!productID) {
        return res.status(400).send({error: true, message:"no id", status: 0})
    } else {
        dbCon.query('update tb_product set pro_std = 1 where productID = ?',[productID],(error, results,fields)=>{
            try {
                if(error) throw error;
            return res.send({error:false,data:results,message:"success",staus:1})
            } catch (error) {
                
            }
        })
        
    }
})


app.get('/province', (req,res) => {
    dbCon.query('select * from tb_province', (error, results, fields) => {
        if (error) throw error;
        
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "table province is empty";
        } else {
            message = "successfully retreive province";
        }
        return res.send({error: false, data: results, message: message})
    })
})

app.get('/district', (req,res) => {
    dbCon.query('select * from tb_district', (error, results, fields) => {
        if (error) throw error;
        
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "table district is empty";
        } else {
            message = "successfully retreive district";
        }
        return res.send({error: false, data: results, message: message})
    })
})

app.get('/village', (req,res) => {
    dbCon.query('select * from tb_village', (error, results, fields) => {
        if (error) throw error;
        
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "table village is empty";
        } else {
            message = "successfully retreive village";
        }
        return res.send({error: false, data: results, message: message})
    })
})

//insert tb_sale and tb_sakleDetail
app.post('/sale_and_saleDetail', (req,res)=>{
    let data=req.body.data;
    let emID=req.body.emID;
    let total_price = req.body.total_price;

    console.log('datalength',data.length)
    // dbCon.query('insert into tb_saledetail value')
    if(!emID || !data || !total_price){
        return res.status(200).send({error:true, message:"please provide employee ID"})
    }else{
        dbCon.query('insert into tb_sale (emID,total_price) values (?,?)', [emID,total_price] , (error, results, fields) => {
            if(error) throw error;
            dbCon.query('SELECT MAX(saleID) as saleID  FROM tb_sale',(error,results,fields)=>{
                if(error) throw error;
                // return res.send({error:false, data: results, message:"sale insert successfully"})
                for (let index = 0; index < data.length; index++) {
                    console.log(data[index])
                        dbCon.query('insert into tb_saledetail (saleID,productID,tkID,sale_qty) values (?,?,?,?)', [results[0].saleID,data[index].productID,data[index].tkID,data[index].Qty],(error,results,fields)=>{
                        if(error) throw error;
                            let updateStock = data[index].orQty - data[index].Qty
                        dbCon.query('update tb_product set Qty = ? where productID = ? ', [updateStock,data[index].productID], (error, results, fields) => {
                            if(error) throw error;
                            updateStock=0
                        })
                    })
                    
                }
                return res.send({error:false, data: results, message:"sale insert successfully"}) 
            })
        })
    }
})




app.post('/order', (req,res) => {
    let data = req.body;
    if (!data) {
        return res.status(200).send({error:true, message:"please provide sup ID"})
    } else {
        dbCon.query('insert into tb_order (supID) value (?)', [data[0].supID], (error, results, fields) => {
            if(error) throw error;

            dbCon.query('SELECT MAX(orderID) as orderID  FROM tb_order',(error,results,fields)=>{
                if(error) throw error;
                console.log('orderID',results[0].orderID)
                // console.log(data.length)
                for (let index = 0; index < data.length; index++) {
                    console.log(data[index])
                        dbCon.query('insert into tb_ordedetail (orderID,productID,buy_qty,price,sell_price) values (?,?,?,?,?)', [results[0].orderID,data[index].productID,data[index].buy_qty,data[index].buy_price,data[index].sell_price],(error,results,fields)=>{
                        if(error) throw error;
                    })
                }
                return res.send({error:false, data: results, message:"orderdetail insert successfully"})
        })
    })  
    }
})

app.post ('/sale', (req,res) => {
    let {emID} = req.body;
    console.log(req.body)
    
    if(!emID ) {
        return res.status(200).send({error:true, message:"please provide employee ID"})
    } else {
        dbCon.query('insert into tb_sale (emID) values (?)', [emID] , (error, results, fields) => {
            if(error) throw error;
            return res.send({error:false, data: results, message:"employee insert successfully"})
        })
    }
})

// app.post('/orderlist', (req,res)=>{
//     let {supID,productID,buy_qty,price} = req.body;
//     if(!supID || !productID || !buy_qty || !price) {
//         return res.status(200).send({error:true, message:"please provide supID"})
//     } else {
//         dbCon.query('insert into tb_orderlist (supID,productID,buy_qty,price) values (?,?,?,?)', [supID,productID,buy_qty,price], (error,results,fields) => {
//             if (error) throw error;
//             return res.send({error:false, data: results, message:"add item successfully"})
//         })
//     }
// })






app.get('/showProductName', (req, res) => {
    let id = req.query.id
    console.log(id)

    dbCon.query('select productName from tb_product where productID = '+id+'', (error, results, fields) => {
        if(error) throw error;

        let message = ""
        if (results === undefined || results.length == 0){
            message = "category table is empty";
        } else {
            message = "successfully retrieve category";
        }
        return res.send ({ error: false, data: results, message: message });
    })
})


// app.post('/order', (req,res) => {
//     // let {supID} = req.body[0];
//     // let token = crypto.Hash(date());
//     console.log(req.body)
//     if(!supID) {
//         return res.status(200).send({error:true, message:"please provide supID"})
//     } else {
//         dbCon.query('insert into tb_order (supID,token) values (?,?)', [supID,token], (error,results,fields) => {
//             if (error) throw error;
//             // return res.send({error:false, data: results, message:"add order successfully"})
//             dbCon.query('select * from tb_order where token = ?', token, (error, results, fields) =>{
//                 if (error) throw error;
//                 console.log(results)
//                 // dbCon.query('insert into tb_orderdetail (orderID,productID,buy_qty,buy_date) values (?,?,?,?,?)', [orderID,productID,price,buy_qty,buy_date], (error,results,fields) => {
//                 //     if (error) throw error;
//                 //     return res.send({error:false, data: results, message:"add order successfully"})
//                 // })
//             })
//         })  
//     }
// })



app.post('/login', (req,res) => {
    const {user,password} = req.body;
    if (!user || !password) {
        return res.status(200).send({error:true, message:"please provide email"})
    } else {
        dbCon.query("SELECT * FROM tb_employee WHERE user = ? AND password = ?", [user,password],(error,results, fields)=> {
            try {
                if (error) throw error;
                let message = ""
                if (results.length > 0) {
                    message = " login successfully"
                    return res.send({error:false, message:message, data:results, status: 1 })
                } else {
                    message = " login failed"
                    return res.send({error:true, message:message, data:results, status: 0 })
                }
            } catch (error) {
                
            }
        })
        // console.log("e y ka dai")
        // return res.send "e y ka dai"
    }
})


// app.get('/showOrderList', (req,res) => {
//     dbCon.query('SELECT o.*, p.productName as productName ,s.supName as supName FROM tb_orderlist o INNER JOIN tb_product p ON o.productID = p.productID INNER JOIN tb_suppliers s on o.supID = s.supID  WHERE o.supID = p.supID and o.productID = p.productID', (error, results, fields) => {
//         if (error) throw error;
        
//         let message = ""
//         if(results == undefined || results.lenght === 0){
//             message = "orderlist is empty";
//         } else {
//             message = "successfully retreive orderlist";
//         }
//         return res.send({error: false, data: results, message: message})
//     })
// })

app.get ('/showSale', (req,res) => {
    dbCon.query('SELECT s.*, e.emName as emName FROM tb_sale s INNER JOIN tb_employee e ON s.emID = e.emID WHERE s.emID = e.emID order by s.saleID desc', (error,results,fields) => {
        if (error) throw error;
        
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "tb_sale is empty";
        } else {
            message = "successfully retreive sale Data";
        }
        return res.send({error: false, data: results, message: message})
    })
})

app.get ('/showOutOfStock', (req,res) => {
    dbCon.query('SELECT p.*, s.supName as supName FROM tb_product p INNER JOIN tb_suppliers s ON p.supID = s.supID WHERE p.supID = s.supID order by p.productID desc', (error,results,fields) => {
        if (error) throw error;
        
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "product less than 5 is empty";
        } else {
            message = "successfully retreive out of stock Data";
        }
        return res.send({error: false, data: results, message: message})
    })
})



app.get ('/showOrderDetail', (req,res) => {
    let orderID = req.query.orderID;
    console.log(orderID);
    dbCon.query('SELECT tb_ordedetail.*,tb_order.supID,tb_order.status,tb_suppliers.supName,tb_product.productName,tb_product.product_code,tb_unit.unitName FROM tb_ordedetail INNER JOIN tb_order ON tb_ordedetail.orderID = tb_order.orderID LEFT JOIN tb_suppliers ON tb_order.supID = tb_suppliers.supID LEFT JOIN tb_product ON tb_ordedetail.productID = tb_product.productID LEFT JOIN tb_unit ON tb_product.unitID = tb_unit.unitID WHERE tb_ordedetail.orderID ='+orderID, (error,results,fields) => {
        if (error) throw error;
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "import Detail is empty";
        } else {
            message = "successfully retreive import Detail Data";
        }
        return res.send({error: false, data: results, message: message})
    })
})

app.get ('/showOrderDetail_report', (req,res) => {

    dbCon.query('SELECT tb_ordedetail.*,tb_order.supID,tb_order.status,tb_suppliers.supName,tb_product.productName FROM tb_ordedetail INNER JOIN tb_order ON tb_ordedetail.orderID = tb_order.orderID LEFT JOIN tb_suppliers ON tb_order.supID = tb_suppliers.supID LEFT JOIN tb_product ON tb_ordedetail.productID = tb_product.productID ', (error,results,fields) => {
        if (error) throw error;
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "import Detail is empty";
        } else {
            message = "successfully retreive import Detail Data";
        }
        return res.send({error: false, data: results, message: message})
    })
})

app.get ('/showSaleDetail', (req,res) => {
    let saleID = req.query.saleID;
    console.log(saleID);
    dbCon.query('SELECT tb_saledetail.*,tb_sale.emID,tb_sale.total_price,tb_employee.emName,tb_product.productName,tb_updateprice.sell_price FROM tb_saledetail INNER JOIN tb_sale ON tb_saledetail.saleID = tb_sale.saleID LEFT JOIN tb_employee ON tb_sale.emID = tb_employee.emID LEFT JOIN tb_product ON tb_saledetail.productID = tb_product.productID LEFT JOIN tb_updateprice ON tb_product.productID = tb_updateprice.productID WHERE tb_saledetail.tkID = tb_updateprice.tkID and tb_saledetail.saleID =' +saleID, (error,results,fields) => {
        if (error) throw error;
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "sale Detail is empty";
        } else {
            message = "successfully retreive sale Detail Data";
        }
        return res.send({error: false, data: results, message: message})
    })
})

app.get ('/showSaleDetail_report', (req,res) => {
    dbCon.query('SELECT tb_saledetail.*,tb_sale.emID,tb_sale.total_price,tb_employee.emName,tb_product.productName,tb_updateprice.sell_price FROM tb_saledetail INNER JOIN tb_sale ON tb_saledetail.saleID = tb_sale.saleID LEFT JOIN tb_employee ON tb_sale.emID = tb_employee.emID LEFT JOIN tb_product ON tb_saledetail.productID = tb_product.productID LEFT JOIN tb_updateprice ON tb_saledetail.tkID = tb_updateprice.tkID order by tb_sale.saleID desc', (error,results,fields) => {
        if (error) throw error;
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "sale Detail is empty";
        } else {
            message = "successfully retreive sale Detail Data";
        }
        return res.send({error: false, data: results, message: message})
    })
})

app.post('/date', (req,res) => {
    const date = req.body;
    dbCon.query('select * from tb_ordedetail WHERE month(buy_date) = ?', [date], (error,results,fields) =>{
        if (error) throw error;
        let message = ""
        if (results === undefined || results.length == 0){
            message = " table orderdetail is empty";
        } else {
            message = "successfully retrieve order";
        }
        return res.send ({ error: false, data: results, message: message });
    })
})

app.get('/showOrder', (req, res) => {
    dbCon.query('SELECT o.*,s.supName as supName FROM tb_order o INNER JOIN tb_suppliers s on o.supID = s.supID order by o.orderID desc', (error, results, fields) => {
        if(error) throw error;

        let message = ""
        if (results === undefined || results.length == 0){
            message = " table order is empty";
        } else {
            message = "successfully retrieve order";
        }
        return res.send ({ error: false, data: results, message: message });
    })
})

app.post('/importProduct', (req,res) => {
    let data = req.body.data;
    let emID = req.body.emID;
    console.log(req.body)
    if (!data || !emID) {
        return res.status(200).send({error:true, message:"please provide data"})
    } else {
        dbCon.query('insert into tb_import (orderID,supID,emID) values (?,?,?)', [data[0].orderID,data[0].supID,emID] , (error, results, fields) => {
            if(error) throw error;
            dbCon.query('SELECT MAX(importID) as importID  FROM tb_import',(error,results,fields)=>{
                if(error) throw error;

                for (let index = 0; index < data.length; index++) {
                    // console.log(data[index])
                    dbCon.query('insert into tb_importdetail (importID,productID,buy_qty,import_qty,buy_price,sell_price) values (?,?,?,?,?,?)', [results[0].importID,data[index].productID,data[index].buy_qty,data[index].import_qty,data[index].price,data[index].sell_price],(error,results,fields)=>{
                        if (error) throw error;
                    })
                    dbCon.query ('update tb_updateprice set status = 0 where productID = ? and status = 1', [data[index].productID] , (error, results, fields) => {
                        if(error) throw error;
                    })
                    dbCon.query('insert into tb_updateprice (productID,buy_price,sell_price,qty,status) values (?,?,?,?,1)', [data[index].productID,data[index].price,data[index].sell_price,data[index].buy_qty],(error,results,fields)=>{
                        if (error) throw error;
                    })
                    dbCon.query('update tb_product set Qty = Qty + ? where productID = ?', [data[index].import_qty,data[index].productID] , (error, results, fields) => {
                        if (error) throw error;
                    })
                    
                }
                dbCon.query('update tb_order set status = 1 where orderID = ?', [data[0].orderID] , (error, results, fields) => {
                    if (error) throw error;
                })
                
                return res.send({error:false, data: results, message:"import insert successfully", status:1}) 
            })
        })
           
        }
        
    }
)

app.get('/showImport', (req, res) => {
    dbCon.query('SELECT i.*,s.supName as supName, e.emName as emName FROM tb_import i INNER JOIN tb_suppliers s on i.supID = s.supID INNER JOIN tb_employee e ON i.emID = e.emID ', (error, results, fields) => {
        if(error) throw error;

        let message = ""
        if (results === undefined || results.length == 0){
            message = " table import is empty";
        } else {
            message = "successfully retrieve import";
        }
        return res.send ({ error: false, data: results, message: message });
    })
})

app.get ('/showImportDetail', (req,res) => {
    let importID = req.query.importID;
    console.log(importID);
    dbCon.query('SELECT tb_importdetail.*,tb_product.productName,tb_product.product_code FROM tb_importdetail INNER JOIN tb_import ON tb_importdetail.importID = tb_import.importID LEFT JOIN tb_product ON tb_importdetail.productID = tb_product.productID WHERE tb_importdetail.importID =' + importID, (error,results,fields) => {
        if (error) throw error;
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "sale Detail is empty";
        } else {
            message = "successfully retreive sale Detail Data";
        }
        return res.send({error: false, data: results, message: message})
    })
})

app.get ('/showImportDetail_qty', (req,res) => {
    let orderID = req.query.orderID;
    console.log(orderID);
    dbCon.query('SELECT tb_importdetail.*,tb_product.productName,tb_product.product_code FROM tb_importdetail INNER JOIN tb_import ON tb_importdetail.importID = tb_import.importID LEFT JOIN tb_product ON tb_importdetail.productID = tb_product.productID WHERE tb_import.orderID =' + orderID, (error,results,fields) => {
        if (error) throw error;
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "sale Detail is empty";
        } else {
            message = "successfully retreive sale Detail Data";
        }
        return res.send({error: false, data: results, message: message})
    })
})

app.get ('/showImportDetail_report', (req,res) => {
    dbCon.query('SELECT tb_importdetail.*,tb_product.productName,tb_product.product_code, tb_employee.emName FROM tb_importdetail INNER JOIN tb_import ON tb_importdetail.importID = tb_import.importID LEFT JOIN tb_product ON tb_importdetail.productID = tb_product.productID LEFT JOIN tb_employee ON tb_import.emID = tb_employee.emID', (error,results,fields) => {
        if (error) throw error;
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "sale Detail is empty";
        } else {
            message = "successfully retreive sale Detail Data";
        }
        return res.send({error: false, data: results, message: message})
    })
})

app.get('/showDate',(req,res) => {
    console.log
    dbCon.query('SELECT day(CURDATE()) FROM tb_sale', (error,results,fields) => {
        if (error) throw error;
        
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "tb_sale is empty";
        } else {
            message = "successfully retreive sale Data";
        }
        return res.send({error: false, data: results, message: message})
    })
})

app.get('/showEmployee', (req,res) => {
    dbCon.query('select * from tb_employee', (error,results,fields)=> {
        if (error) throw error;
        
        let message = ""
        if(results == undefined || results.lenght === 0){
            message = "tb_employee is empty";
        } else {
            message = "successfully retreive employee";
        }
        return res.send({error: false, data: results, message: message})
    })
})













app.use('/present', express.static('./image'));


app.listen(3000, () => {
console.log('node app is running');
})

module.exports = app;