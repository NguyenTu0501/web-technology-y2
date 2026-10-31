import type {RowDataPacket, ResultSetHeader, PoolConnection} from 'mysql2/promise'
import {getPool} from '../config/database.js'
import {type ProductDTO} from './product.service.js'

export interface OrderTableDTO extends RowDataPacket{
    id: number,
    table_name: string,
    table_size: number, // How many people can sit
    is_available: boolean
}

export interface OrderBody{
    table_id: number,
    product_ids: number[] // productId
}

export class OrderTableService {
    static async getAllTables(): Promise<OrderTableDTO[]> {
        // Seed data can be run more than once. Show the first row for each
        // table name so duplicate seed rows do not appear as extra tables.
        const query = "SELECT O.* FROM order_tables AS O "+
                      "JOIN (SELECT MIN(id) AS id FROM order_tables GROUP BY table_name) AS T ON T.id = O.id "+
                      "ORDER BY O.id";
        const [row] = await getPool().query<OrderTableDTO[]>(query);
        return row;
    };

    static async insertTable({name, size}: {name: string, size: number}): Promise<ResultSetHeader> {
        const insertQuery = "INSERT INTO order_tables(table_name, table_size, is_available) VALUES (?,?,?)";
        const [result] = await getPool().query<ResultSetHeader>(insertQuery,[name,size,true]);
        return result;
    };

    static async removeTable(id: number): Promise<ResultSetHeader>{
        const removeQuery = "DELETE FROM order_tables as O where O.id = ?";
        const [result] = await getPool().query<ResultSetHeader>(removeQuery,[id]);
        return result;
    }

    static async updateTable(id: number, {name, size}: {name: string, size: number}): Promise<ResultSetHeader> {
        const updateQuery = "UPDATE order_tables as O "+
                            "SET O.table_name = ?, "+
                            "O.table_size = ? "+
                            "WHERE O.id = ?";
        const [result] = await getPool().query<ResultSetHeader>(updateQuery,[name,size,id]);
        return result;
    }

    static async markAsAvailable(id: number): Promise<ResultSetHeader>{
        const updateQuery = "UPDATE order_tables as O SET O.is_available = ? where O.id = ?";
        const [result] = await getPool().query<ResultSetHeader>(updateQuery,[true,id]);
        return result;
    }

    static async markAsUnAvailable(id: number): Promise<ResultSetHeader>{
        const updateQuery = "UPDATE order_tables as O SET O.is_available = ? where O.id = ?";
        const [result] = await getPool().query<ResultSetHeader>(updateQuery,[false,id]);
        return result;
    }

    static async addItemsForTable({table_id,product_ids}: OrderBody){
        const connection: PoolConnection = await getPool().getConnection();
        try{
            await connection.beginTransaction();
            // The table_items composite key prevents duplicate products per table.
            // Treat calling an already-added product as an idempotent operation.
            const query = "INSERT INTO table_items(table_id, product_id) VALUES (?,?) "+
                          "ON DUPLICATE KEY UPDATE table_id = VALUES(table_id)";
            for(const product_id of product_ids){
                await connection.query(query,[table_id,product_id]);
            }
            await connection.commit();
        }
        catch(error){
            await connection.rollback();
            throw error;
        }
        finally{
            connection.release();
        }
    }

    static async removeItemFromTable(table_id: number, product_id: number): Promise<ResultSetHeader>{
        const query = "DELETE I FROM table_items AS I WHERE I.table_id = ? AND I.product_id = ?";
        const [result] = await getPool().query<ResultSetHeader>(query,[table_id,product_id]);
        return result;
    }

    static async getProductInItemOnTable(table_id: number): Promise<ProductDTO[]>{
        const query =   "SELECT P.* from products as P "+
                        "JOIN table_items as I on I.product_id = P.id "+
                        "WHERE I.table_id = ? ORDER BY P.product_name";
        const [row] = await getPool().query<ProductDTO[]>(query,[table_id]);
        return row;
    }

}
