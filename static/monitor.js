
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

    function defaultOptions(dataTable, height, isMaterial) {
        var options = {
            chartArea: { left: 35, top: 10, height: height - 30, width: '96%'},
            height: height,
            hAxis: {
                gridlines: { count: -1 },
                viewWindow: { }
            }
        };

        if (!isMaterial) {
            options.theme = 'material';
        }

        return options;
    }

    /**
     * Creates the configuration options for displaying glucose values in a Highcharts line graph
     *
     * http://api.highcharts.com/highcharts
     */
    var GlucoseLineHighchart = function(actualGlucose, predictedGlucose, targetGlucose, displayUnit) {
        Highcharts.setOptions({
            chart: {
                style: {
                    fontFamily: '-apple-system, sans-serif'
                }
            }
        });

        this.options = {
            chart: {
                type: 'line'
            },
            legend: {
                enabled: false
            },
            title: {
                text: null
            },
            xAxis: {
                gridLineWidth: 1,
                minTickInterval: 60*60*1000,
                tickWidth: 0,
                type: 'datetime',
                labels: {
                    format: "{value:%l %p}"
                }
            },
            yAxis: {
                startOnTick: true,
                endOnTick: true,
                title: null
            },
            series: [
                {
                    data: actualGlucose,
                    lineWidth: 1,
                    marker: {
                        enabled: true,
                        lineColor: Highcharts.getOptions().colors[0],
                        states: {
                            hover: {
                                enabled: false,
                                radius: 0
                            }
                        }
                    },
                    name: "Glucose",
                },
                {
                    color: Highcharts.getOptions().colors[0],
                    data: predictedGlucose,
                    dashStyle: "Dash",
                    marker: {
                        enabled: false
                    },
                    name: "Predicted",
                    states: {
                        hover: {
                            marker: {
                                enabled: false,
                                radius: 0
                            }
                        }
                    }
                },
                {
                    color: Highcharts.getOptions().colors[0],
                    data: targetGlucose,
                    fillOpacity: 0.3,
                    lineWidth: 0,
                    linkedTo: ':previous',
                    name: 'Targets',
                    type: 'arearange',
                    zIndex: 0
                }
            ],
            tooltip: {
                shared: true,
                valueDecimals: 0,
                valueSuffix: ' ' + displayUnit,
                xDateFormat: "%l:%M %p"
            }
        }
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
        var options = defaultOptions(dataTable, this.height);

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
    global.GlucoseLineHighchart = GlucoseLineHighchart;
    global.InputAreaChart = InputAreaChart;
})(window);
