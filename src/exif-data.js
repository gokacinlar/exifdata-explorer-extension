$(document).ready(function () {
    const textData = {
        imgStyling: "img-has-border-radius",
        abortingMessage: "You're about to close the page. Do you want to continue?"
    };

    const abortProcessButton = $("#abortProcess");
    const downloadExifLogButton = $("#downloadExifLog");
    const exifToBeDownloaded = $("#rawExifData");

    // Function to close tab if user decides to abandon removing exif data
    abortProcessButton.on("click", function () {
        if (confirm(textData.abortingMessage)) {
            window.close();
        }
    });

    const imgElement = $("#exifImgSource");
    const images = $("img");

    images.attr("class", textData.imgStyling);

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        downloadExifLogButton.on("click", saveAsJson);

        function saveAsJson() {
            var exifData = exifToBeDownloaded.text(); // Get the text content
            var rawDataAsBlob = new Blob([exifData], { type: "application/json" });
            var downloadedJsonName = `EXIFDATAOF-${message.imgExifAlt}.json`;

            var downloadLink = document.createElement("a");
            downloadLink.download = downloadedJsonName;

            downloadLink.href = URL.createObjectURL(rawDataAsBlob);

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    });
});