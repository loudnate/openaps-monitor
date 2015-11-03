
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
                marginLeft: 44,
                style: {
                    fontFamily: '-apple-system, sans-serif'
                }
            },
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
                borderWidth: 0,
                positioner: function() {
                    return { x: this.chart.chartWidth - this.label.width - 10, y: 1 }
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
                title: null
            }
        });
    }

    /**
     * Creates the configuration options for displaying glucose values in a Highcharts line graph
     *
     * http://api.highcharts.com/highcharts
     */
    M.GlucoseLineHighchart = function(actualGlucose, predictedGlucose, targetGlucose, displayUnit) {
        return {
            chart: {
                type: 'line'
            },
            series: [
                {
                    data: actualGlucose,
                    lineWidth: 1,
                    marker: {
                        enabled: true,
                    },
                    name: "Glucose"
                },
                {
                    color: Highcharts.getOptions().colors[0],
                    data: predictedGlucose,
                    dashStyle: "Dash",
                    marker: {
                        enabled: false,
                        symbol: 'circle'
                    },
                    name: "Predicted",
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
                    data: basal,
                    marker: {
                        enabled: false
                    },
                    name: "Temp Basal",
                    step: "left"
                },
                {
                    data: square,
                    marker: {
                        enabled: false
                    },
                    name: "Square Bolus",
                    step: "left"
                }
            ],
            tooltip: {
                pointFormat: '<span style="color:{point.color}">\u25CF</span> {point.x:%l:%M %p}: <b>{point.y}</b><br/>',
                valueDecimals: 3,
                valueSuffix: ' U/hour'
            },
            yAxis: {
                tickPixelInterval: 16
            }
        };
    };

    M.CarbsAreaHighchart = function(carbs) {
        return {
            chart: {
                type: 'area'
            },
            series: [
                {
                    data: carbs,
                    marker: {
                        enabled: true
                    },
                    name: "Carbs",
                    step: "left",
                    tooltip: {
                        valueSuffix: ' g',
                        valueDecimals: 0
                    }
                }
            ],
            tooltip: {
                pointFormat: '<span style="color:{point.color}">\u25CF</span> {point.x:%l:%M %p}: <b>{point.y}</b><br/>',
                synced: true
            },
            yAxis: {
                tickPixelInterval: 16
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
                    data: bolus,
                    marker: {
                        enabled: true
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
                tickPixelInterval: 16
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
