const express = require('express')
const router = express.Router()
const knex = require('../dbConnector')
// import {knex} from "../dbConnector";

router.use((req, res, next) => {
    next()
})

router.get('/', async (request, response) => {
    const familyreading = await knex.raw("select * from familyreading;")
    const rows = familyreading.rows.length
    response.render('readingsView', {data: {result: (familyreading.rows), rows : rows}})
})

router.get('/view-book', async (request, response) => {
    // console.log(request.query)

    const ID = request.query.ID == undefined ? 0 : request.query.ID;
    // fetch event where id
    const reading = await knex.raw(`SELECT * FROM familyreading WHERE scriptureid =` + ID )
    //parse
    const item = reading.rows[0]
    // console.log((event))
    const placeHolder = {
        scripturebook: item.scripturebook,
        book: item.book,
        chapter: item.chapter,
        id : ID
    }
    response.render('viewBook', {data: placeHolder})
})

router.get('/update-book/_update', async (request, response) => {
    // console.log(request.query)
    // Make update
    await knex.raw(`update familyreading 
    set scripturebook = \'` + request.query.scripturebook + `\',
    book = \'` + request.query.book + `\', 
    chapter = \'` + request.query.chapter + `\' 
    where scriptureid = ` + request.query.id + `;`)
    //render view
    const placeHolder = {
        scripturebook: request.query.scripturebook,
        book: request.query.book,
        chapter: request.query.chapter,
        id :request.query.id
    }
    const familyreading = await knex.raw("select * from familyreading;")
    const rows = familyreading.rows.length
    response.render('readingsView', {data: {result: (familyreading.rows), rows : rows}})
})

router.get('/update-book', async (request, response) => {
    const ID = request.query.ID;
    const event = await knex.raw('select * from familyreading where scriptureid = ' + ID)
    const item = event.rows[0]
    // console.log(event)
    const eventObj = {
        scripturebook: item.scripturebook,
        book: item.book,
        chapter: item.chapter,
        id :item.scriptureid
    }
    // console.log(JSON.stringify({data: eventObj}))
    response.render('updateBookForm', {data : eventObj})
})

// Logic for adding new event from form
router.get('/new-book/_add', async (request, response) => {
    // Our id gets auto gened here
    const scripturebook = request.query.scripturebook;
    const book = request.query.book;
    const chapter = request.query.chapter;
    // craft insert statement
    await knex.raw(`insert into familyreading (scripturebook, book, chapter) values (\'` + scripturebook + `',\'` + book + `',` + chapter.toString() + `\);`)


    // fetch new id
    const books = await knex.raw('select scriptureid from familyreading;')
    let lastID = books.rows[books.rows.length-1].scriptureid
    // send us to view
    const placeHolder = {
        scripturebook: scripturebook,
        book: book,
        chapter: chapter,
        scriptureid :lastID
    }
    const familyreading = await knex.raw("select * from familyreading;")
    const rows = familyreading.rows.length
    response.render('viewBook', {data: {result: (familyreading.rows), rows : rows}})
})

router.get('/new-book', (request, response) => {
    response.render('newReading')
})

router.get('/delete-book', async (request, response) => {
    const ID = request.query.ID
    await knex.raw(`DELETE FROM familyreading WHERE scriptureid = ` + ID + `;`)
    // Take us to root
    const familyreading = await knex.raw("select * from familyreading;")
    const rows = familyreading.rows.length
    response.render('readingsView', {data: {result: (familyreading.rows), rows : rows}})

})

module.exports = router