import { Shopify } from '@shopify/shopify-api';

const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN;
const shop = process.env.SHOP;

export default async function handler(req, res) {
  const storefrontClient = new Shopify.Clients.Graphql(
    shop,
    shopifyAccessToken
  );

  const { id = null, country = 'GB' } = req.query;

  if (id == null) return res.send('please supply product variant id')

  let products;
  try {
    products = await storefrontClient.query({
      data: {
        query: `query GetProducts($id: ID!, $countryCode: CountryCode!) {
          productVariant(id: $id) {
            contextualPricing(context: {country: $countryCode}) {
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
            }
          }
        }`,
        variables: {
          id: `gid://shopify/ProductVariant/${id}`,
          countryCode: country,
        },
      },
    });
  } catch (err) {
    // console.error(err)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    return res.status(500).send(err);
  }
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'max-age=0, s-maxage=86400');

  const { price, compareAtPrice } =
    products.body.data.productVariant.contextualPricing;
  res.status(200).json({
    price,
    compareAtPrice,
  });
}
