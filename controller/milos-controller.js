const path = require('path');
const model = require('../model/paralies-model.js');
const bcrypt = require("bcryptjs");
const fs = require("fs");
const sql = require('./db.heroku-pg.js');
const { send } = require('process');


//Does not let logged in user acces login page
exports.getLogin = (req, res) => {
    if(req.session.isAuth){
        res.redirect("/home")
    }
    else{
        res.render('login')
    }
}
//Does not let logged in user acces register page
exports.getRegister = (req, res) => {
    if(req.session.isAuth){
        res.redirect("/home")
    }
    else{
        res.render('register')
    }
}

//Loads home page and checks is user is logged in and if so sends users data
exports.loadHome = (req,res) => {
    const urls = req.originalUrl.split('/');
    const path=urls[urls.length-1];
   
    if(req.session.isAuth){
        email = req.session.user.email;
        username = req.session.user.username;
        admin = req.session.user.admin;
        data = {email:email,username:username,admin:admin};
        console.log(req.session.user.email);
        res.render(path,data);
    }
    else(
        res.render(path)
    )
}

exports.loadinsert = (req,res) => { 
    // console.log(req.session.user.length); 
    if(!req.session.isAuth){
        res.redirect('/')
    }
    else{
    const email = req.session.user.email;
    sql.query('SELECT * FROM users WHERE email = $1', [email], async (error,results) =>{
        const data = results.rows;
        if(data[0].role=="admin"){
            const email = req.session.user.email;
            const username = req.session.user.username;
            const admin = req.session.user.admin;
            const data = {email:email,username:username,admin:admin};
            res.render('insert',data)
        }
        else{
            res.redirect('/')
        }
    })}
}
//Loads the 4 categories of articles and send to the client user information and info about the articles
// of the chosen type.
exports.getParalies = async(req, res) => {
    const urls = req.originalUrl.split('/');
    const goodpath=urls[urls.length-1];
    const path = goodpath;
    const loggeduser = {};
   
    sql.query('SELECT * FROM public.sights WHERE sight_type = $1',[path],async(error,results) =>{
        var data = JSON.stringify(results.rows);
        if(req.session.isAuth){
            email = req.session.user.email;
            username = req.session.user.username;
            admin = req.session.user.admin;
            const parsething = {object:JSON.parse(data),email:email,username:username,admin:admin};
            return res.render(path + '.hbs', parsething);
        }
        else{
            const parsething = {object:JSON.parse(data)};
            return res.render(path + '.hbs', parsething);
        }      
     })
}
//Loads an article's information from the database and sends it to the client along with user i
exports.getArticle = async(req,response) =>{
    // var urls = req.originalUrl;
    // var path = urls.substring(5);
    const path = req.params.sth;
    sql.query('SELECT * FROM sights WHERE sight_id = $1',[path],async(error,results) =>{
        var data1 = JSON.stringify(results.rows);
        
        sql.query('SELECT * FROM photos WHERE sight_id = $1',[path],async(error,result) =>{
            var data2 = JSON.stringify(result.rows)

            sql.query('SELECT * FROM comments WHERE sight_id = $1',[path],async(error,result) =>{
            var data3 = JSON.stringify(result.rows)

                sql.query('SELECT * FROM ratings WHERE sight_id = $1',[path],async(err,ratingss) =>{
                    const data4 = ratingss.rows
                    var sum =0 ;
                    // console.log(data4);
                    for(i=0;i<data4.length;i=i+1){
                        sum = sum+data4[i].rating;
                        // console.log(sum);
                    }
                    sum=sum/data4.length;
                    // console.log(sum);

                    stringsum = sum.toString()
                    if(req.session.isAuth){
                        email = req.session.user.email;
                        username = req.session.user.username;
                        admin = req.session.user.admin;
                        const parsedata = {sights:JSON.parse(data1),photos:JSON.parse(data2),comments:JSON.parse(data3),rating:stringsum,email:email,username:username,admin:admin};
                        console.log(parsedata);
                       
                        response.render('article',parsedata);
                    }
                    else{
                        const parsedata = {sights:JSON.parse(data1),photos:JSON.parse(data2),comments:JSON.parse(data3),rating:stringsum};
                        console.log(parsedata);
                       
                        response.render('article',parsedata);
                    }
                })
            })
        })  
    })  
}
//Registers the user's information to the databse and warns with messages for not meeting the requirments
// for the completion of the registration. Also hashes the passwords for better sequrity of personal data
exports.register= (req,result) =>{
    const {name,surname,email,password,passwordConfirm} = req.body;

    sql.query('SELECT email FROM users WHERE email = $1',[email],async (error,results) =>{
        if(error){
            console.log(error);
        }
        const data = results.rows;

        if(data.length > 0 ){
            return result.render('register',{
                message:'That email is already in use.'
            })
        } else if( password !== passwordConfirm){
            return result.render('register',{
                message:'Passwords do not match.'
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        // console.log(hashedPassword);

        const query = {
            text: 'INSERT INTO users (name,surname,email,password,role) VALUES ($1,$2,$3,$4,$5)',
            values: [name,surname,email,hashedPassword,"basic"],
        }

        sql.query(query, (error,res) =>{
            if(error){
                console.log(error);
            }
            else {
                return result.render('register',{
                    message:'User registered please Login.'
                })
            }
        })
    });  
}
//Log's in the user as long as the input email matches the input password.
//The password cheching is made by  bcrypt so that user passwords never acces the system.
exports.login = async (req,res) => {
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).render('login',{
            message: 'Provide email and password'
        })
    }

    sql.query('SELECT * FROM users WHERE email = $1', [email], async (error,results) =>{
        const data = results.rows;

        if(!data.length || !(await bcrypt.compare(password, data[0].password)) ){
            res.status(401).render('login',{
                message:'Email or Password is incorrect.'
            })
        } else{
            req.session.isAuth = true;
            const username = data[0].name+' '+data[0].surname;
            if(data[0].role=="admin"){
                req.session.user = {email:email,username:username,admin:"admin"};
            }
            else{
                req.session.user = {email:email,username:username};
            }
            res.status(200).redirect('/');
        }
    })  
}

//Destroys the session thus ending the user info 
exports.logout = (req,res) =>{
    req.session.destroy((err) =>{
        if(err){
            throw err
        }
        res.redirect('/');
    })
}
//
exports.insertArticle = async (req,res) => {
    console.log(req.body);
    const {sight_name,sight_type,service_email,service_phone,location,photo_src,sight_text} = req.body;
    console.log(sight_name,sight_type,service_email,service_phone,location,photo_src,sight_text);

    sql.query('SELECT sight_name FROM sights WHERE sight_name = $1',[sight_name],async (error,results) =>{
        if(error){
            console.log(error);
        }
        const data = results.rows;

        if(data.length > 0 ){
            return res.render('insert',{
                message:'Article with that name already exists.'
            })
        } else {
            console.log("tha eprepe na bei");
            const query = {
                text: 'INSERT INTO sights (sight_name,location,service_email,service_phone,sight_type,photo_src,sight_text) VALUES ($1,$2,$3,$4,$5,$6,$7)',
                values: [sight_name,location,service_email,service_phone,sight_type,photo_src,sight_text],
            }
            sql.query(query, (error,results) =>{
                console.log("den ginetai an mhn bhke")
                return res.render('insert',{
                    message:'New article added.'
                })

            })
        }
        })

}

exports.updateUser = async (req,res) =>{
    console.log(req.body);
    console.log(req.session.user);
    if(!req.session.isAuth){
        res.redirect('/')
    }
    const name = req.body.name;
    const surname = req.body.surname;
    const email =req.body.email;
    const password =req.body.password;
    let hashedPassword = await bcrypt.hash(password, 8);
    sql.query('SELECT * FROM users WHERE email = $1', [email], async (error,results) =>{
        const data = results.rows;
        const user_id = data[0].user_id

    const namequery = {
        text: 'UPDATE users SET name = $1 WHERE user_id = $2',
        values: [name,user_id],
    }
    const surnamequery = {
        text: 'UPDATE users SET surname = $1 WHERE user_id = $2',
        values: [surname,user_id],
    }
    const emailquery = {
        text: 'UPDATE users SET email = $1 WHERE user_id = $2',
        values: [email,user_id],
    }
    const passwordquery = {
        text: 'UPDATE users SET password = $1 WHERE user_id = $2',
        values: [hashedPassword,user_id],
    }
    sql.query(namequery, async (error,results) =>{
        sql.query(surnamequery, async (error,results) =>{
            sql.query(emailquery, async (error,results) =>{
                if(password == ""){
                    return res.redirect('/userinfo')
                }
                else{
                    sql.query(passwordquery, async (error,results) =>{
                        var data = JSON.stringify(results.rows);
                        const parsedata = JSON.parse(data);
                        return res.redirect('/userinfo');
                    })
                }
                }) 
            })  
        }) 
    }) 
}

exports.loadUser = (req,res) =>{
    if(!req.session.isAuth){
        res.redirect('/')
    }
    const email = req.session.user.email;
    sql.query('SELECT * FROM users WHERE email = $1', [email], async (error,results) =>{
        var data = JSON.stringify(results.rows);
        const parsedata = JSON.parse(data);
        if(!req.session.user.admin){
            return res.render('userinfo',{userdata:parsedata});

        }
        else{
            return res.render('userinfo',{userdata:parsedata,admin:"admin"});

        }

    })    
}

//
exports.deleteComment = (req,res) => {
    const path = req.params.sth;
    if(req.session.isAuth && req.session.user.admin){
        sql.query('SELECT * FROM comments WHERE comment_id = $1',[path],async(error,results) =>{
            const sight_id = results.rows[0].sight_id;
            sql.query('DELETE FROM comments WHERE comment_id = $1',[path],async(error,results) =>{
                return res.redirect('/pick'+sight_id);
            })
        })
    }   
}

exports.deleteArticle = (req,res) => {
    const path = req.params.sth;
    if(req.session.isAuth && req.session.user.admin){
        sql.query('DELETE FROM comments WHERE sight_id = $1',[path],async(error,results) =>{
            sql.query('DELETE FROM photos WHERE sight_id = $1',[path],async(error,results) =>{
                sql.query('DELETE FROM sights WHERE sight_id = $1',[path],async(error,results) =>{

                })
            })
        })
    }  
    res.redirect('/',); 

}

//
exports.insertcomments= async (req,res) =>{
    
    if(!req.session.isAuth){
        return res.status(402).render("login",{
            message:'Please Login in to write a comment.'
        })
    }
    
    const sight_id = req.params.sth;
    const comment = req.body.comment;
    const email = req.session.user.email
    var d = new Date();
    const timestamp = d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()+" "+d.getHours()+':'+d.getMinutes()+":"+d.getSeconds();
 
    const query = {
        text: 'INSERT INTO comments (comment,datetime,user_email,sight_id) VALUES ($1,$2,$3,$4)',
        values: [comment,timestamp,email,sight_id],
    }

    sql.query(query, (error,result) =>{
        console.log("new comment")
        if(error){
            console.log(error);
        }
        else {
            res.status(200).redirect("/pick"+sight_id);
        }
    })
}

exports.addRating= async (req,res) =>{
    
    if(!req.session.isAuth){
        return res.status(402).render("login",{
            message:'Please Login in to rate and article.'
        })
    }
    
    const extra = req.params.sth;
    const sight_id = extra.substring(1);
    const rating = extra.charAt(0);
    const email = req.session.user.email
    sql.query('SELECT user_email FROM ratings WHERE user_email = $1',[email],async (error,results) =>{
        if(error){
            console.log(error);
        }
        const data = results.rows;
        console.log(data);

        if(data.length > 0 ){
            const query = {
                text: 'UPDATE ratings SET rating = $1 WHERE user_email = $2',
                values: [rating,email],
            }
            sql.query(query, (error,result) =>{
                if(error){
                    console.log(error);
                }
                else {
                    res.status(200).redirect("/pick"+sight_id);
                }
            })  
        } 
        else {
            const query = {
                text: 'INSERT INTO ratings (sight_id,rating,user_email) VALUES ($1,$2,$3)',
                values: [sight_id,rating,email],
            }
            sql.query(query, (error,result) =>{
                console.log("new rating")
                if(error){
                    console.log(error);
                }
                else {
                    res.status(200).redirect("/pick"+sight_id);
                }
            })
        }
    })
}

//An admin can choose other members via their email and promote them to the admin role
exports.makeadmin = async(req,res) =>{
    const {email} = req.body;
    sql.query('SELECT * FROM users WHERE email = $1',[email],async (error,results) =>{
        const data = results.rows;
        if(data[0].role=="basic"){
            const query = {
                text: 'UPDATE users SET role = $1 WHERE email = $2',
                values: ['admin',email],
            }
            sql.query(query, (error,result) =>{
                if(error){
                    console.log(error);
                }
                else {
                    res.status(200).redirect("/userinfo");
                }
            }) 
        }
         else{
            return res.status(402).redirect("/home");
         }
    })
}