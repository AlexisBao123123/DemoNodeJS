// D:\DemoNode\crud-vendedores\controllers\productos.controller.js
const ProductoModel = require("../models/producto.model");
const { json } = require("express");

class ProductoController {
  /**
   * Muestra la lista de productos con paginación, búsqueda y filtros.
   */
  static async listar(req, res) {
    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const porPagina = 10;
      const offset = (pagina - 1) * porPagina;

      const busqueda = req.query.busqueda || '';
      const tipo = req.query.tipo || 'todos';

      let productos = [];
      let totalProductos = 0;

      if (busqueda) {
        const resultadoBusqueda = await ProductoModel.buscarPaginado(busqueda, tipo, porPagina, offset);
        productos = resultadoBusqueda.productos;
        totalProductos = resultadoBusqueda.total;
      } else {
        productos = await ProductoModel.listarPaginado(porPagina, offset);
        totalProductos = await ProductoModel.contarTodos();
      }

      const totalPaginas = Math.ceil(totalProductos / porPagina);

      res.render("productos/index", {
        productos,
        busqueda,
        tipo,
        paginacion: {
          pagina,
          porPagina,
          totalProductos,
          totalPaginas,
          queryString: (busqueda || tipo !== 'todos') ?
            `busqueda=${encodeURIComponent(busqueda)}&tipo=${encodeURIComponent(tipo)}` :
            ''
        }
      });
    } catch (error) {
      console.error("Error al listar productos:", error);
      res.status(500).render("productos/index", {
        productos: [],
        error: `Error al recuperar productos: ${error.message}`,
        busqueda: req.query.busqueda || '',
        tipo: req.query.tipo || 'todos',
        paginacion: {
          pagina: 1,
          porPagina: 10,
          totalProductos: 0,
          totalPaginas: 0,
          queryString: ''
        }
      });
    }
  }

  /**
   * Formulario de nuevo producto.
   */
  static async mostrarFormularioNuevo(req, res) {
    try {
      const marcas = await ProductoModel.listarMarcas();
      const categorias = await ProductoModel.listarCategorias();
      const unidades = await ProductoModel.listarUnidades();
      res.render("productos/nuevo", { marcas, categorias, unidades });
    } catch (error) {
      console.error("Error al cargar formulario nuevo producto:", error);
      res.status(500).send("Error al cargar el formulario");
    }
  }

  /**
   * Crear producto.
   */
  static async crear(req, res) {
  const { nom_pro, pre_pro, id_marca, id_cat, stk_pro, id_uni, estado } = req.body;
  try {
    const precio = parseFloat(pre_pro);
    const stock = parseInt(stk_pro);
    const marca_id = parseInt(id_marca);
    const categoria_id = parseInt(id_cat);
    const unidad_id = parseInt(id_uni);

    if (isNaN(precio) || isNaN(stock) || isNaN(marca_id) || isNaN(categoria_id) || isNaN(unidad_id)) {
      return res.status(400).json({
        success: false,
        message: 'Error: El precio, stock, marca, categoría o unidad deben ser números válidos.'
      });
    }

    const nuevoProducto = {
      nom_pro,
      pre_pro: precio,
      id_marca: marca_id,
      id_cat: categoria_id,
      id_uni: unidad_id,
      stk_pro: stock,
      estado: estado === 'A' ? 'A' : 'I',
    };

    await ProductoModel.crear(nuevoProducto);
    res.json({ success: true, message: "Producto creado exitosamente" });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ success: false, message: `Error al crear producto: ${error.message}` });
  }
}
  /**
   * Formulario de edición.
   */
  static async mostrarFormularioEditar(req, res) {
    try {
      const id = req.params.id;
      const [producto] = await ProductoModel.buscarPorId(id);
      if (!producto) return res.status(404).send("Producto no encontrado");

      const marcas = await ProductoModel.listarMarcas();
      const categorias = await ProductoModel.listarCategorias();
      const unidades = await ProductoModel.listarUnidades();

      console.log("Producto:", producto);
      console.log("Unidades:", unidades);

      res.render("productos/editar", { producto, marcas, categorias, unidades });
    } catch (error) {
      console.error("Error al buscar producto:", error);
      res.status(500).send("Error al recuperar producto");
    }
  }

  /**
   * Actualizar producto.
   */
  static async actualizar(req, res) {
  const { nom_pro, pre_pro, id_marca, id_cat, stk_pro, id_uni, estado } = req.body; // 👈 usar id_uni en vez de uni_med
  const id_pro = req.params.id;

  try {
    const precio = parseFloat(pre_pro);
    const stock = parseInt(stk_pro);
    const marca_id = parseInt(id_marca);
    const categoria_id = parseInt(id_cat);
    const unidad_id = parseInt(id_uni); // 👈 aseguramos que sea número

    if (isNaN(precio) || isNaN(stock) || isNaN(marca_id) || isNaN(categoria_id) || isNaN(unidad_id)) {
      return res.status(400).json({
        success: false,
        message: 'Error: El precio, stock, marca, categoría o unidad deben ser números válidos.'
      });
    }

    const productoActualizado = {
      nom_pro,
      pre_pro: precio,
      id_marca: marca_id,
      id_cat: categoria_id,
      id_uni: unidad_id, // 👈 corregido
      stk_pro: stock,
      estado: estado ? 'A' : 'X',
    };

    console.log("Actualizando producto:", { id_pro, ...productoActualizado }); // 👈 debug

    await ProductoModel.actualizar(id_pro, productoActualizado);

    res.json({ success: true, message: "Producto actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ success: false, message: `Error al actualizar producto: ${error.message}` });
  }
}

  /**
   * Eliminar producto.
   */
  static async eliminar(req, res) {
    try {
      const id = req.params.id;
      const [producto] = await ProductoModel.buscarPorId(id);
      if (!producto) {
        return res.status(404).json({ success: false, message: "El producto especificado no existe" });
      }
      await ProductoModel.eliminar(id);
      res.json({ success: true, message: "Producto eliminado exitosamente" });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      res.status(500).json({ success: false, message: `Error al eliminar producto: ${error.message}` });
    }
  }

  /**
   * Exportar a PDF.
   */
  static async exportarPDF(req, res) {
    try {
      const productos = await ProductoModel.listarTodos();

      const PdfPrinter = require("pdfmake");
      const vfsFonts = require("pdfmake/build/vfs_fonts.js");

      const fonts = {
        Roboto: {
           normal: "Helvetica",
           bold: "Helvetica-Bold",
           italics: "Helvetica-Oblique",
           bolditalics: "Helvetica-BoldOblique"
        }
      };

      const printer = new PdfPrinter(fonts);

      const docDefinition = {
        content: [
          { text: "Lista de Productos", style: "header" },
          {
            table: {
              headerRows: 1,
              widths: ["auto", "*", "auto", "auto", "*", "*", "*"],
              body: [
                [
                  { text: "ID", bold: true },
                  { text: "Nombre", bold: true },
                  { text: "Precio", bold: true },
                  { text: "Stock", bold: true },
                  { text: "Unidad", bold: true },
                  { text: "Marca", bold: true },
                  { text: "Categoría", bold: true }
                ],
                ...productos.map((p) => [
                  p.id_pro,
                  p.nom_pro,
                  `S/ ${(parseFloat(p.pre_pro) || 0).toFixed(2)}`,
                  p.stk_pro,
                  p.uni_med || p.unidad,
                  p.marca,
                  p.categoria,
                ]),
              ],
            },
            layout: 'lightHorizontalLines'
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        },
      };

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=productos.pdf");
      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      console.error("Error en exportarPDF:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: `Error al generar PDF: ${error.message}` });
      }
    }
  }

  /**
   * Exportar a CSV.
   */
  static async exportarCSV(req, res) {
    try {
      const productos = await ProductoModel.listarTodos();
      const { Parser } = require("json2csv");

      const fields = ["id_pro", "nom_pro", "pre_pro", "stk_pro", "uni_med", "marca", "categoria"];
      const parser = new Parser({ fields });
      const csv = parser.parse(productos);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=productos.csv");
      res.send(csv);
    } catch (error) {
      console.error("Error al generar CSV:", error);
      res.status(500).json({ success: false, message: "Error al generar CSV" });
    }
  }

  /**
   * Exportar a HTML.
   */
  static async exportarHTML(req, res) {
    try {
      const productos = await ProductoModel.listarTodos();
      let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Lista de Productos</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h1 { color: #333; }
          .print-btn { margin: 20px 0; padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; }
          @media print { .print-btn { display: none; } }
        </style>
      </head>
      <body>
        <h1>Lista de Productos</h1>
        <button class="print-btn" onclick="window.print()">Imprimir / Guardar como PDF</button>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Unidad</th>
              <th>Marca</th>
              <th>Categoría</th>
            </tr>
          </thead>
          <tbody>
      `;

      productos.forEach((p) => {
        html += `
          <tr>
            <td>${p.id_pro}</td>
            <td>${p.nom_pro}</td>
            <td>${p.pre_pro ? Number(p.pre_pro).toFixed(2) : "0.00"}</td> <!-- ✅ corregido -->
            <td>${p.stk_pro}</td>
            <td>${p.uni_med || p.unidad}</td>
            <td>${p.marca}</td>
            <td>${p.categoria}</td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
        <button class="print-btn" onclick="window.print()">Imprimir / Guardar como PDF</button>
      </body>
      </html>
      `;

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (error) {
      console.error("Error al generar HTML:", error);
      res.status(500).send(`<p>Error al generar la vista: ${error.message}</p><p><a href="/productos">Volver</a></p>`);
    }
  }
}

module.exports = ProductoController;
