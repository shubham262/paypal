import express from "express";
import {
	seedProductsController,
	fetchAllProductsController,
	checkoutController,
	captureController,
	orderStatusController,
	fetchAllPlanController,
	seedPlanController,
	subscriptionController,
	subscriptionStatusController,
} from "../controllers/ecommerceController.js";
import { checkUserAuth } from "../middleware/index.js";

const router = express.Router();

router.post("/seed", seedProductsController);
router.get("/products", fetchAllProductsController);
router.post("/plans", seedPlanController);
router.get("/plans", fetchAllPlanController);
router.post("/create-checkout", checkUserAuth, checkoutController);
router.post("/capture-checkout", checkUserAuth, captureController);
router.get("/order-status/:order_id", checkUserAuth, orderStatusController);
router.get(
	"/subscription-status/:subscriptionId",
	checkUserAuth,
	subscriptionStatusController
);
router.post("/create-subscription", checkUserAuth, subscriptionController);
export default router;
