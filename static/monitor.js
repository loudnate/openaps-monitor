
(function(global) {
    'use strict';

    function mapRows(rows) {
        // Convert the first column in each row to a date
        var timeZoneOffset = (new Date()).getTimezoneOffset() * 60000;
        for (var r = 0; r < rows.length; r++) {
            rows[r]['c'][0]['v'] = new Date(Date.parse(rows[r]['c'][0]['v']) + timeZoneOffset);
        }

        return rows;
    }

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
                marginLeft: 40,
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

    M.InsulinAreaHighchart = function(iob, basal, bolus) {
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
                        valueSuffix: ' U'
                    }
                },
                {
                    data: basal,
                    marker: {
                        enabled: false
                    },
                    name: "Temp Basal",
                    step: "left",
                    tooltip: {
                        valueSuffix: ' U/hour'
                    }
                },
                {
                    data: bolus,
                    marker: {
                        enabled: false
                    },
                    name: "Bolus",
                    step: "left",
                    tooltip: {
                        valueSuffix: ' U'
                    }
                }
            ],
            tooltip: {
                valueDecimals: 3
            }
        };
    };

    M.syncHighchartsMovementsInContainer = function($container) {
        var max = -Infinity,
            min = Infinity;

        Highcharts.each(Highcharts.charts, function (chart) {
            var extremes = chart.xAxis[0].getExtremes();

            max = Math.max(max, extremes.max);
            min = Math.min(min, extremes.min);
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

                    if (!point || point.dist > seriesPoint.dist) {
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

    /**
     *
     * @param {!Object} cols
     * @param {!Object} rows
     * @param {!HTMLElement} element
     * @constructor
     */
    var InputAreaChart = function(cols, rows, element) {
        this.height = parseInt(getComputedStyle(element)['height']);

        this.dataTable = this.buildDataTable(cols, rows);
        this.options = this.buildOptions(this.dataTable);

        this.chart = new google.visualization.AreaChart(element);
    };

    InputAreaChart.prototype.draw = function() {
        this.chart.draw(this.dataTable, this.options);
    };

    InputAreaChart.prototype.buildDataTable = function(cols, rows) {

        return new google.visualization.DataTable({cols: cols, rows: mapRows(rows)});
    };

    InputAreaChart.prototype.buildOptions = function(dataTable) {
        var options = {
            chartArea: { left: 35, top: 10, height: this.height - 30, width: '96%'},
            height: this.height,
            hAxis: {
                gridlines: { count: -1 },
                viewWindow: { }
            },
            theme: 'material'
        };

        options.series = {
            0: { targetAxisIndex: 0 },
            1: { targetAxisIndex: 0 },
            2: { targetAxisIndex: 0 },
            3: { targetAxisIndex: 1 },
            4: { targetAxisIndex: 0 },
            vAxes: {
                1: { textPosition: 'in' }
            }
        };

        return options
    };

    // Exports
    global.Monitor = M;
    global.InputAreaChart = InputAreaChart;
})(window);
