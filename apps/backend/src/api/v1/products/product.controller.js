import { sendResponse } from "../../../utils/responseHandler.js";
import { validateCreateProduct } from "./validators/product.validator.js";
import { createProductService } from "./services/createProduct.service.js";
import { getProductsService } from "./services/getProducts.service.js";
import { getProductDetailService } from "./services/getProductDetail.service.js";
import { deleteProductService } from "./services/deleteProduct.service.js";

export const createProduct = async (req, res, next) => {
  try {
    const cleanData = validateCreateProduct(req.body);
    const product = await createProductService(req.merchantId, cleanData);
    return sendResponse(
      res,
      201,
      "Product and variants created successfully.",
      product,
    );
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const result = await getProductsService(req.merchantId, req.query);
    return sendResponse(res, 200, "Products fetched successfully.", result);
  } catch (error) {
    next(error);
  }
};

export const getProductDetail = async (req, res, next) => {
  try {
    const product = await getProductDetailService(
      req.merchantId,
      req.params.slugOrId,
    );
    return sendResponse(
      res,
      200,
      "Product details fetched successfully.",
      product,
    );
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await deleteProductService(req.merchantId, req.params.id);
    return sendResponse(res, 200, "Product deleted successfully.", deleted);
  } catch (error) {
    next(error);
  }
};