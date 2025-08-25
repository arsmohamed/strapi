/**
 * order service
 * Purpose: handle createOrder and updateOrderStatus logic.
 *
 * This service manages:
 *  - Creating orders with stock validation
 *  - Managing inventory reserved quantities
 *  - Updating order status (PENDING, CANCELLED, DELIVERED, etc.)
 *  - Applying transactional safety when modifying inventory and orders
 */

import { factories } from "@strapi/strapi";

type OrderItemInput = { productId: number; qty: number };

export default factories.createCoreService(
  "api::order.order",
  ({ strapi }) => ({
    /**
     * Create a new order for a given customer.
     *
     * Steps:
     *  1. Validate stock for each requested item.
     *  2. Prepare order items with price at purchase.
     *  3. Use a transaction:
     *     - Increase reserved stock for all items.
     *     - Create the order record with its items.
     *
     * @param customerId - ID of the customer placing the order
     * @param items - List of products with their requested quantities
     * @returns The newly created order entity
     */
    async createOrder(customerId: number, items: OrderItemInput[]) {
      let total = 0;
      const orderItemsData: {
        product: number;
        qty: number;
        priceAtPurchase: number;
      }[] = [];

      // --- 1. Validate stock & prepare order items ---
      for (const item of items) {
        const inventory = await strapi.db
          .query("api::inventory.inventory")
          .findOne({
            where: { product: { id: item.productId } },
            populate: ["product"],
          });

        if (!inventory) throw new Error("PRODUCT_NOT_FOUND");

        if (inventory.onHand - inventory.reserved < item.qty) {
          throw new Error("INSUFFICIENT_STOCK");
        }

        const productPrice = inventory.product.price;
        total += productPrice * item.qty;

        orderItemsData.push({
          product: item.productId,
          qty: item.qty,
          priceAtPurchase: productPrice,
        });
      }

      // --- 2. Perform updates in a transaction ---
      const order = await strapi.db.transaction(async (trx) => {
        // Increase reserved stock for each product
        for (const item of items) {
          const inventory = await strapi.db
            .query("api::inventory.inventory")
            .findOne({
              where: { product: { id: item.productId } },
              // @ts-expect-error - `transacting` not in types yet
              transacting: trx,
            });

          if (!inventory) throw new Error("PRODUCT_NOT_FOUND");

          await strapi.db.query("api::inventory.inventory").update({
            where: { product: item.productId },
            data: { reserved: inventory.reserved + item.qty },
            // @ts-expect-error
            transacting: trx,
          });
        }

        // Create the order record
        const newOrder = await strapi.db.query("api::order.order").create({
          data: {
            customer: customerId,
            total,
            status: "PENDING",
            placedAt: new Date(),
            items: orderItemsData.map((oi) => ({
              product: oi.product,
              qty: oi.qty,
              priceAtPurchase: oi.priceAtPurchase,
            })),
          },
          // @ts-expect-error
          transacting: trx,
        });

        return newOrder;
      });

      return order;
    },

    /**
     * Update the status of an existing order.
     *
     * Rules:
     *  - If CANCELLED → release reserved stock back to inventory.
     *  - If DELIVERED → reduce onHand stock and reserved stock.
     *  - Other statuses → only update order status.
     *
     * @param orderId - ID of the order being updated
     * @param newStatus - New status value (e.g., PENDING, CANCELLED, DELIVERED)
     * @returns The updated order entity
     */
    async updateOrderStatus(orderId: number, newStatus: string) {
      const order = await strapi.db.query("api::order.order").findOne({
        where: { id: orderId },
        populate: ["items", "items.product", "items.product.inventory"],
      });

      if (!order) throw new Error("ORDER_NOT_FOUND");

      // --- Apply status transition rules ---
      if (newStatus === "CANCELLED") {
        // Return reserved stock back
        for (const item of order.items) {
          await strapi.db.query("api::inventory.inventory").update({
            where: { product: item.product.id },
            data: {
              reserved: Math.max(0, item.product.inventory.reserved - item.qty),
            },
          });
        }
      } else if (newStatus === "DELIVERED") {
        // Deduct from onHand and reserved
        for (const item of order.items) {
          await strapi.db.query("api::inventory.inventory").update({
            where: { product: item.product.id },
            data: {
              onHand: item.product.inventory.onHand - item.qty,
              reserved: Math.max(0, item.product.inventory.reserved - item.qty),
            },
          });
        }
      }

      // --- Finally, update the order status ---
      return strapi.db.query("api::order.order").update({
        where: { id: orderId },
        data: { status: newStatus },
      });
    },
  })
);
