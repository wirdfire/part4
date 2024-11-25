const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
`mongodb+srv://fullstack:${password}@cluster0.n8kdq.mongodb.net/testBlogList?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url).then(() => {
  const blogSchema = new mongoose.Schema({
    content: String,
    important: Boolean,
  })

  const Blog = mongoose.model('Blog', blogSchema)

  /*
  const blog = new Blog({
    content: 'HTML is x',
    important: true,
  })

  blog.save().then(result => {
    console.log('blog saved!')
    mongoose.connection.close()
  })
  */
  blogSchema.find({}).then(result => {
    result.forEach(blog => {
      console.log(blog)
    })
    mongoose.connection.close()
  })
})

