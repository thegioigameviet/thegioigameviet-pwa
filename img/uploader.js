/**
 * =====================================================
 * uploader.js
 * Foundation
 * DOM + State + Init + Drag & Drop
 * =====================================================
 */

"use strict";

/* =====================================================
   DOM
===================================================== */

const DOM = {

    fileInput: document.getElementById("fileInput"),
    selectBtn: document.getElementById("selectBtn"),
    uploadBtn: document.getElementById("uploadBtn"),
    clearBtn: document.getElementById("clearBtn"),
    copyAllBtn: document.getElementById("copyAllBtn"),

    dropZone: document.getElementById("dropZone"),

    preset: document.getElementById("preset"),
    folder: document.getElementById("folder"),

    watermark: document.getElementById("watermark"),
    resize: document.getElementById("resize"),
    quality: document.getElementById("quality"),
    format: document.getElementById("format"),

    table: document.getElementById("fileTable"),

    preview: document.getElementById("previewImage"),

    totalFiles: document.getElementById("totalFiles"),
    totalSize: document.getElementById("totalSize"),
    uploaded: document.getElementById("uploadedCount")

};


/* =====================================================
   State
===================================================== */

const App = {

    queue: [],

    uploading: false,

    uploadedCount: 0,

    totalBytes: 0

};


/* =====================================================
   Init
===================================================== */

document.addEventListener("DOMContentLoaded", init);


function init(){

    initConfig();

    bindEvents();

}


/* =====================================================
   Config
===================================================== */

function initConfig(){

    DOM.folder.value = CLOUDINARY.defaultFolder;

    applyPreset(DOM.preset.value);

}


/* =====================================================
   Bind Events
===================================================== */

function bindEvents(){

    DOM.selectBtn.addEventListener("click", () => {

        DOM.fileInput.click();

    });


    DOM.fileInput.addEventListener("change", e => {

        addFiles(e.target.files);

        e.target.value = "";

    });


    DOM.preset.addEventListener("change", () => {

        applyPreset(DOM.preset.value);

    });


    initDragDrop();

}


/* =====================================================
   Drag & Drop
===================================================== */

function initDragDrop(){

    [
        "dragenter",
        "dragover"
    ].forEach(event => {

        DOM.dropZone.addEventListener(event, dragEnter);

    });


    [
        "dragleave",
        "drop"
    ].forEach(event => {

        DOM.dropZone.addEventListener(event, dragLeave);

    });


    DOM.dropZone.addEventListener("drop", handleDrop);

}


function dragEnter(e){

    e.preventDefault();

    e.stopPropagation();

    DOM.dropZone.classList.add("dragover");

}


function dragLeave(e){

    e.preventDefault();

    e.stopPropagation();

    DOM.dropZone.classList.remove("dragover");

}


function handleDrop(e){

    e.preventDefault();

    e.stopPropagation();

    DOM.dropZone.classList.remove("dragover");

    if(!e.dataTransfer.files.length){

        return;

    }

    addFiles(e.dataTransfer.files);

}


/* =====================================================
   Helpers
===================================================== */

function applyPreset(name){

    const preset = PRESETS[name];

    if(!preset){

        return;

    }

    DOM.watermark.checked = preset.watermark;

    DOM.resize.value = preset.resize;

    DOM.quality.value = preset.quality;

    DOM.format.value = preset.format;

    const editable = (name === "custom");

    DOM.watermark.disabled = !editable;
    DOM.resize.disabled = !editable;
    DOM.quality.disabled = !editable;
    DOM.format.disabled = !editable;

}


function formatSize(bytes){

    if(bytes < 1024){

        return bytes + " B";

    }

    if(bytes < 1024 * 1024){

        return (bytes / 1024).toFixed(1) + " KB";

    }

    return (bytes / 1024 / 1024).toFixed(2) + " MB";

}
/* =====================================================
   Queue Manager
===================================================== */

/**
 * Thêm nhiều ảnh vào Queue
 */
function addFiles(fileList){

    [...fileList].forEach(file=>{

        if(!validateFile(file)) return;

        App.queue.push({

            id: crypto.randomUUID(),

            file,

            alt: generateAlt(file.name),

            progress:0,

            status:"waiting",

            result:null,

            error:null

        });

    });

    renderTable();

    updateStats();

}


/**
 * Kiểm tra file hợp lệ
 */
function validateFile(file){

    if(!UPLOAD.acceptedTypes.includes(file.type)){

        alert(file.name + " không đúng định dạng.");

        return false;

    }

    if(file.size > (UPLOAD.maxFileSize*1024*1024)){

        alert(file.name + " vượt quá dung lượng.");

        return false;

    }

    if(App.queue.length>=UPLOAD.maxFiles){

        alert("Đã vượt quá số lượng ảnh.");

        return false;

    }

    return true;

}


/**
 * Xóa 1 ảnh
 */
function removeFile(id){

    App.queue=App.queue.filter(item=>item.id!==id);

    renderTable();

    updateStats();

}


/**
 * Xóa toàn bộ
 */
function clearQueue(){

    App.queue=[];

    DOM.table.innerHTML="";

    DOM.preview.removeAttribute("src");

    DOM.preview.style.display="none";

    updateStats();

}


/**
 * ALT mặc định
 */
function generateAlt(filename){

    return filename

        .replace(/\.[^/.]+$/,"")

        .replace(/[-_]+/g," ")

        .replace(/\s+/g," ")

        .trim();

}


/**
 * Cập nhật thống kê
 */
function updateStats(){

    DOM.totalFiles.textContent=App.queue.length;

    App.totalBytes=App.queue.reduce((sum,item)=>{

        return sum+item.file.size;

    },0);

    DOM.totalSize.textContent=formatSize(App.totalBytes);

    DOM.uploaded.textContent=

        App.queue.filter(item=>item.status==="done").length;

}



/* =====================================================
   Render Table
===================================================== */

function renderTable(){

    DOM.table.innerHTML="";

    App.queue.forEach(item=>{

        const tr=document.createElement("tr");

        tr.innerHTML=`

<td>${item.file.name}</td>

<td>

<input

class="alt-input"

data-id="${item.id}"

value="${item.alt}">

</td>

<td>${formatSize(item.file.size)}</td>

<td>

<div class="progress">

<div

class="progress-bar"

id="progress-${item.id}"

style="width:${item.progress}%">

</div>

</div>

</td>

<td

id="status-${item.id}">

${statusText(item.status)}

</td>

<td

id="action-${item.id}">

<button

class="remove-btn"

data-id="${item.id}">

Xóa

</button>

</td>

`;

        DOM.table.appendChild(tr);

    });

}


/**
 * Chuyển trạng thái
 */
function statusText(status){

    switch(status){

        case"waiting":

            return"Đang chờ";

        case"uploading":

            return"Đang upload";

        case"done":

            return"Hoàn thành";

        case"error":

            return"Lỗi";

        default:

            return status;

    }

}


/* =====================================================
   Event Delegation
===================================================== */

DOM.table.addEventListener("click",e=>{

    if(e.target.classList.contains("remove-btn")){

        removeFile(e.target.dataset.id);

    }

});


DOM.table.addEventListener("input",e=>{

    if(e.target.classList.contains("alt-input")){

        const item=App.queue.find(

            x=>x.id===e.target.dataset.id

        );

        if(item){

            item.alt=e.target.value;

        }

    }

});


/* =====================================================
   Clear Button
===================================================== */

DOM.clearBtn.addEventListener("click",()=>{

    if(confirm("Xóa toàn bộ?")){

        clearQueue();

    }

});

/* ==========================================
   Upload Button
========================================== */

DOM.uploadBtn.addEventListener("click", startUpload);

async function startUpload() {

    if (App.uploading) return;

    const waiting = App.queue.filter(item => item.status === "waiting");

    if (!waiting.length) {

        alert("Không có ảnh để upload.");

        return;

    }

    App.uploading = true;

    DOM.uploadBtn.disabled = true;

    await runWorkers(waiting);

    App.uploading = false;

    DOM.uploadBtn.disabled = false;

    updateStats();

}
/* ==========================================
   Worker Queue
========================================== */

async function runWorkers(list) {

    let index = 0;

    async function worker() {

        while (true) {

            if (index >= list.length) break;

            const item = list[index++];

            await uploadFile(item);

        }

    }

    const workers = [];

    for (let i = 0; i < UPLOAD.concurrent; i++) {

        workers.push(worker());

    }

    await Promise.all(workers);

}
/* ==========================================
   Upload One File
========================================== */

async function uploadFile(item) {

    item.status = "uploading";

    renderStatus(item);

    try {

        const result = await cloudinary.upload(

            item.file,

            {

                folder: DOM.folder.value,

                watermark: DOM.watermark.checked,

                resize: Number(DOM.resize.value),

                quality: DOM.quality.value,

                format: DOM.format.value

            },

            percent => {

                item.progress = percent;

                renderProgress(item);

            }

        );

        item.result = result;

        item.progress = 100;

        item.status = "done";

        renderProgress(item);

        renderStatus(item);

        renderAction(item);

    }

    catch (err) {

        console.error(err);

        item.status = "error";

        renderStatus(item);

        renderAction(item);

    }

}
function renderProgress(item) {

    const bar = document.getElementById(

        "progress-" + item.id

    );

    if (!bar) return;

    bar.style.width = item.progress + "%";

}
function renderStatus(item) {

    const td = document.getElementById(

        "status-" + item.id

    );

    if (!td) return;

    td.textContent = statusText(item.status);

}
function renderAction(item) {

    const td = document.getElementById(

        "action-" + item.id

    );

    if (!td) return;

    if (item.status === "done") {

        td.innerHTML = `

<button class="copy-url" data-id="${item.id}">
URL
</button>

<button class="copy-blogger" data-id="${item.id}">
Blogger
</button>

<button class="preview-btn" data-id="${item.id}">
Preview
</button>

`;

    }

    if (item.status === "error") {

        td.innerHTML = `

<button class="retry-btn" data-id="${item.id}">
Retry
</button>

<button class="remove-btn" data-id="${item.id}">
Xóa
</button>

`;

    }

}
/* =====================================================
   Copy Manager + Preview
===================================================== */

/**
 * Copy văn bản vào Clipboard
 */
async function copyText(text){

    try{

        await navigator.clipboard.writeText(text);

        showToast("Đã sao chép.");

    }

    catch{

        alert("Không thể sao chép.");

    }

}


/**
 * Sinh HTML Blogger
 */
function bloggerHTML(item){

    const alt = item.alt || "";

    return `<img src="${item.result.optimizedUrl}" alt="${alt}" loading="lazy">`;

}


/**
 * Sinh HTML chuẩn
 */
function htmlImage(item){

    const alt = item.alt || "";

    return `<img src="${item.result.secureUrl}" alt="${alt}">`;

}


/**
 * Copy URL
 */
function copyURL(id){

    const item = App.queue.find(x=>x.id===id);

    if(!item || !item.result) return;

    copyText(item.result.secureUrl);

}


/**
 * Copy Blogger
 */
function copyBlogger(id){

    const item = App.queue.find(x=>x.id===id);

    if(!item || !item.result) return;

    copyText(bloggerHTML(item));

}


/**
 * Copy HTML
 */
function copyHTML(id){

    const item = App.queue.find(x=>x.id===id);

    if(!item || !item.result) return;

    copyText(htmlImage(item));

}


/* =====================================================
   Preview
===================================================== */

function previewImage(id){

    const item = App.queue.find(x=>x.id===id);

    if(!item || !item.result) return;

    DOM.preview.src = item.result.secureUrl;

    DOM.preview.style.display = "block";

}


/* =====================================================
   Event Delegation
===================================================== */

DOM.table.addEventListener("click",(e)=>{

    const id = e.target.dataset.id;

    if(!id) return;

    if(e.target.classList.contains("copy-url")){

        copyURL(id);

    }

    if(e.target.classList.contains("copy-blogger")){

        copyBlogger(id);

    }

    if(e.target.classList.contains("copy-html")){

        copyHTML(id);

    }

    if(e.target.classList.contains("preview-btn")){

        previewImage(id);

    }

});


/* =====================================================
   Toast
===================================================== */

function showToast(message){

    let toast = document.getElementById("toast");

    if(!toast){

        toast = document.createElement("div");

        toast.id = "toast";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(()=>{

        toast.classList.remove("show");

    },2000);

}
/* =====================================================
   Retry Upload
===================================================== */

async function retryUpload(id){

    const item = App.queue.find(x => x.id === id);

    if(!item) return;

    item.status = "waiting";
    item.progress = 0;
    item.error = null;

    renderProgress(item);
    renderStatus(item);
    renderAction(item);

    await uploadFile(item);

    updateStats();

}


/* =====================================================
   Copy All
===================================================== */

function copyAll(format = "blogger"){

    const done = App.queue.filter(item => item.status === "done");

    if(!done.length){

        showToast("Chưa có ảnh nào.");

        return;

    }

    let output = "";

    switch(format){

        case "url":

            output = done
                .map(item => item.result.secureUrl)
                .join("\n");

            break;

        case "html":

            output = done
                .map(item => htmlImage(item))
                .join("\n");

            break;

        default:

            output = done
                .map(item => bloggerHTML(item))
                .join("\n");

    }

    copyText(output);

}


/* =====================================================
   Copy All Button
===================================================== */

DOM.copyAllBtn.addEventListener("click", () => {

    copyAll("blogger");

});


/* =====================================================
   Event Delegation (Retry)
===================================================== */

DOM.table.addEventListener("click", e => {

    const id = e.target.dataset.id;

    if(!id) return;

    if(e.target.classList.contains("retry-btn")){

        retryUpload(id);

    }

});


/* =====================================================
   Toast (Improved)
===================================================== */

function showToast(message){

    let toast = document.getElementById("toast");

    if(!toast){

        toast = document.createElement("div");

        toast.id = "toast";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.className = "show";

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {

        toast.classList.remove("show");

    },2000);

}


/* =====================================================
   Finish
===================================================== */

window.addEventListener("beforeunload", e => {

    if(App.uploading){

        e.preventDefault();

        e.returnValue = "";

    }

});
