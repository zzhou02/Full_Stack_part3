require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const entry = require('./models/entry')

app.use(express.static('build'))
app.use(express.json())
app.use(cors())
morgan.token('body', (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (req, res) => {
  entry.find({}).then(entries => {
    res.json(entries.map(entry => entry.toJSON()))
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  entry
    .findById(id)
    .then(person => {
      if (person) {
        res.json(person.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.get('/info', (req, res) => {
  const time = new Date()
  entry
    .find({})
    .then(entries => {
      res.send(`<div>Phonebook has info for ${entries.length} people</div><div>${time}</div>`)
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
  entry
    .findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const updatedEntry = {
    name: body.name,
    number: body.number,
  }
  entry
    .findByIdAndUpdate(req.params.id, updatedEntry, { new: true })
    .then(result => {
      res.json(result.toJSON())
    })
    .catch(error => next(error))
})

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

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})