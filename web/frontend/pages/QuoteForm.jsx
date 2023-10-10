// import $, { type } from 'jquery';

import React, { useRef, useEffect, useState } from "react";
//  import('jquery-ui-sortable');
import { useAppBridge } from '@shopify/app-bridge-react';
import { useAuthenticatedFetch } from '../hooks'
import useSubscriptionUrl from '../hooks/useSubscriptionUrl'
import useApi from '../hooks/useApi';
import { Text } from '@shopify/polaris';
import { json } from "body-parser";

// window.jQuery = $;
// window.$ = $;
// import('formBuilder');

/* 
autocomplete
button
checkbox-group
date
file
header
hidden
number
paragraph
radio-group
select
starRating
text
textarea*/

const optionsFree = {
  disableFields: [

    //  'autocomplete',
    //   'button',
    'checkbox-group',
    'date',
    'file',
    'header',
    'hidden',
    'number',
    'paragraph',
    //  'radio-group',k
    // 'select',
    'starRating',
    // 'textarea'
  ],
  // replaceFields: [
  //   {
  //     type: "checkbox-group",
  //     label: "Checkbox",
  //     values: [{ label: "Option 1", value: "" }],
  //     icon: "☑"
  //   }
  // ],
  // layoutTemplates: {
  //   default: function(field, label, help, data) {
  //     help = $('<div/>')
  //       .addClass('helpme')
  //       .attr('id', 'row-' + data.id)
  //       .append(help);
  //     return $('<div/>').append(label, field, help);
  //   }
  // }
  // roles: {
  //   1: 'Administrator',
  //   2: 'Editor'
  // },
  //{
  controlPosition: 'right'
  //}
}

const optionsPremium = {
  disableFields: [
    'autocomplete',
    // 'button',
    'checkbox-group',
    'date',
    // 'file',
    'header',
    'hidden',
    'number',
    'paragraph',
    'radio-group',
    'select',
    'starRating',
    'textarea'
  ],
  // replaceFields: [
  //   {
  //     type: "checkbox-group",
  //     label: "Checkbox",
  //     values: [{ label: "Option 1", value: "" }],
  //     icon: "☑"
  //   }
  // ],
  // layoutTemplates: {
  //   default: function(field, label, help, data) {
  //     help = $('<div/>')
  //       .addClass('helpme')
  //       .attr('id', 'row-' + data.id)
  //       .append(help);
  //     return $('<div/>').append(label, field, help);
  //   }
  // }
  // roles: {
  //   1: 'Administrator',
  //   2: 'Editor'
  // },
  //{
  controlPosition: 'right'
  //}
}
const optionsBasic = {
  disableFields: [

    'autocomplete',
    //   'button',
    'checkbox-group',
    'date',
    'file',
    'header',
    'hidden',
    // 'number',
    // 'paragraph',
    //  'radio-group',
    //   'select',
    'starRating',
    // 'textarea'
  ],
  // replaceFields: [
  //   {
  //     type: "checkbox-group",
  //     label: "Checkbox",
  //     values: [{ label: "Option 1", value: "" }],
  //     icon: "☑"
  //   }
  // ],
  // layoutTemplates: {
  //   default: function(field, label, help, data) {
  //     help = $('<div/>')
  //       .addClass('helpme')
  //       .attr('id', 'row-' + data.id)
  //       .append(help);
  //     return $('<div/>').append(label, field, help);
  //   }
  // }
  // roles: {
  //   1: 'Administrator',
  //   2: 'Editor'
  // },
  //{
  controlPosition: 'right'
  //}
}
// const fields = [{
//   label: 'Star Rating',
//   attrs: {
//     type: 'starRating'
//   },
//   icon: '🌟'
// }];
// const templates = {
//   starRating: function(fieldData) {
//     return {
//       field: '<span id="'+fieldData.name+'">',
//       onRender: function() {
//         $(document.getElementById(fieldData.name)).rateYo({rating: 3.6});
//       }
//     };
//   }
// };

const formData = [
  {
    type: "header",
    subtype: "h1",
    label: "Build you form"
  },
  {
    type: "paragraph",
    label: "You can build your form using drag and drop elements."
  }

];


const QuoteForm = () => {
  const [status, setStatus] = useState("")

  const app = useAppBridge();
  const [shop, setShop] = useState()
  const metafieldHook = useApi()
  const subscription = useSubscriptionUrl()
  const fb = useRef({});
  const [show, setShow] = useState(false);
  const [test, setTest] = useState(false)
  const [data, setData] = useState();
  const [message, setMessage] = useState("")
  const [metaId, setMetaId] = useState("")
  const fBuilder = useRef();
  const shopApi = useApi()
  const fetch = useAuthenticatedFetch()

  useEffect(async () => {
    const metafieldId = await metafieldHook.metafield()
    let dataArr = []
    let planName = ""

    setMetaId(metafieldId)
    setShow(true);

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

    if (show) {
      try {
        let count = $(fb.current).find('.form-builder').length;
        if (count < 1) {
          if (status === "Free") {
            fBuilder.current = $(fb.current).formBuilder(optionsFree, { formData });//$(fb.current).formBuilder(options,{formData });
          }
          if (status === "Basic") {
            fBuilder.current = $(fb.current).formBuilder(optionsBasic, { formData })
          }
          if (status === "Premium") {
            fBuilder.current = $(fb.current).formBuilder(optionsPremium, { formData })
          }
        }
      } catch (err) {
        console.warn("formData not available yet.");
        console.error("Error: ", err);
      }
  }
  
  const shopN = await shopApi.shop()
  setShop(shopN.shopName)
 
  setTest(true)
}, [show, test]);


const handleShowData = async () => {
  fBuilder.current.actions.showData();
  fBuilder.current.actions.getData('xml');
  fBuilder.current.actions.save();

  var dataForm = fBuilder.current.actions.getData('xml')
  var formRenderOpts = {
    dataType: 'xml',
    formData: dataForm
  };

  let iddd;
  var renderedForm = $('<div/>');
  renderedForm.formRender(formRenderOpts);
  let customerData = renderedForm.html()

  const parser = new DOMParser();
  const doc = parser.parseFromString(customerData, 'text/html');
  const inputElements = doc.querySelectorAll('input');

  inputElements.forEach((inputElement, i) => {
    const newDiv = document.createElement('span');
    newDiv.setAttribute("id", "errorDiv" + i + "");
    inputElement.parentNode.appendChild(newDiv);
  });
  
  let modifiedHTMLString = doc.querySelector('html').innerHTML;
  modifiedHTMLString = modifiedHTMLString.replaceAll('<head>', '');
  modifiedHTMLString = modifiedHTMLString.replaceAll('</head>', '');
  modifiedHTMLString = modifiedHTMLString.replaceAll('<body>', '');
  modifiedHTMLString = modifiedHTMLString.replaceAll('</body>', '');

  const parser2 = new DOMParser();
  const doc2 = parser2.parseFromString(modifiedHTMLString, 'text/html');

  const inputElements2 = doc2.querySelectorAll('.rendered-form input');
  inputElements2.forEach(input => {
    const labelForAttribute = input.parentElement.querySelector('label').textContent.trim();
    const formattedId = labelForAttribute.toLowerCase().replace(/\s+/g, '');
    input.name = formattedId;
    input.id = formattedId;
    // input.placeholder = formattedId;
  });

  const tokenArray = [];
  inputElements2.forEach((input) => {
    const inputId = input.id;
    tokenArray.push(
      {
        token: inputId
      }
    );
  });
  let tokens = [
    { token: " shopName " },
    { token: " shopDomain " },
    { token: " shopLogo " }
  ];

  let combineArr = tokens.concat(tokenArray)
  const LabelElements2 = doc2.querySelectorAll('.rendered-form label');
  LabelElements2.forEach(label => {
    const labelForAttribute = label.textContent.trim();
    const formattedId = labelForAttribute.toLowerCase().replace(/\s+/g, '');
    label.setAttribute('for', formattedId);
    // label.for = labelForAttribute;
  });

  let modifyHtml = doc2.querySelector('html').innerHTML;
  modifyHtml = modifyHtml.replaceAll('<head>', '');
  modifyHtml = modifyHtml.replaceAll('</head>', '');
  modifyHtml = modifyHtml.replaceAll('<body>', '');
  modifyHtml = modifyHtml.replaceAll('</body>', '');

  const metafieldData = {
    key: "admin-form-token",
    namespace: "quotes-app",
    ownerId: `${metaId}`,
    type: "single_line_text_field",
    value: JSON.stringify(combineArr)
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
      setMessage(result.msg)
    }

  } catch (error) {
    console.error("Error:", error);
  }

  try {
    const response = await fetch("/api/customFormFields", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customForm: modifyHtml, shopName: shop })
    });
    const result = await response.json()
    if (result.type === "success") {
      setData(result.msg)
    }

  } catch (error) {
    console.error("Error:", error);
  }

}

const handleClearDataFields = () => {
  fBuilder.current.actions.clearFields();
}

return (
  <>
    <div id="fb-editor" className="build-wrap" ref={fb}>
      <div className="text-center">
        <button id="clear-all-fields" onClick={handleClearDataFields} className="clear-all btn btn-danger" type="button">Clear Fields</button>
        <button id="showData" onClick={handleShowData} className="btn btn-primary save-template" type="button">Save and Show Data</button>
      </div>
    </div>
  </>
);
}
export default QuoteForm;


