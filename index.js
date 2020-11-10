require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Person = require('./models/person')


app.use(cors())
app.use(express.json())
app.use(express.static('build'))

const morgan = require('morgan')
morgan.token('body', (req, res) => JSON.stringify(req.body)); // Use morgan to log request body
app.use(morgan(':method :url :response-time :body'))


app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
  Person.find({})
    .then(result => {
      res.send(`<p>Phonebook has info for ${result.length} people</p> <p>${new Date()}</p>` )
    })

})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(result => {
    res.json(result.map(person => person.toJSON()))
  })
})

app.post('/api/persons', (req, res, next) => {
  if(!req.body.number || !req.body.name){
    return res.status(400)
      .json({
        error: 'Name or number is missing'
      })
  }
  const person = new Person({
    name: req.body.name,
    number: req.body.number
  })

  Person.findOne({name: person.name})
    .then(result => {
      if(result){
        return res.status(400)
          .json({error: 'This person already exists'})
      }
      else {
        person
          .save()
          .then(result => {res.json(result)})
          .catch( err => {next(err)})
      }
    })


})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if(person){
        res.json(person)
      }
      else {
        res.status(404).end()
      }
  })
    .catch(err => {
      next(err)
    })
})

app.put('/api/persons/:id', (req, res, next) => {

  const person = {
    name: req.body.name,
    number: req.body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(person => {
      res.json(person)
    })
    .catch(err => {
      next(err)
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch( err => {
      next(err)
    })
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }
  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

