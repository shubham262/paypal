import express from "express";
import {
	seedProductsController,
	fetchAllProductsController,
	createCheckoutSessionController,
	verifyPayment,
	seedPlanController,
	fetchAllPlansController,
	subscriptionController,
	verifySubscription,
} from "../controllers/ecommerceController.js";
import { checkUserAuth } from "../middleware/index.js";

const router = express.Router();

router.post("/seed", seedProductsController);
router.get("/products", fetchAllProductsController);
router.post("/create-checkout", checkUserAuth, createCheckoutSessionController);
router.post("/verify-payment", checkUserAuth, verifyPayment);
router.post("/plans", seedPlanController);
router.get("/plans", fetchAllPlansController);
router.post("/create-subscription", checkUserAuth, subscriptionController);
router.post("/verify-subscription", checkUserAuth, verifySubscription);

export default router;
