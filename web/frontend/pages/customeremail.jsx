import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form';
import { useAuthenticatedFetch } from '../hooks'
import * as errorConstant from '../Utils/ErrorMessage'
import './css/myStyle.css'
import { TextField, Button, AlphaCard, Text, Grid, Page } from '@shopify/polaris';
import { Dot } from 'react-bootstrap-icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import useApi from '../hooks/useApi';
const CustomerForm = () => {
  const metafieldHook = useApi()
  const [tokenData, setTokenData] = useState([])

  const fetch = useAuthenticatedFetch()
  const { reset: reset1, control: control1,
    handleSubmit: handleSubmit1,
    formState: { errors: errors1 }, } = useForm();
  const { reset: reset2, control: control2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 }, } = useForm();
  const [data, setData] = useState("")
  const [metaId, setMetaId] = useState("")
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ size: [] }],
      [{ font: [] }],
      [{ align: ["right", "center", "justify"] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      [{ color: ["red", "#785412"] }],
      [{ background: ["red", "#785412"] }]
    ]
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "color",
    "image",
    "background",
    "align",
    "size",
    "font"
  ];

  useEffect(async () => {
    const metafieldId = await metafieldHook.metafield()
    setMetaId(metafieldId)
    try {
      const response = await fetch(`/api/app-metafield/get-all?id=${metafieldId.id}`);
      const result = await response.json();
      let arr = result.data.body.data.app.installation.metafields.edges
      arr.find((f) => {
        if (f.node.key === "customer-form-display") {
          let avv = JSON.parse(f.node.value)
          return reset1(avv)
        }
        if (f.node.key === "admin-form-token") {
          let avv = JSON.parse(f.node.value)
          setTokenData(avv)
      }
      })
    } catch (error) {
      console.error("Error:", error);
    }
  }, [])
  const onSubmit = async (data) => {
  
    const customerData = {
      key: "customer-form-display",
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
      }

    } catch (error) {
      console.error("Error:", error);
    }
  }
  const onSubmitEmail = () => {
    console.log("D")
  }

  return (
    <>
      <Page fullWidth>
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>

            <form onSubmit={handleSubmit1(onSubmit)}>
              <Controller
                name="subject"
                control={control1}
                rules={{ required: true }}
                defaultValue={""}
                render={({ field }) => <TextField type="text" onChange={field.onChange}
                  onBlur={field.onBlur}
                  value={field.value}
                  name={field.name}
                  inputRef={field.ref}
                  label="Subject" />}
              />
              {errors1.subject && <span className='error'>{errorConstant.EmptyFieldError}</span>}

              <Controller
                name="emailReply"
                control={control1}
                rules={{ required: true }}
                defaultValue={""}
                render={({ field }) => <TextField type="text" onChange={field.onChange}
                  onBlur={field.onBlur}
                  value={field.value}
                  name={field.name}
                  inputRef={field.ref}
                  label="Email Reply" />}
              />
              {errors1.emailReply && <span className='error'>{errorConstant.EmptyFieldError}</span>}

              <Controller
                name="message"
                control={control1}
                rules={{ required: true }}
                defaultValue={""}
                render={({ field }) => <ReactQuill
                theme="snow"
                  modules={modules}
                  formats={formats}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  value={field.value}
                  name={field.name}
                  inputRef={field.ref}
                />}
              />
              {errors1.message && <span className='error'>{errorConstant.EmptyFieldError}</span>}

              <input type="submit" />
            </form>
          </Grid.Cell >
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <Grid.Cell >
              <h4>Tokens which you can use in your app </h4>
              {tokenData.map((e,i) => {
                            return (
                                <div key={i}>
                                    <Dot /> <b> ## {e.token} ##  </b><span className='textChange'>anywhere to have replaced by the {e.token} </span>
                                </div>
                            )
                        })}
            </Grid.Cell>

            <Grid.Cell >
              <AlphaCard className="w-50 ms-5 mt-4">
                <form onSubmit={handleSubmit2(onSubmitEmail)} >
                  <Controller
                    name="testemail"
                    control={control2}
                    defaultValue={""}
                    rules={{ required: true }}
                    render={({ field }) => <TextField type="text" onChange={field.onChange}
                      onBlur={field.onBlur}
                      value={field.value}
                      name={field.name}
                      inputRef={field.ref}
                      label="Email Id" className='w-50' />}
                  />
                  {errors2.testemail && <span className='error'>{errorConstant.EmptyFieldError}</span>}
                  <input type="submit" />

                </form>
              </AlphaCard>
            </Grid.Cell>
            
          </Grid.Cell>
        </Grid>
      </Page >
    </>
  )
}

export default CustomerForm