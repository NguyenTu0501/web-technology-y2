import type {Request, Response, NextFunction} from 'express'
import {ProductService, type Size} from '../service/product.service.js'

export class ProductController{
    static async geTProducts(req: Request, res: Response, next: NextFunction): Promise<void>{
        const row = await ProductService.getAllProducts();
        res.status(200).send(row);
    }

    static async searchProducts(req: Request, res: Response, next: NextFunction): Promise<void>{
        const {name} = req.params as {name : string};
        const row = await ProductService.getSearchProducts(name);
        res.status(200).send(row);
    }

    static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void>{
        const {name, description, price, size} = req.body as 
                        {name: string, description: string, price: number, size: Size};
        const result = await ProductService.createProduct({name, description, price, size});
        if(result.affectedRows === 0 ){
            res.status(400).send({message: "Unable to create product"});
        }
        res.status(201).send({
            message: "Created product",
            product_id: result.insertId
        });
    }

    static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void>{
        const {name, description, price, size} = req.body as 
                        {name: string, description: string, price: number, size: Size};
        const {id} = req.params as {id: string};
        const product_id = Number(id);
        const result = await ProductService.updateProduct(product_id,{name, description, price, size});
        if(result.affectedRows === 0 ){
            res.status(400).send({message: "Unable to update product"});
        }
        res.status(200).send({message: "Updated product"});
    }

    static async removeProduct(req: Request, res: Response, next: NextFunction): Promise<void>{
        const {id} = req.params as {id: string};
        const product_id = Number(id);
        const result = await ProductService.removeProduct(product_id);
        if(result.affectedRows === 0 ){
            res.status(400).send({message: "Unable to remove product"});
        }
        res.status(200).send({message: "Removed product"});
    }
}