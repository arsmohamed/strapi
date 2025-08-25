export default {
  graphql: {
    enabled: true,
    config: {
      defaultLimit: 50,
      apolloServer: { introspection: true },
    },
  },
};
