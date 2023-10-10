import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import cors from 'cors'
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import db from './Database.js'
import nodemailer from 'nodemailer';
import useMetafields from "./useMetafields.js";
// import {PencilSquare} from 'bootstrap-icons'
import { LocalStorage } from "node-localstorage";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import fs from 'fs';

const PORT2 = 5000;//parseInt(process.env.PORT, 10);
const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);
let domain

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
const app2 = express();
app2.options('*', cors());
app2.use(cors());

app2.use(bodyParser.urlencoded({ extended: false }));
app2.use(express.static('public'));
app2.use(bodyParser.json());

// app.options('*', cors());
// app.use(cors());
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

const uploadStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './uploads/');
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 25 * 1024 * 1024, },
});

const uploadFolderPath = './uploads/';

function getFolderSize(folderPath) {
  let totalSize = 0;
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      totalSize += getFolderSize(filePath);
    }
  }

  return totalSize;
}

const folderSize = getFolderSize(uploadFolderPath);
console.log(`Upload folder size 112000: (${(folderSize / (1024 * 1024)).toFixed(2)} MB)`);

let folderSizePath = `${(folderSize / (1024 * 1024)).toFixed(2)} MB)`;
app.use("/api/*", shopify.validateAuthenticatedSession());
app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app2.post('/upload', upload.single('uploadFile'), (req, res) => {
  res.send({ data: req.files })
  // res.send('File uploaded successfully');
})

app.get("/api/folderSize", async (req, res) => {
  res.send(folderSizePath);
});

app.get("/api/getshop", async (_req, res) => {
  const countData = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send({ countData });
})

app.get("/api/subscription/get-all", async (_req, res) => {
  const client = await new shopify.api.clients.Graphql({
    session: res.locals.shopify.session
  });
  // const data = await client.query({
  //   data: `{query {
  //     node(id: "gid://shopify/AppInstallation/513137344814"
  //        {
  //       ...on AppSubscription {
  //         billingInterval
  //         createdAt
  //         currentPeriodEnd
  //         id
  //         name
  //         status
  //         test
  //         lineItems {
  //           plan {
  //             pricingDetails {
  //               ...on AppRecurringPricing {
  //                 interval
  //                 price {
  //                   amount
  //                   currencyCode
  //                 }

  //               }
  //               ...on AppUsagePricing {
  //                 terms
  //                 cappedAmount {
  //                   amount
  //                   currencyCode

  //                 }
  //                 balanceUsed {
  //                   amount
  //                   currencyCode
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  //   }`
  // });
  const data = await client.query({
    data: `query {
      currentAppInstallation {
        allSubscriptions(first:100) {
          edges {
            node {
              lineItems {
                plan {
                  pricingDetails {
                    __typename
                    ... on AppRecurringPricing {
                      price {
                        amount
                        currencyCode
                      }
                    }
                    ... on AppUsagePricing {
                      balanceUsed {
                        amount
                        currencyCode
                      }
                      cappedAmount {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
              createdAt
              id
              name
              status
              test
            }
          }
        }
      }
    }`,
  })
  res.status(200).send({ data: data, msg: "Get all data of this app  " });
});

// app.post("/api/subscription/cancel", async (_req, res) => {
//   // console.log("_555555",_req.body.id)
//   const client = await new shopify.api.clients.Graphql({
//     session: res.locals.shopify.session
//   });
//   const data = await client.query({
//     data: {
//       "query": `mutation AppSubscriptionCancel($id: ID!) {
//         appSubscriptionCancel(id: $id) {
//           userErrors {
//             field
//             message
//           }
//           appSubscription {
//             id
//             status
//           }
//         }
//       }`,
//       "variables": {
//         "id": _req.body.id
//       },
//     },

//   })
//   // console.log("data",data)
//   res.status(200).send({ data: data, msg: "Get all data of this app  " });
// });
app.post("/api/subscription/cancel", async (req, res) => {
  try {
    const { id } = req.body;
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session
    });

    const data = await client.query({
      data: {
        "query": `mutation AppSubscriptionCancel($id: ID!) {
          appSubscriptionCancel(id: $id) {
            userErrors {
              field
              message
            }
            appSubscription {
              id
              status
            }
          }
        }`,
        "variables": {
          "id": id
        },
      },
    });
    res.status(200).send({ data: data, msg: "Get all data of this app" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});
// app.get("/api/subscription/cancel", async (_req, res) => {
//   console.log("fffwqf",_req.body.id)
//   const client = await new shopify.api.clients.Graphql({
//     session: res.locals.shopify.session
//   });

//     const data=await client.query({
//     data: {
//       "query": `mutation AppSubscriptionCancel($id: ID!) {
//         appSubscriptionCancel(id: $id) {
//           userErrors {
//             field
//             message
//           }
//           appSubscription {
//             id
//             status
//           }
//         }
//       }`,
//       "variables": {
//         "id": _req.query.id
//       },
//     },

//   })
// })


// app.get('/api/qoute_To_order', (req, res) => {
//   // console.log("fhgfsfhfssfaFASDFSDFDFHFDGKDFHJWEWSfASFHDFGDHJKDH",req.query.data)
// //   let ab =[]
// //  ab.push(req.query.data);
//   // Split the comma-separated 'id' query parameter into an array
// //   const variantIDs = req.query.id.split(',');

// // const arrayData = JSON.parse(ab[0]);

// // Extract the "id" values
// // const idValues = jsonArray.map(obj => obj.id);

// // console.log("mkmkmkmkkmk",jsonArray);
//   const accessToken = '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';
//   const apiUrl = 'https://mukesh-kumar004.myshopify.com/admin/api/2023-07/draft_orders.json';

// //   // Create an array of line items based on variant IDs
// //   // const lineItems = variantIDs.map(variantID => ({
// //   //   'variant_id': String(variantIDs),
// //   //   'quantity': req.query.quantity,
// //   // }));
// //  const lineItems= jsonArray.map((variantID) => (
// //     // console.log("fffffff",variantID.id)
// //     // variantID
// //   {  
// //     'variant_id':variantID.id, 
// //     'quantity': variantID.quantity,
// //   }
// //   ));
// // let gg = JSON.stringify(arrayData)
// // let dd= gg.replace(/"/g, '')
//   const draftOrderData = {
//     draft_order: {
//       // gg
//       variant_id:req.query.id, 
//      quantity: req.query.quantity,
//     },
//   };
//   // console.log("draftOrderData0000",draftOrderData)

//   fetch(apiUrl, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-Shopify-Access-Token': accessToken,
//       'Access-Control-Allow-Origin': '*',
//     },
//     body: JSON.stringify(draftOrderData),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       console.log('Draft orders:', data);
//       // res.send({data:data.draft_order.invoice_url})
//     })
//     .catch((error) => {
//       console.error('Error fetching draft orders:', error); 
//     });
// });

app.get('/api/qoute_To_order', (req, res) => {
  let newArr = []
  newArr.push(req.query.data)
  const objects = [];
  JSON.parse(newArr).forEach(obj => {
    objects.push(obj);
  });

  const draftOrderData = {
    draft_order: {
      line_items:
        // req.query.data
        objects
    }

  }

  fetch(req.query.url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": req.query.token,
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(draftOrderData)
  })
    .then((response) => response.json())
    .then((data) => {
      res.send({ data: data.draft_order.invoice_url })
      // console.log('Draft orders:', data);
    })
    .catch((error) => {
      console.error('Error fetching draft orders:', error);
    });
})





app.get('/api/orders_status', async (req, res) => {
  const ACCESS_TOKEN = req.query.token;
  const shopDomain = req.query.domain;
  try {
    const apiUrl = `https://${shopDomain}/admin/api/2023-07/orders.json?status=any`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// app.get('/api/order_fulfillments', async (req, res) => {
//   // console.log("req.query.id_Data4555555555545544545544554",req.query.id_Data)
//   const apiKey = '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';
//   const shopDomain = 'mukesh-kumar004.myshopify.com';
//   const orderID = 5503427019051; 
//   // for (let i = 0; i < orderID.length; i++) {
//   //   let element = orderID[i];
//     // let ab=[]
//     const orderIDs = [
//   5503427019051,
//   5500454601003,
//   5497779847467,
//   5496800510251
// ];
//   try {
//     const apiUrl = `https://${shopDomain}/admin/api/2023-07/orders/${orderID}/fulfillments.json`;

//     const response = await fetch(apiUrl, {
//       method: 'GET',
//       headers: {
//         'X-Shopify-Access-Token': apiKey,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const result = await response.json();
//     res.json(result);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: 'An error occurred' });
//   }
// // }
// });
app.get('/api/order_fulfillments', async (req, res) => {
  // console.log("iddddddddddddddddddddddddd",req.query.id_Data, req.query.token, req.query.domain)
  const apiKey = req.query.token;
  // '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';
  const shopDomain = req.query.domain;
  // 'mukesh-kumar004.myshopify.com';
  console.log("testingZoommmmmm",apiKey,shopDomain)
  let newId_Data = JSON.parse(req.query.id_Data);
  const results = [];
  try {

    for (let i = 0; i < newId_Data.length; i++) {

      const apiUrl = `https://${shopDomain}/admin/api/2023-07/orders/${newId_Data[i]}/fulfillments.json`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      // console.log("bkbbkbkbbkbkbkbkbbkbkbkbk",result)
      results.push(result);
    }
    // console.log("results222222222222",JSON.stringify(results))
    // console.log("length",results.length)
    // let ss = JSON.stringify(results);
    // let ff;
    // for(let j=0; j<ss.length; j++){
    //    ff = ss[j].fulfillments;  
    // }
    //   console.log("ffffffff ", ff)

    res.send(JSON.stringify(results));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get("/api/plan/emailQuota", (req, res) => {
  db.query("SELECT * FROM `Plan` WHERE plan_name=" + req.query.planName + "", (err, result) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ result: result, msg: "success" })
    }
  })
})

app.get("/api/plan", (req, res) => {
  db.query("SELECT * FROM `Plan` ", (err, result) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ result: result, msg: "success" })
    }
  })
})

app.get("/api/app-metafield/delete", async (_req, res) => {
  const client = await new shopify.api.clients.Graphql({
    session: res.locals.shopify.session
  });
  const data = await client.query({
    data: {
      "query": `mutation metafieldDelete($input: MetafieldDeleteInput!) {
      metafieldDelete(input: $input) {
        deletedId
        userErrors {
          field
          message
        }
      }
    }`,
      "variables": {
        "input": {
          "id": _req.query.id
        }
      },
    }
  });
  res.status(200).send({ data: data, msg: "app-data-metafield deleted successfully " });
})

app2.get('/form/customFormFields', (req, res) => {
  db.query("SELECT * FROM CustomForm WHERE shopName='" + req.query.shopName + "'", (err, result) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.json({ result: result, msg: "success" })
    }
  })
})

app.post('/api/customFormFields', async (req, res) => {
  db.query("SELECT * from CustomForm where shopName='" + req.body.shopName + "'", (err, result) => {
    if (err) {
      console.log("first", err)
    }
    else {
      if (result.length != 0) {
        db.query("UPDATE `CustomForm` SET `customForm`='" + req.body.customForm + "' WHERE customForm_id= " + result[0].customForm_id + " ", (err, result) => {
          if (err) {
            console.log("first", err)
          }
          else {
            res.send({ msg: "form created successfully", type: "success" })
          }
        })

      } else {
        db.query("INSERT INTO `CustomForm`(`customForm`, `shopName`) VALUES ('" + req.body.customForm + "','" + req.body.shopName + "')", (err, result) => {
          if (err) {
            console.log("first", err)
          }
          else {
            res.send({ msg: "form created successfully", type: "success" })
          }
        })
      }
    }
  })
})

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.get('/api/serachProducts', async (req, res) => {
  const NameVar = JSON.parse(req.query.product_name)
  db.query(`SELECT  AddQuotes.add_qoutes_id created_at, AddQuotes.shop_name, user_data, AddQuotes.add_qoutes_id, product_name, product_image, product_variants FROM QuotesDetail INNER JOIN AddQuotes ON AddQuotes.add_qoutes_id =QuotesDetail.quotes_detail_id where AddQuotes.shop_name=${req.query.shop} AND product_name LIKE '%${NameVar}%'  LIMIT  ${req.query.firstPost}, ${req.query.listingPerPage} `, (err, results) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ data: results, msg: "success" })
    }
  })
})

app.get("/api/name", (req, res) => {
  db.query("SELECT COUNT(*) as count FROM QuotesDetail WHERE shop_name=" + req.query.shop + "", (err, result) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ result: result[0].count, msg: "success" })
    }
  })
})

app.get("/api/searchTotalRecord", (req, res) => {
  const NameVar = JSON.parse(req.query.product_name)
  db.query(`SELECT COUNT(*) as count FROM QuotesDetail INNER JOIN AddQuotes ON AddQuotes.add_qoutes_id =QuotesDetail.quotes_detail_id where AddQuotes.shop_name=${req.query.shop} AND product_name LIKE '%${NameVar}%'`, (err, result) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ result: result[0].count, msg: "success" })
    }
  })
})

app.post("/api/subscription/create", async (_req, res) => {
  const client = await new shopify.api.clients.Graphql({
    session: res.locals.shopify.session
  });
  const data = await client.query({
    data: {
      "query": `mutation appSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean, $trialDays: Int) {
        appSubscriptionCreate(name: $name, lineItems: $lineItems, returnUrl: $returnUrl, test: $test, trialDays: $trialDays) {
          appSubscription {
            id
          }
          confirmationUrl
          userErrors {
            field
            message
          }
        }
      }`,
      "variables": {
        "name": `${_req.body.plan}`,
        "test": true,
        "returnUrl": _req.body.returnUrl,
        "lineItems": [_req.body.data],
        "trialDays": 0
      },
    },
  });
  //   const data = await client.query({
  //   data: {
  //     "query": `mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!) {
  //       appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems) {
  //         userErrors {
  //           field
  //           message
  //         }
  //         appSubscription {
  //           id
  //         }
  //         confirmationUrl
  //       }
  //     }`,
  //     "variables": {
  //       "name": `${_req.body.plan}`,
  //       "trialDays": 50,
  //       "returnUrl": `https://admin.shopify.com/store/${_req.body.shop}/apps/quotes-app`,
  //       "lineItems": _req.body.data
  //     },
  //   },
  // });
  res.status(200).send({ data: data, msg: "Get all data of this app  " });
})


app.get("/api/subscription/planstatus", async (req, res) => {
  const data = await shopify.api.rest.RecurringApplicationCharge.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send({ data: data });
})

app.get("/api/countFilter", async (req, res) => {
  let Newtoday = JSON.parse(req.query.value);
  let whereClause
  if (Newtoday === "today") {
    whereClause = `AND create_date = CURDATE()`
    // whereClause = `AND created_at SUBDATE(DATE_FORMAT(CURDATE(), "%y/%m/%d") `
    // whereClause = "AND created_at LIKE '" + JSON.parse(req.query.date) + "%' "
  }
  if (Newtoday === "yesterday") {
    whereClause = `AND create_date = CURDATE() -1`
    // whereClause = `AND create_date BETWEEN   SUBDATE(DATE_FORMAT(CURDATE(), "%y/%m/%d"), INTERVAL 1 DAY ) AND DATE_FORMAT(CURDATE(), "%y/%m/%d")`
  }

  if (Newtoday === "month") {
    whereClause = `AND create_date BETWEEN   SUBDATE(DATE_FORMAT(CURDATE(), "%y/%m/%d"), INTERVAL 1 MONTH ) AND DATE_FORMAT(CURDATE(), "%y/%m/%d")`
  }

  if (Newtoday === "lastWeek") {
    whereClause = `AND create_date BETWEEN   SUBDATE(DATE_FORMAT(CURDATE(), "%y/%m/%d"), INTERVAL 7 DAY ) AND DATE_FORMAT(CURDATE(), "%y/%m/%d")`
  }

  db.query("SELECT COUNT(*)  as count FROM `AddQuotes` WHERE shop_name =" + req.query.shopName + " " + whereClause + "", (err, result) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ data: result, msg: "success" })
    }
  })
})

app2.get('/prod/productstats', async (req, res) => {
  const data = db.query("SELECT COUNT(*) as count FROM `ProductStats` WHERE product_id = '" + req.query.productId + "' ", (err, result) => {
    if (err) {
      console.log("err", err)
    }
    else {
      db.query("SELECT * FROM `ProductStats` WHERE product_id = '" + req.query.productId + "' ", (err, result2) => {
        if (err) {
          console.log("err", err)
        }
        else {
          res.send({ count: result, result: result2 })
        }
      })

    }
  })
})

app2.post("/qoutes/insertproduct", async (req, res) => {
  let viewsVal = 1
  let conV = 0
  const data = db.query("INSERT INTO `ProductStats`(`shop_name`, `product_id`, `product_name`, `views`, `clicks`, `conversions`) VALUES ('" + req.body.shopName + "' ,'" + req.body.productId + "','" + req.body.productName + "','" + viewsVal + "','" + viewsVal + "','" + conV + "')", (err, result) => {
    if (err) {
      console.log("first", err)
    }
    else {
      console.log("result", result)
    }
  })

})

app2.post("/quotes/updateproduct", (req, res) => {
  const views = parseInt(req.body.view) + 1
  const clicks = parseInt(req.body.click) + 1
  const conversions = parseInt(req.body.conversion) + 1
  let whereClause = ""
  if ("modalview" === req.body.modalview) {
    whereClause = 'views=' + views + ',clicks=' + clicks + ''
  }

  if ("modalsubmit" === req.body.modalsubmit) {
    whereClause = 'conversions=' + conversions + ''
  }

  const updateData = db.query("UPDATE `ProductStats` SET " + whereClause + " WHERE product_stats_id = " + req.body.productId + " AND shop_name = '" + req.body.shopName + "'", (err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.send("success")
    }
  }
  )
})

app.get("/api/userDetail", (req, res) => {
  db.query("SELECT * FROM AddQuotes WHERE shop_name = " + JSON.stringify(req.query.shop) + "  AND product_id= " + JSON.stringify(req.query.product_id) + " ", (err, result) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ data: result })
    }
  })
})

app.get("/api/product/productList", async (req, res) => {
  db.query("SELECT * FROM `ProductStats` where shop_name=" + req.query.shopName + "ORDER BY product_name ASC" + " LIMIT " + req.query.firstPost + ", " + req.query.listingPerPage + "", (err, results) => {
    // db.query("SELECT * FROM `ProductStats` where shop_name=" + req.query.shopName + "ORDER BY product_name ASC", (err, results) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ data: results, msg: "success" })
    }
  })
})

app.get("/api/product/getproductstats", (req, res) => {
  const data = db.query("SELECT COUNT(*) as count FROM `ProductStats` WHERE shop_name ='" + req.query.shopName + "' ", (err, result) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ data: result })
    }
  })
})

app.get("/api/chartFilter", async (req, res) => {
  let Newtoday = JSON.parse(req.query.value);
  let whereClause
  if (Newtoday === "today") {
    whereClause = `AND create_date BETWEEN SUBDATE( DATE_FORMAT(CURDATE(), "%y%m%d"), INTERVAL 1 MONTH) AND DATE_FORMAT(CURDATE(), "%y%m%d") GROUP BY create_date ORDER BY create_date ASC`
  }

  if (Newtoday === "month") {
    whereClause = `AND create_date> now() - INTERVAL 12 month GROUP by DATE_FORMAT(create_date, '%M') ORDER by create_date ASC;`
  }

  db.query("SELECT  create_date, count(create_date) as count FROM `AddQuotes` WHERE shop_name =" + req.query.shopName + " " + whereClause + "", (err, result) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ data: result, msg: "success" })
    }
  })
})
// app.get("/api/chartFilter", async (req, res) => {
//   let Newtoday = JSON.parse(req.query.value);
//   let whereClause
//   if (Newtoday === "today") {
//     // whereClause = `AND create_date=CURDATE();`
//     whereClause = `AND create_date BETWEEN SUBDATE(DATE_FORMAT(CURDATE(), "%y%m%d"), INTERVAL 1 MONTH ) AND DATE_FORMAT(CURDATE(), "%y%m%d") GROUP BY create_date ORDER BY create_date ASC;`
//   }

//   if (Newtoday === "month") {
//     // whereClause = `AND create_date=CURDATE()- INTERVAL 12 month GROUP by DATE_FORMAT(create_date, '%M') ORDER by create_date ASC;`
//     whereClause = `AND create_date > now() - INTERVAL 12 month GROUP by DATE_FORMAT(create_date, '%M') ORDER by create_date ASC;`
//   }

//   console.log("ggggggggggg", "SELECT * FROM `AddQuotes` WHERE shop_name =" + req.query.shopName + " " + whereClause + "")
//   db.query("SELECT  create_date, count(create_date) as count FROM `AddQuotes` WHERE shop_name =" + req.query.shopName + " " + whereClause + "", (err, result) => {
//     if (err) {
//       console.log("err", err)
//     }
//     else {
//       res.send({ data: result, msg: "success" })
//     }
//   })
// })

app.get("/api/quoteList", async (req, res) => {
  // console.log("first....", `SELECT  (*)as count FROM QuotesDetail`)
  db.query("SELECT  * FROM `QuotesDetail`where shop_name=" + req.query.shop + "ORDER BY product_name ASC" + " LIMIT " + req.query.firstPost + ", " + req.query.listingPerPage + "", (err, results) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ data: results, msg: "success" })
    }
  })
})
app.get("/api/quoteList_withoutPagination", async (req, res) => {
  // console.log("first....", `SELECT  (*)as count FROM QuotesDetail`)
  db.query("SELECT  * FROM `QuotesDetail`where shop_name=" + req.query.shop + "ORDER BY quotes_detail_id ASC" + " ", (err, results) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ data: results, msg: "success" })
    }
  })
})



app.get("/api/csvData", async (req, res) => {
  db.query("SELECT * FROM `QuotesDetail`where shop_name=" + req.query.shop + "  ORDER BY product_name ASC ", (err, results) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ data: results, msg: "success" })
    }
  })
})

app.get("/api/remainingQuote", async (req, res) => {
  db.query("SELECT COUNT(*) as count FROM AddQuotes WHERE shop_name=" + req.query.shop + " and create_date >= '" + req.query.startDate + "' and create_date <= '" + req.query.lastDate + "'", (err, result) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ result: result[0].count })
    }
  })
})



app.get("/api/update_order_Status", (req, res) => {
  // let gg = JSON.parse(req.query.data);
  // console.log("ccccccccc012012",req.query.data)
  let dataArr =[]
  dataArr.push(req.query.data);
  let NewData = JSON.parse(dataArr[0]);
for (let i = 0; i < NewData.length; i++) {
  // console.log("dddddddddddd",NewData[i].product_id)
  let order = "Order Placed";
  // console.log("tokenTest", (`UPDATE QuotesDetail SET product_status="order" WHERE product_id="+ gg[i].product_id +"`))
  // console.log("tokenTest77777", "UPDATE QuotesDetail SET product_status='"+order+"' WHERE product_variant_id ='" + NewData[i].product_id + "' ")
  const updateData = db.query("UPDATE QuotesDetail SET product_status='"+order+"' WHERE product_variant_id ='" + NewData[i].product_id + "' ", (err, result) => {
    if (err) {
      console.log(err)
    } else {
      // console.log("result14141414",result)
      // res.send({data:result})
      res.send("success")
    }
  }
  )
  
}
})


app2.post("/quote/createquote", (req, res) => {
  let UserArr = req.body.userArr;
  let shop = req.body.shop
  let product = req.body.productArr
  const variants = req.body.variants
  const variant = JSON.stringify(req.body.variants)
  let entries = Object.entries(variants)

  const createQuotes = db.query("INSERT INTO `AddQuotes`(`shop_name`,`product_id` ,`user_data`) VALUES ('" + shop.shop_name + "','" + product.id + "', '" + UserArr + "')", (err, result) => {
    if (err) {
      console.log("first", err)
    }

    else {
      db.query("SELECT * FROM QuotesDetail WHERE product_id='" + product.id + "'", (err, result) => {
        if (err) {
          console.log("first", err)
        }
        else {
          if (result.length === 0) {
            db.query("INSERT INTO `QuotesDetail`(`product_id`, `shop_name`,  `product_name`, `product_image`, `product_variants`, product_variant_id) VALUES ('" + product.id + "','" + shop.shop_name + "','" + product.title + "','" + product.image + "','" + variant + "','" + req.body.variantId + "')", (err, result) => {
              if (err) {
                console.log("first", err)
              }

              let image = product.image;
              let finalImage;

              if (image) {
                let newImg = image.indexOf("?")
                finalImage = image.substring(0, newImg)
              }
              else {
                finalImage = null;
              }

              let message = "";
              entries.map(([key, val] = entry) => {
                return message += `<span ><b>${key}</b> : ${val} </span> `
              })

              let divTag = "";

              JSON.parse(UserArr).map((item, index) => {
                const key = Object.keys(item)[0];
                const value = Object.values(item)[0];
                return (
                  divTag += `<div style="margin-left:38px" key=${index}>${key}: ${value}</div>`
                )
              })
              // var transporter = nodemailer.createTransport({
              //   service: 'Gmail',
              //   auth: {
              //     user: "gurmeet.webframez@gmail.com",
              //     pass: "eevtwsaefulfxcmk",
              //   }
              // });
              db.query("SELECT *  FROM EmailSMTP WHERE shop_name='" + shop.shop_name + "' ", (err, result) => {
                if (err) {
                  console.log("err", err)
                }
                else {
              
                  let transporter = nodemailer.createTransport({
                    host: result[0].smtp_server,
                    // host: "smtp-relay.sendinblue.com",
                    // port: 587,
                    port: result[0].port,
                    secure: false,
                    auth: {
                      user: result[0].user_email,
                      pass: result[0].password
                      // user: "gurmeet.webframez@gmail.com",
                      // pass: "I5CNfgOPp6twxM19",
                    },
                  });

                  transporter.sendMail({
                    headers: {
                      From: "mukeshkumar.webframez@gmail.com",
                      To: shop.shop_email,
                      Subject: shop.subject,
                    },
                    html: ` <div style="width:700px;margin:auto;">
                    <div>
                        <table style="width:100%;max-width:100%;margin-bottom:20px;font-size:16px;background:#00387f">
                            <thead>
                                <tr>
                                    <th style="text-align:left">
                                        <div style="padding:15px">
                                            <div style="max-height:60px;max-width:100px;margin-right:auto">
                                            </div>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div style="margin:0 12px;color:#ffffff;text-align:center">
                                            <h2>Request a quote - Company Name</h2>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="padding:15px;background:#fbfbfb">
                        <div>
                            <table style="width:100%;max-width:100%;margin:20px 0;font-size:16px">
                                <tbody>
                                    <tr>
                                        <td>
                                            <div style="display:flex">
                                                <img src="https://img.icons8.com/?id=3225&format=png"
                                                    style="  width: 21px; height: 21px" alt="">
                                                <span style="margin-left:15px">CUSTOMER INFORMATION</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div style="margin-left:38px">Create At: ${req.body.date}</div>
                                            ${divTag}                                                         
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            
                        </div>
                    </div>
                    <div>
                        <div style="font-size:18px;margin-top:24px">
                            Quote form information:
                        </div>
                        <div style="background:#fff;padding:10px">
                            <table style="width:100%;max-width:100%;margin-bottom:20px;font-size:16px">
                                <tbody>
                                    <tr>
                                        <td style="border-top:1px solid #f1f1f6">
                                            <div style="display:flex">
                                                <img src=${finalImage} alt="image-product"
                                                    style="max-width:120px;padding:15px 15px 15px 0">
                                                <div>
                                                    <p style="font-weight:600">${product.title}</p>
                                                    ${message}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>`
                  });

                }
              })
              if (err) {
                res.send({
                  status: "error",
                  Message: "Something went wrong"
                });
              }
              else {
                res.send({
                  status: "success",
                  Message: "Data Saved Sucessfuly"
                });
              }
            })
          }
          else {
            let image = product.image;
            let finalImage;
            if (image) {
              let newImg = image.indexOf("?")
              finalImage = image.substring(0, newImg)
            }
            else {
              finalImage = null;
            }
            let message = "";
            entries.map(([key, val] = entry) => {
              return message += `<span ><b>${key}</b> : ${val} </span>  `
            })
            let divTag = "";
            JSON.parse(UserArr).map((item, index) => {
              const key = Object.keys(item)[0];
              const value = Object.values(item)[0];
              return (
                divTag += `<div style="margin-left:38px" key=${index}>${key}: ${value}</div>`
              )
            })

            db.query("SELECT *  FROM EmailSMTP WHERE shop_name='" + shop.shop_name + "' ", (err, result) => {
              if (err) {
                console.log("err", err)
              }
              else {
                let transporter = nodemailer.createTransport({
                  host: result[0].smtp_server,
                  port: result[0].port,
                  // host: "smtp-relay.sendinblue.com",
                  // port: 587,
                  secure: false,
                  auth: {
                    user: result[0].user_email,
                    pass: result[0].password
                    // user: "gurmeet.webframez@gmail.com",
                    // pass: "I5CNfgOPp6twxM19",
                  },
                });

                transporter.sendMail({

                  headers: {
                    From: result[0].from_email,
                    To: shop.shop_email,
                    Subject: shop.subject,
                  },
                  html: ` <div style="width:700px;margin:auto;">
        <div>
            <table style="width:100%;max-width:100%;margin-bottom:20px;font-size:16px;background:#00387f">
                <thead>
                    <tr>
                        <th style="text-align:left">
                            <div style="padding:15px">
                                <div style="max-height:60px;max-width:100px;margin-right:auto">
                                </div>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div style="margin:0 12px;color:#ffffff;text-align:center">
                                <h2>Request a quote - Company Name</h2>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div style="padding:15px;background:#fbfbfb">
            <div>
                <table style="width:100%;max-width:100%;margin:20px 0;font-size:16px">
                    <tbody>
                        <tr>
                            <td>
                                <div style="display:flex">
                                    <img src="https://img.icons8.com/?id=3225&format=png"
                                        style="  width: 21px; height: 21px" alt="">
                                    <span style="margin-left:15px">CUSTOMER INFORMATION</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div style="margin-left:38px">Create At: ${req.body.date}</div>
                          
                                ${divTag}         
                                                 
                            </td>
                        </tr>
                    </tbody>
                </table>
                
            </div>
        </div>
        <div>
            <div style="font-size:18px;margin-top:24px">
                Quote form information:
            </div>
            <div style="background:#fff;padding:10px">
                <table style="width:100%;max-width:100%;margin-bottom:20px;font-size:16px">
                    <tbody>
                        <tr>
                            <td style="border-top:1px solid #f1f1f6">
                                <div style="display:flex">
                                    <img src=${finalImage} alt="image-product"
                                        style="max-width:120px;padding:15px 15px 15px 0">
                                    <div>
                                        <p style="font-weight:600">${product.title}</p>
                                        ${message}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>`
                });

                // transporter.sendMail({
                //   headers: {
                //     From: "mukeshkumar.webframez@gmail.com",
                //     To: shop.shop_email,
                //     Subject: shop.subject,
                //   },
                //   html: `<p>This is the HTML content of your email.</p>`,
                //   // ... rest of the options ...
                // });
              }

            })
            if (err) {
              res.send({
                status: "error",
                Message: "Something went wrong"
              });
            }
            else {
              res.send({
                status: "success",
                Message: "Data Saved Sucessfuly"
              });
            }
          }
        }
      })

    }
  })
})

app.post("/api/testemail", async (_req, res) => {
  let request = _req.body
  db.query("SELECT *  FROM EmailSMTP WHERE shop_name='" + _req.body.shopName + "' ", (err, result) => {
    if (err) {
      console.log("err", err)
    }
    else {
      let transporter = nodemailer.createTransport({
        // host: "smtp-relay.sendinblue.com",
        // port: 587,
        host: result[0].smtp_server,
        port: result[0].port,
        secure: false,
        auth: {
          // user: "gurmeet.webframez@gmail.com",
          // pass: "I5CNfgOPp6twxM19",
          user: result[0].user_email,
          pass: result[0].password
        },
      });

      transporter.sendMail({
        headers: {
          From: request.email,
          To: "mukeshkumar.webframez@gmail.com",
          Subject: request.subject,
          // To: request.email,
          // Subject: request.subject,
        },
        html: `<div style="width:700px;margin:auto;">
    <div>
        <table style="width:100%;max-width:100%;margin-bottom:20px;font-size:16px;background:#00387f">
            <thead>
                <tr>
                    <th style="text-align:left">
                        <div style="padding:15px">
                            <div style="max-height:60px;max-width:100px;margin-right:auto">
                            </div>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div style="margin:0 12px;color:#ffffff;text-align:center">
                            <h2>Request a quote - Company Name</h2>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div style="padding:15px;background:#fbfbfb">
        <div>
          
            <table style="width:100%;max-width:100%;margin:20px 0;font-size:16px">
                <tbody>
                    <tr>
                        <td>
                            <div style="display:flex">
                                <img src="https://img.icons8.com/?id=3225&format=png" style="  width: 21px; height: 21px" alt="" >
                                    <span style="margin-left:15px">CUSTOMER INFORMATION</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                        <div style="margin-left:38px">Created At: ${request.date}</div>
                            <div style="margin-left:38px">Name: ${request.name}</div>
                            <div style="margin-left:38px">Email: <a href="mailto:${request.email} target="_blank">${request.email}</a></div>
                            <div style="margin-left:38px">Mob: ${request.number}</div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table style="width:100%;max-width:100%;margin:20px 0;font-size:16px">
            <tbody>
            <tr>
            <td>
                <div>
                <img src="https://img.icons8.com/?id=49&format=png" alt="" style="width: 21px; height: 21px"  >
                <span style="margin-left:15px">QUOTE MESSAGE</span>
                </div>
            </td>
        </tr>
        <tr>
            <td>
            <div style="font-size:16px;margin-left:38px " > ${request.msg} </div>
            </td>
        </tr>
    </tbody>
        </table>

            <table style="width:100%;max-width:100%;margin:20px 0;font-size:16px">
                <tbody>
                <tr>
                <td>
                    <img src="https://img.icons8.com/?id=2bMQJZQif7nl&format=png" alt="" style="width: 21px; height: 21px"  >
                    <span style="margin-left:15px">Product Information:</span>
                </td>
            </tr>
          <tr>
            <td style="border-top:1px solid #f1f1f6">
            <div style="display:flex">
            <img src="https://ci6.googleusercontent.com/proxy/OtfvSwk5q_LWT6OGQiRziN4fCKFUFK-w2h0IIQVnOZ8kX0fSg4Ko9mIG8sqChDd8_voBT9hsiggjm7haI5kyqA1floLRW-dH3izG7vGWKfG8VPUGPowfHt2bNewmwO9kP56DmD0X2Gv7qhAcHe3NRMiRe6jE8OymMGPJ9OXdFF3YcH3fE2PYbJqSCZ9QQhXj2A=s0-d-e1-ft#https://cdn.shopify.com/s/files/1/0734/4072/3246/products/single-sprout-in-a-pot_925x_a26a8b11-9dc1-4c33-b5ee-577856930c3c.jpg" alt="image-product" style="max-width:120px;padding:15px 15px 15px 0" class="CToWUd" data-bit="iit">
                <div>
                    <p style="font-weight:600">Clay Plant Pot</p>
                    <span><b>Size</b> : Regular </span> <span><b>Color</b> : Red </span> </div>
        </div>
            </td>
        </tr>
        </tbody>
            </table>
      
            </div>
        </div>
    `
      }).then(res.send({ msg: "sucess" }))
        .catch(console.log("console_check"))

    }
  })

})

app.get("/api/app-metafield/get-id", async (_req, res) => {
  const client = await new shopify.api.clients.Graphql({
    session: res.locals.shopify.session
  });
  const data = await client.query({
    data: `query {
                      currentAppInstallation {
                      id
                    }
  }`
  });
  res.status(200).send({ data: data, msg: "Get id of app metafield " });
});

app.post("/api/app-metafield/create", async (_req, res) => {
  const client = await new shopify.api.clients.Graphql({
    session: res.locals.shopify.session
  });
  // let ourData = await createAppMetafieldFunction(_req.body);
  let ourData = await useMetafields(_req.body);
  const data = await client.query({
    data: ourData,
  });
  res.status(200).send({ data: data, status: "success", msg: "Data is saved successfully" });
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.post("/api/emailSMTP_data", async (req, res) => {
  db.query("INSERT INTO EmailSMTP ( driver, smtp_server, user_email, password, port, from_email, shop_name) VALUES ('" + req.body.driver + "','" + req.body.smtp_server + "','" + req.body.user_email + "','" + req.body.password + "','" + req.body.port + "','" + req.body.from_email + "','" + req.body.shop_name + "')", (err, results) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ data: results, msg: "success" })
    }
  })
})

app.get("/api/app-metafield/get-all", async (_req, res) => {
  const client = await new shopify.api.clients.Graphql({
    session: res.locals.shopify.session
  });

  const data = await client.query({
    data: `query {
                      app {
                      id
        installation {
                      metafields(first: ${10}) {
                      edges {
                      node {
                      id
                namespace
                    key
                    value
              }
            }
          }
        }
      }
    }`
  });

  res.status(200).send({ data: data, msg: "Get all data of this app  " });
});

app.get("/api/appsubscription/get-all", async (_req, res) => {
  const client = await new shopify.api.clients.Graphql({
    session: res.locals.shopify.session
  });

  const data = await client.query({
    data: `query {
      currentAppInstallation {
        allSubscriptions(first: 50) {
          edges {
            node {
              id
              status
              lineItems {
                id
                usageRecords(first: 5) {
                  edges {
                    node {
                      id
                      description
                      createdAt
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `
  });

  res.status(200).send({ data: data, msg: "Get all data of this app  " });
});

global.localStorage = new LocalStorage('./scratch');

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  domain = JSON.stringify(res.req.rawHeaders[1])
  localStorage.setItem('myFirstKey', res.req.rawHeaders[1]);
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});


app.post("/quotes/productstatus", (req, res) => {

  const data = db.query("SELECT * FROM `ProductStats` WHERE product_id='" + req.body.productId + "' AND shop_name='" + req.body.shopName + "'", (err, result) => {
    if (err) {
      console.log("first", err)
    }
    else {
      res.send({ data: result, msg: "success" })
    }
  })
})

app.post("/quotes/productstatus", (req, res) => {

  const data = db.query("INSERT INTO `ProductStats`(`shop_name`, `product_id`, `product_name`, `product_variants`, `views`, `clicks`, `conversions`) VALUES ('[value-2]','[value-3]','[value-4]','[value-5]','[value-6]','[value-7]','[value-8]')", (err, result) => {
    if (err) {
      console.log("first", err)
    }
    else {
      console.log("test")
    }
  })
})

// app2.listen(PORT2);
// app.listen(PORT);
app.listen(PORT, () => {
  console.log("Started server on PORT");
});

app2.listen(PORT2, () => {
  console.log("Started server on PORT2");
});

