"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShopify = exports.getOrdersWithDate = void 0;
const getOrdersWithDate = (date) => `query orders($cursor: String) {
    orders(first: 50, query: "created_at:>=${date.from_created_date} created_at:<${date.to_created_date}", after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          createdAt 
          displayFulfillmentStatus
          displayFinancialStatus
          totalDiscountsSet {
            shopMoney {
              amount
            }
          }
          totalPriceSet {
            shopMoney {
              amount
            }
          }
          totalReceivedSet {
            shopMoney {
              amount
            }
          }
          totalRefundedSet {
            shopMoney {
              amount
            }
          }
          netPaymentSet {
            shopMoney {
              amount
            }
          }
          transactions {
            id
            createdAt
            kind
            status
            amountSet {
              shopMoney {
                amount
              }
            }
          }
        }
      }
    }
  }`;
exports.getOrdersWithDate = getOrdersWithDate;
const getShopify = () => `query {
    shop {
      name
      url
      currencyCode
    }
  }`;
exports.getShopify = getShopify;
//# sourceMappingURL=query.js.map