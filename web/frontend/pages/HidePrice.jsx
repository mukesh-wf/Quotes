import { Checkbox, Button, Toast, Frame } from '@shopify/polaris';
import { useForm, Controller } from "react-hook-form";
import "./css/myStyle.css"
import { useAuthenticatedFetch } from '../hooks'
import useApi from '../hooks/useApi';
import { useEffect, useState, useCallback } from 'react';

const HidePrice = () => {
  const fetch = useAuthenticatedFetch()
  const metafieldHook = useApi()
  const [id, setId] = useState("")
  const [active, setActive] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const toastMarkup = active ? (
    <Toast content="All Settings Save" onDismiss={toggleActive} />
  ) : null;

  useEffect(async () => {
    const metafieldId = await metafieldHook.metafield()
    setId(metafieldId)
    try {
      const response = await fetch(`/api/app-metafield/get-all?id=${metafieldId.id}`);
      const result = await response.json();
      let arr = result.data.body.data.app.installation.metafields.edges

      arr.find((f) => {
        if (f.node.key === "priceCSS") {
          let avv = JSON.parse(f.node.value)
          return reset(avv)
        }
      })

    } catch (error) {
      console.error("Error:", error);
    }

  }, [id])

  const { handleSubmit, control, reset } = useForm({});
  const onSubmit = async (data) => {

    const customerData = {
      key: "priceCSS",
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
  }

  return (
    <>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="Price"
          control={control}
          render={({ field: { onChange, value } }) => <Checkbox
            label="Hide Price"
            value={value}
            onChange={onChange}
            checked={value}
          />
          }
        />
        <br />
        <Controller
          name="AddToCart"
          control={control}
          render={({ field: { onChange, value } }) => <Checkbox
            label="Hide Add To Cart "
            value={value}
            onChange={onChange}
            checked={value}
          />
          }
        />
        <br />
        <Frame>
          <input type="submit" onClick={toggleActive} />
          {toastMarkup}
        </Frame>
      </form>

    </>
  );
}
export default HidePrice;