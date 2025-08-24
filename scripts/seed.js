import { request, gql } from 'graphql-request';

const endpoint = process.env.PUBLIC_GRAPHQL_URL || 'http://localhost:1337/graphql';

// GraphQL mutations for creating data
const mutation = gql`
  mutation SeedData($products: [ProductInput!]!, $inventories: [InventoryInput!]!, $customers: [CustomerInput!]!) {
    createProducts(data: $products) { id name sku price active }
    createInventories(data: $inventories) { id onHand reserved product { data { id } } }
    createCustomers(data: $customers) { id email name phone }
  }
`;

async function main() {
  const variables = {
    products: [
      { name: 'Laptop', sku: 'LAP123', price: 1000, active: true },
      { name: 'Phone', sku: 'PHN456', price: 500, active: true },
      { name: 'Tablet', sku: 'TAB789', price: 750, active: true }
    ],
    inventories: [
      { onHand: 10, reserved: 0, product: 1 },
      { onHand: 20, reserved: 0, product: 2 },
      { onHand: 15, reserved: 0, product: 3 }
    ],
    customers: [
      { email: 'john@example.com', name: 'John Doe', phone: '123456789' },
      { email: 'jane@example.com', name: 'Jane Smith', phone: '987654321' }
    ]
  };

  try {
    const response = await request(endpoint, mutation, variables);
    console.log('Seeded demo data ✅');
    console.log(response);
  } catch (err) {
    console.error('Error seeding data:', err);
  }
}

main();
