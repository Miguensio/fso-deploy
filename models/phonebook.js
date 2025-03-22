const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const mongoUrl = process.env.MONGODB_URI

mongoose.connect(mongoUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch(() => console.log('Error connecting to MongoDB'))

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3
  },
  number: {
    type: String,
    validate: {
      validator: (number) => {
        return /^\d{2,3}-\d+$/.test(number)
      },
      message: 'Not a valid phone number'
    }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)