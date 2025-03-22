require('dotenv').config()
const express = require('express')
const Person = require('./models/phonebook')
const app = express()
const morgan = require('morgan')

morgan.token('body', (req) => { return JSON.stringify(req.body) })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(express.json())
app.use(requestLogger)
app.use(express.static('dist'))

app.get('/', (request, response) => {
  response.send('<h1>Phonebook</h1>')
})

app.get('/info', (request, response) => {
  const date = new Date()

  let entries = 0
  Person.find({})
    .then((persons) => {
      persons.forEach(() => {
        entries++
      })
      response.send(`<p>Phonebook has info for ${entries} people <br> ${date}</p>`)
    })
})

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then((persons) => {
      response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findById(id).then((data) => {
    if(data){
      response.json(data)
    }
    else{
      response.status(404)
      response.send({ error: 'No phonebook entry found' })
    }
  })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  let body = request.body

  if(body.name === '' && body.number === ''){
    response.status(400).json({ error: 'Name or number is empty' })
  }
  else{
    const person = new Person({
      name: body.name,
      number: body.number
    })

    person.save().then(savedPerson => {
      console.log(`Saved ${savedPerson} to the database`)
      response.json(savedPerson)
    })
      .catch(error => next(error))
  }
})

app.put('/api/persons', (request, response) => {
  let body = request.body
  const filter = { name: body.name }
  const update = { number: body.number }

  Person.findOneAndUpdate(filter, update, {
    new: true
  })
    .then(person => {
      response.status(200).send(person)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findByIdAndDelete(id).then(person => {
    if(person){
      response.status(200).send(person)
    }
    else{
      response.status(404).end()
    }
  })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError'){
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if(error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})