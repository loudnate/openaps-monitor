
(function(global) {
    'use strict';

    var M = {};

    M.syncExtremes = function (e) {
        var thisChart = this.chart;

        Highcharts.each(Highcharts.charts, function (chart) {
            if (chart !== thisChart) {
                if (chart.xAxis[0].setExtremes) { // It is null while updating
                    chart.xAxis[0].setExtremes(e.min, e.max, true, false);
                }
            }
        });
    }

    M.setupHighcharts = function () {
        Highcharts.setOptions({
            chart: {
                borderColor: '#e7e7e8',
                marginLeft: 44,
                marginTop: 46,
                style: {
                    fontFamily: '-apple-system, sans-serif'
                }
            },
            colors: [
                '#009ddc', '#ff851b', '#98005d', '#85cebc', '#00853e', '#f8ca12', '#b06110', '#ee2e24'
            ],
            credits: {
                enabled: false  
            },
            legend: {
                enabled: false
            },
            title: {
                text: null
            },
            tooltip: {
                borderRadius: 10,
                borderWidth: 1,
                headerFormat: '<span>{point.key}</span><br/>',
                pointFormat: '<span>{point.x:%l:%M %p}:</span> <b style="color:{point.color}; font-weight: bold">{point.y}</b><br/>',
                positioner: function(labelWidth, labelHeight, point) {
                    return { x: Math.min(Math.max(this.chart.plotLeft, point.plotX - labelWidth / 2.0), this.chart.chartWidth - labelWidth), y: 0 }
                },
                shadow: false,
                xDateFormat: "%l:%M %p"
            },
            xAxis: {
                crosshair: true,
                gridLineWidth: 1,
                labels: {
                    format: '{value:%l %p}'
                },
                minTickInterval: 60*60*1000,
                tickWidth: 0,
                type: 'datetime',
                events: {
                    setExtremes: M.syncExtremes
                }
            },
            yAxis: {
                startOnTick: true,
                endOnTick: true,
                title: null,
                plotBands: [{
                    from: 80,
                    to: 180,
                    color: 'rgba(68, 170, 213, 0.1)'
                }]
            }
        });
    }

    /**
     * Creates the configuration options for displaying glucose values in a Highcharts line graph
     *
     * http://api.highcharts.com/highcharts
     */
    M.GlucoseLineHighchart = function(actualGlucose, predictedGlucose, predictedGlucoseWithoutDose, targetGlucose, displayUnit) {
        return {
            chart: {
                type: 'line'
            },
            series: [
                {
                    data: actualGlucose,
                    lineWidth: 0,
                    marker: {
                        enabled: true,
                    },
                    name: "Glucose",
                    states: {
                        hover: {
                            lineWidthPlus: 0
                        }
                    }
                },
                {
                    color: Highcharts.getOptions().colors[0],
                    data: predictedGlucose,
                    dashStyle: "Dash",
                    marker: {
                        enabled: false,
                        symbol: 'circle'
                    },
                    name: "Predicted"
                },
                {
	                color: 'rgba(68, 170, 213, 0.5)',
                    data: predictedGlucoseWithoutDose,
                    dashStyle: "Dash",
                    marker: {
                        enabled: false,
                        symbol: 'circle'
                    },
                    name: "Predicted Without Dose",
                },                
                {
                    color: Highcharts.getOptions().colors[0],
                    data: targetGlucose,
                    fillOpacity: 0.3,
                    followerPointer: false,
                    followTouchMove: false,
                    lineWidth: 0,
                    name: 'Targets',
                    states: {
                        hover: {
                            enabled: false
                        }
                    },
                    step: "left",
                    stickyTracking: false,
                    type: 'arearange',
                    zIndex: 0
                }
            ],
            tooltip: {
                valueDecimals: 0,
                valueSuffix: ' ' + displayUnit
            }
        };
    };

    M.BasalAreaHighchart = function(basal, square) {
        return {
            chart: {
                type: 'area'
            },
            series: [
                {
                    color: Highcharts.getOptions().colors[3],
                    data: square,
                    marker: {
                        enabled: false
                    },
                    name: "Square Bolus",
                    step: "left"
                },
                {
                    color: Highcharts.getOptions().colors[4],
                    data: basal,
                    lineWidth: 0,
                    marker: {
                        enabled: false,
                        symbol: 'circle'
                    },
                    name: "Temp Basal",
                    step: "left"
                }
            ],
            tooltip: {
                valueDecimals: 3,
                valueSuffix: ' U/hour'
            },
            yAxis: {
                plotLines: [{
                    color: Highcharts.getOptions().colors[4],
                    width: 2,
                    value: 0
                }],
                tickPixelInterval: 24
            }
        };
    };

    M.CarbsAreaHighchart = function(cob, carbs) {
        return {
            chart: {
                type: 'area'
            },
            series: [
                {
                    color: Highcharts.getOptions().colors[5],
                    data: cob,
                    marker: {
                        enabled: false
                    },
                    name: "COB",
                    tooltip: {
                        valueDecimals: 0,
                        valueSuffix: ' g'
                    }
                },
                {
                    color: Highcharts.getOptions().colors[6],
                    data: carbs,
                    marker: {
                        enabled: true,
                        radius: 6,
                        symbol: 'triangle'
                    },
                    name: "Carbs",
                    step: "left",
                    tooltip: {
                        valueSuffix: ' g',
                        valueDecimals: 0
                    }
                }
            ],
            yAxis: {
                tickPixelInterval: 24
            }
        };
    };

    
    M.IOBAreaHighchart = function(iob, bolus) {
        return {
            chart: {
                type: 'area'
            },
            series: [
                {
                    color: Highcharts.getOptions().colors[1],
                    lineWidth: 0,
                    data: iob,
                    marker: {
                        enabled: false
                    },
                    name: "IOB",
                    tooltip: {
                        valueDecimals: 3,
                        valueSuffix: ' U'
                    }
                },
                {
                    color: Highcharts.getOptions().colors[2],
                    data: bolus,
                    marker: {
                        enabled: true,
                        radius: 6,
                        symbol: 'triangle-down'
                    },
                    name: "Bolus",
                    step: "left",
                    tooltip: {
                        valueSuffix: ' U',
                        valueDecimals: 3
                    }
                }
            ],
            yAxis: {
                tickPixelInterval: 24
            }
        };
    };

    M.syncHighchartsMovementsInContainer = function($container) {
        var max = -Infinity,
            min = Infinity;

        Highcharts.each(Highcharts.charts, function (chart) {
            var extremes = chart.xAxis[0].getExtremes();
            
            if (extremes.max != undefined && extremes.min != undefined) {
                max = Math.max(max, extremes.max);
                min = Math.min(min, extremes.min);   
            }
        });

        Highcharts.charts[0].xAxis[0].setExtremes(min, max, true, false);

        $container.bind('mousemove touchmove', function (e) {
            var chart,
                point,
                i,
                j;

            for (i = 0; i < Highcharts.charts.length; i = i + 1) {
                point = null;
                chart = Highcharts.charts[i];
                e = chart.pointer.normalize(e); // Find coordinates within the chart

                for (j = 0; j < chart.series.length; j = j + 1) {
                    var seriesPoint = chart.series[j].searchPoint(e, true); // Get the hovered point

                    if (seriesPoint && (!point || point.distX > seriesPoint.distX)) {
                        point = seriesPoint;
                    }
                }

                if (point) {
                    point.onMouseOver(); // Show the hover marker
                    chart.tooltip.refresh(point); // Show the tooltip
                    chart.xAxis[0].drawCrosshair(e, point); // Show the crosshair
                }
            }
        });
    };

    // Exports
    global.Monitor = M;
})(window);
