import {Router} from 'express'
import {OrderTableController} from '../controller/order-table.controller.js'

const router = Router();

router.get("/",OrderTableController.getTables);
router.post("/",OrderTableController.insertTable);
router.delete("/:id",OrderTableController.removeTable);
router.put("/:id",OrderTableController.updateTable);
router.patch("/mark/:id",OrderTableController.markAvailable);
router.patch("/unmark/:id",OrderTableController.markUnAvailable);
router.post("/items/",OrderTableController.addItemsForTable);
router.delete("/item/",OrderTableController.removeItemFromTable);
router.get("/item/:id",OrderTableController.getProductInTable);


export default router;