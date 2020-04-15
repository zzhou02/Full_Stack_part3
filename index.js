require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const entry = require('./models/entry')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
morgan.token('body', (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// let persons = [
//   {
//     "name": "Arto Hellas",
//     "number": "040-123456",
//     "id": 1
//   },
//   {
//     "name": "Ada Lovelace",
//     "number": "39-44-5323523",
//     "id": 2
//   },
//   {
//     "name": "Dan Abramov",
//     "number": "12-43-234345",
//     "id": 3
//   },
//   {
//     "name": "Mary Poppendieck",
//     "number": "39-23-6423122",
//     "id": 4
//   }
// ]

app.get('/api/persons', (req, res) => {
  entry.find({}).then(entries => {
    res.json(entries.map(entry => entry.toJSON()))
  })
})

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  entry.findById(id).then(person => {
    if (person) {
      res.json(person.toJSON())
    } else {
      res.status(404).end()
    }
  })
})

app.get('/info', (req, res) => {
  const time = new Date()
  entry.find({}).then(entries => {
    res.send(`<div>Phonebook has info for ${entries.length} people</div><div>${time}</div>`)
  })
})

// app.delete('/api/persons/:id', (req, res) => {
//   const id = req.params.id
//   persons = persons.filter(person => person.id !== id)
//   res.status(204).end()
// })

app.post('/api/persons', (req, res) => {
  const body = req.body
  if (!body) {
    return res.status(400).json({ error: 'content missing' })
  }
  // else if (!body.name) {
  //   return res.status(400).json({ error: 'name missing' })
  // } else if (!body.number) {
  //   return res.status(400).json({ error: 'number missing' })
  // } else if (persons.find(person => person.name === body.name)) {
  //   return res.status(400).json({ error: 'name must be unique' })
  // }
  const person = new entry({
    name: body.name,
    number: body.number,
    date: new Date(),
  })
  person.save().then(result => {
    res.json(result.toJSON())
  })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})