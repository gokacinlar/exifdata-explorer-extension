document.addEventListener("DOMContentLoaded", function () {
    initFunctions();
});

let acceptableImageTypes = ["image/jpeg", "image/png", "image/webp"]; // Define the MIME types

function initFunctions() {
    getImageOrigin();
    limitImageTypes();
    dragAndDropImage();
}

function getImageOrigin() {
    const fileUploadBtn = $("#uploadImage");
    const uploadFileDiv = $("#uploadFile"); // Reference the upload div

    $(fileUploadBtn).on("click", function () {
        $("#theFile").trigger("click"); // Trigger click on hidden file input
    });

    // Handle file selection from hidden input
    $("#theFile").on("change", function () {
        const file = this.files[0];
        if (!file) {
            return; // No file selected
        }

        if (!acceptableImageTypes.includes(file.type)) {
            alert("Invalid image type. Please select a JPEG, PNG, or WEBP image.");
            console.error("Invalid image type:", file.type);
            return;
        }

        const img = $("<img>").attr({
            src: URL.createObjectURL(file),
            alt: file.name,
            class: "uploaded-image"
        }).css({
            "width": "100%",
            "height": "auto",
            "object-fit": "cover",
            "margin": "0",
            "position": "absolute",
            "z-index": "2",
            "inset": "0"
        });

        uploadFileDiv.append(img); // Append the image to the upload div
    });
}


function dragAndDropImage() {
    // Add and remove dragover events to accompany user input
    $("#uploadFile").on("dragover", function (e) {
        e.preventDefault();
        $(this).addClass("dragover");
    });

    $("#uploadFile").on("dragleave", function () {
        $(this).removeClass("dragover");
    });

    // Append the dropped image to the uploadFile div
    $("#uploadFile").on("drop", function (e) {
        e.preventDefault();
        $(this).removeClass("dragover");

        const file = e.originalEvent.dataTransfer.files[0];
        const img = $("<img>").attr({
            src: URL.createObjectURL(file),
            alt: file.name,
            class: "uploaded-image"
        });

        // Append the image to the upload area
        $("#uploadFile").append(img);
    });
}

/**
 * Helper Functions
 */

function openFileExplorer() {
    $("#theFile").trigger("click");
}

function limitImageTypes() {
    const fileInput = $("#theFile");
    $(fileInput).attr("accept", acceptableImageTypes.join(","));

    // Abort the function if user input doesn't include acceptableImageTypes
    $(fileInput).on("change", function () {
        if (!acceptableImageTypes.includes(this.files[0].type)) {
            alert("Invalid image type. Please select a JPEG, PNG, or WEBP image.");
            console.error("Invalid image type:", file.type);
            return;
        }
    });
}