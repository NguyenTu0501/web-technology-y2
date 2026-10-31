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
        const query = "SELECT * FROM order_tables";
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
                            "O.table_size = ?, "+
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
            const query = "INSERT INTO table_items(table_id, product_id) VALUES (?,?)";
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
        const query = "DELETE FROM table_items as I where I.table_id = ? and I.product_id = ?";
        const [result] = await getPool().query<ResultSetHeader>(query,[table_id,product_id]);
        return result;
    }

    static async getProductInItemOnTable(table_id: number): Promise<ProductDTO[]>{
        const query =   "SELECT * from products as P "+
                        "JOIN table_items as I on I.product_id = P.id "+
                        "WHERE I.table_id = ?";
        const [row] = await getPool().query<ProductDTO[]>(query,[table_id]);
        return row;
    }

}