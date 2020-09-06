var chart;
var xyChart;
var polygonSeries;

function constructChart(chartData) {
    // Create map instance
    chart = am4core.create("chartdiv", am4maps.MapChart);

    // Create map polygon series
    polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

    //create polygon template
    var polygonTemplate = polygonSeries.mapPolygons.template;
    // Set map definition
    chart.geodata = am4geodata_worldLow;

    // Set projection
    chart.projection = new am4maps.projections.Miller();

    polygonSeries.exclude = ["AQ"];
    polygonSeries.data = chartData;
    // Make map load polygon (like country names) data from GeoJSON
    polygonSeries.useGeodata = true;
    polygonSeries.nonScalingStroke = true;

    polygonSeries.strokeWidth = 0.5;
    polygonSeries.calculateVisualCenter = true;

    polygonTemplate.fill = am4core.color("#84c4a4");

    // Configure series    

    var imageSeries = chart.series.push(new am4maps.MapImageSeries());
    imageSeries.data = chartData;
    imageSeries.dataFields.value = "value";

    var imageTemplate = imageSeries.mapImages.template;
    imageTemplate.nonScaling = true

    imageTemplate.adapter.add("latitude", function(latitude, target) {
        var polygon = polygonSeries.getPolygonById(target.dataItem.dataContext.id);
        if (polygon) {
            return polygon.visualLatitude;
        }
        return latitude;
    })

    imageTemplate.adapter.add("longitude", function(longitude, target) {
        var polygon = polygonSeries.getPolygonById(target.dataItem.dataContext.id);
        if (polygon) {
            return polygon.visualLongitude;
        }
        return longitude;
    })

    var circle = imageTemplate.createChild(am4core.Circle);
    circle.fillOpacity = 0.7;
    circle.properties.fill = "red";
    circle.tooltipHTML = "<div class='text-center'><b>{country}</b></br>" +
        "Cases: <b>{value}</b> </br>" +
        "Recovered : <b>{total_recovered}</b></br>" +
        "Deaths: <b>{total_deaths}</b></div>";

    imageSeries.heatRules.push({
            "target": circle,
            "property": "radius",
            "min": 4,
            "max": 60,
            "dataField": "value"
        })
        // Create a zoom control
    var zoomControl = new am4maps.ZoomControl();
    chart.zoomControl = zoomControl;
    zoomControl.slider.height = 100;

    // Add button to zoom out
    var home = chart.chartContainer.createChild(am4core.Button);
    home.label.text = "Init";
    home.align = "right";
    home.events.on("hit", function(ev) {
        chart.goHome();
    });
}

function fillXyChart(xydata, last) {

    xyChart = am4core.create("xyChart", am4charts.XYChart);

    xydata.sort((current, next) => next.new_cases - current.new_cases);

    xyChart.data = xydata.filter((e, index) => index < 30);

    let categoryAxis = xyChart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "country";
    categoryAxis.title.text = "Last Update: " + last;

    let valueAxis = xyChart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "New Cases";
    categoryAxis.renderer.minGridDistance = 150;
    categoryAxis.renderer.grid.template.location = 0;

    let series = xyChart.series.push(new am4charts.ColumnSeries());
    series.columns.template.tooltipText = "{country}\nNew cases: {new_cases}";
    series.columns.template.fill = am4core.color("#007ad1");
    series.dataFields.valueY = "new_cases";
    series.dataFields.categoryX = "country";
}