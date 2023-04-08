export const assembleCart = ({ cartResponse, cartItems, products }: any) => {
  return {
    id: cartResponse.id,
    items: cartItems.map(({ count, product_id }) => {
      return {
        count: count,
        product: products.find(product => product.id === product_id),
      };
    }),
  };
};
