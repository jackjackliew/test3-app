import Shopify, { ApiVersion, AuthQuery } from '@shopify/shopify-api';

export const shopifySetup = () => {
  const API_KEY = process.env.API_KEY ? process.env.API_KEY : '';
  const API_SECRET_KEY = process.env.API_SECRET_KEY ? process.env.API_SECRET_KEY : '';
  const SCOPES = process.env.SCOPES ? process.env.SCOPES : '';
  const HOST = process.env.HOST ? process.env.HOST : '';
  const { HOST_SCHEME } = process.env;

  Shopify.Context.initialize({
    API_KEY,
    API_SECRET_KEY,
    SCOPES: [SCOPES],
    HOST_NAME: HOST.replace(/https?:\/\//, ''),
    HOST_SCHEME,
    IS_EMBEDDED_APP: false,
    API_VERSION: ApiVersion.October22, // all supported versions are available, as well as "unstable" and "unversioned"
  });

  const activeShopifyShops: { [key: string]: string | undefined } = {};

  return activeShopifyShops;
};
