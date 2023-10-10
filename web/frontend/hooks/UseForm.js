// import $ from 'jquery';
// import 'jquery-ui-sortable';
// import React, { useRef, useEffect, useState } from "react";

// window.jQuery = $;
// window.$ = $;

// require("formBuilder");



// /* 
// autocomplete
// button
// checkbox-group
// date
// file
// header
// hidden
// number
// paragraph
// radio-group
// select
// starRating
// text
// textarea*/

// const options = {
//   disableFields: [
//     'autocomplete',
//     'file',
//     'date',
//     'paragraph'
//   ],
//   replaceFields: [
//     {
//       type: "checkbox-group",
//       label: "Checkbox",
//       values: [{ label: "Option 1", value: "" }],
//       icon: "☑"
//     }
//   ],
//   // layoutTemplates: {
//   //   default: function(field, label, help, data) {
//   //     help = $('<div/>')
//   //       .addClass('helpme')
//   //       .attr('id', 'row-' + data.id)
//   //       .append(help);
//   //     return $('<div/>').append(label, field, help);
//   //   }
//   // }
//   // roles: {
//   //   1: 'Administrator',
//   //   2: 'Editor'
//   // },
//   //{
//     controlPosition: 'right'
//   //}
// };

//   // const fields = [{
//   //   label: 'Star Rating',
//   //   attrs: {
//   //     type: 'starRating'
//   //   },
//   //   icon: '🌟'
//   // }];
//   // const templates = {
//   //   starRating: function(fieldData) {
//   //     return {
//   //       field: '<span id="'+fieldData.name+'">',
//   //       onRender: function() {
//   //         $(document.getElementById(fieldData.name)).rateYo({rating: 3.6});
//   //       }
//   //     };
//   //   }
//   // };

//   const formData = [
//     {
//       type: "header",
//       subtype: "h1",
//       label: "Build you form"
//     },
//     {
//       type: "paragraph",
//       label: "You can build your form using drag and drop elements."
//     }
     
//   ];
// const FormBuilder = () => {

//   const fb = useRef({});
//   const [show, setShow] = useState(false);
//   const fBuilder = useRef();

//   useEffect(() => {
//     setShow(true);
//     if (show) {
//       try {
//         fBuilder.current = $(fb.current).formBuilder(options,{formData });

//         //promises
//         // fBuilder.current.promise.then(formBuilder => {
//         //     console.log(formBuilder.formData);
//         // });
//       } catch (err) {
//         console.warn("formData not available yet.");
//         console.error("Error: ", err);
//       }
//     }
//   }, [show]);

//   const handleShowData = () => {
//     fBuilder.current.actions.showData();
//     //fBuilder.current.actions.removeField();
//     //fBuilder.current.actions.getData('json');
//    // console.log(fBuilder.current.actions.getData('json'), 'fBuilder.current.actions.getData()')
//     fBuilder.current.actions.save()
//   }


//   const handleClearDataFields = () => {
//     fBuilder.current.actions.clearFields();
//   }



//   return (
//     <div id="fb-editor" className="build-wrap" ref={fb}>
//       <div className="text-center">
//           <button id="clear-all-fields" onClick={handleClearDataFields} className="clear-all btn btn-danger" type="button">Clear Fields</button>
//           <button id="showData" onClick={handleShowData} className="btn btn-primary save-template" type="button">Save and Show Data</button>
//       </div>
//     </div>
//   );
// }

// export default FormBuilder;