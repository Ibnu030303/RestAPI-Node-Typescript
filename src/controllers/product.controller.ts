import { Request, Response } from 'express'
import {
  addProductToDB,
  deleteProductById,
  getProductById,
  getProductFromDB,
  updateProductById
} from '../services/product.service'
import { logger } from '../utils/logger'
import { createProductValidation, updateProductValidation } from '../validations/product.validation'
import { v4 as uuidv4 } from 'uuid'
import ProductType from '../types/product.types'

export const createProduct = async (req: Request, res: Response) => {
  req.body.product_id = uuidv4()

  const { error, value } = createProductValidation(req.body)

  if (error) {
    logger.error('ERR: product - create = ', error.details[0].message)
    res.status(422).send({
      status: false,
      statusCode: 422,
      message: error.details[0].message,
      data: {}
    })
  }

  try {
    await addProductToDB(value)
    logger.info('Success add new product')
    res.status(201).send({
      status: true,
      statusCode: 201,
      message: 'Add product success',
      data: value
    })
  } catch (error) {
    logger.error('ERR: product - create = ', error)
    res.status(500).send({
      status: false,
      statusCode: 500,
      message: 'Error adding product',
      data: error
    })
  }
}

export const getProduct = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req

  if (id) {
    const product = await getProductById(id)

    if (product) {
      logger.info('Success get product data')
      res.status(200).send({ status: true, statusCode: 200, data: product })
    } else {
      res.status(404).send({ status: false, statusCode: 404, message: 'Data Not Found', data: {} })
    }
  } else {
    const products = (await getProductFromDB()) || ([] as ProductType[])
    logger.info('Success get product data')
    res.status(200).send({ status: true, statusCode: 200, data: products })
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req

  const { error, value } = updateProductValidation(req.body)

  if (error) {
    logger.error('ERR: product - update = ', error.details[0].message)
    res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message, data: {} })
    return
  }

  try {
    const result = await updateProductById(id, value)

    if (result) {
      logger.info('Success update product')
      res.status(200).send({ status: true, statusCode: 200, message: 'Update product success', data: {} })
    } else {
      logger.warn('Product not found for update')
      res.status(404).send({ status: false, statusCode: 404, message: 'Product not found', data: {} })
    }
  } catch (error) {
    logger.error('ERR: product - update = ', error)
    res.status(500).send({ status: false, statusCode: 500, message: 'Error updating product', data: error })
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req

  try {
    const result = await deleteProductById(id)

    if (result) {
      logger.info('Success delete product')
      res.status(200).send({ status: true, statusCode: 200, message: 'Delete product success' })
    } else {
      logger.warn('Product not found for update')
      res.status(404).send({ status: false, statusCode: 404, message: 'Product not found', data: {} })
    }
  } catch (error) {
    logger.error('ERR: product - Delete = ', error)
    res.status(500).send({ status: false, statusCode: 500, message: 'Error delete product', data: error })
  }
}
