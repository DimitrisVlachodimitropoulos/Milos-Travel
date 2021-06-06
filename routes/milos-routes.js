'use strict'
const express = require('express');
const router = express.Router();
const milosController = require('../controller/milos-controller'); 

router.get('/',(req,res)=>{res.redirect("/home")});

router.get('/home',milosController.loadHome);

router.get("/logout",milosController.logout);

router.get('/login',milosController.getLogin);

router.get('/register',milosController.getRegister);

router.get('/paralies',milosController.getParalies);

router.get('/food',milosController.getParalies);

router.get('/stay',milosController.getParalies);

router.get('/ancient',milosController.getParalies);

router.get('/pick:sth',milosController.getArticle);

router.get('/delete:sth',milosController.deleteArticle);

router.get('/removecomment:sth',milosController.deleteComment);

router.get('/userinfo',milosController.loadUser);

router.get('/insert',milosController.loadinsert);

router.get('/rate_topic:sth',milosController.addRating);

router.post('/insert',milosController.insertArticle);

router.post('/userinfo',milosController.updateUser);

router.post('/login',milosController.login);

router.post('/register',milosController.register);

router.post('/sight:sth',milosController.insertcomments);

router.post('/newadmin',milosController.makeadmin);








// router.get('/article/:sight_id',milosController.getHome)


module.exports = router;