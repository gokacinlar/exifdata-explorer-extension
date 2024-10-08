document.addEventListener("DOMContentLoaded", initFunctions);

// Define images which can have exif data with their mime types
const acceptableImageTypes = ["image/jpeg", "image/heic", "image/tiff"];
// Declare a flag to later check the input state of the uploadDiv
let isImageExists = false;

const imageCss = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    margin: "0 auto",
    inset: "0",
    position: "absolute",
    zIndex: "2",
    pointerEvents: "none"
};

const $fileUploadBtn = $("#uploadImage");
const $uploadFileDiv = $("#uploadFile");
const $fileInput = $("#theFile");

// Store EXIF data globally to later append it to newly created tab
let exifData = {};

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

// Add a global variable to store the current image URL
// NOTE: If you use it inside the displayImage function scope,
// it won't be accessible to chrome.tabs.sendMessage API
let currentImageUrl = "";
let currentImageName = "";

function displayImage(file) {
    if (!isImageExists) {
        // Store the image uploaded to later append it to newly created tab
        currentImageUrl = URL.createObjectURL(file); // Store the image URL
        currentImageName = file.name;
        const imgExif = $("<img>").attr({
            src: currentImageUrl,
            alt: currentImageName || "default-img",
            class: "uploaded-image"
        }).css(imageCss);

        $uploadFileDiv.append(imgExif);

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
            const allMetaData = EXIF.getAllTags(this);

            exifData = {
                "Device Model": model || "N/A",
                "Manufacturer": make || "N/A",
                "All Metadata": allMetaData && Object.keys(allMetaData).length > 0 ? allMetaData : "No EXIF data has been found."
            };

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
        alert("Invalid image type. Please select a image with JPEG, HEIC or TIFF format.");
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

// Function to list all Exif Data in a separate window
function listExifDataBtn() {
    const $listExifDataBtn = $("<button>").html("<i class='bi bi-journal-arrow-up'></i> List Exif Data")
        .attr("class", btnCss);

    $("#asPrimary").append($listExifDataBtn);

    $listExifDataBtn.on("click", function () {
        chrome.tabs.create({ url: "/src/exif-data.html" }, (tab) => {
            console.log("New tab has been created:", tab);
            // Send EXIF data, image URL, and image alt to the new tab "exif-data.html"
            chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                if (tabId === tab.id && changeInfo.status === "complete") {
                    chrome.tabs.onUpdated.removeListener(listener); // Remove listener after sending data
                    // Pass the required data to service_worker.js using sendMessage API
                    chrome.tabs.sendMessage(tab.id, {
                        exifData: exifData,
                        imageUrl: currentImageUrl,
                        imgExifAlt: currentImageName
                    });
                }
            });
        });
    });
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