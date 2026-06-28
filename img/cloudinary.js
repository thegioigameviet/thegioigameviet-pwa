/**
 * ==========================================
 * cloudinary.js
 * ==========================================
 * Chỉ xử lý upload và tạo URL Cloudinary.
 * Không xử lý giao diện.
 */

class CloudinaryUploader {

    constructor() {

        this.cloudName = CLOUDINARY.cloudName;
        this.uploadPreset = CLOUDINARY.uploadPreset;

    }

    /**
     * Upload ảnh
     * @param {File} file
     * @param {Object} options
     * @param {Function} onProgress
     * @returns {Promise<Object>}
     */
    upload(file, options = {}, onProgress = null) {

        return new Promise((resolve, reject) => {

            const formData = new FormData();

            formData.append("file", file);
            formData.append("upload_preset", this.uploadPreset);

            if (options.folder) {
                formData.append("folder", options.folder);
            }

            const xhr = new XMLHttpRequest();

            xhr.open(
                "POST",
                `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`
            );

            // Progress
            xhr.upload.onprogress = (event) => {

                if (!event.lengthComputable) return;

                const percent = Math.round(
                    (event.loaded / event.total) * 100
                );

                if (onProgress) {
                    onProgress(percent);
                }

            };

            // Success
            xhr.onload = () => {

                if (xhr.status !== 200) {

                    reject(xhr.responseText);

                    return;

                }

                const response = JSON.parse(xhr.responseText);

                resolve({

                    publicId: response.public_id,

                    secureUrl: response.secure_url,

                    optimizedUrl: this.buildUrl(
                        response.public_id,
                        options
                    ),

                    width: response.width,

                    height: response.height,

                    bytes: response.bytes,

                    format: response.format

                });

            };

            xhr.onerror = () => {

                reject("Upload failed.");

            };

            xhr.send(formData);

        });

    }

    /**
     * Tạo URL tối ưu
     */
    buildUrl(publicId, options = {}) {

        const transforms = [];

        // Resize
        if (options.resize && Number(options.resize) > 0) {

            transforms.push(
                `c_limit,w_${options.resize}`
            );

        }

        // Quality
        if (options.quality) {

            transforms.push(
                `q_${options.quality}`
            );

        }

        // Format
        if (options.format) {

            if (options.format === "auto") {

                transforms.push("f_auto");

            } else {

                transforms.push(
                    `f_${options.format}`
                );

            }

        }

        // Watermark
        if (options.watermark) {

            transforms.push(

                `l_${WATERMARK.publicId}` +
                `,o_${WATERMARK.opacity}` +
                `,g_${WATERMARK.gravity}` +
                `,x_${WATERMARK.offsetX}` +
                `,y_${WATERMARK.offsetY}`

            );

        }

        const transformation = transforms.join("/");

        return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformation}/${publicId}`;

    }

}


/**
 * Singleton
 */
const cloudinary = new CloudinaryUploader();
