//Variables Initialization
let boxCount = 2;
let username = "";
let plusSignObj;
let serverAddress = "http://192.168.1.5:4000"

let boxImages = [];
for (let i=0; i<6; i++){
    boxImages[i] = new Image();
}

let finalCanvas = null;
let previewCanvas = null;

//Divide final image
function addSubFinal(){
    let rows = document.querySelectorAll(".final-row");
    for (let r of rows){
        for (let i=0; i<8; i++){
            let canv = document.createElement('canvas');
            canv.style.width = "80px";
            canv.style.height = "80px";
            r.appendChild(canv);
        }
        
    }
}

//Divide preview image
function addSubPreview(ar){
    let k;
        let rows = ar.querySelectorAll(".preview-row");
        k = 0;
        for (let r of rows){
            if (r.innerHTML == ""){
                for (let i=0; i<4; i++){
                    let canv = document.createElement('canvas');
                    canv.setAttribute('addr', `${username}-${ar.id}-${k}-${i}`)
                    canv.style.width = "80px";
                    canv.style.height = "80px";
                    r.appendChild(canv);
                }
            }
            k += 1;  
        }
}

//Delete preview image
function deleteSubPreview(ar){
    let rows = ar.querySelectorAll(".preview-row");
    for(let r of rows){
        r.innerHTML = "";
    }
}

//Delete description section
function deleteDescription(ar){
    let descElem = ar.querySelector('.description');
    if (descElem){
        descElem.remove();
    }
}

//Fill hidden inputs
function fillHiddenInputs(){
    let inputs = document.querySelectorAll('input[type=hidden]');
    for (let input of inputs){
        let ar = input.parentNode.parentNode;
        input.value = username + '-' + ar.id;
    } 
}

//Delete file inputs
function deleteFileInputs(){
    let inputs = document.querySelectorAll('input[type=file]');
    for (let input of inputs){
        input.value = '';
    } 
}

//Create form
function createForm(ar){
    let form = document.createElement('form');
    form.method = "post";
    form.action = "/upload-image";
    form.enctype = "multipart/form-data";
    form.onsubmit = formSubmitHandler;
      
    let fileIn = document.createElement('input');
    fileIn.type = "file";
    fileIn.accept = "image/*";
    fileIn.onchange = fileChangeHandler;

    let hiddenIn = document.createElement('input');
    hiddenIn.type = "hidden";
    hiddenIn.value = username + '-' + ar.id;

    let temp = document.createElement('p');

    form.appendChild(fileIn);
    form.appendChild(hiddenIn);
    form.appendChild(temp);

    return form;

}

//Assign change event handler to file inputs
function assignChangeHandler(){
    let fileInputs = document.querySelectorAll('input[type=file]');
    for (let input of fileInputs){
        input.onchange = fileChangeHandler;
    }

}

//Reset button handler
function resetButtonHandler(event){
    let articleElem = event.target.parentNode;
    let form = createForm(articleElem);
    deleteSubPreview(articleElem);
    showProcessText(event.target);

    fetch(serverAddress + '/delete-image/' + username + '-' + articleElem.id).then(res => res.json()).then(data => {
        if (!data.deleted){
            showErrorText(articleElem);
        }
        else{
            articleElem.querySelector('p').replaceWith(form);
        }
    })
}

// Handler for removing final borders
function finalDeleteBorderHandler(event){
    document.getElementById('final-wrapper').onclick = null;
    for (let wr of document.getElementsByClassName('preview-wrapper')){
        wr.onclick = null;
    }
    let addButton = document.createElement('button');
    addButton.innerHTML = "اضافه کردن حاشیه ها"
    addButton.title = "با کلیک روی این دکمه جابجایی قطعات دوباره فعال میشود"
    addButton.onclick = finalAddBorderHandler;
    event.target.replaceWith(addButton);

    let wrapperElem = document.getElementById('final-wrapper');
    for (let row of wrapperElem.querySelectorAll('.final-row')){
        row.classList.remove('border');
    }
}

//Handler for adding final borders
function finalAddBorderHandler(event){
    document.getElementById('final-wrapper').onclick = finalCanvasHandler;
    for (let wr of document.getElementsByClassName('preview-wrapper')){
        wr.onclick = previewCanvasHandher;
    }
    let remButton = document.createElement('button');
    remButton.innerHTML = "برداشتن حاشیه ها"
    remButton.title = "با کلیک روی این دکمه جابجایی قطعات غیر فعال میشود"
    remButton.onclick = finalDeleteBorderHandler;
    event.target.replaceWith(remButton);

    let wrapperElem = document.getElementById('final-wrapper');
    for (let row of wrapperElem.querySelectorAll('.final-row')){
        row.classList.add('border');
    }
}

//Assign submit event to forms
function assignFormHandler(){
    let forms = document.querySelectorAll('form');
    for (let form of forms){
        form.onsubmit = formSubmitHandler;
    }
}

//Delete final canvases
function deleteFinalButtonHandler(){
    for (let canvas of document.getElementById('final-wrapper').querySelectorAll('canvas')){
        let context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}

//Handler for preview canvases
function previewCanvasHandher(event){
    if (event.target.tagName.toLowerCase() === 'canvas'){
        if (finalCanvas){
            let boxId = event.target.getAttribute('addr').split('-')[1];
            let xoffset = event.target.getAttribute('addr').split('-')[3];
            let yoffset = event.target.getAttribute('addr').split('-')[2];
            let imIdx = boxId.split('')[boxId.length - 1];
            let image = boxImages[imIdx-1];
            let context = finalCanvas.getContext('2d');
            context.drawImage(image, xoffset * 160, yoffset * 160, 160, 160, 0, 0, finalCanvas.width, finalCanvas.height);
            finalCanvas.style.borderColor = "";
            finalCanvas.style.borderWidth = "";
            finalCanvas = null;
        }
        else{
            if (previewCanvas){
                previewCanvas.style.borderColor = "";
                previewCanvas.style.borderWidth = "";
                if (previewCanvas === event.target){
                    previewCanvas = null;
                    return;
                }
            }
            previewCanvas = event.target;
            previewCanvas.style.borderColor = "red";
            previewCanvas.style.borderWidth = "3px";
        }
    }
}

//Handler for final canvases
function finalCanvasHandler(event){
    if (event.target.tagName.toLowerCase() === 'canvas'){
        if (previewCanvas){
            let boxId = previewCanvas.getAttribute('addr').split('-')[1];
            let xoffset = previewCanvas.getAttribute('addr').split('-')[3];
            let yoffset = previewCanvas.getAttribute('addr').split('-')[2];
            let imIdx = boxId.split('')[boxId.length - 1];
            let image = boxImages[imIdx-1];
            let context = event.target.getContext('2d');
            context.drawImage(image, xoffset * 160, yoffset * 160, 160, 160, 0, 0, event.target.width, event.target.height);
            previewCanvas.style.borderColor = "";
            previewCanvas.style.borderWidth = "";
            previewCanvas = null;
        }
        else{
            if (finalCanvas){
                finalCanvas.style.borderColor = "";
                finalCanvas.style.borderWidth = "";
                if (finalCanvas === event.target){
                    finalCanvas = null;
                    return;
                }
            }
            finalCanvas = event.target;
            finalCanvas.style.borderColor = "red";
            finalCanvas.style.borderWidth = "3px";
        }
    }
}

//Show processing text
function showProcessText(obj){
    let processElem = document.createElement('p');
    processElem.innerHTML = "...در حال پردازش";
    processElem.style.color = "rgb(200, 120, 159)";
    processElem.style.fontFamily = "Vazir";
    processElem.style.fontSize = "13pt";
    obj.replaceWith(processElem);
}

//Show error text
function showErrorText(ar){
    deleteSubPreview(ar);
    let errorElem = document.createElement('div');
    errorElem.style.color = "red";
    errorElem.style.fontFamily = "Vazir";
    errorElem.style.fontSize = "13pt";
    errorElem.innerHTML = `<p>!متأسفانه خطایی رخ داد</p>
                           <p>از باکس های دیگر استفاده کرده یا صفحه را رفرش کنید</p>`
   
    ar.querySelector('p').replaceWith(errorElem);
}

//Show reset button
function showResetButton(ar){
    let button = document.createElement('button');
    button.innerHTML = "پاک کردن عکس"
    button.onclick = resetButtonHandler;
    ar.querySelector('p').replaceWith(button);
}

//Load Preview image
function loadPreviewImage(ar){
    let canvases = ar.querySelectorAll('canvas');

    let imIdx = ar.id.split('')[ar.id.length - 1];
    let im = boxImages[imIdx-1];

    let sourceWidth = im.width / 4;
    let sourceHeight = im.height / 3;
    let xoffset;
    let yoffset;
    let context;
    for (let canvas of canvases){
        xoffset = canvas.getAttribute('addr').split('-')[3];
        yoffset = canvas.getAttribute('addr').split('-')[2];
        context = canvas.getContext('2d');
        context.drawImage(im, xoffset * sourceWidth, yoffset * sourceHeight, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    }
}

//Adding more boxes
function plusSignHandler(){
    let plusArticle = document.querySelector('.add-photo');
    let boxRow1 = document.getElementById('boxrow1');
    let boxRow2 = document.getElementById('boxrow2');
    let article = document.createElement('article');
    article.id = `box${boxCount + 1}`;
    article.setAttribute('version', '0');
    article.innerHTML = `<form method="POST" action="/upload-image" enctype="multipart/form-data">
                           <input type="file" name="image" accept="image/*" /><br/>
                           <input type="hidden" value="\`${username}-${article.id}\`" name="hidden" />
                        </form>
                        <div class="preview-wrapper">
                          <div class="preview-row"></div>
                          <div class="preview-row"></div>
                          <div class="preview-row"></div>
                          <div class="description">
                                <p>عکس مورد نظر را در این قسمت انتخاب کنید</p>
                                <p>حجم فایل انتخابی نباید بیشتر از ۴ مگابایت باشد</p>
                                <p>پس از انتخاب فایل و بارگزاری آن عکس مورد نظر در ۱۲ قسمت مساوی جدا از هم نمایش داده میشود که میتوانید هر قسمت را به عکس نهایی منتقل کنید </p>
                            </div>
                        </div>`;
    article.querySelector('input[type=file]').onchange = fileChangeHandler;
    article.querySelector('form').onsubmit = formSubmitHandler;

    if (boxCount == 2){
        boxRow2.appendChild(plusArticle);
        boxRow1.appendChild(article);
        boxCount += 1;
    }
    else if (boxCount == 5){
        plusArticle.replaceWith(article);
    }
    else{
        plusArticle.before(article);
        boxCount += 1;
    }

}

//Handle change event on file input
function fileChangeHandler(event){
    let file = event.target.files[0];
    let articleBox = event.target.parentNode.parentNode;

    let lastElemIdx = event.target.parentNode.childNodes.length - 1;
    let lastElem = event.target.parentNode.childNodes[lastElemIdx];

    let button = document.createElement('button');
    button.innerHTML = 'بارگزاری عکس';
    button.type = "submit";

    let badFileTypeElem = document.createElement('p');
    badFileTypeElem.innerHTML = "لطفاً یک عکس انتخاب کنید*"
    badFileTypeElem.style.color = "red";
    badFileTypeElem.style.fontSize = "11pt";
    badFileTypeElem.style.fontFamily = "Vazir";

    let largeFileElem = document.createElement('p');
    largeFileElem.innerHTML = "حجم فایل بیشتر از ۴ مگابایت است*"
    largeFileElem.style.color = "red";
    largeFileElem.style.fontSize = "11pt";
    largeFileElem.style.fontFamily = "Vazir";

    deleteDescription(articleBox);
    
    if (!/^image\/\w{3,4}$/.test(file.type)){
        lastElem.replaceWith(badFileTypeElem);
        deleteSubPreview(articleBox);
    }
    else if (file.size > 4 * 1024 * 1024){
        lastElem.replaceWith(largeFileElem);
        deleteSubPreview(articleBox);
    }
    else{
        lastElem.replaceWith(button);
        
    }
}

//Submit handler for forms
function formSubmitHandler(event){
    event.preventDefault();
    let articleElem = event.target.parentNode;

    let hiddenValue = event.target.querySelector('input[type=hidden]').value;
    hiddenValue = hiddenValue.replaceAll('`', '');
    let file = event.target.querySelector('input[type=file]').files[0];
    let version = parseInt(articleElem.getAttribute('version')) + 1;
    articleElem.setAttribute('version', String(version));

    let formData = new FormData();
    formData.append('hidden', hiddenValue)
    formData.append('image', file);
    formData.append('version', version);

    let imIdx = articleElem.id.split('')[articleElem.id.length - 1];
    let image = boxImages[imIdx-1];

    showProcessText(event.target);
    addSubPreview(articleElem);

    fetch(serverAddress + '/upload-image', {
        method: "POST",
        body: formData
    }).then(res => res.json()).then(data => {
        if (!data.loaded){
            showErrorText(articleElem);
        }
        else{
            image.src = '/images/' + hiddenValue + '-640' + 'v' + version + file.name.slice(file.name.indexOf('.'));
            image.onload = () => {
                showResetButton(articleElem);
                loadPreviewImage(articleElem);
                if (document.querySelector('.final-row').className.includes('border')){
                    articleElem.querySelector('.preview-wrapper').onclick = previewCanvasHandher;
                }
            }
        }
    });

}

window.addEventListener("load", () => {
    addSubFinal();

    //Initialize DOM Objects
    plusSignObj = document.getElementById('plus-sign');
    document.getElementById('borderless').onclick = finalDeleteBorderHandler;
    document.getElementById('final-wrapper').onclick = finalCanvasHandler;
    document.getElementById('delete-parts').onclick = deleteFinalButtonHandler;
    assignChangeHandler();
    assignFormHandler();

    fetch(serverAddress + '/get-user').then(res => res.json()).then(data => {
        username = data.username
        fillHiddenInputs();
        deleteFileInputs();
        plusSignObj.onclick = plusSignHandler;
   });
});

