import { Checkbox, Button,Toast, Frame, } from '@shopify/polaris';
import { useForm, Controller } from "react-hook-form";
import "./css/myStyle.css"
import { useAuthenticatedFetch } from '../hooks'
import useApi from '../hooks/useApi';
import { useEffect, useState,useCallback } from 'react';

const LabelSetting = () => {
  const fetch = useAuthenticatedFetch()
  const metafieldHook = useApi()
  const [id, setId] = useState("")

  const { handleSubmit, control, reset, register } = useForm({});

  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive((active) => !active), []);
  const toastMarkup = active ? (
    <Toast content="Save Settings" onDismiss={toggleActive} />
  ) : null;

  useEffect(async () => {

    const metafieldId = await metafieldHook.metafield()
    setId(metafieldId)

    try {
      const response = await fetch(`/api/app-metafield/get-all?id=${metafieldId.id}`);
      const result = await response.json();
      let MetafieldArr = result.data.body.data.app.installation.metafields.edges
      MetafieldArr.find((f) => {
        if (f.node.key === "label-setting") {
          let val = JSON.parse(f.node.value)
          return reset(val)
        }
      })

    } catch (error) {
      console.error("Error:", error);
    }

    try {
      const response = await fetch(`/api/app-metafield/get-all?id=${metafieldId.id}`);
      const result = await response.json();
      let MetafieldArr = result.data.body.data.app.installation.metafields.edges
      MetafieldArr.find((f) => {
        if (f.node.key === "grid-setting") {
          let  val = JSON.parse(f.node.value)
          return reset(val)
        }
      })

    } catch (error) {
      console.error("Error:", error);
    }

  }, [])

  const onSubmit = async (data) => {

    const customerData = {
      key: "label-setting",
      namespace: "quotes-app",
      ownerId: `${id}`,
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

    const labelGrid = {
      key: "grid-setting",
      namespace: "quotes-app",
      ownerId: `${id}`,
      type: "single_line_text_field",
      value: JSON.stringify(data)
    };

    try {
      const response = await fetch("/api/app-metafield/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(labelGrid),
      });
      const result = await response.json();
      if (result.status === "sucess") {
        setData(result.msg)
      }

    } catch (error) {
      console.error("Error:", error);
    }

  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        
        <select {...register("label")}>
          <option value="" >
            Select
          </option>
          <option value="left_label">left_label</option>
          <option value="Placholder">Placholder</option>
          <option value="Upper_Label">Upper_Label</option>
        </select>
      
        <select {...register("grid")} style={{marginLeft:'20px'}}>
        <option value="" >
          Select 
        </option>
        <option value="Single_Grid">One Column</option>
        <option value="Two_Grid">Two Column</option>
      </select>
     
      <Frame>
        <button type="submit" onClick={toggleActive} style={{ marginLeft: '25%' }}>Submit </button>
          {toastMarkup}
      </Frame>
   
      </form>

    </>
  );
}
export default LabelSetting;