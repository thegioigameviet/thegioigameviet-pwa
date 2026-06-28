/**
 * ==========================================
 * uploader.js
 * Part 1
 * Khởi tạo + DOM + Preset + Drag & Drop + Queue
 * ==========================================
 */

// ==========================================
// DOM
// ==========================================

const fileInput = document.getElementById("fileInput");
const selectBtn = document.getElementById("selectBtn");
const uploadBtn = document.getElementById("uploadBtn");
const clearBtn = document.getElementById("clearBtn");
const copyAllBtn = document.getElementById("copyAllBtn");

const dropZone = document.getElementById("dropZone");

const presetSelect = document.getElementById("preset");
const folderInput = document.getElementById("folder");

const watermarkInput = document.getElementById("watermark");
const resizeInput = document.getElementById("resize");
const qualityInput = document.getElementById("quality");
const formatInput = document.getElementById("format");

const previewImage = document.getElementById("previewImage");

const fileTable = document.getElementById("fileTable");

const totalFiles = document.getElementById("totalFiles");
const totalSize = document.getElementById("totalSize");
const uploadedCount = document.getElementById("uploadedCount");


// ==========================================
// STATE
// ==========================================

const uploader = {

    queue: [],

    uploading: 0,

    completed: 0,

    failed: 0,

    paused: false

};


// ==========================================
// INIT
// ==========================================

init();

function init() {

    // Folder mặc định
    folderInput.value = CLOUDINARY.defaultFolder;

    // Preset mặc định
    applyPreset("banner");

    // Event
    bindEvents();

}


// ==========================================
// EVENT
// ==========================================

function bindEvents() {

    selectBtn.addEventListener("click", () => {

        fileInput.click();

    });


    fileInput.addEventListener("change", (e) => {

        addFiles(e.target.files);

    });


    presetSelect.addEventListener("change", () => {

        applyPreset(presetSelect.value);

    });


    initDragDrop();

}


// ==========================================
// PRESET
// ==========================================

function applyPreset(name) {

    const preset = PRESETS[name];

    if (!preset) return;

    watermarkInput.checked = preset.watermark;

    resizeInput.value = preset.resize;

    qualityInput.value = preset.quality;

    formatInput.value = preset.format;


    // Custom được chỉnh

    const editable = name === "custom";

    watermarkInput.disabled = !editable;

    resizeInput.disabled = !editable;

    qualityInput.disabled = !editable;

    formatInput.disabled = !editable;

}


// ==========================================
// DRAG & DROP
// ==========================================

function initDragDrop() {

    [
        "dragenter",
        "dragover"
    ].forEach(eventName => {

        dropZone.addEventListener(
            eventName,
            highlight,
            false
        );

    });


    [
        "dragleave",
        "drop"
    ].forEach(eventName => {

        dropZone.addEventListener(
            eventName,
            unHighlight,
            false
        );

    });


    dropZone.addEventListener(
        "dragover",
        preventDefaults,
        false
    );

    dropZone.addEventListener(
        "drop",
        handleDrop,
        false
    );

}


function preventDefaults(e) {

    e.preventDefault();

    e.stopPropagation();

}


function highlight() {

    dropZone.classList.add("dragover");

}


function unHighlight() {

    dropZone.classList.remove("dragover");

}


function handleDrop(e) {

    preventDefaults(e);

    const files = e.dataTransfer.files;

    addFiles(files);

}


// ==========================================
// QUEUE
// ==========================================

function addFiles(files) {

    [...files].forEach(file => {

        if (!validateFile(file)) {

            return;

        }

        queue.push({

            id: crypto.randomUUID(),

            file,

            status: "waiting",

            progress: 0,

            result: null

        });

    });

    renderQueue();

    updateStats();

}


// ==========================================
// VALIDATE
// ==========================================

function validateFile(file) {

    if (
        !UPLOAD.acceptedTypes.includes(file.type)
    ) {

        alert(
            `${file.name} không đúng định dạng.`
        );

        return false;

    }


    const maxSize =
        UPLOAD.maxFileSize * 1024 * 1024;

    if (file.size > maxSize) {

        alert(
            `${file.name} vượt quá dung lượng cho phép.`
        );

        return false;

    }


    if (queue.length >= UPLOAD.maxFiles) {

        alert("Đã vượt quá số lượng ảnh.");

        return false;

    }

    return true;

}


// ==========================================
// RENDER QUEUE
// ==========================================

function renderQueue() {

    fileTable.innerHTML = "";

    queue.forEach(item => {

        const row = document.createElement("tr");

        row.innerHTML = `

<td>

${item.file.name}

</td>

<td>

${formatSize(item.file.size)}

</td>

<td>

<div class="progress">

<div
class="progress-bar"
id="progress-${item.id}">
</div>

</div>

</td>

<td id="status-${item.id}">

${item.status}

</td>

<td id="action-${item.id}">

-

</td>

`;

        fileTable.appendChild(row);

    });

}


// ==========================================
// STATS
// ==========================================

function updateStats() {

    totalFiles.textContent = queue.length;

    const size =
        queue.reduce(
            (sum, item) => sum + item.file.size,
            0
        );

    totalSize.textContent =
        formatSize(size);

    uploadedCount.textContent =
        queue.filter(
            item => item.status === "done"
        ).length;

}


// ==========================================
// UTIL
// ==========================================

function formatSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }

    if (bytes < 1024 * 1024) {

        return (
            (bytes / 1024).toFixed(1) +
            " KB"
        );

    }

    return (
        (bytes / 1024 / 1024).toFixed(2) +
        " MB"
    );

}
/**
 * ==========================================
 * uploader.js
 * Part 2
 * Upload Manager + Upload Queue + Progress
 * ==========================================
 */

// ==========================================
// Upload Button
// ==========================================

uploadBtn.addEventListener("click", startUpload);


// ==========================================
// START
// ==========================================

async function startUpload() {

    // Không upload nếu queue rỗng
    if (queue.length === 0) {

        alert("Chưa có ảnh.");

        return;

    }

    uploadBtn.disabled = true;

    const waiting = queue.filter(item => item.status === "waiting");

    await runConcurrent(waiting);

    uploadBtn.disabled = false;

    updateStats();

}


// ==========================================
// Upload Concurrent
// ==========================================

async function runConcurrent(items) {

    let index = 0;

    const workers = [];

    for (let i = 0; i < UPLOAD.concurrent; i++) {

        workers.push(worker());

    }

    await Promise.all(workers);


    async function worker() {

        while (true) {

            if (index >= items.length) {

                break;

            }

            const item = items[index++];

            await uploadItem(item);

        }

    }

}


// ==========================================
// Upload One File
// ==========================================

async function uploadItem(item) {

    item.status = "uploading";

    updateStatus(item);

    const options = {

        folder: folderInput.value.trim(),

        watermark: watermarkInput.checked,

        resize: Number(resizeInput.value),

        quality: qualityInput.value,

        format: formatInput.value

    };

    try {

        const result = await cloudinary.upload(

            item.file,

            options,

            (percent) => {

                item.progress = percent;

                updateProgress(item);

            }

        );

        item.status = "done";

        item.progress = 100;

        item.result = result;

        updateProgress(item);

        updateStatus(item);

        updateAction(item);

        updateStats();

    }

    catch (error) {

        console.error(error);

        item.status = "error";

        updateStatus(item);

    }

}


// ==========================================
// Progress
// ==========================================

function updateProgress(item) {

    const bar = document.getElementById(

        `progress-${item.id}`

    );

    if (!bar) return;

    bar.style.width = item.progress + "%";

}


// ==========================================
// Status
// ==========================================

function updateStatus(item) {

    const td = document.getElementById(

        `status-${item.id}`

    );

    if (!td) return;

    switch (item.status) {

        case "waiting":

            td.textContent = "Đang chờ";

            break;

        case "uploading":

            td.textContent = "Đang upload";

            break;

        case "done":

            td.textContent = "Hoàn thành";

            break;

        case "error":

            td.textContent = "Lỗi";

            break;

    }

}


// ==========================================
// Action
// ==========================================

function updateAction(item) {

    const td = document.getElementById(

        `action-${item.id}`

    );

    if (!td) return;

    td.innerHTML = `

<button
class="copy-url"
data-id="${item.id}">
URL
</button>

<button
class="copy-blogger"
data-id="${item.id}">
Blogger
</button>

<button
class="preview"
data-id="${item.id}">
Preview
</button>

`;

}

/**
 * ==========================================
 * uploader.js
 * Part 3
 * Preview + Copy + Clear + Retry + Events
 * ==========================================
 */

// ==========================================
// Event Delegation
// ==========================================

fileTable.addEventListener("click", async (e) => {

    const button = e.target;

    const id = button.dataset.id;

    if (!id) return;

    const item = queue.find(file => file.id === id);

    if (!item) return;

    // Copy URL
    if (button.classList.contains("copy-url")) {

        await copyText(item.result.optimizedUrl);

        return;

    }

    // Copy Blogger
    if (button.classList.contains("copy-blogger")) {

        const html = BLOGGER.template
            .replace("{URL}", item.result.optimizedUrl)
            .replace("{ALT}", generateAlt(item.file.name));

        await copyText(html);

        return;

    }

    // Preview
    if (button.classList.contains("preview")) {

        preview(item);

        return;

    }

    // Retry
    if (button.classList.contains("retry")) {

        retryUpload(item);

        return;

    }

    // Remove
    if (button.classList.contains("remove")) {

        removeItem(item.id);

        return;

    }

});


// ==========================================
// Preview
// ==========================================

function preview(item) {

    previewImage.src = item.result.optimizedUrl;

    previewImage.style.display = "block";

}


// ==========================================
// Clipboard
// ==========================================

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(text);

    }

    catch {

        alert("Không thể copy.");

    }

}


// ==========================================
// Retry
// ==========================================

async function retryUpload(item) {

    item.status = "waiting";

    item.progress = 0;

    item.result = null;

    updateStatus(item);

    updateProgress(item);

    await uploadItem(item);

}


// ==========================================
// Remove
// ==========================================

function removeItem(id) {

    const index = queue.findIndex(

        item => item.id === id

    );

    if (index === -1) return;

    queue.splice(index, 1);

    renderQueue();

    updateStats();

}


// ==========================================
// Clear
// ==========================================

clearBtn.addEventListener("click", () => {

    if (!confirm("Xóa toàn bộ danh sách?")) {

        return;

    }

    queue.length = 0;

    fileTable.innerHTML = "";

    previewImage.removeAttribute("src");

    previewImage.style.display = "none";

    updateStats();

});


// ==========================================
// Copy All Blogger
// ==========================================

copyAllBtn.addEventListener("click", async () => {

    const completed = queue.filter(

        item => item.status === "done"

    );

    if (completed.length === 0) {

        return;

    }

    const html = completed.map(item => {

        return BLOGGER.template

            .replace("{URL}", item.result.optimizedUrl)

            .replace("{ALT}", generateAlt(item.file.name));

    }).join("\n\n");

    await copyText(html);

});


// ==========================================
// Update Action Buttons
// ==========================================

function updateAction(item) {

    const td = document.getElementById(

        `action-${item.id}`

    );

    if (!td) return;

    if (item.status === "done") {

        td.innerHTML = `

<button
class="copy-url"
data-id="${item.id}">
URL
</button>

<button
class="copy-blogger"
data-id="${item.id}">
Blogger
</button>

<button
class="preview"
data-id="${item.id}">
Preview
</button>

<button
class="remove"
data-id="${item.id}">
Xóa
</button>

`;

    }

    if (item.status === "error") {

        td.innerHTML = `

<button
class="retry"
data-id="${item.id}">
Retry
</button>

<button
class="remove"
data-id="${item.id}">
Xóa
</button>

`;

    }

}
