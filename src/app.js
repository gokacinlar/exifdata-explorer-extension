document.addEventListener("DOMContentLoaded", initFunctions);

const acceptableImageTypes = ["image/jpeg", "image/png", "image/heic", "image/avif"];
// Declare a flag to later check the input state of the uploadDiv
let isImageExists = false;

const imageCss = {
    width: "100%",
    height: "auto",
    objectFit: "contain",
    margin: "0",
    inset: "0",
    position: "absolute",
    zIndex: "2",
};

const $fileUploadBtn = $("#uploadImage");
const $uploadFileDiv = $("#uploadFile");
const $fileInput = $("#theFile");

let exifData = {}; // Store EXIF data globally to later append it to newly created tab

function initFunctions() {
    setupEventListeners();
    limitImageTypes();
}

function setupEventListeners() {
    $fileUploadBtn.on("click", () => $fileInput
        .trigger("click"));

    $fileInput.off("change")
        .on("change", handleFileSelect); // Reset event listener

    $uploadFileDiv
        .off("dragover dragleave drop") // Remove previous event listeners
        .on("dragover", handleDragOver)
        .on("dragleave", handleDragLeave)
        .on("drop", handleDrop);
}

function displayImage(file) {
    if (!isImageExists) {
        const img = $("<img>").attr({
            src: URL.createObjectURL(file),
            alt: file.name,
            class: "uploaded-image"
        }).css(imageCss);

        $uploadFileDiv.append(img);

        addRemoveImageBtn();
        listExifDataBtn();

        getExif(file); // Call getExif without window.onload

        isImageExists = true;
        $fileUploadBtn.prop("disabled", true).css("cursor", "not-allowed");
    }
}

/**
 * Main function to read EXIF data using Exif.js library
 * https://github.com/exif-js/exif-js
 * included in the HTML file (popup.html)
 */

function getExif(file) {
    try {
        EXIF.getData(file, function () {
            const make = EXIF.getTag(this, "Make");
            const model = EXIF.getTag(this, "Model");
            const allMetaData = EXIF.pretty(this);

            console.log(allMetaData);
            exifData = {
                "Device Model": model || "N/A",
                "Manufacturer": make || "N/A",
                "All Metadata": allMetaData || "No EXIF data found."
            };

            if (!make && !model && !allMetaData) {
                alert("No EXIF data has been found.");
                return;
            } else if (!make || !model) {
                alert("Partial EXIF data has been detected.");
            }

            console.log(exifData);
        });
    } catch (error) {
        console.error("Error reading EXIF data", error);
    }
}

function handleFileSelect() {
    const file = this.files[0];
    if (file && acceptableImageTypes.includes(file.type)) {
        displayImage(file);
        $fileInput.val(""); // Clear file input value after selection
    } else {
        alert("Invalid image type. Please select a JPEG, PNG, or AVIF image.");
        console.error("Invalid image type:", file.type);
        return;
    }
}

// Functions to handle drag, drop events & appending target image to
// selected div
function handleDragOver(e) {
    e.preventDefault();
    $uploadFileDiv.addClass("dragover");
}

function handleDragLeave() {
    $uploadFileDiv.removeClass("dragover");
}

function handleDrop(e) {
    e.preventDefault();
    $uploadFileDiv.removeClass("dragover");

    const file = e.originalEvent.dataTransfer.files[0];
    if (file && acceptableImageTypes.includes(file.type)) {
        displayImage(file);
    } else {
        alert("Invalid image type. Please select a JPEG, PNG, or AVIF image.");
        console.error("Invalid image type:", file.type);
        return;
    }
}

const btnCss = ["box has-text-light has-background-primary-dark has-text-centered is-size-5 column my-0"];

function addRemoveImageBtn() {
    const $removeBtn = $("<button>").html("<i class='bi bi-arrow-clockwise'></i> Remove Image")
        .attr("class", btnCss)
        .on("click", removeBtnsAndReset);

    $("#asPrimary").append($removeBtn);
}

function listExifDataBtn() {
    const $listExifDataBtn = $("<button>").html("<i class='bi bi-journal-arrow-up'></i> List Exif Data")
        .attr("class", btnCss);

    $("#asPrimary").append($listExifDataBtn);

    $listExifDataBtn.on("click", function () {
        chrome.tabs.create({ url: "/src/exif-data.html" }, (tab) => {
            console.log("New tab has been created:", tab);
            // Send EXIF data to the new tab
            chrome.tabs.executeScript(tab.id, {
                function: appendExifDataToNewTab
            });
        });
    });
}

function appendExifDataToNewTab() {
    `document.body.innerHTML = '<pre>${JSON.stringify(exifData, null, 2)}</pre>';`
}

function removeBtnsAndReset() {
    $("#asPrimary").find("button").remove();
    $uploadFileDiv.empty();
    $fileUploadBtn.prop("disabled", false)
        .css("cursor", "pointer");

    isImageExists = false; // Reset flag to allow new image uploads
    console.clear();
}

function limitImageTypes() {
    $fileInput.attr("accept", acceptableImageTypes.join(","));
}

function clearConsole() {
    console.clear();
}