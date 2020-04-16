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
  entry
    .find({})
    .then(entries => {
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

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  const person = new entry({
    name: body.name,
    number: body.number,
    date: new Date(),
  })
  person
    .save()
    .then(result => {
      res.json(result.toJSON())
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})