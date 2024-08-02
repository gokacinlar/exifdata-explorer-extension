/**
 * Define the classnames of the HTML structure
 * Used framework: Bulma
 */

document.addEventListener("DOMContentLoaded", function () {
    init();

    const warnings = {
        noExif: "No Exif Data has been received.",
        err: "Error retrieving Exif Data:"
    }

    // Listen for Exif Data and append the Exif Data content to the
    // newly created "exif-data.html"
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
            if (message.exifData && message.imageUrl && message.imgExifAlt) { // Ensure the key matches
                $("title")
                    .append(`\n ${message.imgExifAlt}`)
                $("#exifImageName")
                    .append(`Your Image: ${message.imgExifAlt}`);
                $("#rawExifData")
                    .append(JSON.stringify(message.exifData, null, 2));
                $("#exifImgSource")
                    .attr("src", message.imageUrl)
                    .css({
                        "margin-bottom": "1rem"
                    });
                // You can also use message.imgExifAlt here if needed
            } else {
                alert(warnings.noExif);
                console.error(warnings.noExif);
            }
        } catch (error) {
            console.error(warnings.err, error);
        }
    });
});

function init() {
    const dropSection = $("#droppableSection");
    const uploadSection = $("#uploadSection");
    const actionBtnsSection = $("#asPrimary");

    const cssClasses = {
        dsCss: "ds-main box is-flex is-flex-direction-column is-justify-content-center is-align-content-center columns",
        usCss: "ds-secondary box is-flex is-flex-direction-column is-justify-content-center is-align-content-center",
        absCss: "is-flex is-flex-direction-row is-justify-content-center is-align-content-center"
    };

    addCssClasses(dropSection, cssClasses.dsCss);
    addCssClasses(uploadSection, cssClasses.usCss);
    addCssClasses(actionBtnsSection, cssClasses.absCss);
}

function addCssClasses(element, cssClass) {
    element.addClass(cssClass);
}