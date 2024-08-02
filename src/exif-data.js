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

    const images = $("img");
    images.attr("class", textData.imgStyling);

    $("#removeExif").addEventListener("click", async () => {
        const imgElement = $("#exifImgSource");
        const imageUrl = imgElement.src;

        // Fetch the image as a Blob
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            // Remove EXIF data from the image file
            const cleanedFile = await removeExifData(blob);

            // Create a new URL for the cleaned image and update the img element
            const cleanedImageUrl = URL.createObjectURL(cleanedFile);
            imgElement.src = cleanedImageUrl;

            // Optionally, update the image name or any other UI elements
            const imageName = cleanedFile.name || "cleaned_image.jpg"; // Default name if not provided
            $("#exifImageName").textContent = `Your Image: ${imageName}`;
        } catch (error) {
            console.error("Error removing EXIF data:", error);
            alert("An error occurred while removing EXIF data.");
        }
    });

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