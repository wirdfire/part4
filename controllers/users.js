const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const middleware = require('../utils/middleware')


usersRouter.post('/', middleware.tokenExtractor, async (request, response) => {
  const { username, name, password } = request.body

  //validate username and password
  if (!username || username.length < 3) {
    return response.status(400).json({ error: 'Username must be atleast 3 letters' })
  }

  if (!password || password.length < 3) {
    return response.status(400).json({ error: 'password is missing or too short' })
  }

  const existingUser = await User.findOne({ username })

  if (existingUser) {
    return response.status(400).json({ error: 'Username must be unique' })
  }
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })
  const savedUser = await user.save()

  response.status(201).json(savedUser)
})


usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { url: 1, title: 1, author: 1 })
  response.json(users)
})


module.exports = usersRouter