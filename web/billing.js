// import { BillingInterval, BillingReplacementBehavior, GraphqlQueryError } from "@shopify/shopify-api";

// import shopify from "./shopify.js";

// export const billingConfig = {
//     "My Shopify Charge": {
//         amount: 5.0,
//         currencyCode: "USD",
//         trialDays: "",
//         interval: BillingInterval.Every30Days,
//         replacementBehavior: BillingReplacementBehavior.ApplyImmediately
//     },
// };

// const CREATE_SUBSCRIPTION_RECORD = `
//     mutation appSubscriptionCreate($lineItems: [AppSubscriptionLineItemInput!]!, $name: String!, $returnUrl: URL!, $trialDays: Int, $test: Boolean) {
//         appSubscriptionCreate(lineItems: $lineItems, name: $name, returnUrl: $returnUrl, trialDays: $trialDays, test: $test) {
//             appSubscription {
//                 id
//             }
//             confirmationUrl
//             userErrors {
//                 field
//                 message
//             }
//         }
//     }
// `;

// export async function createSubscriptionRecord(session, req) {
//     let response = {}
//     console.log("Gg")
//     try {
//         const client = new shopify.api.clients.Graphql({ session });

//         response = await client.query({
//             data: {
//                 query: CREATE_SUBSCRIPTION_RECORD,
//                 variables: {
//                     lineItems: [
//                         {
//                             plan: {
//                                 appRecurringPricingDetails: {
//                                     price: {
//                                         amount: 0,
//                                         currencyCode: ""
//                                     },
//                                     interval: ""
//                                 }
//                             }
//                         }
//                     ],
//                     name: "Free",
//                     returnUrl: `https://${shop.shopify_domain}/admin`,
//                     trialDays: "",
//                     test: true
//                 },
//             },
//         });
//         console.log(response);

//     } catch (error) {
//         if (error instanceof GraphqlQueryError) {
//             throw new Error(
//                 `${error.message}\n${JSON.stringify(error.response, null, 2)}`
//             );
//         } else {
//             throw error;
//         }
//     }

//     return response;
// }


import { BillingInterval, BillingReplacementBehavior, GraphqlQueryError, ApiVersion } from "@shopify/shopify-api";

// import shopify from "./shopify.js";

export const billingConfig = {
    "My Shopify Charge": {
        amount: 5.0,
        currencyCode: "USD",
        trialDays: 15,
        interval: BillingInterval.Every30Days,
        replacementBehavior: BillingReplacementBehavior.ApplyImmediately
    },
};

const CREATE_SUBSCRIPTION_RECORD = `
    mutation appSubscriptionCreate($lineItems: [AppSubscriptionLineItemInput!]!, $name: String!, $returnUrl: URL!, $trialDays: Int, $test: Boolean) {
        appSubscriptionCreate(lineItems: $lineItems, name: $name, returnUrl: $returnUrl, trialDays: $trialDays, test: $test) {
            appSubscription {
                id
            }
            confirmationUrl
            userErrors {
                field
                message
            }
        }
    }
`;

export async function createSubscriptionRecord(session, req) {
    let response = {}
    // try {
    //     const client = new shopify.api.clients.Graphql({ session });

    //     response = await client.query({
    //         data: {
    //             query: CREATE_SUBSCRIPTION_RECORD,
    //             variables: {
    //                 lineItems: [
    //                     {
    //                         plan: {
    //                             appRecurringPricingDetails: {
    //                                 price: {
    //                                     amount: 30,
    //                                     currencyCode: "USD"
    //                                 },
    //                                 interval: "EVERY_30_DAYS"
    //                             }
    //                         }
    //                     }
    //                 ],
    //                 name: Object.keys(billingConfig)[0],
    //                 returnUrl: shopify.utils.sanitizeShop(req.query.shop, true),
    //                 trialDays: 15,
    //                 test: true
    //             },
    //         },
    //     });
    //     console.log(response);

    // } catch (error) {
    //     if (error instanceof GraphqlQueryError) {
    //         throw new Error(
    //             `${error.message}\n${JSON.stringify(error.response, null, 2)}`
    //         );
    //     } else {
    //         throw error;
    //     }
    // }

    // return response;
}