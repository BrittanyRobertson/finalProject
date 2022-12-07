const express = require('express')
const router = express.Router()
const knex = require('../dbConnector')
// import {knex} from "../dbConnector";

router.use((req, res, next) => {
    next()
})

function monthFromNow() {
    let currentDate = new Date()
    currentDate = currentDate.setMonth(currentDate.getMonth() + 1)
    return currentDate
}

function weekFromNow() {
    let currentDate = new Date()
    currentDate = currentDate.setDate(currentDate.getDate() + 7)
    return currentDate
}

function formatDate(desiredDate) {
    // Get the date into the yyyy-mm-dd format for postgres
    return new Date(desiredDate).toISOString().split('T')[0]
}

// Montly by default
router.get('/', async (request, response) => {
    // let current = new Date()
    const searchDate = formatDate(monthFromNow())
    const currentDate = formatDate(new Date())
    const event = await knex.raw("select * from events where eventdate <= \'"+searchDate +"\' and eventdate >= \'"+ currentDate+"\';")
    const numRows = event.rows.length
    response.render('calendarMonthlyView', {data: {result: (event.rows), numRows : numRows}})
})

router.get('/monthly', async (request, response) => {
    const searchDate = formatDate(monthFromNow())
    const currentDate = formatDate(new Date())
    const event = await knex.raw("select * from events where eventdate <= \'"+searchDate +"\' and eventdate >= \'"+ currentDate+"\';")
    const numRows = event.rows.length
    response.render('calendarMonthlyView', {data: {result: (event.rows), numRows : numRows}})
})

router.get('/weekly', async (request, response) => {
    const searchDate = formatDate(weekFromNow())
    const currentDate = formatDate(new Date())
    const result = await knex.raw("select * from events where eventdate <= \'"+searchDate +"\' and eventdate >= \'"+ currentDate+"\';")
    const numRows = result.rows.length
    response.render('calendarWeeklyView', {data: {result: (result.rows), numRows : numRows}})
})

router.get('/view-event', async (request, response) => {
    // console.log(request.query)

    const ID = request.query.ID == undefined ? 0 : request.query.ID;
    // fetch event where id
    const event = await knex.raw(`SELECT * FROM events WHERE eventid =` + ID )
    //parse
    const item = event.rows[0]
    // console.log((event))
    const placeHolder = {
        name: item.eventname,
        date: item.eventdate,
        contributor: item.contributorname,
        start: item.eventstarttime,
        end: item.eventendtime,
        id :ID
    }
    response.render('viewEvent', {data: placeHolder})
})

router.get('/update-event/_update', async (request, response) => {
    // console.log(request.query)
    // Make update
    await knex.raw(`update events 
    set eventname = \'` + request.query.name + `\',
    eventdate = \'` + request.query.startDate + `\', 
    contributorname = \'` + request.query.contributor + `\', 
    eventstarttime = \'` + request.query.start + `\', 
    eventendtime = \'` + request.query.end + `\' 
    where eventid = ` + request.query.id + `;`)
    //render view
    const placeHolder = {
        name: request.query.name,
        date: request.query.startDate,
        contributor: request.query.contributor,
        start: request.query.start,
        end: request.query.end,
        id :request.query.id
    }
    response.render('calendarMonthlyView', {data: placeHolder})
})

router.get('/update-event', async (request, response) => {
    const ID = request.query.ID;
    const event = await knex.raw('select * from events where eventid = ' + ID)
    // console.log(event)
    const eventObj = {
        name: String(event.rows[0].eventname).slice(0),
        startDate: String(formatDate(event.rows[0].eventdate).slice(0)),
        contributor: String(event.rows[0].contributorname).slice(0),
        start: String(event.rows[0].eventstarttime).slice(0),
        end: String(event.rows[0].eventendtime).slice(0),
        id: ID
    }
    // console.log(JSON.stringify({data: eventObj}))
    response.render('updateEventForm', {data : eventObj})
})

// Logic for adding new event from form
//http://localhost:3000/calendar/new-event/_add?name=ev&contributor=br&startDate=2022-11-01&start=3&end=4
router.get('/new-event/_add', async (request, response) => {
    // query to find out how many total events we have to find new ID
    const eventCount = await knex.raw(`select eventid from events order by eventid asc`)
    // console.log(eventCount.rowCount)
    // console.log((eventCount.rows[eventCount.rowCount - 1].eventid))
    const newID = (eventCount.rows[eventCount.rowCount - 1].eventid) + 1
    const name = request.query.name;
    const contributor = request.query.contributor;
    const startDate = request.query.startDate;
    // formatted for postgres
    const start = request.query.start + ':00';
    const end = request.query.end + ':00';
    // craft insert statement
    await knex.raw(`INSERT INTO events VALUES (` + newID.toString() + `,\'` + name + `\',\'` + startDate + `\',\'` + start + `\',\'` + contributor + `\',\'` + end + `\')`)
    // send us to view
    const placeHolder = {
        id: newID,
        name: name,
        date: startDate,
        contributor: contributor,
        start: start,
        end: end
    }
    response.render('calendarMonthlyView', {data: placeHolder})
})

router.get('/new-event', (request, response) => {
    response.render('newEventForm')
})

router.get('/delete-event', async (request, response) => {
    const ID = request.query.ID
    await knex.raw(`DELETE FROM events WHERE eventid = ` + ID + `;`)
    // Take us to root
    const searchDate = formatDate(monthFromNow())
    const currentDate = formatDate(new Date())
    const event = await knex.raw("select * from events where eventdate <= \'"+searchDate +"\' and eventdate >= \'"+ currentDate+"\';")
    const numRows = event.rows.length
    response.render('calendarMonthlyView', {data: {result: (event.rows), numRows : numRows}})

})

module.exports = router