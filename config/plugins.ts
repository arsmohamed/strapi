export default {
  graphql: {
    enabled: true,
    config: {
      defaultLimit: 50,
      maxLimit: 100,
      apolloServer: { introspection: true },
    },
  },
};
