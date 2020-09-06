var data = [];

$(document).ready(function() {

    var request = $.ajax({
        url: "https://covid-19.dataflowkit.com/v1",
        method: "GET",
        dataType: "json"
    });

    request.done(d => {
        hideSpinners();

        document.getElementById("new-cases").innerText = d[0]["New Cases_text"];
        document.getElementById("last-update").innerText = d[0]["Last Update"];
        document.getElementById("new-deaths").innerText = d[0]["New Deaths_text"];
        document.getElementById("active-cases").innerText = d[0]["Active Cases_text"];

        d.forEach((element, index) => {
            if (index != 216) {
                if (element["Country_text"] != "World" &&
                    element["Country_text"] != "Diamond Princess" && element["Country_text"] != "MS Zaandam" &&
                    !element["Country_text"].includes("Islands") && !element["Country_text"].includes("St") &&
                    !element["Country_text"].includes("Saint")) {
                    data.push({
                        id: countryById[element["Country_text"]].code,
                        new_cases: reformat(element["New Cases_text"]),
                        country: element["Country_text"],
                        last_update: element["Last Update"],
                        new_deaths: reformat(element["New Deaths_text"]),
                        active_cases: reformat(element["Active Cases_text"]),
                        value: reformat(element["Total Cases_text"]),
                        total_deaths: reformat(element["Total Deaths_text"]),
                        total_recovered: reformat(element["Total Recovered_text"])
                    })
                }
            }
        });

        fillNewCases(data, d[0]["New Cases_text"]);
        fillCases(data, d[0]["Total Cases_text"]);
        fillRecovered(data, d[0]["Total Recovered_text"]);
        fillDeaths(data, d[0]["Total Deaths_text"]);
        constructChart(data);
        fillXyChart(data, d[0]["Last Update"]);
    });
    request.fail(err => console.log(err));
})

function reformat(n) {
    //"+22,666"
    //["+22","666"]
    //["22","666"]
    //"22666"
    if (n != "") {
        let number = n.split(",").filter(n => n != "+").join("");
        return parseInt(number);
    } else return 0;
}

function createLi(liClass, id, country, value, c = "") {
    let li = document.createElement("li");
    //after       
    li.addEventListener("click", function() {
        chart.zoomToMapObject(polygonSeries.getPolygonById(id));
    })

    li.setAttribute("class", "list-group-item bg-light cursor");
    li.innerHTML = "<img src='flags/" + id.toLowerCase() + ".svg' height='20px' width='30px'><span class='text-upper'>" + country + "</span> <b><span class='text-" + liClass + " float-right'>" + c + value + "</span></b>";
    return li;
}

function createFirstLi(title, type, icon, totale) {
    let firstLi = document.createElement("li");
    firstLi.setAttribute("class", "list-group-item bg-" + type + " text-center text-white");
    firstLi.innerHTML = "<span class='fa fa-" + icon + "'></span> " + title + " " + totale
    return firstLi;
}

function createUl() {
    let ul = document.createElement("ul");
    ul.setAttribute("class", "list-group list-group-flush  shadow");
    return ul;
}

function fillCases(casesData, totale) {
    let side = document.getElementById("side");
    let ul = createUl();
    ul.appendChild(createFirstLi("Total cases", "info", "biohazard", totale));
    casesData.forEach(d => {
        ul.appendChild(createLi("info", d.id, d.country, d.value));
    });
    side.appendChild(ul);
}

function fillRecovered(recoveredData, totale) {
    let side = document.getElementById("otherside");
    let ul = createUl();

    ul.appendChild(createFirstLi("Total Recovered", "success", "check", totale));
    recoveredData.forEach(d => {
        ul.appendChild(createLi("success", d.id, d.country, d.total_recovered));
    });

    side.appendChild(ul);
}

function fillDeaths(deathsData, totale) {
    let side = document.getElementById("otherside");
    let ul = createUl();
    ul.appendChild(createFirstLi("Total Deaths", "dark", "meh", totale));
    deathsData.forEach(d => {
        ul.appendChild(createLi("dark", d.id, d.country, d.total_deaths));
    });
    side.appendChild(ul);
}

function fillNewCases(newData, totale) {
    let side = document.getElementById("side");
    let ul = createUl();
    ul.appendChild(createFirstLi("New Cases", "danger", "bars", totale));
    newData.forEach(d => {
        ul.appendChild(createLi("danger", d.id, d.country, d.new_cases, "+"));
    });
    side.appendChild(ul);
}

function hideSpinners() {
    let spinners = document.getElementsByClassName("spinners");
    spinners.forEach(s => {
        s.style.display = "none";
    })
}