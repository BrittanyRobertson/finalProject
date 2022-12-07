const express = require('express')
const router = express.Router()
const knex = require('../dbConnector')
// import {knex} from "../dbConnector";

router.use((req, res, next) => {
    next()
})

// Montly by default
router.get('/', async (request, response) => {

    const vacations = await knex.raw("select * from vacations;")
    const numRows = vacations.rows.length
    response.render('vacationsView', {data: {result: (vacations.rows), numRows : numRows}})
})

router.get('/view-trip', async (request, response) => {
    // console.log(request.query)

    const ID = request.query.ID == undefined ? 0 : request.query.ID;
    // fetch event where id
    const vacation = await knex.raw(`SELECT * FROM vacations WHERE vacationid =` + ID )
    //parse
    const item = vacation.rows[0]
    // console.log((event))
    const placeHolder = {
        destination: item.destination,
        days: item.mindays,
        cost: item.approxcost,
        notes: item.notes,
        id :ID
    }
    response.render('viewTrip', {data: placeHolder})
})

router.get('/update-trip/_update', async (request, response) => {
    // console.log(request.query)
    // Make update
    await knex.raw(`update vacations 
    set destination = \'` + request.query.dest + `\',
    mindays = \'` + request.query.days + `\', 
    approxcost = \'` + request.query.cost + `\', 
    notes = \'` + request.query.notes + `\'
    where vacationid = ` + request.query.id + `;`)
    //render view
    response.redirect('/tables/');
})

router.get('/update-trip', async (request, response) => {
    const ID = request.query.ID;
    const event = await knex.raw('select * from vacations where vacationid = ' + ID)
    const item = event.rows[0]
    // console.log(event)
    const eventObj = {
        destination: item.destination,
        days: item.mindays,
        cost: item.approxcost,
        notes: item.notes,
        id :item.vacationid
    }
    // console.log(JSON.stringify({data: eventObj}))
    response.render('updateTripForm', {data : eventObj})
})

// Logic for adding new event from form
//http://localhost:3000/vacation/new-event/_add?name=ev&contributor=br&startDate=2022-11-01&start=3&end=4
router.get('/new-trip/_add', async (request, response) => {
    // Our id gets auto gened here
    const dest = request.query.dest;
    const days = request.query.days;
    const cost = request.query.cost;
    const notes = request.query.notes;
    // craft insert statement
    await knex.raw(`insert into vacations (destination, approxcost,mindays,notes) values (\'` + dest + `\',` + cost.toString() + `,` + days.toString() + `,\'` + notes + `\');`)

    // fetch new id
    const trips = await knex.raw('select vacationid from vacations;')
    let lastID = trips.rows[trips.rows.length-1].vacationid
    // send us to view
    response.redirect('/tables/');
})

router.get('/new-trip', (request, response) => {
    response.render('newTripForm')
})

router.get('/delete-trip', async (request, response) => {
    const ID = request.query.ID
    await knex.raw(`DELETE FROM vacations WHERE vacationid = ` + ID + `;`)
    // Take us to root
    response.redirect('/tables/');

})

module.exports = router