import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server' // Corrected import
import mongoose from 'mongoose'
import createServer from '../utils/server' // Assuming this is the path to your server file
import { addProductToDB } from '../services/product.service'
import { v4 as uuidv4 } from 'uuid'
import { createUser } from '../services/auth.service'
import { hashing } from '../utils/hashing'

const app = createServer()

const productPayload = {
  product_id: uuidv4(),
  name: 'Kaos',
  price: 100000,
  size: 'XL'
}

const productPayloadUpdate = {
  price: 200000,
  size: 'XXL'
}

const productPayloadCreate = {
  product_id: uuidv4(),
  name: 'Kaos Baru',
  price: 100000,
  size: 'XL'
}

const userAdminCreated = {
  user_id: uuidv4(),
  email: 'ibnu123@test.com',
  name: 'ibnu123',
  password: `${hashing('12345')}`,
  role: 'admin'
}

const userCreated = {
  user_id: uuidv4(),
  email: 'ibnu@test.com',
  name: 'ibnu',
  password: `${hashing('12345')}`,
  role: 'reguler'
}

const userAdmin = {
  email: 'ibnu123@test.com',
  password: '12345'
}

const userReguler = {
  email: 'ibnu@test.com',
  password: '12345'
}

describe('product', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
    await addProductToDB(productPayload)
    await createUser(userAdminCreated)
    await createUser(userCreated)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })

  describe('get all product', () => {
    describe('given the product does exist', () => {
      it('should return 200', async () => {
        const { statusCode } = await supertest(app).get(`/product`)

        expect(statusCode).toBe(200)
      })
    })
  })

  describe('get detail product', () => {
    describe('given the product does not exist', () => {
      it('should return 404, and empty data', async () => {
        const productId = 'Product_123'
        await supertest(app).get(`/product/${productId}`).expect(404)
      })
    })
    describe('given the product does exist', () => {
      it('should return 200, and detail product data', async () => {
        const { statusCode, body } = await supertest(app).get(`/product/${productPayload.product_id}`)
        console.log(body)

        expect(statusCode).toBe(200)
        expect(body.data.name).toBe('Kaos')
      })
    })
  })

  describe('create product', () => {
    let adminToken: string

    beforeAll(async () => {
      const { body } = await supertest(app).post('/auth/login').send(userAdmin)
      adminToken = body.data.accessToken
      console.log('Admin Token:', adminToken)
    })

    it('should return 201, success create product', async () => {
      const response = await supertest(app)
        .post('/product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productPayloadCreate)

      console.log('Response Body:', response.body) // Debugging response
      expect(response.statusCode).toBe(201)
      expect(response.body.data.name).toBe(productPayloadCreate.name)
    })

    // it('should return 422, product name is exist in db', async () => {
    //   const response = await supertest(app)
    //     .post('/product')
    //     .set('Authorization', `Bearer ${adminToken}`)
    //     .send(productPayload)

    //   console.log('Response Body:', response.body) // Debugging response
    //   expect(422)
    //   expect(response.body.message).toBe('Product name already exists') // Adjust message as per your API
    // })

    describe('if user is logged in as regular user', () => {
      it('should return 403, request forbidden', async () => {
        const { body: userLoginResponse } = await supertest(app).post('/auth/login').send(userReguler)
        const regularUserToken = userLoginResponse.data.accessToken

        const { statusCode } = await supertest(app)
          .post('/product')
          .set('Authorization', `Bearer ${regularUserToken}`) // Use regular user's token
          .send(productPayloadCreate)

        expect(statusCode).toBe(403)
      })
    })
  })

  describe('delete product', () => {
    let adminToken: string
    let regularUserToken: string

    beforeAll(async () => {
      const adminLoginResponse = await supertest(app).post('/auth/login').send(userAdmin)
      adminToken = adminLoginResponse.body.data.accessToken

      const regularLoginResponse = await supertest(app).post('/auth/login').send(userReguler)
      regularUserToken = regularLoginResponse.body.data.accessToken
    })

    describe('if user is not logged in', () => {
      it('should return 403, request forbidden', async () => {
        const response = await supertest(app).delete(`/product/${productPayload.product_id}`)
        expect(response.statusCode).toBe(403)
      })
    })

    describe('if user is logged in as admin', () => {
      it('should return 200, success delete product', async () => {
        const response = await supertest(app)
          .delete(`/product/${productPayload.product_id}`)
          .set('Authorization', `Bearer ${adminToken}`)

        expect(response.statusCode).toBe(200)
      })

      it('should return 404, product does not exist in db', async () => {
        const response = await supertest(app)
          .delete(`/product/non_existent_product_id`)
          .set('Authorization', `Bearer ${adminToken}`)

        expect(response.statusCode).toBe(404)
      })
    })

    describe('if user is logged in as a regular user', () => {
      it('should return 403, request forbidden', async () => {
        const response = await supertest(app)
          .delete(`/product/${productPayload.product_id}`)
          .set('Authorization', `Bearer ${regularUserToken}`)

        expect(response.statusCode).toBe(403)
      })
    })
  })

  describe('update product', () => {
    let adminToken: string
    let regularUserToken: string
    let productId: string

    beforeAll(async () => {
      const adminLoginResponse = await supertest(app).post('/auth/login').send(userAdmin)
      adminToken = adminLoginResponse.body.data.accessToken

      const regularLoginResponse = await supertest(app).post('/auth/login').send(userReguler)
      regularUserToken = regularLoginResponse.body.data.accessToken

      // Create a product to test the update
      const createResponse = await supertest(app)
        .post('/product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productPayload)

      productId = createResponse.body.data.product_id
    })

    describe('if user is not logged in', () => {
      it('should return 403, request forbidden', async () => {
        const response = await supertest(app).put(`/product/${productId}`)
        expect(response.statusCode).toBe(403)
      })
    })

    describe('if user is logged in as admin', () => {
      it('should return 200, success update product', async () => {
        const response = await supertest(app)
          .put(`/product/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(productPayloadUpdate)

        expect(response.statusCode).toBe(200)

        const updateData = await supertest(app).get(`/product/${productId}`)
        expect(updateData.body.data.size).toBe('XXL')
        expect(updateData.body.data.price).toBe(200000)

        // Validate more fields
        expect(updateData.body.data).toHaveProperty('product_id')
        expect(updateData.body.data).toHaveProperty('name')
      })

      it('should return 404, product does not exist in db', async () => {
        const response = await supertest(app)
          .put(`/product/123`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(productPayloadUpdate)

        expect(response.statusCode).toBe(404)
      })
    })

    describe('if user is logged in as a regular user', () => {
      it('should return 403, request forbidden', async () => {
        const response = await supertest(app)
          .put(`/product/${productId}`)
          .set('Authorization', `Bearer ${regularUserToken}`)
          .send(productPayloadUpdate)

        expect(response.statusCode).toBe(403)
      })
    })
  })
})
