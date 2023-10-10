import React, { useEffect, useState } from 'react'
import { Page, Grid, LegacyCard, Button, Icon, HorizontalStack, VerticalStack, HorizontalGrid } from '@shopify/polaris';
import { useAuthenticatedFetch } from '../hooks'
import useSubscriptionUrl from '../hooks/useSubscriptionUrl'
import useApi from '../hooks/useApi';
import { StatusActiveMajor } from '@shopify/polaris-icons';
import './css/myStyle.css'

const PricingPlan = () => {
  const subscription = useSubscriptionUrl()
  const ShopApi = useApi()
  const fetch = useAuthenticatedFetch()
  const [shop, setShop] = useState()
  const [status, setStatus] = useState("")
  const [plandata, setPlandata] = useState([])
  
  let dataArr = []
  let planName = ""

  useEffect(async () => {
    const shopApi = await ShopApi.shop()
    setShop(shopApi)

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

    try {
      const response = await fetch(`/api/plan`);
      const result = await response.json();
      setPlandata(result.result)
    } catch (error) {
      console.error("Error:", error);
    }

  }, [])

  const handleChange = async (value) => {
    const returnData = `https://${shop.domain}/admin/apps/quotes-5`
    const datas = {
      plan: {
        appRecurringPricingDetails: {
          price: {
            amount: value.amount,
            currencyCode: "USD"
          },
          interval: "EVERY_30_DAYS"
        }
      }
    }

    try {
      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: datas, shop: shop.shopName, plan: value.plan, returnUrl: returnData }),
      });
      const result = await response.json();
      const urlName = result.data.body.data.appSubscriptionCreate.confirmationUrl
      const subscription = useSubscriptionUrl(urlName)

      subscription.ReloadPage()

    } catch (error) {
      console.error("Error:", error);
    }

  }
  return (
    <>
      <Page fullWidth>
      <Grid>
      {plandata.map((data) => (
        <Grid.Cell key={data.plan_id} columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
          <div className={status === data.plan_name ? 'highLight_div' : 'basicClass'}>
            <LegacyCard title={data.plan_name} sectioned>
              <div className='basicClass'>
                {status === data.plan_name ? (
                  <div className='icon_div'>
                    <Icon
                      source={StatusActiveMajor}
                      color='base'
                      />
                  </div>
                ) : null}
                <div>
                  <p>Price ${data.price} / Month</p>
                  <p>Email Quota {data.email_quota}</p>
                  <p>Email notification</p>
                 { data.plan_name === "Free" ? " " :
                  <div className="addPlanBtn">
                <Button onClick={() => handleChange({ amount: data.price, plan: data.plan_name })}>
                  Upgrade
                </Button>
              </div>
                 }
                </div>
              </div>
            </LegacyCard>
          </div>
        </Grid.Cell>
      ))}
    </Grid>

      </Page>

    </>
  )
}

export default PricingPlan

