import React from 'react'
import {Button} from '@shopify/polaris';
import "./css/myStyle.css"
import { useAuthenticatedFetch } from '../hooks'
import useApi from '../hooks/useApi';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSubscriptionUrl from '../hooks/useSubscriptionUrl';

const CancelSubscription = () => {
    const fetch = useAuthenticatedFetch()
    const subscription = useSubscriptionUrl()
  const [activeSub, setActiveSub] = useState("")
  const [status, setStatus] = useState("")
console.log("activeSub",activeSub)
  const ShopApi = useApi()
  const [test, setTest] = useState(false)
  const navigate = useNavigate();
  let dataArr = []
  let planName = ""

    useEffect(async()=>{
        const activeSubId = await ShopApi.getSubscription()
        setActiveSub(activeSubId)   
        
        try {
          const response = await fetch(`/api/subscription/planstatus`);
          const result = await response.json();
          dataArr = result.data
    
          planName = await subscription.subscriptionArr(result.data)
          if (planName === "") {
            setStatus("Free")
          }
          setStatus(planName)
        } catch (error) {
          console.error("Error:", error);
        }
   


      },[test])

    const cancelSubscription2 = async () => {
        try {
          const response = await fetch("/api/subscription/cancel", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: activeSub }),
          });
          const result = await response.json();
          
          if (result.data.body.data.appSubscriptionCancel.appSubscription.status === "CANCELLED") {
            setTest(true)
            navigate('/')
          }
    
        } catch (error) {
          console.error("Error:", error);
        }   
    }
    const addSub = () =>{
      navigate('/pricingplan')
    }
  return (
    <>
    {status === "Free" ?  <div>
        <p>Please Add Subscription Plan</p>
        <Button onClick={addSub}>
     Add Subscription
   </Button>
   </div> :
    <div>
        <p>If you want to Cancel Subscription</p>
     <Button onClick={cancelSubscription2}>
     Cancel
   </Button>
   </div>
}
</>
  )
}

export default CancelSubscription