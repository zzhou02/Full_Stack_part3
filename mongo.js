const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://bobbyzhou:${password}@cluster0-gwidp.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })


const entrySchema = new mongoose.Schema({
  name: String,
  number: String,
  date: Date,
})

const Entry = mongoose.model('Entry', entrySchema)

if (process.argv.length === 3) {
  console.log('phonebook:')
  Entry.find({}).then(result => {
    result.forEach(entry => {
      console.log(entry.name, entry.number, entry._id)
    })
    mongoose.connection.close()
  })
} else {
  const name = process.argv[3]
  const number = process.argv[4]

  const entry = new Entry({
    name: name,
    number: number,
    date: new Date(),
  })

  entry.save().then(response => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}