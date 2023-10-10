import {
  Page, Grid, LegacyCard, Select, ButtonGroup, Button, IndexTable, useIndexResourceState, Text, SkeletonPage,
  Layout,
  SkeletonBodyText,
  TextContainer,
  SkeletonDisplayText,
  Spinner,
  ProgressBar,
  LegacyStack,
  Tooltip as Tool
} from '@shopify/polaris';
import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, } from "recharts";
import { useAuthenticatedFetch } from '../hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import { TitleBar } from "@shopify/app-bridge-react";
import { trophyImage } from "../assets";
import usePagination from '../hooks/usePagination';
import useSubscriptionUrl from '../hooks/useSubscriptionUrl'
import ProSubscription from './ProSubscription';
import { ProductsCard } from "../components";
import "./css/myStyle.css"
import { push } from '@shopify/app-bridge/actions/Navigation/History';
import moment from "moment";
import { useRef } from 'react';
import useApi from '../hooks/useApi';
import { PhoneLandscape } from 'react-bootstrap-icons';
import useDateFormat from '../hooks/useDateFormat';

export default function HomePage() {
  const { search } = useLocation()
  const ShopApi = useApi()
  const metafieldHook = useApi()
  const [shop, setShop] = useState({})
  let activeSubId = useRef()
  const searchParams = new URLSearchParams(search.trim());
  const Navigate = useNavigate()
  const subscription = useSubscriptionUrl()
  let navigate = "/"
  const [status, setStatus] = useState("")
  let currentPage = searchParams.get('pagenumber')
  const [loading, setLoading] = useState(false)
  const pagination = usePagination(currentPage, navigate)
  let listingPerPage = 5
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalRecord1, setTotalRecord1] = useState(0);
  const [emailQuota, setEmailQuota] = useState("")
  const [data, setData] = useState([]);
  const [remainData, setRemainData] = useState([]);
  const changeDate = useDateFormat();
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const finalFirstDay = changeDate.convertFormat(firstDay)
  const finalLastDay = changeDate.convertFormat(lastDay)

  const paginationFunc = pagination.pagination(totalRecord, listingPerPage);
  let firstPost = paginationFunc.firstPost
  const [selected, setSelected] = useState('today');
  const [metaId, setMetaId] = useState("")
  const [totalChart, setTotalChart] = useState("today");
  const [chartOne, setChartOne] = useState([])
  const [test, setTest] = useState(false)
  const [isFirstButtonActive, setIsFirstButtonActive] = useState(true);
  const options = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 days', value: 'lastWeek' },
    { label: 'Month', value: 'month' },
  ];
  const EmpArr = []
  let email
  let shopName
  const fetch = useAuthenticatedFetch()
  const id = localStorage.getItem("key")
  let local_get = JSON.parse(localStorage.getItem("adminDetail"))
  let dataArr = []
  let planName = ""
  let newPlan = 1
  let toolData = emailQuota - remainData;
  useEffect(async () => {
    const shopApi = await ShopApi.shop()
    setShop(shopApi)
    const metafieldId = await metafieldHook.metafield()
    setMetaId(metafieldId)

    try {
      const response = await fetch(`/api/folderSize`);
      const result = await response.json();
    } catch (error) {
      console.error("Error:", error);
    }

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
    if (planName === "Free") {
      listingPerPage = 3
      firstPost = 0
    }

    try {
      const response = await fetch(`/api/product/getproductstats?shopName=${shopApi.shopName}`);
      const result = await response.json();
      setTotalRecord(result.data[0].count)
    } catch (error) {
      console.error("Error:", error);
    }

    try {
      const response = await fetch(`/api/product/productList?shopName=${JSON.stringify(shopApi.shopName)}&&listingPerPage=${JSON.stringify(listingPerPage)}&&firstPost=${JSON.stringify(firstPost)}`);
      const result = await response.json();
      setData(result.data)
    } catch (error) {
      console.error("Error:", error);
    }
    Navigate({
      pathname: "/",
      search: `?pagenumber=${planName === "Free" ? newPlan : pagination.currentPage}`
      // search: `?pagenumber=${ pagination.currentPage}`
    })

    try {
      const response = await fetch(`/api/countFilter?shopName=${JSON.stringify(shopApi.shopName)}&&value=${JSON.stringify(selected)}`);
      const result = await response.json();
      setTotalRecord1(result.data[0].count)
    } catch (error) {
      console.error("Error:", error);
    }

    try {
      const response = await fetch(`/api/chartFilter?shopName=${JSON.stringify(shopApi.shopName)}&&value=${JSON.stringify(totalChart)}`);
      const result = await response.json();
      setChartOne(result.data)

    } catch (error) {
      console.error("Error:", error);
    }

    // const activeSubId = await ShopApi.getSubscription()
    // setActiveSub(activeSubId)

    try {
      const response = await fetch(`/api/plan/emailQuota?planName=${JSON.stringify(planName)}`);
      const result = await response.json();
      setEmailQuota(result.result[0].email_quota)
    } catch (error) {
      console.error("Error:", error);
    }

    try {
      const response = await fetch(`/api/remainingQuote?shop=${JSON.stringify(shopApi.shopName)}&&startDate=${finalFirstDay}&&lastDate=${finalLastDay}`);
      const result = await response.json();
      setRemainData(result.result)
    } catch (error) {
      console.error("Error:", error);
    }

    const metafieldData = {
      key: "subscription",
      namespace: "quotes-app",
      ownerId: `${metafieldId}`,
      type: "single_line_text_field",
      value: JSON.stringify(planName)
    };
    try {
      const response = await fetch("/api/app-metafield/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metafieldData),
      });
      const result = await response.json();
      if (result.status === "sucess") {
        setData(result.msg)
      }

    } catch (error) {
      console.error("Error:", error);
    }

  }, [totalChart, currentPage, test, newPlan])

  let newData = [];
  let testArr = [];
  let newDataArr = [];
  for (let i = 0; i <= 30; i++) {
    const date = new Date();
    const start = date.setDate(date.getDate() - 30);
    let ddd = new Date(start)
    let ss = new Date(ddd.getFullYear(), ddd.getMonth(), ddd.getDate() + i)
    EmpArr.push({ date: ss, count: 0 });
  }

  EmpArr.map((d, i) => {
    const date = new Date(d.date);
    const newmonthWithDay = date.toLocaleString('default', { month: 'short', day: 'numeric' });
    testArr.push({ index: i + 1, date: newmonthWithDay, count: d.count })

  })

  chartOne.map((d, i) => {
    const date = new Date(d.create_date);
    const monthWithDay = date.toLocaleString('default', { month: 'short', day: 'numeric' });
    if (totalChart === "today") {
      newDataArr.push({ index: i + 1, date: monthWithDay, count: d.count })
    }
  })

  var monthName = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
  var months = [];
  let newArr = [];
  let OneArr = [];
  let monthDateArr = [];

  var dateVar = new Date();
  dateVar.setDate(1);
  for (let i = 0; i <= 11; i++) {
    months.push(monthName[dateVar.getMonth()]);
    dateVar.setMonth(dateVar.getMonth() - 1);
  }

  for (let i = 0; i < months.length; i++) {
    const element = months[i];
    newArr.push({ date: element, count: 0 })
  }

  chartOne.map((d, i) => {
    const date = new Date(d.create_date);
    const month = date.toLocaleString('en-US', { month: 'short' })
    const monthWithDay = date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    newDataArr.push({ index: i + 1, date: monthWithDay, count: d.count })
    newData.push({ index: i + 1, date: month, count: d.count })
  })

  newArr.reverse();

  function reverseArr(input) {
    var ret = new Array;
    for (var i = input.length - 1; i >= 0; i--) {
      ret.push(input[i]);
    }
    return ret;
  }

  let newReverseArr = reverseArr(newArr);

  OneArr.push(newReverseArr.reverse())

  OneArr[0].map((e, i) => {
    monthDateArr.push({ index: i + 1, date: e.date, count: e.count })
  })
  monthDateArr.map((e) => {    
    newData.map((g) => {
      if (e.date === g.date) {
        e.count = g.count;
      }
    })
  })

  testArr.map((val, ii) => {
    newDataArr.map((b, i) => {
      if (val.date === b.date) {
        val.count = b.count
      }
    })
  })

  let map = new Map();
  map.set("a", { val: status === "Free" ? firstPost = 0 : firstPost })
  map.get("a").val++
  const handleSelectChange = async (value) => {
    setSelected(value)
    let newDate = new Date();
    let MyDateString;

    newDate.setDate(newDate.getDate());
    MyDateString = ('0' + newDate.getDate()).slice(-2) + '/' + ('0' + (newDate.getMonth() + 1)).slice(-2) + '/' + newDate.getFullYear();
    const response = await fetch(`/api/countFilter?shopName=${JSON.stringify(shop.shopName)}&&value=${JSON.stringify(value)}`);
    const result = await response.json();
    setTotalRecord1(result.data[0].count)
  }

  const handleFirstButtonClick = async (value) => {
    if (isFirstButtonActive) return;
    setIsFirstButtonActive(true);
    setTotalChart("today")
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 7000);
  };

  const handleSecondButtonClick = async (value) => {
    if (!isFirstButtonActive) return;
    setIsFirstButtonActive(false);
    setTotalChart("month")
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 7000);
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(data);
  let entries
  const all = (data) => {
    const db = JSON.parse(data)
    entries = Object.entries(db)
  }

  const rowMarkup = data.map(
    //  const rowMarkup = rowData[0].sort().map(
    (
      { product_stats_id, product_name, views, clicks, conversions }
    ) => (

      <IndexTable.Row
        id={product_stats_id}
        key={product_stats_id}
        position={product_stats_id}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {map.get("a").val++}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{product_name}</IndexTable.Cell>
        <IndexTable.Cell>{views}</IndexTable.Cell>
        <IndexTable.Cell>{clicks}</IndexTable.Cell>
        <IndexTable.Cell>{conversions}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );
  // const cancelSubscription = async () => {
  //   try {
  //     const response = await fetch("/api/subscription/cancel", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ id: activeSub }),
  //     });
  //     const result = await response.json();

  //     if (result.data.body.data.appSubscriptionCancel.appSubscription.status === "CANCELLED") {
  //       setTest(true)
  //     }

  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // }

  return (
    <>
      <Page fullWidth>
        <Grid>

          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <LegacyCard sectioned >
              <div style={{ height: '150px' }}>
                <div className="quotes_heading">
                  <div className='left_side_quotes'>
                    <p className='qoutes_text'>Account Information</p>
                  </div>
                </div>

                <div className='leftCardInfo'>
                  <span>
                    Plan:
                  </span>
                  <span>
                    {status}
                  </span>

                </div>
                <div className='leftCardInfo'>
                  <span>
                    Total Email Quota:-
                  </span>
                  <span>
                    {emailQuota}
                  </span>
                </div>

                <div className='leftCardInfo'>
                  <span>
                    Total Remaining Quota:-
                  </span>
                  <div style={{ width: '400px', padding: '15px 100px', marginTop: '-32px', marginLeft: '60px' }}>
                    {emailQuota === "Unlimited" ? <p>Unlimited</p> :
                      <Tool active content={toolData} preferredPosition='mostSpace' activatorWrapper='span'>
                        <ProgressBar progress={toolData} />
                      </Tool>
                    }
                  </div>
                </div>
              </div>
            </LegacyCard>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <LegacyCard sectioned>
              <div style={{ height: '150px' }}>
                <div className="quotes_heading">
                  <div className='left_side_quotes'>
                    <p className='qoutes_text'>Total Quotes</p>
                  </div>
                  <Select
                    options={options}
                    onChange={handleSelectChange}
                    value={selected}
                    className='right_side_div'
                  />

                </div>
                <p className="qoutes_counts">{totalRecord1}</p>
              </div>
            </LegacyCard>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 12, xl: 12 }}>
            <LegacyCard title="" sectioned >
              <div style={{ height: '100%', }}>
                <div style={{ display: 'flex', justifyContent: 'left' }}>
                  <LegacyStack vertical>
                    <Text variant="heading2xl" as="h3">
                      Quotes Report Charts
                    </Text>
                  </LegacyStack>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <ButtonGroup segmented>
                    <Button pressed={isFirstButtonActive} onClick={handleFirstButtonClick}>
                      DAY
                    </Button>
                    <Button pressed={!isFirstButtonActive} onClick={handleSecondButtonClick}>
                      MONTH
                    </Button>
                  </ButtonGroup>
                </div>
                <div style={{ height: '100%', width: '100%', marginTop: '20px' }}>
                  {loading ?
                    <div style={{ display: 'flex', height: '300px', justifyContent: 'center', alignItems: 'center' }}>
                      <Spinner accessibilityLabel="Small spinner example" size="large" />
                    </div>
                    : <LineChart width={990} height={300} data={totalChart === "today" ? testArr : monthDateArr} margin={{
                      top: 5,
                      right: 30,
                      left: 0,
                      bottom: 12,
                    }}>
                      <XAxis dataKey="index" angle={0} dx={0} dy={10} minTickGap={-200} />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="date"
                        stroke="#8884d8"
                        activeDot={{ r: 5 }}
                        strokeWidth={2}
                      />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" />
                    </LineChart>
                  }
                </div>
              </div>
            </LegacyCard>
          </Grid.Cell>

          {/* <Button onClick={cancelSubscription}>
            Cancel
          </Button> */}

          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 12, xl: 12 }}>
            <LegacyCard sectioned>
              <div style={{ height: '400px' }}>
                <div style={{ height: '70px' }}>
                  <LegacyStack vertical>
                    <Text variant="heading2xl" as="h3">
                      Product Conversions Data
                    </Text>
                  </LegacyStack>
                </div>

                {pagination.loading ? (
                  <div style={{ display: 'flex', height: '350px', justifyContent: 'center', alignItems: 'center' }}>
                    <Spinner accessibilityLabel="Small spinner example" size="large" />
                  </div>
                ) : (
                  <div>
                    <LegacyCard>
                      <IndexTable
                        itemCount={data.length}
                        selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                        onSelectionChange={handleSelectionChange}
                        headings={[
                          { title: 'Sr.no' },
                          { title: 'Product Name' },
                          { title: 'Views' },
                          { title: 'Clicks' },
                          { title: 'Conversions' },
                        ]}
                        selectable={false}
                      >
                        {rowMarkup}
                      </IndexTable>
                    </LegacyCard>

                    {status === "Free" && (
                      <>
                        <div>
                          <LegacyCard sectioned>
                            <TextContainer>
                              <SkeletonBodyText />
                            </TextContainer>
                          </LegacyCard>
                          <LegacyCard sectioned>
                            <TextContainer>
                              <SkeletonBodyText />
                            </TextContainer>
                          </LegacyCard>
                          <div style={{ position: 'absolute', width: '100%', marginTop: '-90px', marginLeft: '400px' }}>
                            <p>To See Remaining ({remainData - rowMarkup.length})</p>
                            <ProSubscription />
                          </div>
                        </div>
                      </>
                    )}

                    {status === "Basic" && remainData < 5 ?
                      <>
                        <PaginationControl
                          page={parseInt(pagination.currentPage)}
                          total={totalRecord}
                          limit={listingPerPage}
                          changePage={(page) => {
                            pagination.pageChange(page);
                          }}
                        />
                      </>
                      : ""
                    }
                    {status === "Basic" && remainData >= 5 ?
                      <>
                        <LegacyCard sectioned>
                          <TextContainer>
                            <SkeletonBodyText />
                          </TextContainer>
                        </LegacyCard>
                        <LegacyCard sectioned>
                          <TextContainer>
                            <SkeletonBodyText />
                          </TextContainer>
                        </LegacyCard>
                        <div style={{ position: 'absolute', width: '100%', marginTop: '-90px', marginLeft: '400px' }}>
                          <p>Basic Data ({remainData})</p>
                          <ProSubscription />
                        </div>
                      </>
                      : ""
                    }

                    {status === "Premium" && (
                      <>
                        <PaginationControl
                          page={parseInt(pagination.currentPage)}
                          total={totalRecord}
                          limit={listingPerPage}
                          changePage={(page) => {
                            pagination.pageChange(page);
                          }}
                        />
                      </>
                    )}
                  </div>
                )}

              </div>
            </LegacyCard>
          </Grid.Cell>
        </Grid>
      </Page >
    </>
  );
}