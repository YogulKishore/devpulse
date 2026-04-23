const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const db = require('./db')
const cache = require('./cache')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({message: "DevPulse API is running"})
})

app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})

const repoRoutes = require('./routes/repo')
app.use('/api/repo', repoRoutes)