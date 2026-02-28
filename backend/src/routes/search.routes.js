import { Router } from "express";
import { search } from "../controllers/search.controller.js";
import { optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { searchQuerySchema } from "../validations/search.validations.js";

const router = Router();

router.route("/").get(optionalVerifyJWT, validate({ query: searchQuerySchema }), search);

export default router;
