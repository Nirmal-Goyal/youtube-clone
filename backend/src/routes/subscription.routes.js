import { Router } from "express";
import {
    subscribeToChannel,
    unsubscribeFromChannel,
    getUserSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    channelIdParamSchema,
    subscriptionsQuerySchema
} from "../validations/subscription.validations.js";

const router = Router();

router.route("/").get(verifyJWT, validate({ query: subscriptionsQuerySchema }), getUserSubscribedChannels);

router
    .route("/:channelId")
    .post(verifyJWT, validate({ params: channelIdParamSchema }), subscribeToChannel)
    .delete(verifyJWT, validate({ params: channelIdParamSchema }), unsubscribeFromChannel);

export default router;
