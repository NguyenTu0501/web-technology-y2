import type {RowDataPacket, ResultSetHeader} from 'mysql2/promise'
import {getPool} from '../config/database.js'

export type Size = "M" | "L" | "XL" | "XXL";

export interface ProductDTO extends RowDataPacket{
    id: number,
    product_name: string,
    product_description: string,
    product_price: number,
    product_size: Size
};

export class ProductService {
    static async getAllProducts(): Promise<ProductDTO[]>{
        const query = "SELECT * FROM products";
        const [row] = await getPool().query<ProductDTO[]>(query);
        return row;
    };

    static async getSearchProducts(productName: string): Promise<ProductDTO[]>{
        const query = "SELECT * FROM products as P WHERE P.product_name LIKE ?";
        const [row] = await getPool().query<ProductDTO[]>(query,[`%${productName}%`]);
        return row;
    };

    static async createProduct({name, description, price, size}:
         {name: string, description: string, price: number, size: Size}): Promise<ResultSetHeader>
    {
        const insertQuery = "INSERT INTO products(product_name, product_description, product_price, product_size) "+
                            "VALUES (?,?,?,?)";
        const [result] = await getPool().query<ResultSetHeader>(insertQuery,[name,description,price,size]);
        return result;
    };

    static async updateProduct(id: number ,{name, description, price, size}:
         {name: string, description: string, price: number, size: Size}): Promise<ResultSetHeader>
    {
        const updateQuery = "UPDATE products as P "+
                            "SET P.product_name = ?, P.product_description = ?, "+
                            "P.product_price = ?, P.product_size = ? "+
                            "WHERE P.id = ?";
        const [result] = await getPool().query<ResultSetHeader>(updateQuery,[name,description,price,size,id]);
        return result;
    }

    static async removeProduct(id: number): Promise<ResultSetHeader>{
        const removeQuery = "DELETE FROM products as P WHERE P.id = ?";
        const [result] = await getPool().query<ResultSetHeader>(removeQuery,[id]);
        return result;
    }
}
