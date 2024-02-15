const BACKEND_PORT = "http://localhost:5000"
let productResult
let data = [];
let userInfo = []
let getData = [];
var modal = document.getElementById('myModal');
var span = document.getElementsByClassName("close")[0];
let ModalForm = document.getElementById('main-Modal-form')
let EmailSuccess = document.getElementById('sucess-form-msg')
let FetchData = []
let F2=[];
let variant_size = []
let variant_title = ""
let variant_img = ""
let getvariants = JSON.parse(localStorage.getItem("variants")) === null ? "" : JSON.parse(localStorage.getItem("variants"))
let shopdetail = JSON.parse(localStorage.getItem("shop")) === null ? "" : JSON.parse(localStorage.getItem("shop"))
let arrr = {}
let adminMetaresult = []
let metfieldToken = []
let customerMetaresult = []
let fieldForms;
let ab = ""
let urlNew
let customFields = []
let setData
let metafiledLabel
let gridSettings
let subscription
async function GetQuotes(FinalData) {
    FetchData = JSON.parse(FinalData.getAttribute("target-all"));
    urlNew = new URL(location.href).searchParams.get("variant");
    adminMetaresult = JSON.parse(FinalData.getAttribute("metafiledNew"));
    metfieldToken = JSON.parse(FinalData.getAttribute("metafiledToken"));
    customerMetaresult = JSON.parse(FinalData.getAttribute("metafiledNew1"));
    metafiledLabel = JSON.parse(FinalData.getAttribute("metafiledLabel"));
    gridSettings = JSON.parse(FinalData.getAttribute("gridSettings"));
    fieldForms = FinalData.getAttribute("metafieldForm");
    subscription = FinalData.getAttribute("subscription");
    let variantArr = [FetchData]
    variantArr.map((val) => {
        val.variants.map((data) => {
            if (data.id === parseInt(urlNew)) {
                if (data.featured_image === null) {
                    variant_img = "https:" + val.images[0]
                }
                else {
                    variant_img = data.featured_image.src
                }
                variant_size = data.options
            }
            else if (urlNew == null) {
                ab = val.variants[0].id
                val.variants.length = 1
                if (val.variants.length === 1) {
                    if (data.featured_image === null) {
                        variant_img = "https:" + val.images[0]
                    }
                    else {
                        variant_img = data.featured_image.src
                    }
                    variant_size = data.options
                }
            }
        })
    })
    data = {
        id: FetchData.id,
        image: variant_img,
        title: FetchData.title,
    }
    Modal()
}


document.addEventListener('keyup', function (e) {
    if (e.key === "Escape") {
        modal.style.display = "none";
    }
});

async function productApi() {
    try {
        const productData = await fetch(`${BACKEND_PORT}/prod/productstats?productId=${FetchData.id}`
        )
        productResult = await productData.json();

    } catch (error) {
        console.error(`Download error: ${error}`);
    }

    if (productResult.count[0].count === 0) {
        try {
            const productData = await fetch(`${BACKEND_PORT}/qoutes/insertproduct`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: FetchData.id,
                    productName: FetchData.title,
                    shopName: shopdetail[0].shop_name
                })
            })
            productResult = await productData.json();
        } catch (error) {
            console.error(`Download error: ${error}`);
        }
    }
    else {
        try {
            const productData = await fetch(`${BACKEND_PORT}/quotes/updateproduct`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: productResult.result[0].product_stats_id,
                    view: productResult.result[0].views,
                    click: productResult.result[0].clicks,
                    shopName: shopdetail[0].shop_name,
                    modalview: "modalview"
                })
            })
            productResult = await productData.json();
        } catch (error) {
            console.error(`Download error: ${error}`);
        }
    }
}

async function Modal() {
    var getVariantSize
    modal.style.display = "block";
    EmailSuccess.style.display = 'none';
    // create_account()
    ModalForm.style.display = 'block';

    span.onclick = function () {
        modal.style.display = "none";
    }

    for (let i = 0; i < FetchData.options.length; i++) {
        getVariantSize = FetchData.options[i]
        variant_title = FetchData.title
    }

    let wishlistBody = `<div class="row">
                        <div class="img"><img src=${variant_img}/></div>`
    wishlistBody += `<div class="col">
           
            <h1>${FetchData.title}</h1>`

    FetchData.options.map((data, index) => {
        variant_size.map((val, i) => {
            if (i === index) {
                if (data != "title" && val != "Default Title") {
                    wishlistBody += `<p >${data} :
                                     <span>${val}</span> </p>`;
                }
            }
        })
    })

    for (let i = 0; i < FetchData.options.length; i++) {
        arrr[FetchData.options[i]] = variant_size[i];
    }
    localStorage.setItem("variants", JSON.stringify(arrr))
    wishlistBody += '</div></div>';
    document.querySelector('.show-title').innerHTML = wishlistBody
    productApi()
    let customData;
    let formTag;
    let bodyy

    try {
        const response = await fetch(`${BACKEND_PORT}/form/customFormFields?shopName=${shopdetail[0].shop_name}`);
        const result = await response.json();
        customData = result.result[0].customForm
        customData = customData.replaceAll('<button ', '<button onclick="submitHandler()" ')
        const parser = new DOMParser();
        const html = parser.parseFromString(customData, 'text/html');
        bodyy = html.body.innerHTML

        if (metafiledLabel.label === "Placholder" && gridSettings.grid === "Single_Grid") {
            const parser = new DOMParser();
            const html = parser.parseFromString(customData, 'text/html');
            const inputElements2 = html.querySelectorAll('.rendered-form input');
            inputElements2.forEach(input => {
                const labelForAttribute = input.parentElement.querySelector('label').textContent.trim();
                const formattedId = labelForAttribute.toLowerCase().replace(/\s+/g, '');
                input.name = formattedId;
                input.id = formattedId;
                input.placeholder = formattedId;
            });
            const labels = html.querySelectorAll('.formbuilder-text-label');
            labels.forEach(label => {
                label.style.display = 'none';
            });

            // Single Grid
            const gridRender2 = html.querySelectorAll('.formbuilder-text');
            gridRender2.forEach(e => {
                e.style.display = "flex";
                e.style.justifyContent = "space-evenly";
                e.style.width = "50%";
                e.style.marginTop = "10px";
            });
            bodyy = html.body.innerHTML
        }

        if (metafiledLabel.label === "Placholder" && gridSettings.grid === "Two_Grid") {
            const parser = new DOMParser();
            const html = parser.parseFromString(customData, 'text/html');
            const inputElements2 = html.querySelectorAll('.rendered-form input');
            inputElements2.forEach(input => {
                const labelForAttribute = input.parentElement.querySelector('label').textContent.trim();
                const formattedId = labelForAttribute.toLowerCase().replace(/\s+/g, '');
                input.name = formattedId;
                input.id = formattedId;
                input.placeholder = formattedId;
            });
            const labels = html.querySelectorAll('.formbuilder-text-label');
            labels.forEach(label => {
                label.style.display = 'none';
            });

            // Two_Grid
            const gridRender = html.querySelectorAll('.formbuilder-text');
            gridRender.forEach(e => {
                e.style.display = "flex";
                e.style.float = "left";
                e.style.width = "48%";
                e.style.justifyContent = "space-around";
                e.style.alignSelf = "center";
                e.style.marginTop = "10px";
            });
            const inputElements = html.querySelectorAll('.rendered-form input');
            inputElements.forEach(input => {
                input.style.width = "50%";
                // input.style.justifyContent ="right";
            });
            bodyy = html.body.innerHTML
        }

        if (metafiledLabel.label === "left_label" && gridSettings.grid === "Single_Grid") {
            const parser = new DOMParser();
            const html = parser.parseFromString(customData, 'text/html');

            // Single Grid
            const gridRender2 = html.querySelectorAll('.formbuilder-text');
            gridRender2.forEach(e => {
                e.style.display = "flex";
                e.style.justifyContent = "space-evenly";
                e.style.width = "50%";
                e.style.marginTop = "10px";
                // e.style.border = "1px solid blue";
            });
            bodyy = html.body.innerHTML
        }

        if (metafiledLabel.label === "left_label" && gridSettings.grid === "Two_Grid") {
            const parser = new DOMParser();
            const html = parser.parseFromString(customData, 'text/html');

            // Two Grid
            const gridRender2 = html.querySelectorAll('.formbuilder-text');
            gridRender2.forEach(e => {
                e.style.display = "flex";
                e.style.float = "left";
                e.style.width = "48%";
                e.style.justifyContent = "space-around";
                e.style.alignSelf = "center";
                e.style.marginTop = "10px";

            });
            const inputElements2 = html.querySelectorAll('.rendered-form input');
            inputElements2.forEach(input => {
                input.style.width = "50%";
                // input.style.justifyContent ="right";

            });
            bodyy = html.body.innerHTML
        }

        if (metafiledLabel.label === "Upper_Label" && gridSettings.grid === "Single_Grid") {
            const parser = new DOMParser();
            const html = parser.parseFromString(customData, 'text/html');

            // Upper_Label
            const inputElements2 = html.querySelectorAll('.rendered-form input');
            inputElements2.forEach(input => {
                const labelForAttribute = input.parentElement.querySelector('label').textContent.trim();
                const formattedId = labelForAttribute.toLowerCase().replace(/\s+/g, '');
                input.name = formattedId;
                input.id = formattedId;
            });

            const labels = html.querySelectorAll('.formbuilder-text-label');
            labels.forEach(label => {
                label.style.display = 'block';
                label.style.marginBottom = '2px';
            });

          
            const gridRender = html.querySelectorAll('.formbuilder-text');
            gridRender.forEach(e => {
                e.style.width = "50%";
                e.style.marginLeft = "28%";
                // e.style.justifyContent = "center";
                // e.style.alignItem = "center";
            });
            const inputElements = html.querySelectorAll('.rendered-form input');
            inputElements.forEach(input => {
                input.style.width = "50%";
            });

            bodyy = html.body.innerHTML
        }

        if (metafiledLabel.label === "Upper_Label" && gridSettings.grid === "Two_Grid") {
            const parser = new DOMParser();
            const html = parser.parseFromString(customData, 'text/html');

            // Upper_Label
            const inputElements2 = html.querySelectorAll('.rendered-form input');
            inputElements2.forEach(input => {
                const labelForAttribute = input.parentElement.querySelector('label').textContent.trim();
                const formattedId = labelForAttribute.toLowerCase().replace(/\s+/g, '');
                input.name = formattedId;
                input.id = formattedId;
            });

            const labels = html.querySelectorAll('.formbuilder-text-label');
            labels.forEach(label => {
                label.style.display = 'block';
                label.style.marginBottom = '2px';
            });

            // Two_Grid
            const gridRender = html.querySelectorAll('.formbuilder-text');
            gridRender.forEach(e => {
                e.style.float = "left";
                e.style.width = "48%";
                e.style.justifyContent = "space-around";
                e.style.alignSelf = "center";
                e.style.marginTop = "10px";
            });
            const inputElements = html.querySelectorAll('.rendered-form input');
            inputElements.forEach(input => {
                input.style.width = "50%";
            });

            bodyy = html.body.innerHTML
        }

    } catch (error) {
        console.error("Error:", error);
    }

    document.getElementById("formm").innerHTML = bodyy
    const btnn = document.querySelectorAll('.rendered-form button')
    const btnId = btnn[0].getAttribute('id')

    document.getElementById(btnId).addEventListener("click", submitHandler);

    async function submitHandler(e) {
        const variantId = urlNew === null ? ab : parseInt(urlNew)
        var todayDate = new Date().toLocaleString();
        let children = [];
        let idVar = [];

        e.preventDefault()
        let formChild = document.querySelector(".rendered-form").children
        //  children = tt.children;
        let childArray = Array.from(formChild)
        const labelValues2 = [];

        childArray.map((w) => {
            // console.log("first",w )
            // console.log("hghff7878887jjjj....", w.replaceAll('<input >', '<div>'))
            // w.setAttribute('id',labelValues2)
        })

        let idValue;
        let ValueArr;
        let combineArr;
        let getValue = [];
        const inputElements = document.querySelectorAll('.rendered-form input ');
        for (let i = 0; i < inputElements.length; i++) {
            const inputElement = inputElements[i];
            idValue = inputElement.getAttribute('id');
            const nameValue = inputElement.getAttribute('name');
            ValueArr = document.getElementById(idValue).value;
            
            idVar.push(
                {
                    key: nameValue,
                    value: ValueArr
                }
            );
            let tokens = [
                { key: "shopName", value: shopdetail[0].shop_name },
                { key: "shopDomain", value: shopdetail[0].shop_domain },
                // { key: "shopLogo" }
            ];
            combineArr = tokens.concat(idVar);
            let abc = subscription.replace(/"/g, "");

            if (abc === "Premium") {
                let New_Data = new FormData();
                const fileInput = document.getElementById(idValue);

                if (fileInput && fileInput.type === "file" && fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    New_Data.append('uploadFile', file);
                    const headers = {
                        'Content-Type': 'multipart/form-data',
                    };

                    axios.post(`${BACKEND_PORT}/upload`, New_Data, { headers })
                        .then(function (response) {
                            console.log('Post successfully created:', response);
                            dd = response;
                        })
                        .catch(function (error) {
                            console.error('Error:', error);
                        });
                } else {
                    console.log("File input not found or no files selected.");
                }
            }
        }
        const labelElements = document.querySelectorAll(".formbuilder-text-label");
        labelElements.forEach((label) => {
            const inputId = label.getAttribute('for');
            const inputValue = label.textContent.trim();
            // labelValues2[inputId] = inputValue;
            labelValues2.push(
                {
                    key: inputId,
                    value: inputValue
                }
            )
        });

        function replaceTokens(str) {
            for (let i = 0; i < combineArr.length; i++) {
                for (let k = 0; k < metfieldToken.length; k++) {
                    if (combineArr[i].key === metfieldToken[k].token) {
                        getValue.push(
                            {
                                [combineArr[i].key]: combineArr[i].value
                            }
                        )
                        str = str.replace("## " + metfieldToken[k].token + " ##", combineArr[i].value);
                        str = str.replace("## shopDomain ##", shopdetail[0].shop_domain)
                        str = str.replace("## shopName ##", shopdetail[0].shop_name)
                        // console.log("strrrr", str.replace("## " + metfieldToken[k].token + " ##", combineArr[i].value))
                    }
                }
            }
            //     str = str.replace("## customer_email ##", email);
            //     str = str.replace("## shop ##", shopdetail[0].shop_name);
            return str;
        }

        let subject = replaceTokens(adminMetaresult.subject)

        getData = {
            shop_email: adminMetaresult.adminEmail,
            shop_name: shopdetail[0].shop_name,
            subject: subject,
            admin_email: shopdetail[0].shop_email
        }

        let EmptyCheck = false;
        idVar.map((p, i) => {
            // var email_val = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;              
            if (p.value === "") {
                EmptyCheck = true;
                document.getElementById("errorDiv" + i + "").innerHTML = "*This field is required";
                document.getElementById("errorDiv" + i + "").style.color = "Red";
            }

            else {
                document.getElementById("errorDiv" + i + "").innerHTML = "";
                document.getElementById("errorDiv" + i + "").style.color = "";
            }
        })
      
        if (EmptyCheck === true) {
            console.log("TRueeeeeeeeeeeeeeee")
            // ModalForm.style.display = 'block';
        }
        else {
             
            for (let i = 0; i < getValue.length; i++) {
                const obj = getValue[i];
                if (obj.hasOwnProperty('fileupload')) {
                  obj.fileupload = obj.fileupload.replace('C:\\fakepath\\', '');
                }
            }      
              
            try {
                const response = await fetch(`${BACKEND_PORT}/quote/createquote`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        productArr: data, userArr: JSON.stringify(getValue), variants: arrr, shop: getData, date: todayDate, variantId: variantId
                        // productArr: data, userArr: userInfo, variants: arrr, shop: getData, date: todayDate
                    }),
                })

                const result = await response.json();

                if (result.status === "success") {
                    document.getElementById("thankimg").style.width = "0"
                    document.getElementById("thankimg").style.height = "0"
                    setTimeout(() => {
                        document.getElementById("thankimg").style.width = "150px"
                        document.getElementById("thankimg").style.height = "150px"

                    }, 1500)
                    setTimeout(() => {
                        modal.style.display = "none";
                    }, 7000)

                    document.getElementById(idValue).value = ""
                    ModalForm.style.display = 'none';
                    EmailSuccess.style.display = 'block';
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
    }

    try {
        const productData = await fetch(`${BACKEND_PORT}/quotes/updateproduct`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                productId: productResult.result[0].product_stats_id,
                conversion: productResult.result[0].conversions,
                shopName: shopdetail[0].shop_name,
                modalsubmit: "modalsubmit"
            })
        })
        productResult = await productData.json();
    } catch (error) {
        console.error(`Download error: ${error}`);
    }
}

window.onclick = function (event) {
    if (event.target == modal) {
        if (typeof (modal) != 'undefined' && modal != null) {
            modal.style.display = "none";
        }
    }
}

// document.querySelector('#submitButton').addEventListener('click', function (event) {
//     event.preventDefault();
// });

function inputFocus(y) {
    if (y != undefined || y != null && document.getElementById(y).value != " " && document.getElementById(y).value != null) {
        document.getElementById(y.id).innerHTML = "";
    }
}

{ fieldForms }
