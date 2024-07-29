/**
 * Define the classnames of the HTML structure
 * Used framework: Bulma
 */

document.addEventListener("DOMContentLoaded", function () {
    init();

    // Listen for Exif Data and append the Exif Data content to the
    // newly created "exif-data.html"
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.exifData) {
            $("#rawExifData")
                .append(JSON.stringify(message.exifData, null, 2));
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