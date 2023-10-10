import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useAuthenticatedFetch } from '../hooks'
import usePagination from '../hooks/usePagination'
import Pagination from "react-js-pagination";
import Table from 'react-bootstrap/Table';
import "./css/myStyle.css"
import { useNavigate, useLocation } from 'react-router-dom';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import LoadingIcon from '../../Images/LoadingIcon.gif'
import { ViewMajor, SearchMinor } from '@shopify/polaris-icons';
import {
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Text,
  Badge,
  Button,
  TextContainer,
  Modal,
  Spinner,
  LegacyStack,
  Icon,
  Autocomplete,
} from '@shopify/polaris';
import useApi from '../hooks/useApi';
import { json } from 'body-parser';
import Papa from 'papaparse';

const QuoteList = () => {
  function convertArrayToCSV(dataArray) {
    const csv = Papa.unparse(dataArray);
    return csv;
  }

  function DownloadCSVButton({ dataArray }) {
    const handleDownload = () => {
      const csvString = convertArrayToCSV(dataArray);
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'data.csv';
      link.click();
      URL.revokeObjectURL(url);
    };

    return (
      <button onClick={handleDownload}>Download CSV</button>
    );
  }

  let aa = ""
  const { search } = useLocation()
  const ShopApi = useApi()
  const [shop, setShop] = useState()
  const [loading, setLoading] = useState(true)

  const apiKey = 'af201fbb5dc7bedcbc12674b811f51ec';
  const password = '83131b2963862385938cf92b6bf291b3';
  const ACCESS_TOKEN = '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';
  const shopDomain = 'mukesh-kumar004';
  const apiUrl = `https://${shopDomain}.myshopify.com/cart/add`;
  // const apiUrl = `https://${shopDomain}.myshopify.com/admin/api/2023-07`;

  const searchParams = new URLSearchParams(search.trim());
  const Navigate = useNavigate()
  const [searchResults, setSearchResults] = useState("");
  const [dataTrue, setDataTrue] = useState(false)
  const newFatch = useAuthenticatedFetch();
  let currentPage = searchParams.get('pagenumber')
  let navigate = "/quotelist/"
  const pagination = usePagination(currentPage, navigate)
  const listingPerPage = 5
  const [totalRecord, setTotalRecord] = useState(0);
  const [data, setData] = useState([]);
  const [sdata, setSdata] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [conversionStatus, setConversionStatus] = useState('');
  const [orderData, setOrderData] = useState([]);
  const [withoutPagination, setWithoutPagination] = useState([])
  // console.log("tetetetetete", orderData)
  const paginationFunc = pagination.pagination(totalRecord, listingPerPage);
  const [modalObj, setModalObj] = useState({});
  let map = new Map();
  map.set("a", { val: paginationFunc.firstPost })
  map.get("a").val++
  const [resultArray, setResultArray] = useState([]);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {

  //       const shopApi = await ShopApi.shop();
  //       setShop(shopApi)
  //       await csvApi(shopApi);
  //       await searchApi(shopApi);

  //       const maindata = await orderStatusApi(shopApi);
  //       const dattaa = await order_fulfillApi(maindata.data);

  //       const response = await newFatch(`/api/quoteList?shop=${JSON.stringify(shopApi.shopName)}&&listingPerPage=${JSON.stringify(listingPerPage)}&&firstPost=${JSON.stringify(paginationFunc.firstPost)}`);

  //       const resultArray = [];
  //       dattaa.forEach((entry) => {
  //         if (entry.fulfillments[0] && entry.fulfillments[0].status === "success") {
  //           const lineItems = entry.fulfillments[0].line_items;
  //           const status = entry.fulfillments[0].status;

  //           lineItems.forEach((lineItem) => {
  //             let isConditionMet = false;
  //             data.forEach((item) => {
  //               console.log("Comparing:", lineItem.product_id, JSON.parse(item.product_id));
  //               if (!isConditionMet && lineItem.product_id === JSON.parse(item.product_id) && item.product_status === "un-order") {
  //                 const exists = resultArray.some((resultItem) => resultItem.product_id === item.product_id);
  //                 console.log("jliiiiiiiiiiiiiiiiiiiiiiii", exists,"ghh", !exists);
  //                 if (!exists && item.product_status === "un-order") {
  //                   resultArray.push({
  //                     product_id: item.product_id,
  //                   });
  //                 }
  //                 isConditionMet = true;
  //               }
  //             });
  //           });
  //         }
  //       });

  //       console.log("resultArray", resultArray);

  //       Navigate({
  //         pathname: "/quotelist",
  //         search: `?pagenumber=${pagination.currentPage}&&search=${searchResults}`,
  //       });

  //       setTimeout(() => {
  //         setLoading(false);
  //       }, 5000);

  //       const timeoutId = setTimeout(() => {
  //         setShowMessage(true);
  //       }, 3000);

  //       return () => {
  //         clearTimeout(timeoutId);
  //       };
  //     } catch (error) {
  //       // Handle errors
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchData();
  // }, [currentPage, loading]);

  useEffect(async () => {
    // orderFunctions()
    const shopApi = await ShopApi.shop();
    setShop(shopApi)
    await csvApi(shopApi);
    await searchApi(shopApi);
    const maindata = await orderStatusApi(shopApi);
    const dattaa = await order_fulfillApi(maindata.data, shopApi);
    // try {
    //   const response = await newFatch(`/api/csvData?shop=${JSON.stringify(shopApi.shopName)}`);
    //   // const response = await fetch(`/api/csvData?shop=${JSON.stringify(shop.shopName)}`);
    //   const result = await response.json();
    //   setCsvData(result.data)
    // } catch (error) {
    //   console.error("Error:", error);
    // }
    // if (searchResults != "") {
    //   try {
    //     const response = await newFatch(`/api/searchTotalRecord?shop=${JSON.stringify(shopApi.shopName)}&&product_name=${JSON.stringify(searchResults)}`);
    //     const result = await response.json();
    //     setTotalRecord(result.result)
    //   } catch (error) {
    //     console.error("Error:", error);
    //   }
    //   try {
    //     const response = await newFatch(`/api/serachProducts?product_name=${JSON.stringify(searchResults)}&&shop=${JSON.stringify(shopApi.shopName)}&&listingPerPage=${JSON.stringify(listingPerPage)}&&firstPost=${JSON.stringify(paginationFunc.firstPost)}`);
    //     const result = await response.json();
    //     if (searchResults === "") {
    //       setData(sdata)
    //     } else {
    //       setData(result.data)
    //     }
    //   } catch (error) {
    //     console.error("Error:", error);
    //   }
    // }
    // else {
    //   try {
    //     const response = await newFatch(`/api/name?shop=${JSON.stringify(shopApi.shopName)}`);
    //     const result = await response.json();
    //     setTotalRecord(result.result)
    //   } catch (error) {
    //     console.error("Error:", error);
    //   }
    //   try {
    //     const response = await newFatch(`/api/quoteList?shop=${JSON.stringify(shopApi.shopName)}&&listingPerPage=${JSON.stringify(listingPerPage)}&&firstPost=${JSON.stringify(paginationFunc.firstPost)}`);
    //     const result = await response.json();
    //     setData(result.data)
    //     setSdata(result.data)
    //   } catch (error) {
    //     console.error("Error:", error);
    //   }
    // }
    // let status_data = JSON.stringify(data)

    try {
      const response = await newFatch(`/api/update_order_Status?data=${JSON.stringify(resultArray)}`);
      // const result = await response.json();
      // console.log("result.data5555555555588", result)
      // window.top.location.replace(result.data)
    } catch (error) {
      console.error("Error:", error);
    }

    Navigate({
      pathname: "/quotelist",
      search: `?pagenumber=${pagination.currentPage}&&search=${searchResults}`
    })
    setTimeout(() => {
      setLoading(false)
    }, 5000);

    // console.log("shopApi.domain",shopApi.domain)
    // try {
    // //   // const response = await newFatch('/api/orders_status');
    //   const response = await newFatch(`/api/orders_status?token=${ACCESS_TOKEN}&&domain=${shop.domain}`);
    //   // const result = await response.json();
    //   // console.log("response44",result)
    //   if (!response.ok) {
    //     throw new Error(`HTTP error! Status: ${response.status}`);
    //   }
    //   const data = await response.json();
    //   console.log("Shopify Orders:", data.orders);
    //   setOrderData(data.orders)
    // } catch (error) {
    //   console.error("Error:", error);
    // }


    // try {
    //  let ss=[]
    //   for (let i = 0; i < orderData.length; i++) {
    //     ss.push(orderData[i].id)
    //   }
    //   console.log("orderData45454545",JSON.stringify(ss))

    //   const response = await newFatch(`/api/order_fulfillments?id_Data=${JSON.stringify(ss)}`);
    //   if (!response.ok) {
    //     throw new Error(`HTTP error! Status: ${response.status}`);
    //   }
    //   const data = await response.json();
    //   console.log("testing444411111111111111",data)
    //   // document.getElementById('output').textContent = JSON.stringify(data, null, 2);

    // } catch (error) {
    //   console.error("Error:", error);
    // }  

  }, [currentPage, loading])

  const csvApi = async (shopApi) => {
    try {
      const response = await newFatch(`/api/csvData?shop=${JSON.stringify(shopApi.shopName)}`);
      // const response = await fetch(`/api/csvData?shop=${JSON.stringify(shop.shopName)}`);
      const result = await response.json();
      setCsvData(result.data)
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const searchApi = async (shopApi) => {
    if (searchResults != "") {
      try {
        const response = await newFatch(`/api/searchTotalRecord?shop=${JSON.stringify(shopApi.shopName)}&&product_name=${JSON.stringify(searchResults)}`);
        const result = await response.json();
        setTotalRecord(result.result)
      } catch (error) {
        console.error("Error:", error);
      }
      try {
        const response = await newFatch(`/api/serachProducts?product_name=${JSON.stringify(searchResults)}&&shop=${JSON.stringify(shopApi.shopName)}&&listingPerPage=${JSON.stringify(listingPerPage)}&&firstPost=${JSON.stringify(paginationFunc.firstPost)}`);
        const result = await response.json();
        if (searchResults === "") {
          setData(sdata)
        } else {
          setData(result.data)
        }
      } catch (error) {
        console.error("Error:", error);
      }

    }
    else {
      try {
        const response = await newFatch(`/api/name?shop=${JSON.stringify(shopApi.shopName)}`);
        const result = await response.json();
        setTotalRecord(result.result)
      } catch (error) {
        console.error("Error:", error);
      }
      try {
        const response = await newFatch(`/api/quoteList?shop=${JSON.stringify(shopApi.shopName)}&&listingPerPage=${JSON.stringify(listingPerPage)}&&firstPost=${JSON.stringify(paginationFunc.firstPost)}`);
        const result = await response.json();
        setData(result.data)
        setSdata(result.data)
      } catch (error) {
        console.error("Error:", error);
      }



      try {
        const response = await newFatch(`/api/quoteList_withoutPagination?shop=${JSON.stringify(shopApi.shopName)}`);
        const result = await response.json();
        setWithoutPagination(result.data)

        console.log("result.data", result.data)
        // setData(result.data)
        // setSdata(result.data)
      } catch (error) {
        console.error("Error:", error);
      }

    }
  }

  const orderStatusApi = async (shopApi) => {
    try {
      //   // const response = await newFatch('/api/orders_status');
      const response = await newFatch(`/api/orders_status?token=${ACCESS_TOKEN}&&domain=${shopApi.domain}`);
      // const result = await response.json();
      // console.log("response44",result)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // console.log("Shopify Orders:", data.orders);
      // setOrderData(data.orders)
      // await order_fulfillApi(data.orders);
      return {
        data: data.orders
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const order_fulfillApi = async (dataDetail, shopApi) => {
    try {
      let id_data = []
      for (let i = 0; i < dataDetail.length; i++) {
        id_data.push(dataDetail[i].id)
      }

      const response = await newFatch(`/api/order_fulfillments?id_Data=${JSON.stringify(id_data)}&&token=${ACCESS_TOKEN}&&domain=${shopApi.domain}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      fulfill_function(data)
      // document.getElementById('output').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const fulfill_function = (dattaa) => {
    dattaa.forEach((entry) => {
      // console.log("first1111111",entry.fulfillments[0].line_items)
      if (entry.fulfillments[0] && entry.fulfillments[0].status === "success") {
        let lineItems = [];
        lineItems.push(entry.fulfillments[0]);
        let newVar;
        // let dateString;
        // let dateObject = new Date(dateString);
        // let options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        // let formattedDate = dateObject.toLocaleDateString(undefined, options);
        for (let i = 0; i < lineItems.length; i++) {
          // console.log("google hhhhh....",lineItems[i].created_at);  
          newVar = lineItems[i].line_items[0];
          // dateString= lineItems[i].created_at; 

        }
        console.log("newVar", newVar)
        // console.log("aaaaa222222",aa)
        // const status = entry.fulfillments[0].status;
        // lineItems.forEach((lineItem) => {
        let isConditionMet = false;
        withoutPagination.forEach((item) => {
          if (newVar.variant_id === JSON.parse(item.product_variant_id)) {
            const exists = resultArray.some((resultItem) => resultItem.product_id === item.product_variant_id && item.product_status != "Order Placed");
            // console.log("gfgfghfgfh",exists)   
            if (!exists) {
              resultArray.push({
                product_id: item.product_variant_id,
                // date:formattedDate
              });
            }
            isConditionMet = true;
          }

        })
        // let isConditionMet = false;
        // data.forEach((item) => {
        //   if (lineItem.product_id === JSON.parse(item.product_id)) {
        //     const exists = resultArray.some((resultItem) => resultItem.product_id === item.product_id);
        //     if (!exists) {
        //       resultArray.push({
        //         product_id: item.product_id,
        //       });
        //     }
        //     isConditionMet = true;
        //   }
        // });
        // });
        console.log("000111222333", resultArray)

        //      try {
        //   const response =  newFatch(`/api/status_product_id?shop=${JSON.stringify(shopApi.shopName)}&&product_id=${resultArray}`);
        //   // const response = await fetch(`/api/csvData?shop=${JSON.stringify(shop.shopName)}`);
        //   const result =  response.json();
        //   // setCsvData(result.data)
        // } catch (error) {
        //   console.error("Error:", error);
        // }       
      }
    });
  }
  // console.log("aaaaaaaaaaaaaaaaaaaaa",dataTrue,aa)
  const newHandler = async (index, product_variant_id,) => {
    const accessToken = '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';
    const apiUrl = `https://${shop.domain}/admin/api/2023-07/draft_orders.json`;

    let keyValuePairs = [
      {
        variant_id: product_variant_id,
        quantity: 1
      }
    ]
    let newCleanData = JSON.stringify(keyValuePairs);

    try {
      const response = await newFatch(`/api/qoute_To_order?data=${newCleanData}&&token=${accessToken}&&url=${apiUrl}`);
      const result = await response.json();
      // console.log("result.data",result)
      window.top.location.replace(result.data)
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // const orderFunctions = async () => {
  //   let updatedData = data.map((item) => {
  //     let isMatch = false;
  //     for (let i = 0; i < resultArray.length; i++) {
  //       if (resultArray[i].product_id === item.product_id) {
  //         isMatch = true;
  //         break;
  //       }
  //     }
  //     return {
  //       ...item,
  //       orderStatus: isMatch ? 'Order Success' : 'Pending'
  //     };
  //   });

  //   console.log("updatedData",resultArray);
  //   // let firstMatchedItem;
  //   // for (let i = 0; i < resultArray.length; i++) {
  //   //   if (updatedData.some((dataItem) => dataItem.product_id === resultArray[i].product_id)) {
  //   //     firstMatchedItem = resultArray[i];
  //   //     break;
  //   //   }
  //   // }
  //   // console.log("kkkk", firstMatchedItem);  
  //   // if (firstMatchedItem && firstMatchedItem.product_id) {
  //   //   data.forEach((item, index) => {
  //   //     data[index].orderStatus = item.product_id === firstMatchedItem.product_id && item.product_status != "Order Placed" && 'Not Order';
  //   //   });
  //   //   console.log("Updated data array:", data);

  //   // } 
  //   // else {
  //   //   console.error('Invalid firstMatchedItem object or missing product_id property.');
  //   // }
  // }


  let aRR = []
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(data);
  let entries
  const all = (data) => {
    // console.log("hthththththahahahah",data)
    var db = data
    entries = Object.entries(db)
  }
  // console.log("entries454554454",data)
  // let successFound = false; 
  // orderData.forEach(entry => {
  //   const fulfillments = entry.fulfillments || [];
  //   fulfillments.forEach(fulfillment => {
  //       if (fulfillment.status === "success") {
  //           successFound = true;
  //       }
  //   });
  // });
  // if (successFound) {
  //   console.log("Order placed successfully!");
  // } else {
  //   console.log("No successful orders found.");
  // }
  // Your JSON data
  // const fulfillmentData = [{
  //   // ... your fulfillment data here
  // }];

  // console.log("555555555", resultArray)

  const rowMarkup = data.map(
    (
      {
        product_id,
        product_name,
        product_image,
        product_variants,
        user_data,
        product_variant_id,
        product_status,
      },
      index,
    ) => {
      all(product_variants);

      return (
        <IndexTable.Row id={product_id} key={product_id} position={index}>
          <IndexTable.Cell>{map.get("a").val++}</IndexTable.Cell>
          <IndexTable.Cell>{product_name}</IndexTable.Cell>
          <IndexTable.Cell>
            <img src={product_image} className='imgcss' alt={product_name} />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Button
              onClick={() => {
                handleChange(index, product_id);
                setModalObj({
                  entries,
                  product_image,
                  user_data,
                  product_name,
                  product_variants,
                });
              }}
            >
              <Icon source={ViewMajor} color="base" />
            </Button>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Button onClick={() => newHandler(index, product_variant_id)}>
              Convert Quote
            </Button>
          </IndexTable.Cell>
          <IndexTable.Cell>{product_status ? product_status : 'Un Order'}</IndexTable.Cell>
          {/* <IndexTable.Cell>{product_status}</IndexTable.Cell> */}
        </IndexTable.Row>
      );
    }
  );


  const [active, setActive] = useState(false);
  const [userData, setUserData] = useState([]);
  const [user, setUser] = useState([]);

  const handleChange = async (index, product_id) => {
    setActive(!active);
    // console.log("test-Id", product_id)

    // try {
    //   const data = {
    //     product_id: id,
    //     shop: shop.shopName,
    //   };
    //   console.log("dddddddddd",data)
    //   const response = await fetch('/api/userDetail', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json', 
    //     },
    //     body: JSON.stringify(data), 
    //   });
    //   const result = await response.json();
    //   result.data.map((item, i) => {
    //     aRR.push(JSON.parse(item.user_data));
    //   });
    //   setUser(aRR);
    // } catch (error) {
    //   console.error("Error:", error);
    // }

    try {
      const encodedProductId = encodeURIComponent(product_id);
      const response = await newFatch(`/api/userDetail?shop=${shop.shopName}&product_id=${encodedProductId}`);
      const result = await response.json();

      result.data.map((item, i) => {
        aRR.push(JSON.parse(item.user_data))
      })
      setUser(aRR)
    } catch (error) {
      console.error("Error:", error);
    }

  }
  let userDataArray;
  if (modalObj.user_data != undefined) {
    userDataArray = JSON.parse(modalObj.user_data);
  }
  const searchHandle = async (e) => {
    try {
      const response = await newFatch(`/api/searchTotalRecord?shop=${JSON.stringify(shop.shopName)}&&product_name=${JSON.stringify(searchResults)}`);
      const result = await response.json();
      setTotalRecord(result.result)
    } catch (error) {
      console.error("Error:", error);
    }
    try {
      const response = await newFatch(`/api/serachProducts?product_name=${JSON.stringify(searchResults)}&&shop=${JSON.stringify(shop.shopName)}&&listingPerPage=${JSON.stringify(listingPerPage)}&&firstPost=${JSON.stringify(paginationFunc.firstPost)}`);
      const result = await response.json();
      if (searchResults === "") {
        setData(sdata)

      } else {
        setData(result.data)
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const searchHandle1 = (e) => {
    setSearchResults(e.target.value);
  }
  let mainVariant
  if (modalObj.product_variants != undefined) {
    let variantData = JSON.parse(modalObj.product_variants)
    mainVariant = Object.entries(variantData)
  }

  let keyValArr = []
  let uniquePairs = {};
  let result = [];
  return (
    <>
      {loading ?
        <div className='spinnerStyle'>
          <Spinner accessibilityLabel="Small spinner example" size="large" />
        </div>
        :
        <div>
          {pagination.loading === true ?
            <div className='spinnerStyle'>
              <Spinner accessibilityLabel="Small spinner example" size="large" />
            </div>
            :
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <LegacyCard>
                    <input
                      type="text"
                      placeholder="Search"
                      onChange={searchHandle1}
                      value={searchResults}
                      onKeyUp={searchHandle}
                      className="searchBarStyle"
                    />
                  </LegacyCard>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }} >
                  <div>
                    {/* <LegacyCard>
                      <button onClick={convertHandler} >Convert Quote</button>
                    </LegacyCard> */}
                  </div>
                  <div>
                    <LegacyCard>
                      <DownloadCSVButton dataArray={csvData} />
                    </LegacyCard>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '60px' }}>
                <LegacyCard>
                  <IndexTable
                    itemCount={data.length}
                    selectedItemsCount={
                      allResourcesSelected ? 'All' : selectedResources.length
                    }
                    onSelectionChange={handleSelectionChange}
                    headings={[
                      { title: 'Sr No.' },
                      { title: 'Product Name' },
                      { title: 'Product Image' },
                      { title: 'View' },
                      { title: 'Action' },
                      { title: 'Status' },
                      { title: 'Remarks' },
                    ]}
                    selectable={false}
                    style={{ position: 'fixed' }}
                  >
                    {rowMarkup}

                  </IndexTable>
                </LegacyCard>
              </div>
              <PaginationControl
                page={parseInt(pagination.currentPage)}
                total={totalRecord}
                limit={listingPerPage}
                changePage={(page) => {
                  pagination.pageChange(page)
                }}
              />
              <Modal
                large
                open={active}
                onClose={handleChange}
                title=""
              >
                <div className='modal_MainDiv'>
                  <div className='modal_ImgDiv'>
                    {<img src={modalObj.product_image} style={{ height: '100%', width: '100%' }} />}
                    <p className='modal_ProductName'><strong>{modalObj.product_name}</strong></p>
                  </div>

                  <div>
                    <div className='variant_Div'>
                      {mainVariant != undefined && mainVariant.map(([key, val] = entry) => {
                        return (<> <strong>{key}</strong>  : {val}  <br /></>);
                      })}
                    </div>

                    <div>
                      {user.map((data, index) => {
                        for (let i = 0; i < data.length; i++) {
                          let keys = Object.keys(data[i]);
                          let vals = Object.values(data[i]);
                          keyValArr.push({
                            key: keys[0],
                            val: vals[0]
                          })
                        }
                      })
                      }

                      {keyValArr.forEach(obj => {
                        const key = obj.key;
                        const val = obj.val;
                        const pairString = `${key}:${val}`;

                        if (!uniquePairs[pairString]) {
                          uniquePairs[pairString] = true;
                          result.push(obj);
                        }
                      })
                      }

                      {result.map((g, i) => {
                        return (
                          <>
                            <LegacyCard>
                              <strong>{g.key}</strong>  : {g.val}
                            </LegacyCard>
                          </>
                        );
                      })}

                    </div>
                  </div>
                </div>
              </Modal>
            </div>
          }
        </div>
      }
    </>
  )
}

export default QuoteList;