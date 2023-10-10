export default async function useMetafields(data) {
    let cc = {
        "query": `mutation CreateAppDataMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          key
          namespace
          type
          value
        }
        userErrors {
          field
          message
          code
        }
      }
    }`,
        "variables": {
            "metafields":
            {
                "key": data.key,
                "namespace": data.namespace,
                "ownerId": data.ownerId,
                "type": data.type,
                "value": data.value
            }
        },
    }

    return await cc

}