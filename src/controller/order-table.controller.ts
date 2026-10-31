import type {Request, Response, NextFunction} from 'express'
import {OrderTableService} from '../service/order-table.service.js'

export class OrderTableController{
    static async getTables(req: Request, res: Response, next: NextFunction): Promise<void>{
        const row = await OrderTableService.getAllTables();
        res.status(200).send(row);
    }

    static async insertTable(req: Request, res: Response, next: NextFunction): Promise<void>{
        const {name, size} = req.body as {name: string, size: number};
        const result = await OrderTableService.insertTable({name, size});
        if(result.affectedRows === 0){
            res.status(400).send({message: "Unable to create table"});
        }
        res.status(201).send({message: "Created table"});
    }

    static async removeTable(req: Request, res: Response, next: NextFunction): Promise<void>{
        const {id} = req.params as {id: string};
        const table_id = Number(id);
        const result = await OrderTableService.removeTable(table_id);
        if(result.affectedRows === 0){
            res.status(400).send({message: "Unable to remove table"});
        }
        res.status(200).send({message: "Removed table"});
    }

    static async updateTable(req: Request, res: Response, next: NextFunction): Promise<void>{
        const {id} = req.params as {id: string};
        const table_id = Number(id);
        const {name, size} = req.body as {name: string, size: number};

        const result = await OrderTableService.updateTable(table_id,{name, size});
        if(result.affectedRows === 0){
            res.status(400).send({message: "Unable to update table"});
        }
        res.status(200).send({message: "Updated table"});
    }

    static async markAvailable(req: Request, res: Response, next: NextFunction): Promise<void>{
        const {id} = req.params as {id: string};
        const table_id = Number(id);
        const result = await OrderTableService.markAsAvailable(table_id);
        if(result.affectedRows === 0){
            res.status(400).send({message: "Unable to mark as available table"});
        }
        res.status(200).send({message: "Marked table"});
    }

    static async markUnAvailable(req: Request, res: Response, next: NextFunction): Promise<void>{
        const {id} = req.params as {id: string};
        const table_id = Number(id);
        const result = await OrderTableService.markAsUnAvailable(table_id);
        if(result.affectedRows === 0){
            res.status(400).send({message: "Unable to unmark as available table"});
        }
        res.status(200).send({message: "Unmarked table"});
    }

    static async addItemsForTable(req: Request, res: Response, next: NextFunction): Promise<void>{
        const {table_id, product_ids} = req.body as {table_id: number, product_ids: number[]};
        await OrderTableService.addItemsForTable({table_id, product_ids});
        res.status(200).send({message: "Added"});
    }

    static async removeItemFromTable(req: Request, res: Response, next: NextFunction): Promise<void>{
        const {table_id, product_id} = req.body as {table_id: number, product_id: number};
        const result = await OrderTableService.removeItemFromTable(table_id,product_id);
        if(result.affectedRows === 0){
            res.status(400).send({message: "Unable to remove item from table"});
        }
        res.status(200).send({message: "Removed item from table"});
    }

    static async getProductInTable(req: Request, res: Response, next: NextFunction): Promise<void>{
        const {id} = req.params as {id: string};
        const table_id = Number(id);
        const row = await OrderTableService.getProductInItemOnTable(table_id);
        res.status(200).send(row);
    }
}
