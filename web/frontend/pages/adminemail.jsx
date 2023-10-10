import React, { useEffect, useState } from 'react'
import { TextField, Button, AlphaCard, Text, Grid, Page } from '@shopify/polaris';
import { useForm, Controller } from 'react-hook-form';
import { useAuthenticatedFetch } from "../hooks/index";
import * as errorConstant from '../Utils/ErrorMessage'
import './css/myStyle.css'
import { Dot } from 'react-bootstrap-icons';
import useApi from '../hooks/useApi';
const AdminForm = () => {
    //let getToken = (window.localStorage.getItem("myToken") === null )? [] : JSON.parse(localStorage.getItem("myToken"))      

    const metafieldHook = useApi()
    const fetch = useAuthenticatedFetch()
    const [message, setMessage] = useState("")
    const { reset: reset1, control: control1,
        handleSubmit: handleSubmit1,
        formState: { errors: errors1 }, } = useForm();
    const { reset: reset2, control: control2,
        handleSubmit: handleSubmit2,
        formState: { errors: errors2 }, } = useForm();
    const [metaId, setMetaId] = useState("")
    // let tokenData = [];
    const [tokenData, setTokenData] = useState([])
    const [shopData, setShopData] = useState("")
    //   ab = window.localStorage.getItem("idToken") === null ? [] : JSON.parse(window.localStorage.getItem("idToken"));
    //   console.log("GetToken", ab)

    useEffect(async () => {  

        const metafieldId = await metafieldHook.metafield()
        const shop = await metafieldHook.shop()
 
        console.log("hooookshop",shop.shopName)
        setShopData(shop.shopName)
        setMetaId(metafieldId)
        try {
            const response = await fetch(`/api/app-metafield/get-all?id=${metafieldId.id}`);
            const result = await response.json();
            let arr = result.data.body.data.app.installation.metafields.edges
            arr.find((f) => {
                if (f.node.key === "admin-form-display") {
                    // console.log("ggggggg",f.node.value)
                    let avv = JSON.parse(f.node.value)
                 
                    return reset1(avv)
                }
                if (f.node.key === "admin-form-token") {
                    let avv = JSON.parse(f.node.value)
                    // console.log("avvvvv",avv)
                    setTokenData(avv)
                }
            })
        } catch (error) {
            console.error("Error:", error);
        }

    }, [])

    const onSubmit = async (data) => {
        const customerData = {
            key: "admin-form-display",
            namespace: "quotes-app",
            ownerId: `${metaId}`,
            type: "single_line_text_field",
            value: JSON.stringify(data)
        };
        try {
            const response = await fetch("/api/app-metafield/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(customerData),
            });
            const result = await response.json();

            if (result.status === "sucess") {
                setData(result.msg)
                setMessage(result.msg)
            }

        } catch (error) {
            console.error("Error:", error);
        }
    }

    const onSubmitEmail = async (data) => {
        let name = "John"
        let number = "985241325"
        let msg = "Query about this Product. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
        var todayDate = new Date().toLocaleString();
        let subject = "[RFQ] new request from John"
        let arr = {
            adminEmail: data.email,
            email: data.testemail,
            name: name,
            number: number,
            msg: msg,
            date: todayDate,
            subject: subject,
            shopName:shopData
        }
        try {
            const response = await fetch("/api/testemail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(arr ),
            });
            reset2({ testemail: "" })
            const result = await response.json();
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <>
            <Page fullWidth>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                        <form onSubmit={handleSubmit1(onSubmit)} >
                            {message !== "" && setTimeout(() => {
                                message
                            }, 1000)}

                            <Controller
                                name="subject"
                                control={control1}
                                rules={{ required: true }}
                                defaultValue={""}
                                render={({ field }) => <TextField type="text" onChange={field.onChange} onBlur={field.onBlur}
                                    value={field.value}
                                    name={field.name}
                                    inputRef={field.ref}
                                    label="Subject"
                                />}
                            />
                            {errors1.subject && <span className='error'>{errorConstant.EmptyFieldError}</span>}

                            <Controller
                                name="dataEmail"
                                control={control1}
                                defaultValue={""}
                                rules={{ required: true, pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ }}
                                render={({ field }) => <TextField type="email" onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    value={field.value}
                                    name={field.name}
                                    inputRef={field.ref}
                                    label="Admin Email" />}
                            />
                            {errors1.adminEmail && errors1.adminEmail.type === "required" && <span className='error'>{errorConstant.EmptyFieldError}</span>}
                            {errors1.adminEmail && errors1.adminEmail.type === "pattern" && <span className='error'>{errorConstant.EmailFieldError}</span>}

                            <Controller
                                name="emailReply"
                                control={control1}
                                defaultValue={""}
                                rules={{ required: true }}
                                render={({ field }) => <TextField type="text" onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    value={field.value}
                                    name={field.name}
                                    inputRef={field.ref}
                                    label="Email Reply"
                                />}
                            />
                            {errors1.emailReply && errors1.emailReply.type === "required" && <span className='error'>{errorConstant.EmptyFieldError}</span>}
                            {errors1.emailReply && errors1.emailReply.type === "pattern" && <span className='error'>{errorConstant.EmailFieldError}</span>}

                            <Controller
                                name="emailTo"
                                control={control1}
                                rules={{ required: true }}
                                defaultValue={""}
                                render={({ field }) => <TextField type="text" onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    value={field.value}
                                    name={field.name}
                                    inputRef={field.ref}
                                    label="To"
                                />}
                            />
                            {errors1.emailTo && errors1.emailTo.type === "required" && <span className='error'>{errorConstant.EmptyFieldError}</span>}
                            {errors1.emailTo && errors1.emailTo.type === "pattern" && <span className='error'>{errorConstant.EmailFieldError}</span>}

                            <Controller
                                name="emailFrom"
                                control={control1}
                                rules={{ required: true }}
                                defaultValue={""}
                                render={({ field }) => <TextField type="text" onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    value={field.value}
                                    name={field.name}
                                    inputRef={field.ref}
                                    label="From" />}
                            />
                            {errors1.emailFrom && errors1.emailFrom.type === "required" && <span className='error'>{errorConstant.EmptyFieldError}</span>}
                            {errors1.emailFrom && errors1.emailFrom.type === "pattern" && <span className='error'>{errorConstant.EmailFieldError}</span>}
                            <br />
                            <input type="submit" />
                        </form >
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>

                        <h4>Tokens which you can use in your app </h4>

                        {tokenData.map((e,i) => {
                            // console.log("eeeeeeeeeeeeeeeeeeed", e.token)
                            return (
                                <div key={i}>
                                    <Dot /> <b> ## {e.token} ##  </b><span className='textChange'>anywhere to have replaced by the {e.token} </span>
                                </div>
                            )
                        })}
                        {/* <div>
                            <Dot /> <b> ## customer_name ##  </b><span className='textChange'>anywhere to have replaced by the customer name </span>
                        </div>
                        <div>
                            <Dot /> <b> ## shop ##  </b><span className='textChange'>anywhere to have replaced by the shop name </span>
                        </div>
                        <div>
                            <Dot /> <b> ## phone ##  </b><span className='textChange'>anywhere to have replaced by the phone number </span>
                        </div> */}              

                        <AlphaCard className="w-50 ms-5 mt-4">
                            <Text as="h2" variant="bodyMd">
                                Send Test Mail
                            </Text>
                            <form onSubmit={handleSubmit2(onSubmitEmail)} >

                                <Controller
                                    name="testemail"
                                    control={control2}
                                    defaultValue={""}
                                    rules={{ required: true, pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ }}
                                    render={({ field }) => <TextField type="text" onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        value={field.value}
                                        name={field.name}
                                        inputRef={field.ref}
                                        label="Test Email"
                                    />}
                                />
                                {errors2.testemail && errors2.testemail.type === "required" && <span className='error'>{errorConstant.EmptyFieldError}</span>}
                                {errors2.testemail && errors2.testemail.type === "pattern" && <span className='error'>{errorConstant.EmailFieldError}</span>}
                                <input type="submit" />

                            </form>
                        </AlphaCard>
                    </Grid.Cell>

                </Grid >
            </Page>
        </>
    )
}

export default AdminForm