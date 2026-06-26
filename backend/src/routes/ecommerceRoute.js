import express from "express";
import {
	seedProductsController,
	fetchAllProductsController,
	createPayPalCheckoutSessionController,
	capturePayPalOrderController,
	seedPlanController,
	fetchAllPlansController,
	createSubscriptionCheckoutController,
} from "../controllers/ecommerceController.js";
import { checkUserAuth } from "../middleware/index.js";

const router = express.Router();

router.post("/seed", seedProductsController);
router.get("/products", fetchAllProductsController);
router.post(
	"/create-checkout",
	checkUserAuth,
	createPayPalCheckoutSessionController
);
router.post(
	"/create-checkout-capture",
	checkUserAuth,
	capturePayPalOrderController
);

router.post("/plans", seedPlanController);
router.get("/plans", fetchAllPlansController);
router.post(
	"/create-subscription",
	checkUserAuth,
	createSubscriptionCheckoutController
);
export default router;
