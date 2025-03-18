const express = require('express')
const app = express()
const cors = require('cors')
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

app.use(requestLogger)
app.use(cors())
app.use(express.json())

const generateId = () => {
    const id = Math.floor(Math.random()*10000)
    return id
}

let phonebook = [
    { 
        "id": "1",
        "name": "Arto Hellas", 
        "number": "040-123456"
        },
        { 
        "id": "2",
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
        },
        { 
        "id": "3",
        "name": "Dan Abramov", 
        "number": "12-43-234345"
        },
        { 
        "id": "4",
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send("<h1>Phonebook</h1>")
})

app.get('/info', (request, response) => {
    const date = new Date()

    let entries = 0
    phonebook.forEach(element => {
        entries++
    })

    response.send(`<p>Phonebook has info for 2 people <br> ${date}</p>`)
})

app.get('/api/persons', (request, response) => {
    response.json(phonebook)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id

    const entry = phonebook.find(person => person.id === id)

    if(entry){
        response.json(entry)
    }
    else{
        response.status(404)
        response.send({ error: "No phonebook entry found" })
    }
})

app.post('/api/persons', (request, response) => {
    let body = request.body
    
    if(phonebook.find(person => person.name === body.name)){
        response.status(400).json({ error: "Name must be unique" })
    }
    else if(body.name === '' && body.number === ''){
        response.status(400).json({ error: "Name or number is empty" })
    }
    else{
        const newPerson = {
        id: generateId(),
        name: body.name,
        number: body.number
        }

        phonebook = phonebook.concat(newPerson)

        response.json(newPerson)
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id

    phonebook = phonebook.filter(person => person.id !== id)

    response.status(204).end()
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})