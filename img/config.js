/**
 * ==========================================
 * Image Uploader Configuration
 * ==========================================
 * Chỉ chứa cấu hình.
 * Không viết logic xử lý trong file này.
 */

/* ==========================================
   Cloudinary
========================================== */

const CLOUDINARY = {

    // Cloud Name
    cloudName: "dbmyv6u9r",

    // Upload Preset (Unsigned)
    uploadPreset: "thegioigameviet",

    // Thư mục mặc định
    defaultFolder: "uploads"

};


/* ==========================================
   Presets
========================================== */

const PRESETS = {

    banner: {

        name: "Banner",

        watermark: true,

        resize: 640,

        quality: "auto",

        format: "auto"

    },

    screenshot: {

        name: "Screenshot",

        watermark: true,

        resize: 640,

        quality: "auto",

        format: "auto"

    },

    character: {

        name: "Character Icon",

        watermark: false,

        resize: 0,

        quality: "auto",

        format: "auto"

    },

    logo: {

        name: "Logo / PNG",

        watermark: false,

        resize: 0,

        quality: "100",

        format: "png"

    },

    custom: {

        name: "Custom",

        watermark: false,

        resize: 0,

        quality: "auto",

        format: "auto"

    }

};


/* ==========================================
   Watermark
========================================== */

const WATERMARK = {

    // Public ID của logo watermark
    publicId: "watermark",

    // Góc hiển thị
    gravity: "south_east",

    // Độ mờ
    opacity: 60,

    // Khoảng cách mép
    offsetX: 20,

    offsetY: 20

};


/* ==========================================
   Blogger Template
========================================== */

const BLOGGER = {

    template:
`<img
src="{URL}"
alt="{ALT}"
loading="lazy"
decoding="async">`

};


/* ==========================================
   Upload
========================================== */

const UPLOAD = {

    // Upload song song
    concurrent: 3,

    // File tối đa
    maxFiles: 100,

    // Dung lượng tối đa / file (MB)
    maxFileSize: 20,

    // Chỉ nhận ảnh
    acceptedTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/avif"
    ]

};


/* ==========================================
   Utilities
========================================== */

function generateAlt(filename) {

    return filename
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}
