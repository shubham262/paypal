import express from "express";
import {
	seedProductsController,
	fetchAllProductsController,
} from "../controllers/ecommerceController.js";
import { checkUserAuth } from "../middleware/index.js";

const router = express.Router();

router.post("/seed", seedProductsController);
router.get("/products", fetchAllProductsController);

export default router;
