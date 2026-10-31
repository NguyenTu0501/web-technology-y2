import {Router} from 'express'
import {ProductController} from '../controller/product.controller.js'

const router = Router();

router.get("/",ProductController.getProducts);
router.get("/:name",ProductController.searchProducts);
router.post("/",ProductController.createProduct);
router.put("/:id", ProductController.updateProduct);
router.delete("/:id",ProductController.removeProduct);

export default router;