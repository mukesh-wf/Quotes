import React, { useState } from 'react'
import { useAuthenticatedFetch } from './useAuthenticatedFetch'

const useApi = () => {
    const [metafieldId, setMetafieldId] = useState("")
    const fetch = useAuthenticatedFetch()
    const [subscrId, setSubscrId] = useState([])

    const shop = async () => {
        try {
            const response = await fetch(`/api/getshop`);
            const result = await response.json();
            let domain = result.countData[0].domain
            let position = domain.search(".myshopify.com")
            const shopName = domain.substring(0, position)
            const email = result.countData[0].email
            return {
                shopName: shopName,
                domain: domain,
                email: email
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    const metafield = async () => {
        try {
            const response = await fetch("/api/app-metafield/get-id");
            const result = await response.json();
            const id = result.data.body.data.currentAppInstallation.id
            return id
        } catch (error) {
            console.error("Error:", error);
        }
    }
    const getSubscription = async () => {
        let arr
        let Newarr=""
        try {
            const response = await fetch(`/api/subscription/get-all`);
            const result = await response.json();
            arr = result.data.body.data.currentAppInstallation.allSubscriptions.edges
        } catch (error) {
            console.error("Error:", error);
        }
        const data = await arr.find((value) => {
            if (value.node.status === "ACTIVE") {
                Newarr=value.node.id
            }
        })
        let id= Newarr
        return  id
    }

    return {
        shop: shop,
        metafield: metafield,
        getSubscription: getSubscription
    }
}

export default useApi