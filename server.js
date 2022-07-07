let express = require ('express');
let app = express();
let multer = require ('multer');
let bodyParser = require('body-parser');
let cors = require('cors');
let mysql = require ('mysql');
const req = require('express/lib/request');
const crypto = require('crypto');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({ origin:[ 'http://localhost:4200', 'http://localhost:3000']}));


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

    dbCon.query('SELECT * FROM tb_product WHERE productName like "%' + keyword + '%"', (error, results, fields) => {
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
        dbCon.query('insert into tb_employee (emName,surname,date_of_birth,gender,address,tel,ID_card,user,password) values (?,?,?,?,?,?,?,?,?)', [emName,surname,date_of_birth,gender,address,tel,ID_card,user,crypto.createHash('md5').update(password).digest('hex')] , (error, results, fields) => {
            if(error) throw error;
            return res.send({error:false, data: results, message:"employee insert successfully"})
        })
    }


})

// edit employee
app.put('/employee_edit',(req,res) => {
    
    let {emName,surname,date_of_birth,gender,address,tel,user,password} = req.body;

    if(!emName || !surname || !date_of_birth || !gender || !address || !tel || !user || !password) {
        return res.status(200).send({error: true, message: "please provide employee id"})
    } else {
        dbCon.query('update tb_employee set emName = ?, surname = ?, date_of_birth = ?, gender = ?, address = ?, tel = ?, user = ?, password = ? where emID = ?', [emName,surname,date_of_birth,gender,address,tel,user,password], (error, results, fields) => {
            if(error) throw error;

            let message = ""
            if(results.changeRows === 0){
                message = "employee not found";
            } else {
                message = "employee updated successfully"
            }
            return res.send({error: false, data: results, message:message})
        })
    }
})

//delete employee
app.delete('/employee_delete', (req,res) => {
    let id = req.body.id;

    if(!id){
        return res.status(200).send({erorr: true, message: " please provide employee id"})
    } else {
        dbCon.query('delete from tb_employee where emID = ?', [id], (error, results, fields) => {
            if (error) throw error;

            let message = ""
            if(results.affectedRows === 0){
                message = "employee not found";
            } else {
                message = "Delete employee successfully"
            }
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
    dbCon.query('select * from tb_product', (error, results, fields) => {
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
    let {cateID,unitID,supID,productName,Qty,buy_price,sell_price,description} = req.body;
    let image = req.file.filename;
    console.log(cateID,unitID,supID,productName,Qty,buy_price,sell_price,description)

    if(!cateID || !unitID || !supID || !productName || !Qty || !buy_price || !sell_price  ) {
        return res.status(200).send({error:true, message:"please provide product information"})
    } else {
        dbCon.query('insert into tb_product (cateID,unitID,supID,productName,Qty,buy_price,sell_price,image,description) values (?,?,?,?,?,?,?,?,?)', [cateID,unitID,supID,productName,Qty,buy_price,sell_price, "http://localhost:3000/present/"+image,description] , (error, results, fields) => {
            if(error) throw error;
            return res.send({error:false, data: results, message:"product insert successfully"})
        })
    } 
})

app.put('/edit_product', upload.single('image'), (req,res)=>{
    
    let {productID,cateID,unitID,supID,productName,Qty,buy_price,sell_price,description} = req.body;
    
    console.log(req.file)

    if(!productID ||!cateID || !unitID || !supID || !productName || !Qty || !buy_price || !sell_price ){
        return res.status(200).send({error:true, message:"please provide product ID"})
    }else{
       if (req.file) {
        let image = req.file.filename;
           console.log(image)
        try {
            dbCon.query('update tb_product set cateID = ?, unitID = ?, supID = ?, productName = ?, Qty = ?, buy_price = ?, sell_price = ?, image = ? where productID = ?', [cateID,unitID,supID,productName,Qty,buy_price,sell_price,"http://localhost:3000/present/"+image,productID], (error,results,fields) =>{
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
            dbCon.query('update tb_product set cateID = ?, unitID = ?, supID = ?, productName = ?, Qty = ?, buy_price = ?, sell_price = ? where productID = ?', [cateID,unitID,supID,productName,Qty,buy_price,sell_price,productID], (error,results,fields) =>{
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

app.delete("/delete_product/:productID",(req,res)=>{
    const {productID} = req.params
    console.log(req.params)
    if (!productID) {
        return res.status(400).send({error: true, message:"no id", status: 0})
    } else {
        dbCon.query('DELETE FROM tb_product WHERE tb_product.productID = ?',[productID],(error, results,fields)=>{
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
// app.post('/sale_and_saleDetail',(res,req)=>{
//     let emID,saleID,productID,sale_qty = req.body;
//     if(!emID || !saleID){
//         return res.status(200).send({error:true, message:"please provide emID"})
//     }else{
//         try {
//             dbCon.query('insert into tb_sale (emID) values (?)', [emID],(error,results,fields)=>{
//                 if(error) throw error;
//                 return res.send({error: false, data: results, message: message})
//             })
            
//         } catch (error) {
            
//         }
//     }
//     if (!saleID || !productID || !sale_qty){
//         return res.status(200).send({error:true, message:"please provide saleID or productID"})
//     }else{
//         try {
//             dbCon.query('insert into tb_saledetail (saleID,productID,sale_qty) values (?,?,?)',[saleID,productID,sale_qty],(error,results,fields)=>{
//                 if(error) throw error;
//                 return res.send({error: false, data: results, message:message})
//             })
            
//         } catch (error) {
            
//         }
//     }
// })

app.post ('/sale', (req,res) => {
    let {emID} = req.body;
    
    if(!emID ) {
        return res.status(200).send({error:true, message:"please provide employee ID"})
    } else {
        dbCon.query('insert into tb_sale (emID) values (?)', [emID] , (error, results, fields) => {
            if(error) throw error;
            return res.send({error:false, data: results, message:"employee insert successfully"})
        })
    }
})

app.post('/login', (req,res) => {
    const {user,password} = req.body;
    if (!user || !password) {
        return res.status(200).send({error:true, message:"please provide email"})
    } else {
        dbCon.query("SELECT * FROM tb_employee WHERE user = ? AND password = ?", [user,password],(error,results, fields)=> {
            if(error) throw error;
            console.log(results)
            return res.send({error:false, data: results, message:"you're logged in",status:1})
        })
    }

})



app.use('/present', express.static('./image'));


app.listen(3000, () => {
console.log('node app is running');
})

module.exports = app;