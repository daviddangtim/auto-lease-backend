import express from "express";
import { paystackWebHook } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/webhook", paystackWebHook)

export default router;