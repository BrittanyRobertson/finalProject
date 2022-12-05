const express = require('express')
const calendarRouter = require('./routes/calendar')
const vacationRouter = require('./routes/vacations')

const app = express()

app.use("/assets",express.static('assets'));

const PORT = 3000

app.set('view engine', 'ejs')

app.get('/', (request, response) => {
    response.render('index')
})

app.use('/calendar', calendarRouter)
app.use('/vacation', vacationRouter)

// Land 'http://localhost:3000/'
app.listen(PORT)

