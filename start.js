'use strict'

const app = require('./app');
const express = require('express');

const port =  process.env.PORT || 3001;

app.use(express.static('views/images'));
app.use(express.static('views/css'));
app.use(express.static('views/js'));
app.use(express.static('views/ajax'));

const server = app.listen(port, () => {
	console.log('Ready');
});