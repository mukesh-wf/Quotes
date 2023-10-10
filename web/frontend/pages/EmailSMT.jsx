import React, { useState, useEffect } from 'react'
import { useForm } from "react-hook-form";
import "./css/myStyle.css"
import useApi from '../hooks/useApi';
import { useAuthenticatedFetch } from '../hooks';

const EmailSMT = () => {
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
    const fetch = useAuthenticatedFetch()
    const ShopApi = useApi()
    const [shop, setShop] = useState({})
    useEffect(async () => {
        const shopName = await ShopApi.shop()
        setShop(shopName)
    }, [])

    const onSubmit = async (data) => {

        let userData = {
            driver: data.Driver,
            from_email: data.From_Email,
            password: data.Password,
            port: data.Port,
            smtp_server: data.SMTP_Server,
            user_email: data.User_Email,
            shop_name: shop.shopName
        }
        try {
            const response = await fetch("/api/emailSMTP_data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });
            const result = await response.json();
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>

                <div className="email_main_Div">
                    <div className='label_div'>
                        <label>Driver</label>
                    </div>
                    <div className='label_div'>
                        <input  {...register("Driver", { required: true })} className='input_width' />
                        {errors.Driver && <span>This field is required</span>}
                    </div>
                </div><br />

                <div className='email_main2_Div'>
                    <div className='label2_div'>
                        <label>SMTP Server</label>
                    </div>
                    <div className='label2_div'>
                        <input {...register("SMTP_Server", { required: true })} className='input_width' />
                        {errors.SMTP_Server && <span>This field is required</span>}
                    </div>
                </div><br />

                <div className='email_main2_Div'>
                    <div className='label2_div'>
                        <label>User Email</label>
                    </div>
                    <div className='label2_div'>
                        <input  {...register("User_Email", { required: true })} className='input_width' />
                        {errors.User_Email && <span>This field is required</span>}
                    </div>
                </div><br />

                <div className='email_main2_Div'>
                    <div className='label2_div'>
                        <label>Password</label>
                    </div>
                    <div className='label2_div'>
                        <input  {...register("Password", { required: true })} className='input_width' />
                        {errors.Password && <span>This field is required</span>}
                    </div>
                </div><br />
            
                <div className='email_main2_Div'>
                    <div className='label2_div'>
                        <label>Port</label>
                    </div>
                    <div className='label2_div'>
                        <input  {...register("Port", { required: true })} className='input_width' />
                        {errors.Port && <span>This field is required</span>}
                    </div>
                </div><br />

                <div className='email_main2_Div'>
                    <div className='label2_div'>
                        <label>From Email</label>
                    </div>
                    <div className='label2_div'>
                        <input  {...register("From_Email", { required: true })} className='input_width' />
                        {errors.From_Email && <span>This field is required</span>}
                    </div>
                </div><br />

                <div className='btn_Div'>
                    <input type="submit" value='Save' />
                </div>
            </form>
        </div>
    )
}

export default EmailSMT