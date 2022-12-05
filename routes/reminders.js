const express = require('express')
const router = express.Router()
const knex = require('../dbConnector')
// import {knex} from "../dbConnector";

router.use((req, res, next) => {
    next()
})

// Montly by default
router.get('/', async (request, response) => {
    response.render('reminders')
})

module.exports = router