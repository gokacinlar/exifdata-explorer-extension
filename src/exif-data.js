/**
 * Helper Functions to manipulate DOM in the
 * exif-data.html file.
 */

$(document).ready(function () {
    const textData = {
        imgStyling: "img-has-border-radius",
        abortingMessage: "You're about to abort the process. Do you want to continue?"
    }

    const abortProcessButton = $("#abortProcess");

    // Function to close tab if user decides to abandon removing exif data
    abortProcessButton.on("click", function () {
        if (confirm(textData.abortingMessage) == true) {
            window.close();
        } else {
            return;
        }
    });

    const imgElement = $("#exifImgSource");
    const images = $("img");
    images.attr("class", textData.imgStyling);

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        $("#removeExif").on("click", () => {
            const arrayBuffer = message.imageData; // This is the ArrayBuffer
            const mimeType = message.mimeType;

            const blob = new Blob([arrayBuffer], { type: mimeType });
            const fileUrl = URL.createObjectURL(blob);

            // Fetch the Blob URL
            fetch(fileUrl)
                .then(res => {
                    if (!res.ok) {
                        throw new Error("Error fetching the image blob");
                    }
                    return res.blob();
                })
                .then(blob => {
                    return handleExifRemoval(blob);
                })
                .catch(error => {
                    console.error("Error fetching the image blob:", error);
                    alert("An error occurred while fetching the image.");
                });
        });
    });

    // Function to handle the EXIF removal process
    const handleExifRemoval = async (blob) => {
        try {
            const cleanedFile = await removeExifData(blob);

            // Create a new URL for the cleaned image and update the img element
            const cleanedImageUrl = URL.createObjectURL(cleanedFile);
            imgElement.src = cleanedImageUrl;

            // Optionally, update the image name or any other UI elements
            const imageName = cleanedFile.name || "image_without_exif.jpg";
            $("#exifImageName").text(`Your Image: ${imageName}`);

            // Create and append the download button dynamically
            const downloadButton = $("<button>")
                .attr("id", "downloadImage")
                .addClass("button is-info is-spaced")
                .text("Download Image")
                .hide(); // Initially hide the button so that fadeIn animation could be displayed

            // Append the button to the actions section
            $(".buttons").append(downloadButton); // Assuming the buttons are in the same container

            // Now apply fadeIn to the button
            downloadButton.fadeIn("slow"); // Fade in the button

            downloadButton.on("click", () => {
                const url = URL.createObjectURL(cleanedFile);
                const a = document.createElement("a");

                a.href = url;
                a.download = cleanedFile.name || "cleaned_image.jpg"; // Set the filename
                document.body.appendChild(a);
                a.click();

                document.body.removeChild(a); // Clean up
                URL.revokeObjectURL(url); // Free up memory
            });

            // Append the download button to the actions section
            $(".buttons").append(downloadButton); // Assuming the buttons are in the same container

        } catch (error) {
            console.error("Error removing EXIF data:", error);
            alert("An error occurred while removing EXIF data.");
        }
    };

    /**
     * Main Function to remove exif data from images
     * Hugely benefitted from https://stackoverflow.com/a/27638728
     * helper video: https://www.youtube.com/watch?v=ScZZoHj7mqY
     */

    const cleanBuffer = (arrayBuffer) => {
        const dataView = new DataView(arrayBuffer);
        const exifMarker = 0xffe1;
        let offset = 2; // Skip the first two bytes (0xFFD8)

        while (offset < dataView.byteLength) {
            if (dataView.getUint16(offset) === exifMarker) {
                // Found an EXIF marker
                const segmentLength = dataView.getUint16(offset + 2, false) + 2;
                arrayBuffer = removeSegment(arrayBuffer, offset, segmentLength);
                // No need to recreate dataView here, as it will be updated in the next iteration
            } else {
                // Move to the next marker
                offset += 2 + dataView.getUint16(offset + 2, false);
            }
        }

        return arrayBuffer;
    };

    const removeSegment = (buffer, offset, length) => {
        const modifiedBuffer = new Uint8Array(buffer.byteLength - length);
        modifiedBuffer.set(new Uint8Array(buffer.slice(0, offset)), 0);
        modifiedBuffer.set(new Uint8Array(buffer.slice(offset + length)), offset);
        return modifiedBuffer.buffer;
    };

    const removeExifData = (file) => {
        return new Promise((resolve) => {
            if (file && file.type.startsWith("image/")) {
                const fr = new FileReader();
                fr.onload = function () {
                    const cleanedBuffer = cleanBuffer(this.result);
                    const blob = new Blob([cleanedBuffer], { type: file.type });
                    const newFile = new File([blob], file.name, { type: file.type });
                    resolve(newFile);
                };
                fr.readAsArrayBuffer(file);
            } else {
                resolve(file);
            }
        });
    };
});