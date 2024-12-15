// ==UserScript==
// @name         Overpass-turbo-google-nakarte
// @namespace    https://overpass-turbo.eu
// @version      2024.12.15.19.01
// @description  Add a Google & Nakarte Maps link to the nodes popups.
// @author       r051nt
// @match        https://overpass-turbo.eu/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// @updateURL    https://raw.githubusercontent.com/markcla16/tampermonkey-scripts/main/tampermonkey-scripts/overpass-turbo-google-nakarte.user.js
// @downloadURL  https://raw.githubusercontent.com/markcla16/tampermonkey-scripts/main/tampermonkey-scripts/overpass-turbo-google-nakarte.user.js
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

                    // Check if the Google Maps link already exists to avoid duplication
                    if (!document.getElementById("google_link")) {
                        insert_icons(coordinates, popup)
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

    function insert_icons(coordinates, popup){
        let lat = coordinates.split(",")[0]
        let long = coordinates.split(",")[1]


        // Create a <p> that will contain our icons
        let new_p = document.createElement("p");
        //new_p.setAttribute("id", 'tm_icons');
        let new_br = document.createElement("br");
        let google_elem = get_google_link(coordinates);
        let nakarte_elem = get_nakarte_link(lat, long)
        new_p.appendChild(new_br);
        new_p.appendChild(google_elem);
        new_p.appendChild(nakarte_elem);
        console.log("NEW_P", new_p);
        let container = document.querySelector('.leaflet-popup-content');
        const ins_after = document.querySelector('.leaflet-popup-content').querySelector('h4')

        container.insertBefore(new_p, ins_after.nextSibling);
    }

    function get_google_link(coordinates){

        let google_link = "https://www.google.ch/maps/place/" + coordinates;
        let new_a = document.createElement("a");
        let new_img = document.createElement("img")

        new_a.setAttribute("href", google_link);
        new_a.setAttribute("id", "google_link");
        new_a.setAttribute("target", "_blank"); // Open in a new tab
        new_a.setAttribute("title", "View data on Google maps.")

        const base64_icon = "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mW5/P3c6cqil9+HAAAANeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImdpbXA6ZG9jaWQ6Z2ltcDpjOWFlMDc2Yi1iY2Y4LTQzNWUtOWJiNi1hOTRlMDBmMGJkOWYiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M2E0MzVhMGMtNTM0Zi00ZGFjLTkxMTAtNDYzOTM3NWFlZjdmIgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZTRmMGFlZTUtMWQzNy00ZTlhLTk4OGYtYzA0ZGY4NjNmZmI1IgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iTGludXgiCiAgIEdJTVA6VGltZVN0YW1wPSIxNzM0MjcxNjc4NjI4NjIxIgogICBHSU1QOlZlcnNpb249IjIuMTAuMzYiCiAgIHRpZmY6T3JpZW50YXRpb249IjEiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0OjEyOjE1VDE1OjA3OjU4KzAxOjAwIgogICB4bXA6TW9kaWZ5RGF0ZT0iMjAyNDoxMjoxNVQxNTowNzo1OCswMTowMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjk3ZWFkMDgyLTY4ZTItNDQwZi05ZmFjLWZlODA3NTg0NjMxZSIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChMaW51eCkiCiAgICAgIHN0RXZ0OndoZW49IjIwMjQtMTItMTVUMTU6MDc6NTgrMDE6MDAiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+G13UxAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB+gMDw4HOiiDrGcAAAO5SURBVFjDxZddaFtlGMd/5yM5OSdJR7vWbe2YgmuFBC1FxZveWJjYoiw3ZblwGBApOvWqDiSsF2IpDumFAwWneIpUCo76tsLq8GJQdJ2Ikg4ShsMJ2nabjZptadOPNMeLJmVtz0lO2qnvXZ7nef/P/zyfbySqOB298/XAC8AzwGNAY1F1A5j2B/VvFFX5TMT1tFtMyaVjP/A28Aqg29loPg+argHkgA+BPhHXF3ZNoKN3PgSMAw872ageFSPg2yq+Djwv4npqxwQ6eudbgYtArZONosgYQQPJHulv4GkR16ed7stOip9bQ7Wnfzg11rJyp8aRvSyhB3Qn5xSJj0f6c7VVEwAGazKTD752+Q3as3PWNucSGH4fslwxi4eAQccIOnz9I8DHAMpaRg7fuIi35tHCVeOBDcK634fqUZeAPKCWY+Crm2p94vjtkcS5q3+6jcDLm1iu/SU9+9Orykuzk/n1olMueLxqm4jruojrOtAGfG0H5A1ew1f7vrQVsxKBo3bCJ1On1N5fz43qAaNTxPVESS7iesIqKF3Al5u6w3cLveG9spjbEnitNWRYYNu/ahsF7XGpqen15E07faQ/tx+YBWRZzRI4OICsXN/QW+AfiorFshGwoNk2VA9B4Dkp4eS8GImbQEKS8/gPfLLJefFrm92kYJtMCkLwmITsZ9XF4Fw19n2B4r3sKuV2BOa3CgIvSijrndycngg7VvzR/pxqNFw47DHGnUzSFQm0TKdmgI08GcclPAc31HXACSf0PYfeOeGtMfc6qHNmVPzutgu+A9C6wBfepns3PRGObRV+PnokpniSp8uk5lvbwnYwHlOf4oi/3XbKacCn6YnwmyXQOwWt/YOsHrLK18aYewISw8EuaQCZYBnAEBBatWSGFw6QtspNde4Cw64HUUsilZE0zlQqdwsQi038UvBUMj1jRkWm2mU0AMyUQ51c2s/3eV8l5zNFrOq2YX1nMgv0OOlTK3V8tRx086DqMaMiu5N1TH1n8rzdKp3LBxjK7XXjfNCMivPlDGQXeX4LuFT6fbugcXZxH2uVnV9i/S67ItDQmVwBuoHZZUtlaKGRu1bFa7NAtxkVK7smUEzFHNA9uti4/FtBrWS+XHQ+5wbbFYEiiakf89pJF6YnzaiYuq//C+49sZGIcHpcAGNmVESqwZOp/vQAdkMlU65t7xsBMypuAX02qr6ijn87AgAfAfc6+wOJszsB2hEBMyqWS8/2EiHzmFj6zwjYrNdx/o8TG4lciY1EruwG4x971wvRIJbAOQAAAABJRU5ErkJggg=="
        new_img.setAttribute("src", "data:image/png;base64," + base64_icon)
        new_a.appendChild(new_img);

        console.log("Google Maps link added:", google_link);

        return new_a
    }

    function get_nakarte_link(lat, long){

        let nakarte_href = getNakarteUrl(lat,long)



        let new_a = document.createElement("a");

        let new_img = document.createElement("img")
        const base64_icon = "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAALenpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjapZhpluM4DoT/8xRzBHEBQR6H63tzgzn+fKBkV1Yu3V0zdtlSSjIJIoCIYLn1n39v9y9eMV7BJdGSa84Xr1RTDY2Tct2vdr79lc73eYXnFn//dt29bwQuRY7x/rPk5/nXdf8e4D40zuTDQGU8N/rvN2p6xi+fBnomihaRRTGfgeozUAz3Df8M0O5lXbkW/biEvu7jfK2k3B9nX2PdS/fPbJ//Tkr2pnAxhrAil/mOMd8BRPskFxs3wvkWHuSb8ysq3yG+lkpCvsvT+1WJaFuo6duHfkPlfea/v+4+o5XC80j8lOT8Pn573Xn5HpWT+g8zp/Kchd+vV736HdGn7Ntn71n2WTOraCmT6vws6rWUc8ZzDJJs6uIILV/KRxhCz7vyLlT1oBTmNZixc159AK7tk5+++e3XOQ4/CDGF5YJyEsII8VwsUUMNIxp+yd5+B401zlhAcRzYUwzvWPyZtl7DndkKM0/Po8EzmJXDH7/dn/5gb2sF76/yzhVxhWDJJgxDzr55DET8fpIqJ8Gv9+eX4RpBUCzL1iKVxPZ7iC7+FxPEA3TkQeF496DX+QxAiphaCMZHEAA1usJnf2kI6j2JLADUCJ0GCh0EvEiYBBkS7QU2JdjU/ET9eTRI4LLjOmQGEhIzHVZAqAFWSkL9aCrUUJMoSUSyqBSp0nLMKUvOWbORYtOoyaloVtWiVVuJJRUpuWgppZZWQ42QptRctZZaa2vM2Ri58evGA6310GNPXVzPXXvptbdB+Yw0ZOSho4w62gwzTvhj5qmzzDrb8otSWmnJyktXWXW1Tant6HbasvPWXXbd7Y3aA+uX9x+g5h/UwkHKHtQ3alxVfQ3hjU7EMAMwVMSDuBoEFHQwzK7iUwqGnGF21UBXSCBIMcymN8RAMC0fZPsXdi7ciBpy/xduTtNvuIX/FTln0P0hcl9x+w61aTI0DmJ3F1pSr0j3cX+VFkozsftydO8LvTN9rhKW9tUSsY8Gzclc4oW48qTvd+y1QWhxS+mLlfgxub1KdUKSB1TGKDsrxbWNbbXta/m98t6kZhfdw8fSWlk2X+hVV597MjYL8ktE3e76PDc2me3M2ERS989zI4PS7GvudSa50o7T4u+tcUP9GMGuuw9RVI0DiHSTSH39jMT2EtsWaSO3VXOfXauUHQNFsbPPkwzHgtKe7Kxr9asBYQ2z1egZFK5JrL9CNslOzRf8fHSfL1hyc0+NkeaWANksudqUVklPblLqEA3SU5wYGda9Zqx9LrcmdaLkWqWJDbSCATZ0CjIw2j1JQv1PgHTcc/SJ3IPllMxKhiOZF8xH4sRyKGX0mlauI9ayUuBZVXAdU7svOizVO8WV1fdygfPoa6uu6l5IXO9cMSQh1Ty5mmNY+Wqnzkz8/klB2nHt0DNETZGE3LE6Kn3WHVbVXmevkj2g7WilKJ0UDrrH8kGLjDnH7jm1cWcj+PIpGV+SI/QoQ61OBcwIwiO17cRPeILVaI4XhQIiUrfQneqrLCuUtimLRYJKzpHizXH0NknNnhepOKtZTmL9q6Xfx1el2aGNqEIsnVHgjzZa86LL9WFlG+sCcJuebESa9l4n9mHmd5UhlBKM/+mPa5e0eRj8CZCid0S7GVC2Uunk72kX6LB2IYFGAKukVnYPC9qqpJr2YJCdrTvi3jzeLycwB96faqkpZR4Xg+SCDgyvSdHuYYOvyy9j46mV9Km3dsTQspI1SdhyaHmGZvxuA8HsB1dTpQvCh1RrJpEejoyedMGGtAvsmEtgsq6rtamsu24XZKw00rRgqcEVgzW7FdTp+c0g5GM0menO/UII7hLFJP46uudkcxNQFxWMK/A7E7p57Us57+QqDH3SrmPVreUXBjTbFIdSUb2+6dhqQRNcpoUyIYJZQyL4KQmnwWLdPRrZonEmp3fnlHRida/WYFCtw3Iuc7LmnlgdtLSvsdNqXWR0VC3SDcYpGyYR8LNOtUiaYypaHhLBDEFEAdkKkubDagkJ9BvlmYLqII7UeijaxWbZHqETg21mULv6vfJQ64/dBdlpJiaqhAO2lfbEBWRLJsQM2U8X76l3bIrjfY+gJBH6V+pIm6DB9DzcQw+goAu1XunonFXVGcDNi/s/Nby35LzHs5YxdpoMGGnY3dDiRlsomuXQQrohChmoXnCMJ5fzaViYIvpsYo44dxScNro6lFeRob7GXfUJv+BuDGHX76rsHK2HF4pHIdHx8F3tO5tEYHWsTRmcWnGIRYJSCpG1DVNvLNXDK+wQmskaOoU4LG7yKII1kOsma5pwLSP0IKqushyIXUs16vIzvCkk1PYrd1Zf9qCVGaZnNdDTBikCJ9pXxVFBC7MV8ErsrToCjDvDL81EXzLqmjTvwJIZJ1uksAsGbNaxJUeiMnzX7k7X6GMtHTAQkUIJWKjxCoqt1U/qakr6uBVFFBy5Q39Ylm7prNefVZCa8O6DhVkSjBPqVG/18PkmghjNUp6Muivi5lYEkGzSBbQDNYuVil17Bbq87NHMOYQNWjQHho8yXCbFJI0lkyRtLpHpfDonwgc063WMYL0zmyhhWljtNmUbDKy1Wf6wX1vCl1HqmMNBZbDFvKcHswuBMMHhef5lLGJfEFGltenpMZIiRbOwexm2pnkKcKxGizSzH41IqFdmI+gVG0HFJUZKvZoK3MiftdS7UswkfqgU97e6aqhgRTCAMKEBFEyyEhaHc2FURGwYHxH/pnmSHP9MKyy9dq83GOx63ypZOwRnO4PJEB9LAV3owcG3k1V2zLngy181l3OYFa5jF4B3SCSqsFdPSBT2K65I9kuh5eB5QUj2dL/UGzvwU99+PT4yA6tiXbXStM0jWOjamjCPyV+8mcevyBLx/qgcNNRI6FAqBfJBGagQIbJHoXBXdH/50TrUmrZpFLywzMDn4Dk1zC/jN0wD6nNqmV2Us4twOyXHHiMrbJzRi7Ue23IvgIVDciyBXqQ0IW0k4GV6b7lzf+N6Px6tklCtRQMeNcB+Lnxsw9Wzy8bOWPPDrtTuKGJrh5FhAvM3FMuksLsnh23/4gX2nvJbxRFRukrBvLK3D1SccbERz8kP43elGdA/Sy0+3ligYrL7HLbRsDVjt3CXw3FDKzaSrZj9YLM7eMzCX7vYv3a1H90taO2rnoI5tqINmwTt6+DNxseqE3E0C2xrdTQMnhxdadDQWnihl7FubJE6WyMJRs/TB/yhhlsDBegRql5LglypjObYCb0WinVt29yMdYCnAyAt26m+1grf/Vzq7h/0hK3ONir9sIwPVa2IjgJbf1Cr8C8tggmyKJS9CcizC8d42B57h1DZkUXWSqoWMVOU8HCHuJE4s4hs2/Ale8Af2Bp0fbJPwsCyH8BZxXTaHeYiX+b0TlgoaDX5Xmcoxdsx8oTMiRVPwr4fzxst+ezxYaaHFriyzIhvrJLQUOBFhJHdV9oD+Kq1Kk4Ktm5m0fp2yWNorMmCvKXKtK/a7g42/afbI/dNARE1XmEVITPwOtbeN3gDk9vqyzb+4gyaAonC1V7kueJf8HAII00Q5SFl29bboOqR421MO3K1DSMooTrpqNMwdaL8XFlDcJ4oBnY1m1G0emMr/6sn0/lPNrNdF1x8AQr+0zyp0rlMToFJdJik2L4G/DdHS8FCIIjTShnr4+joeREy3c2u8cXe+WtlGiGOY7xoA/3R+T/mjAJ5JqH2Uu79/Ipk1/lRJfIftMhmh23/eYGDO2YNBkKYlQ12aVRj6yupoYpphBJacQlTxQ68UWDeKo9dIdbb20X/tHMxaQ7Lc6mzeORRQ7uMqtWyT09RAm6I3X/GCbbb4AcQq5m6UgALxr1oV2QUutCa+TUtDDkye42hzkLxjO2yMdhiB9xtQyUQ7CMPo+X2hf43hHpd7r+r2L4+p13bDAAAAYNpQ0NQSUNDIHByb2ZpbGUAAHicfZE9SMNAHMVfU6UiLR3aQaRDhupkFxVxrFUoQoVQK7TqYHLpFzRpSVJcHAXXgoMfi1UHF2ddHVwFQfADxNnBSdFFSvxfUmgR48FxP97de9y9A4R2jWnmQBLQdMvIplNivrAqBl4RRBghRBCTmdmYk6QMPMfXPXx8vUvwLO9zf46QWjQZ4BOJk6xhWMQbxDObVoPzPnGUVWSV+Jx4wqALEj9yXXH5jXPZYYFnRo1cdp44SiyW+1jpY1YxNOJp4riq6ZQv5F1WOW9x1mpN1r0nf2GwqK8sc51mDGksYgkSRChooooaLCRo1UkxkaX9lId/1PFL5FLIVQUjxwLq0CA7fvA/+N2tWZqadJOCKWDwxbY/xoDALtBp2fb3sW13TgD/M3Cl9/z1NjD7SXqrp8WPgPA2cHHd05Q94HIHGHlqyIbsSH6aQqkEvJ/RNxWAyC0wvOb21t3H6QOQo64yN8DBITBepux1j3cP9ff275lufz93OnKopffhwAAADXhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJnaW1wOmRvY2lkOmdpbXA6NTg2MjM5Y2QtMjVjOS00NTZlLThiYTktMmQ4NjBhNjBhNGZjIgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjI3NGRiMjRjLTZiMzItNGU3Yi04ZDAyLWUwNmExZjM0MjM1OSIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjRiNjllNTRjLTAwOTMtNGRmZC05MTgzLTJiODQ3NDM1OGZkOCIKICAgZGM6Rm9ybWF0PSJpbWFnZS9wbmciCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IkxpbnV4IgogICBHSU1QOlRpbWVTdGFtcD0iMTczNDI3MTY0NTQ3ODIyNSIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjM2IgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCIKICAgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNDoxMjoxNVQxNTowNzoyNSswMTowMCIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjQ6MTI6MTVUMTU6MDc6MjUrMDE6MDAiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpkODc1MTQ2Yi02MmIzLTQ1ZjgtYmIzMS04ZmNkM2Y1YzE1NjQiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoTGludXgpIgogICAgICBzdEV2dDp3aGVuPSIyMDI0LTEyLTE1VDE1OjA3OjI1KzAxOjAwIi8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PrmSpkgAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfoDA8OBxmK5N0VAAAFyElEQVRYw61XfUwTZxj/3V2vvX7QUigMKgoY5cNi/ABx0RKHmzqMMc7pvjL/UOxmgplmDhPjXEKYTheTLfswMVVngtniXIyTDEmMonJuiTJ06iGiU1eMAuVjLaXXXnv37g/wA2lLwb3/3fu89zy/e57f83veozCGZbM79ABW0MDSVXpiExUlS5QJwsD9C5KqRQF+A3BC4J0D8fqk4gzMAti81ki2lZkV8xQdgZoetHmlEDpFEd6QgnZJg4t+ru9UkP2CAr6+wTtDLwzAZndMnKfB8U/S5aIcPYl6zi0G8MgvAgD+CWpQ4zU0tcj0SoF3tsfyz4wSfNIyHeE/z5TzrVxsoHpWBU7FwCOFkKiSUaiVrG5J/aaUUXTc7Wr2jBmAze7QlnKkoWqSnJOgiq+eHMNARdPoD4Wgpgimc5LJFVS/pmQUHXa7msOR3qFj+Ptsi1WZHm/wxyuZ08CoZgEAOlrG+ybfdAA7xpQBm91h+dhMjpYmKWwkuydMoaGXxoluuucPDy16QpQuVQ1wQ5/DqRj0BIIAgARGBiOzRW5r8X63q9kfbwbKXzUr2kiGFh+FNXeY2spOetrWUwcslacOWCo76Wlr7jC1LT7qSSkM7NPUzdWJWgDlkfxFTPBcNcoytSMZ3y1R2PKA+aX+vHP1s/sC77wpAMtDCxzHaibLqyxqAqNaDV9osOzprIRcRikTgD1xZWC2lhRH2q/vpeV2GRXR6tkuo6K+l5YBQKcaXt08NlwcFwkLShxsGksipv+yH1cF3tkVDYDAO7ua/LgKADQ1XGIsjKK12dezowIgJHprdoWp8Ghd0Bmm5EgKRwAQUMyoAATeGXgQonojOS/RkRybfb0mWvACu0NToiM5ABBSyHPgmd4W3hmIiwM/91NnAsrI/VKzYgaoTdEAEGBTqVlJBABf6OkYkAiFs5LqTNxC5FFQc71/pClfT1CVouyy2R0bI2jHxqoUZVe+noAA6A1KT2y3Axz8hKoZ0zCqXLT+1u7Jck4khFe8NI71UPdO+qkGAFiuI6Wrk0n2LONg2vqCEtp9gxNZAfBNT1LbDw2HcuPWAQCoE6nqt7x0TZFxZC1mGRXMMiK7miAbABhqGInRJYpPnltFLS6FmOpocegYLXXku066KajEGKXU8OAA0BMMICgrQ7WncdSnuyzwziNjBgAATRI++NVNK/EOopCioMP/lOjn+vXKbZn+cNz3AberueOmpUi7xEDsSezoAFz9AwjK8qAqShrs9er3xPr6UTMwtKr2PmSu++XYh7oDQfQPtV5AoVHjNVwHUDWac2a0A25Xc1icUHhOHabWzjGSiHkIyDJcvgE8lp7jHqP/gqRaLPDOjhcGMASi+35qoStPhZXZz01JmRDc9fYjPKR8lwb0OOzn1gm882w8vpl4CeZ2NV+7klSUsshAip/lg8s3AH94sD4uSYOdHsP3Au/c/b9dy212BwdgMYA0i4lrSw2Hq/dZg3aLmqDDL6JLHGT9v7IKX/osvE/N7uj2BHIAPAJwWoig/3EDsNkdM5cuyD+xfKk9MznJDJPRALVGjUM79+G97lvoFX0AAFGhUTdpJj76tALBoASP14eenj6crGu8X3ehdYXAO/8acwkKShzqspI8fvvW8qwJ1pdgMiWA4zRgVSrkFhbg4HkBUwK9UEChPnEqHDsqYNDrwHEamEwJSE9LwfyXZyY+bHct8ZLMfe72ZmVMbUgIFi57fX4Wqxqp1iZTAt7dtgG1tBW1tBXvbNsAkzFhxDmWVWFZ2fxsUFgYLU6sS3eaXq+NarSmp+Lt6s2gQMGanhr9h2XQR9p4hKjx77sx/6owMSMdGRlpMc8M+WgcMwfcrua+ez0my5wZ2cWpKckYz7ohtGH7nqPfXju//8dxdUHRK+soMcxsXjRvark50ZCXn5vVZtDr/E1XWmc41r7xU4JBLzZebJp96c+bs58jEOnz+FpP/377oMA7v4oV4z8PVU+KLeS5MAAAAABJRU5ErkJggg=="
        new_img.setAttribute("src", "data:image/png;base64," + base64_icon)



        new_a.setAttribute("href", nakarte_href);
        new_a.setAttribute("title", "View data on Nakarte maps.")
        new_a.setAttribute("target", "_blank"); // Open in a new tab

        new_a.appendChild(new_img);

        console.log("Nakarte Maps link added:", nakarte_href);

        return new_a
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

    function getNakarteUrl(lat, lon) {
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
            insert_icons(coordinates, popup)
            

            return data;
        } catch (error) {
            console.error("Error running Overpass query:", error);
        }
    }

})();
