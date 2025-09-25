const express = require("express");
const router = express.Router();

// 1. Importación Correcta: Ahora importa el controlador de productos
const ProductoController = require("../controllers/productos.controller");

// 2. Usar el controlador de productos para manejar las rutas
// Listar productos con opción de búsqueda
router.get("/", ProductoController.listar);

// Formulario de nuevo producto
router.get("/nuevo", ProductoController.mostrarFormularioNuevo);

// Crear nuevo producto
router.post("/nuevo", ProductoController.crear);

// Formulario de edición
router.get("/editar/:id", ProductoController.mostrarFormularioEditar);

// Actualizar producto
router.post("/editar/:id", ProductoController.actualizar);

// Eliminar producto (ahora soporta ambos métodos)
router.get("/eliminar/:id", ProductoController.eliminar);

// Exportar rutas
router.get("/exportar-pdf", ProductoController.exportarPDF);
router.get("/exportar-csv", ProductoController.exportarCSV);

// Ruta alternativa para visualización HTML
router.get("/exportar-html", ProductoController.exportarHTML);

// Añadimos rutas alternativas en caso de que haya algún problema con las anteriores
router.get("/pdf", ProductoController.exportarPDF);
router.get("/csv", ProductoController.exportarCSV);

// Ruta para el método DELETE
router.delete("/:id", ProductoController.eliminar);

module.exports = router;