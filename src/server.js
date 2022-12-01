const express = require('express');
require('express-async-errors');
const app = express();
const { Prisma } = require("@prisma/client");
const { MissingFieldsError } = require('../src/utils/errors')


const cors = require('cors');
const morgan = require('morgan');

app.disable('x-powered-by');

// Add middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Tell express to use your routers here

const usersRouter = require('./routers/users')
app.use('/users', usersRouter)


// const customerRouter = require('./routers/customer');
// app.use('/customers', customerRouter);
// const moviesRouter = require('./routers/movies');
// app.use('/movies', moviesRouter);
// const screensRouter = require('./routers/screens');
// app.use('/screens', screensRouter);

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

// Error handling
app.use((e, req, res, next) => {
    console.log(e.code, e.message)
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
            return res.status(409).json({ error: "Unique constraint fail. Already exists in the database" })
        }
        if (e.code === "P2025") {
            return res.status(404).json({ error: "Could not find record" })
        }
        if (e.code === "P2000") {
            return res.status(409).json({ error: "Value provided was too long" })
        }
    }
    if (e instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({ error: "Invalid Data" })
    }
    if (e instanceof MissingFieldsError) {
        return res.status(400).json({ error: e.message })
    }
    
    res.status(500).json({ error: e.message })
})


module.exports = app