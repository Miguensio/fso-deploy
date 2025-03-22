const mongoose = require('mongoose')

if(process.argv.length < 3){
  console.log('Give password as a argument')
  process.exit(1)
}

const mongoUrl = process.env.MONGODB_URI

mongoose.connect(mongoUrl)
  .then(() => {
    console.log('Successfully connected to the database')
  })
  .catch(() => {
    console.log('Error connecting to the Database')
  })

const personSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if(process.argv.length === 3){
  Person.find({}).then(result => {
    console.log('Phonebook:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}
else{
  const id = Math.floor(Math.random()*10000)

  const person = new Person({
    id: id,
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then(result => {
    console.log(result)
    console.log(`Added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close()
  })
}