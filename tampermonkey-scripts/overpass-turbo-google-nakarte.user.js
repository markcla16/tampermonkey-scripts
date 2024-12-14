// ==UserScript==
// @name         Overpass-turbo-google-nakarte
// @namespace    https://overpass-turbo.eu
// @version      2024.12.14.00.13
// @description  Add a Google & Nakarte Maps link to the nodes popups.
// @author       You
// @match        https://overpass-turbo.eu/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Add an event listener for clicks on the page
    document.addEventListener("click", function() {
        setTimeout(()=>{

            const popup = document.querySelectorAll(".leaflet-popup");

            if (popup.length == 1) {
                const coordinate_element = popup[0].querySelector('a[href^="geo"]');

                console.log("Popup found");

                const way_element = popup[0].querySelector('a[href^="//www.openstreetmap.org/way/"]')
                if (coordinate_element) {
                    let coordinates = coordinate_element.getAttribute("href").replace("geo:", "");
                    let lat = coordinates.split(",")[0]
                    let long = coordinates.split(",")[1]

                    let google_link = "https://www.google.ch/maps/place/" + coordinates;
                    // Check if the Google Maps link already exists to avoid duplication
                    if (!document.getElementById("google_link")) {
                        append_google_link(coordinates, popup);
                        append_nakarte_link(lat, long)
                    }


                }else if(way_element){
                    if (!document.getElementById("google_link")) {
                        console.log("way popup")
                        const way_id = way_element.textContent
                        getWayData(way_id, popup)
                    }
                }else{
                    console.log('Could not find coordonates or way id.');
                    return;
                }
            }
        },500);
    });

    function append_google_link(coordinates, popup){

        let google_link = "https://www.google.ch/maps/place/" + coordinates;
        let new_p = document.createElement("p");
        let new_a = document.createElement("a");
        let new_br = document.createElement("br");

        new_a.setAttribute("id", 'google_link');
        new_a.setAttribute("href", google_link);
        new_a.setAttribute("target", "_blank"); // Open in a new tab
        new_a.textContent = "View on Google Maps";
        new_p.appendChild(new_br);
        new_p.appendChild(new_a);


        // Find the parent container and append the new <p> after the existing coordinates <p>
        const insert_here = popup[0].querySelector('ul')
        insert_here.insertAdjacentElement('afterend', new_p);
        //insert_here.appendChild(new_p);
        console.log("Google Maps link added:", google_link);
    }

    function append_nakarte_link(lat, long){

        let nakarte_link = createNakarteLink(lat,long)


        let new_p_nakarte = document.createElement("p");
        let new_a_nakarte = document.createElement("a");
        new_a_nakarte.setAttribute("href", nakarte_link);
        new_a_nakarte.setAttribute("id", "nakarte_link");
        new_a_nakarte.setAttribute("target", "_blank"); // Open in a new tab
        new_a_nakarte.textContent = "View on Nakate Maps";
        new_p_nakarte.appendChild(new_a_nakarte);

        const insert_here = document.getElementById("google_link").parentElement
        insert_here.appendChild(new_p_nakarte);
        console.log("Nakarte Maps link added:", nakarte_link);
    }


    function calculateCenterPoint(data) {
        const nodes = data.elements.filter((el) => el.type === "node");

        if (nodes.length === 0) {
            console.error("No nodes found in the data.");
            return null;
        }

        // Calculate the average latitude and longitude
        const total = nodes.reduce(
            (acc, node) => {
                acc.latSum += node.lat;
                acc.lonSum += node.lon;
                return acc;
            },
            { latSum: 0, lonSum: 0 }
        );

        const center = {
            lat: total.latSum / nodes.length,
            long: total.lonSum / nodes.length
        };

        return center;
    }

    function createNakarteLink(lat, lon) {
        // Ensure lat and lon are numbers
        const parsedLat = parseFloat(lat);
        const parsedLon = parseFloat(lon);

        // Check if parsing succeeded
        if (isNaN(parsedLat) || isNaN(parsedLon)) {
            console.error("Invalid latitude or longitude provided:", lat, lon);
            return null;
        }

        // Round latitude and longitude to 5 decimal places for the Nakarte link
        const roundedLat = parsedLat.toFixed(5);
        const roundedLon = parsedLon.toFixed(5);

        // Format the Nakarte link with the provided latitude and longitude
        const nakarteLink = `https://nakarte.me/#m=17/${roundedLat}/${roundedLon}&l=O&q=${parsedLat}%2C${parsedLon}&r=${roundedLat}/${roundedLon}/${parsedLat}%C2%B0%20${parsedLon}%C2%B0`;

        return nakarteLink;
    }


    async function getWayData(way_id, popup) {
        const overpassUrl = "https://overpass-api.de/api/interpreter"; // Overpass API endpoint
        const query = `
[out:json][timeout:25];
way(` + way_id + `);
(._;>;);
out;
`;

        try {
            // Make the POST request
            const response = await fetch(overpassUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "data=" + encodeURIComponent(query) // Encode the query for transmission
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Parse the response JSON
            const data = await response.json();
            const center = calculateCenterPoint(data);
            // Log or process the data
            console.log('Calculated coords:', center);


            let coordinates = `${center.lat},${center.long}`
            append_google_link(coordinates, popup);
            append_nakarte_link(center.lat, center.long, popup)


            return data;
        } catch (error) {
            console.error("Error running Overpass query:", error);
        }
    }

})();
