const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'bluescribe-secret-key-development'

const setupAuth = (app, User) => {
  app.use(passport.initialize())

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ where: { username } })
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' })
        }
        const isValid = await bcrypt.compare(password, user.password_hash)
        if (!isValid) {
          return done(null, false, { message: 'Incorrect password.' })
        }
        return done(null, user)
      } catch (err) {
        return done(err)
      }
    }),
  )

  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
  }

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await User.findByPk(jwt_payload.id)
        if (user) {
          return done(null, user)
        } else {
          return done(null, false)
        }
      } catch (err) {
        return done(err, false)
      }
    }),
  )

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password } = req.body
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' })
      }

      const existingUser = await User.findOne({ where: { username } })
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' })
      }

      const saltRounds = 10
      const password_hash = await bcrypt.hash(password, saltRounds)

      const user = await User.create({ username, password_hash })
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })

      res.status(201).json({ token, user: { id: user.id, username: user.username } })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Server error' })
    }
  })

  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) return next(err)
      if (!user) {
        return res.status(401).json({ error: info.message || 'Login failed' })
      }
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
      return res.json({ token, user: { id: user.id, username: user.username } })
    })(req, res, next)
  })

  return passport.authenticate('jwt', { session: false })
}

module.exports = setupAuth
