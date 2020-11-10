const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
morgan.token('body', (req, res) => JSON.stringify(req.body)); // Use morgan to log request body
app.use(morgan(':method :url :response-time :body'))


let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    }
  ]

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(person => person.id))
    : 0
  return maxId + 1
}


app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
  const length = persons.length
  res.send(`<p>Phonebook has info for ${length} people</p> <p>${new Date()}</p>` )
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.post('/api/persons', (req, res) => {
  if(!req.body.number || !req.body.name){
    return res.status(400)
      .json({
        error: 'Name or number is missing'
      })
  }
  const isDuplicate = persons.find(person => person.name === req.body.name)

  if(isDuplicate){
    return res.status(400)
      .json({
        error: 'Name already exists'
      })
  }
  else {
    const note = {
      name: req.body.name,
      number: req.body.number,
      id: generateId(),
    }
    persons = persons.concat(note)
    res.json(note)
  }

})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(204).end()
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

