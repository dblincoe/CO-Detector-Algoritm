$(function() {
    //Highcharts with mySQL and PHP - Ajax101.com
    var data = []; //global
    var lastReadingId; //global
    var chart; //global
    var tableName = prompt("bunsen1   or   bunsen2\ncharcoal1   or   charcoal2\nlamp1   or   lamp2\nmotor1   or   motor2", "What is your tables name?");
    /*function afterSetExtremes(e) {

        var chart = $('#chart').highcharts();

        chart.showLoading('Loading data from server...');
        console.log('http://dblincoe.ddns.net:8080/html/loadData.php?start=' + Math.round(e.min) + '&end=' + Math.round(e.max));
        $.get('http://dblincoe.ddns.net:8080/html/loadData.php?start=' + Math.round(e.min) + '&end=' + Math.round(e.max), function (callbackData) {
            var alteredData = [];
            callbackData = callbackData.split('/');
            callbackData.length = callbackData.length-1;        //Gets rid of null value at the end
                
        for (var i=0; i<callbackData.length;i+=3) {
            lastReadingId = callbackData[i];
            alteredData[i/3] = [Date.parse(callbackData[i+1])-36000000,parseFloat(callbackData[i+2])];
        }
            chart.series[0].setData(alteredData);
            chart.hideLoading();
        });
    }*/

    $.get('192.168.7.2:8080/html/values.php?table='+tableName, function(returnData) {
        returnData = returnData.split('/');
        returnData.length = returnData.length-1;        //Gets rid of null value at the end
        
        for (var i=0; i<returnData.length;i+=3) {
            lastReadingId = returnData[i];
            data[i/3] = [Date.parse(returnData[i+1])-36000000,parseFloat(returnData[i+2])];
        }
        
        chart = new Highcharts.Chart({
            chart: {
                type: 'spline',
                renderTo: 'chart',
                zoomType: 'x',
                events: {
                    load: function () {
                        chart = this;
                        requestData();
                        requestOpen();
                    }
                }
            },
            title: {
                text: 'Carbon Monoxide Sensor'
            },
            xAxis: {
                lineWidth: 2,
                lineColor: '#000',
                type: 'datetime',
                dateTimeLabelFormats: {
                    minute: '%l:%M %p'
                },
                title: {
                    style:{
                        color: '#000000',
                        fontSize: '14px'
                    },
                    text: 'Minutes'
                },
                labels:{
                    style: {
                        color: '#ffffff',
                        fontSize: '12px'
                    }
                },
                plotLines: [{
                    color: 'red', // Color value
                    dashStyle: 'longdashdot', // Style of the plot line. Default to solid
                    value: '2016-01-17 13:49:22', // Value of where the line will appear
                    width: 2 // Width of the line    
                }]
            },
            yAxis: {
                lineWidth: 2,
                lineColor: '#000',
                title: {
                    style:{
                        color: '#000000',
                        fontSize: '14px'
                    },
                    text: 'CO Level (Volts)'
                },
                gridLineColor: '#858585',
                labels:{
                    style: {
                        color: '#000000',
                        fontSize: '12px'
                    }
                }
            },
            rangeSelector:{
                enabled:true,
                buttons: [{
                        type: 'hour',
                        count: 1,
                        text: '1h'
                    }, {
                        type: 'day',
                        count: 1,
                        text: '1d'
                    }, {
                        type: 'day',
                        count: 7,
                        text: '1w'
                    }, {
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'all',
                        text: 'All'
                }],
                //selected: 1
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '',
                //formatter: function() {
                        //var date = this.x.split(' ');
                        //return date[1] + '<br>' + date[0] + '<br> Value: ' + this.y;
                //}
            },
            plotOptions: {
                series: {
                    lineWidth: 3
                },
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    lineWidth: 1,
                    marker: {
                        enabled: true,
                        radius: 0.01,
                        states: {
                            select: {
                                fillColor: 'red',
                                lineWidth: 0,
                                radius: 6
                            },
                            hover: {
                                radius: 6
                            }
                        }
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    }
                }
            },
            navigator: {
                enabled: true,
                xAxis: {
                    dateTimeLabelFormats: {
                        minute: '%l:%M %p'
                    },
                },
                adaptToUpdatedData: true
            },
            series: [{
                name: 'Data',
                data: data,
            }]
        });

        function requestData() {
            console.log(lastReadingId)
            $.ajax({
                url: 'http://dblincoe.ddns.net:8080/html/update.php',
                data: {lastReadingId: lastReadingId},
                success: function(point) {
                    point = point.split("/");
                    var lastReadingIdTmp = point[0];
                    console.log(point);
                    
                    point[0] = Date.parse(point[1])-36000000;        //conversion of data
                    point[1] = parseFloat(point[2]);
                    point.length = 2;

                    // add the point
                    if(!isNaN(point[1]) && data != null){
                        chart.series[0].addPoint(point, true, false);

                        lastReadingId =lastReadingIdTmp;
                    }
                
                    // call it again after one second
                    setTimeout(requestData, 5000);    
                },
                cache: true
            });
        };
    });
});

function requestOpen() {        
    $.ajax({
        url: 'http://dblincoe.ddns.net:8080/html/checkOpening.php',
        success: function(opening) {
            if (opening != null){
                opening = opening.split("/");
                opening[1] = Date.parse(opening[1])-18000000;

                if((Date.now() - opening[1]) < 30000) {
                    document.getElementById("alert").innerHTML = "Garage Opened!";
                } else {
                    document.getElementById("alert").innerHTML = "";
                }
            } 
            setTimeout(requestOpen, 5000);    
        },
        cache: true
    });
};
