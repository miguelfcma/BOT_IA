//? Este archivo estan las funciones que interactúan con la base de datos DEV_DSD para realizar consultas y obtener la informacion necesaria para el chatbot.

const Order = require("../models/Order.js");
const { sequelizeDB } = require("../database/db.js");
const { QueryTypes } = require("sequelize");

// Obtener todas las órdenes
// const getOrders = async (req, res) => {
//     try {
//         const orders = await Order.findAll();
//         res.json(orders);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error al obtener órdenes" });
//     }
// };

const getOrders = async () => {
  try {
    const orders = await Order.findAll();
    // console.log("Órdenes obtenidas:", orders);
    // return orders;
    return orders.map((order) => order.toJSON());
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return [];
  }
};

const getOrders2 = async () => {
  try {
    // const [orders, metadata] = await sequelizeDB.query("SELECT * FROM orders");
    //Recuperar solo la consulta, no los metadatos
    const orders = await sequelizeDB.query("SELECT * FROM orders LIMIT 10", {
      type: QueryTypes.SELECT,
    });
    console.log("Órdenes obtenidas:", orders);
    return orders;
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return [];
  }
};

const getClientInfoByClientId = async (id) => {
  try {
    const result = await sequelizeDB.query(
      `
        SELECT 
          c.Latitude, 
          c.Longitude,
          s.Name AS estado,
          ci.Name AS ciudad,
          l.Name AS ubicacion,
          ct.Name AS tipo_cliente,
          ch.Name AS canal,
          b.Name AS cadena
        FROM customers c
        INNER JOIN states s ON s.Id = c.StateId
        INNER JOIN cities ci ON ci.Id = c.CityId
        INNER JOIN locations l ON l.Id = c.LocationId
        INNER JOIN customertypes ct ON ct.Id = c.CustomerTypeId
        INNER JOIN channels ch ON ch.Id = c.ChannelId
        INNER JOIN banners b ON b.Id = c.BannerId
        WHERE c.Id = ?;
        `,
      {
        replacements: [id],
        type: sequelizeDB.QueryTypes.SELECT,
      }
    );

    return result;
  } catch (error) {
    console.error("Error al obtener la info del cliente:", error);
    return [];
  }
};
// Esta función obtiene los productos más vendidos por cliente
const getProductsMostSold = async (id) => {
  try {
    const result = await sequelizeDB.query(
      `
      select p.Name as producto, sum(od.QtyOrdered) as Cant
      from orders o inner join ordersdetails od on o.Id=od.OrderId
      inner join products p on od.ProductId=p.Id
      where o.CustomerId=? and o.OrderDate BETWEEN NOW() - INTERVAL 30 DAY AND NOW()
      Group By producto
      Order By Cant desc
      limit 10;
        `,
      {
        replacements: [id],
        type: sequelizeDB.QueryTypes.SELECT,
      }
    );

    return result;
  } catch (error) {
    console.error(
      "Error al obtener la información de los productos que más se han vendido",
      error
    );
    return [];
  }
};

// Esta función obtiene los Productos que no se han vendido en este cliente
const getProductsNotSold = async (id) => {
  try {
    const result = await sequelizeDB.query(
      `
      select p.Name
      from customers cus 
      inner join pricelistsdetails pld on cus.PriceListId=pld.PriceListId
      inner join products p on pld.ProductId=p.Id
      where cus.Id=? and 
      pld.ProductId not in (
        select distinct od.ProductId
        from orders o inner join ordersdetails od on o.Id=od.OrderId
        where o.CustomerId=? 
        and o.OrderDate BETWEEN NOW() - INTERVAL 30 DAY AND NOW()
      )
      limit 10;
        `,
      {
        replacements: [id, id],
        type: sequelizeDB.QueryTypes.SELECT,
      }
    );

    return result;
  } catch (error) {
    console.error(
      "Error al obtener la información de los productos que no se han vendido",
      error
    );
    return [];
  }
};

async function getEssentialData(clientId, options = {}) {
  const defaultOptions = {
    clienteInfo: true,
    orders: false,
    productsMostSold: true,
    productsNotSold: true,

  };

  const finalOptions = { ...defaultOptions, ...options };

  const promises = [];

  const data = {};

  if (finalOptions.clienteInfo) {
    promises.push(
      getClientInfoByClientId(clientId)
        .then((clientInfo) => {
          data.cliente = {
            mensaje: "Mi información general es:",
            datos: clientInfo,
          };
        })
        .catch((err) => console.error("Error en cliente:", err))
    );
  }

  if (finalOptions.orders) {
    promises.push(
      getOrders()
        .then((orders) => {
          data.ordenes = {
            mensaje: "Listado de órdenes realizadas por el cliente",
            datos: orders,
          };
        })
        .catch((err) => console.error("Error en orders:", err))
    );
  }

  if (finalOptions.productsMostSold) {
    promises.push(
      getProductsMostSold(clientId)
        .then((products) => {
          data.productosMasVendidos = {
            mensaje: "mis productos más vendidos en los últimos 30 días son:",
            datos: products,
          };
        })
        .catch((err) => console.error("Error en productosMasVendidos:", err))
    );
  }

  if (finalOptions.productsNotSold) {
    promises.push(
      getProductsNotSold(clientId)
        .then((products) => {
          data.productosNoVendidos = {
            mensaje: "mis productos que no se han vendido en los últimos 30 días son:",
            datos: products,
          };
        })
        .catch((err) => console.error("Error en productosNoVendidos:", err))
    );
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    console.error("Error al obtener datos esenciales:", error);
  }

  return data;
}

module.exports = {
  getOrders,
  getClientInfoByClientId,
  getOrders2,
  getEssentialData,
};
