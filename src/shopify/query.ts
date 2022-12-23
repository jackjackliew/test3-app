export const getOrdersWithDate = (date: any) => `query orders($cursor: String) {
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
          channelInformation {
            channelDefinition {
              channelName
              subChannelName
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

export const getShopify = () => `query {
    shop {
      id
      name
      url
      currencyCode
    }
  }`;
