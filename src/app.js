document.addEventListener("DOMContentLoaded", function () {
    initFunctions();
});

let acceptableImageTypes = ["image/jpeg", "image/png", "image/heic", "image/avif"]; // Define the MIME types
let isImageExists = false;

function initFunctions() {
    getImageOrigin();
    limitImageTypes();
    dragAndDropImage();
}

let imageCss = {
    width: "100%",
    height: "auto",
    objectFit: "contain",
    margin: "0",
    inset: "0",
    position: "absolute",
    zIndex: "2",
};

const fileUploadBtn = $("#uploadImage");
const uploadFileDiv = $("#uploadFile");

function getImageOrigin() {
    $(fileUploadBtn).on("click", function () {
        $("#theFile").trigger("click"); // Trigger click on hidden file input
    });

    // Handle file selection from hidden input
    $("#theFile").on("change", function () {
        const file = this.files[0];
        if (!file) {
            return;
        }

        if (!acceptableImageTypes.includes(file.type)) {
            alert("Invalid image type. Please select a JPEG, PNG, or WEBP image.");
            console.error("Invalid image type:", file.type);
            return;
        }

        const img = $("<img>").attr({
            src: URL.createObjectURL(file),
            alt: file.name,
            class: "uploaded-image",
        }).css(imageCss);

        // Append the image to the upload area
        // and check if user attempt to upload another one
        if (!isImageExists) {
            uploadFileDiv.append(img);
            addRemoveImageBtn();
            listExifDataBtn();
            isImageExists = true;
            window.onload = getExif(file);
        }
    });
}

function dragAndDropImage() {
    // Add and remove dragover events to accompany user input
    $(uploadFileDiv).on("dragover", function (e) {
        e.preventDefault();
        $(this).addClass("dragover");
    });

    $(uploadFileDiv).on("dragleave", function () {
        $(this).removeClass("dragover");
    });

    // Append the dropped image to the uploadFile div
    $(uploadFileDiv).on("drop", function (e) {
        e.preventDefault();
        $(this).removeClass("dragover");

        const file = e.originalEvent.dataTransfer.files[0];

        if (!acceptableImageTypes.includes(file.type)) {
            alert("Invalid image type. Please select a JPEG, PNG, or WEBP image.");
            console.error("Invalid image type:", file.type);
            return;
        }

        const img = $("<img>").attr({
            src: URL.createObjectURL(file),
            alt: file.name,
            class: "uploaded-image",
        }).css(imageCss);

        // Append the image to the upload area
        if (!isImageExists) {
            $(uploadFileDiv).append(img);
            addRemoveImageBtn();
            listExifDataBtn();
            isImageExists = true;
            window.onload = getExif(file);
        }
    });
}

/**
 * Main function to READ exif data
 */

// make, model & allMetaData returns null and undefined
// fixme
// Use async function to get Exif Data from the passed parameter

function getExif(file) {
    try {
        EXIF.getData(file, function () {
            if (file) {
                var make = EXIF.getTag(this, "Make");
                var model = EXIF.getTag(this, "Model");
                var allMetaData = EXIF.pretty(this);

                console.log(JSON.stringify(allMetaData, null, 2));
                console.log(make, model);
            } else {
                console.error("EXIF data has not been found or incomplete.");
            }
        });
    } catch (error) {
        console.error("Error reading EXIF data", error);
    }
}

/**
 * Helper Functions
 */

let $removeBtn;
let $listExifDataBtn;
let $btnCss = ["box has-text-light has-background-primary-dark has-text-centered is-size-5 column my-0"];

function addRemoveImageBtn() {
    let $removeBtnContent = ["<i class='bi bi-arrow-clockwise'></i> Remove Image"];

    $removeBtn = $("<button>");
    $removeBtn.html($removeBtnContent).attr("class", $btnCss);
    $("#asPrimary").append($removeBtn);

    $($removeBtn).on("click", removeBtnsAndReset);
}

function listExifDataBtn() {
    let $exifDataBtnContent = ["<i class='bi bi-journal-arrow-up'></i> List Exif Data"];

    $listExifDataBtn = $("<button>");
    $listExifDataBtn.html($exifDataBtnContent).attr("class", $btnCss);
    $("#asPrimary").append($listExifDataBtn);
}

function removeBtnsAndReset() {
    $removeBtn.remove();
    $listExifDataBtn.remove();

    isImageExists = false; // Return to the inital stage of upload div's empty state

    $(uploadFileDiv).empty();
}

function openFileExplorer() {
    $("#theFile").trigger("click");
}

function limitImageTypes() {
    const fileInput = $("#theFile");
    $(fileInput).attr("accept", acceptableImageTypes.join(","));

    // Abort the function if user input doesn't include acceptableImageTypes
    $(fileInput).on("change", function () {
        if (!acceptableImageTypes.includes(this.files[0].type)) {
            alert("Invalid image type. Please select a JPEG, PNG or HEIC image.");
            console.error("Invalid image type:", file.type);
            return;
        }
    });
}