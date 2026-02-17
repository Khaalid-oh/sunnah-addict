export const gql = String.raw;

export const cartQuery = gql`
  query Cart($id: ID!) {
    cart(id: $id) {
      id
      checkoutUrl
      lines(first: 100) {
        edges {
          node {
            quantity
          }
        }
      }
    }
  }
`;

export const discoverCollectionQuery = gql`
  query DiscoverCollection($handle: String!) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: 8) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

export const collectionQuery = gql`
  query Collection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            tags
            featuredImage {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

export const productSearchQuery = gql`
  query ProductSearch($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
            }
          }
        }
      }
    }
  }
`;

/** All products with tags and featuredImage for collection-style pages (e.g. New Arrivals) */
export const allProductsQuery = gql`
  query AllProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          tags
          featuredImage {
            url
            altText
          }
        }
      }
    }
  }
`;

export const productsQuery = gql`
  query Products {
    products(first: 20) {
      edges {
        node {
          id
          title
          handle
          priceRange {
            minVariantPrice {
              amount
            }
          }
          media(first: 1) {
            edges {
              node {
                ... on MediaImage {
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/** Single product by ID (2026-01 Storefront API). */
export const singleProductQuery = gql`
  query SingleProduct($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      description
      descriptionHtml
      featuredImage {
        url
        altText
      }
      media(first: 20) {
        edges {
          node {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

/** Single product by handle (for /products/[handle] routes). Same shape as singleProductQuery. */
export const singleProductByHandleQuery = gql`
  query SingleProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      featuredImage {
        url
        altText
      }
      media(first: 20) {
        edges {
          node {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;