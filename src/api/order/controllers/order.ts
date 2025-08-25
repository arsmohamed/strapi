/**
 * order controller
 * Strapi gives you order(id) but you might want to customize the return fields.
 * This ensures GraphQL resolves with customer { name email } and items { qty priceAtPurchase product { name sku } }.
 * 
 * orders query (with pagination & filters)
Already provided by Strapi GraphQL out of the box:
 * query {
  orders(
    pagination: { page: 1, pageSize: 10 }
    filters: { status: { eq: CONFIRMED } }
  ) {
    data {
      id
      attributes {
        status
        total
        customer { data { attributes { name email } } }
      }
    }
  }
}
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async findOne(ctx) {
      const { id } = ctx.params;
      const entity = await strapi.db.query("api::order.order").findOne({
        where: { id },
        populate: {
          customer: true,
          items: {
            populate: { product: true },
          },
        },
      });
      return entity;
    },
  })
);
