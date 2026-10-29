import { sendResponse } from "../../../utils/responseHandler.js";
import {
  validateCreateCategory,
  validateCategoryIdParam,
} from "./validators/category.validator.js";
import { createCategoryService } from "./services/createCategory.service.js";
import { getCategoriesService } from "./services/getCategories.service.js";
import { deleteCategoryService } from "./services/deleteCategory.service.js";

export const createCategory = async (req, res, next) => {
  try {
    const cleanData = validateCreateCategory(req.body);
    const category = await createCategoryService(req.merchantId, cleanData);
    return sendResponse(res, 201, "Category created successfully.", category);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const data = await getCategoriesService(req.merchantId);
    return sendResponse(res, 200, "Categories fetched successfully.", data);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = validateCategoryIdParam(req.params.id);
    const result = await deleteCategoryService(req.merchantId, categoryId);
    return sendResponse(
      res,
      200,
      "Category and sub-categories deleted.",
      result,
    );
  } catch (error) {
    next(error);
  }
};