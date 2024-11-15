import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server' // Corrected import
import mongoose from 'mongoose'
import createServer from '../utils/server' // Assuming this is the path to your server file
import { v4 as uuidv4 } from 'uuid'
import { createUser } from '../services/auth.service'
import { hashing } from '../utils/hashing'

const app = createServer()

const userAdmin = {
  user_id: uuidv4(),
  email: 'ibnu123@test.com',
  name: 'ibnu123',
  password: `${hashing('12345')}`,
  role: 'admin'
}

const userReguler = {
  user_id: uuidv4(),
  email: 'ibnu@test.com',
  name: 'ibnu',
  password: `${hashing('12345')}`,
  role: 'reguler'
}

const userAdminCreated = {
  email: 'penul123@test.com',
  name: 'penul123',
  password: '12345',
  role: 'admin'
}

const userRegulerCreated = {
  email: 'penul@test.com',
  name: 'penul',
  password: '12345',
  role: 'reguler'
}

const userAdminLogin = {
  email: 'ibnu123@test.com',
  password: '12345'
}

const userNotExist = {
  email: 'ibnu1234@test.com',
  password: '12345'
}

describe('auth', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
    await createUser(userAdmin)
    await createUser(userReguler)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })

  describe('register', () => {
    describe('create user with role admin', () => {
      it('should return 201, create user with role admin succes', async () => {
        await supertest(app).post('/auth/register').send(userAdminCreated).expect(201)
      })
    })
    describe('create user with role reguler', () => {
      it('should return 201, create user with role reguler succes', async () => {
        await supertest(app).post('/auth/register').send(userRegulerCreated).expect(201)
      })
    })
    describe('Error register user', () => {
      it('should return 500', async () => {
        await supertest(app).post('/auth/register').send(userRegulerCreated).expect(500)
      })
    })
  })

  describe('login', () => {
    describe('login with exist user', () => {
      it('should return 200, return access token $ refresh token', async () => {
        await supertest(app).post('/auth/login').send(userAdminLogin).expect(200)
      })
    })
    describe('login with not exist user', () => {
      it('should return 401, login failed', async () => {
        await supertest(app).post('/auth/login').send(userNotExist).expect(401)
      })
    })
  })
})
