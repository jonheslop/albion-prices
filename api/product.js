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
            title
            contextualPricing(context: {country: $countryCode}) {
              price {
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
    return res.status(500).send(err);
  }

  res.setHeader('Cache-Control', 'max-age=0, s-maxage=86400');
  res.status(200).json(products);
}
