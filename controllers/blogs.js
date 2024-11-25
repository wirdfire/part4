const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')
const jwt = require('jsonwebtoken')


blogsRouter.post('/', middleware.tokenExtractor, middleware.userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body
  const user = request.user // User is now extracted from the token

  if (!user) {
    return response.status(403).json({ error: 'user is missing' })
  }

  if (!title || !url) {
    return response.status(400).json({ error: 'Title or URL is missing' })
  }
  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
    user: user.id
  })
  try {
    //save blog to database
    const savedBlog = await blog.save()

    //Associate blog with the user
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    console.log('Error saving blog', error)
    response.status(500).json({ error: 'An error occured saving the blog' })
  }
})


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs)
})


blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})


blogsRouter.delete('/:id', middleware.tokenExtractor, middleware.userExtractor, async (request, response) => {
  const user = request.user

  if (!user) {
    return response.status(401).json({ error: 'User not authenticated' })
  }

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'log not found' })
  }
  //check if the user is authorized to delete the blog
  if (user.id.toString() !== blog.user.toString()) {
    return response.status(403).json({ error: 'user not authorized to delete this blog' })
  }

  await blog.deleteOne()

  user.blogs = user.blogs.filter(b => b.toString() !== blog._id.toString())

  await user.save()

  response.status(204).end()
})


blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter
