const db = require("../config/db");

class ProductoModel {
    /**
     * Method to list all products.
     * Calls the `sp_obtener_productos` stored procedure.
     */
    static async listarTodos() {
        try {
            const [rows] = await db.query("CALL sp_obtener_productos()");
            return rows[0];
        } catch (error) {
            console.error("Error al listar productos:", error);
            throw error;
        }
    }

    /**
     * Method to find products based on a search query.
     * This is a simplified version since your `sp_obtener_productos` doesn't support searching.
     * You'll need to create new stored procedures for this functionality.
     */
    static async buscarPor(busqueda, tipo) {
        let rows;
        try {
            // You'll need to create stored procedures like sp_buspro_id and sp_searchpro_nom
            switch (tipo) {
                case "id":
                    [rows] = await db.query("SELECT * FROM productos WHERE id_pro = ?", [busqueda]);
                    break;
                case "nombre":
                    [rows] = await db.query("SELECT * FROM productos WHERE nom_pro LIKE ?", [`%${busqueda}%`]);
                    break;
                default:
                    [rows] = await db.query("CALL sp_obtener_productos()");
                    break;
            }
            return rows[0] || [];
        } catch (error) {
            console.error("Error en buscarPor:", error);
            return [];
        }
    }

    /**
     * Method to find a single product by its ID.
     * Calls the `sp_obtener_producto_por_id` stored procedure.
     */
    static async buscarPorId(id) {
    try {
        const [rows] = await db.query("CALL sp_obtener_producto_por_id(?)", [id]);
        return rows[0];
    } catch (error) {
        console.error("Error en buscarPorId:", error);
        return [];
    }
}


    /**
     * Method to create a new product.
     * Calls the `sp_insertar_producto` stored procedure.
     */
    static async crear(nuevoProducto) {
    const { nom_pro, pre_pro, id_uni, id_marca, id_cat, stk_pro, estado } = nuevoProducto;

    console.log("Enviando a MySQL:", {
        nom_pro, pre_pro, id_uni, id_marca, id_cat, stk_pro, estado
    });

    try {
        await db.query("CALL sp_insertar_producto(?, ?, ?, ?, ?, ?, ?)", [
            nom_pro,   // nombre del producto
            pre_pro,   // precio
            id_uni,    // id de unidad
            id_marca,  // id de marca
            id_cat,    // id de categoría
            stk_pro,   // stock
            estado     // estado 'A' o 'X'
        ]);
        return { success: true };
    } catch (error) {
        console.error("Error al crear producto:", error);
        throw error;
    }
}

    /**
     * Method to update an existing product.
     * Calls the `sp_actualizar_producto` stored procedure.
     */
    static async actualizar(id_pro, productoActualizado) {
        // CORRECCIÓN: Usar id_uni en lugar de uni_med
        const { nom_pro, pre_pro, id_marca, id_cat, stk_pro, id_uni, estado } = productoActualizado;
        try {
            await db.query("CALL sp_actualizar_producto(?, ?, ?, ?, ?, ?, ?, ?)", [
                id_pro,
                nom_pro,
                pre_pro,
                id_marca,
                id_cat,
                stk_pro,
                id_uni, // Se usa la variable corregida
                estado,
            ]);
            return { success: true };
        } catch (error) {
            console.error("Error al actualizar producto:", error);
            throw error;
        }
    }

    /**
     * Method to delete a product.
     * Calls the `sp_eliminar_producto` stored procedure.
     */
    static async eliminar(id_pro) {
        try {
            await db.query("CALL sp_eliminar_producto(?)", [id_pro]);
            return { success: true };
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            throw error;
        }
    }

    /**
     * Methods to get related data for forms.
     * Calls stored procedures for brands, categories, and units.
     */
    static async listarMarcas() {
        const [rows] = await db.query("CALL sp_obtener_marcas()");
        return rows[0];
    }

    static async listarCategorias() {
        const [rows] = await db.query("CALL sp_obtener_categorias()");
        return rows[0];
    }

    static async listarUnidades() {
        const [rows] = await db.query("CALL sp_obtener_unidades()");
        return rows[0];
    }

    // New methods for pagination
    static async listarPaginado(limite, offset) {
        try {
            const [rows] = await db.query("CALL sp_obtener_productos_paginado(?, ?)", [limite, offset]);
            return rows[0];
        } catch (error) {
            console.error("Error en listarPaginado:", error);
            throw error;
        }
    }

    static async contarTodos() {
        try {
            const [rows] = await db.query("CALL sp_contar_productos()");
            return rows[0][0].total;
        } catch (error) {
            console.error("Error en contarTodos:", error);
            throw error;
        }
    }
}

module.exports = ProductoModel;