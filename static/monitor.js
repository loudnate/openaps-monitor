
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
     *
     * @param {!Object} cols
     * @param {!Object} rows
     * @param {!HTMLElement} element
     * @param {boolean=} isMaterial
     * @constructor
     */
    var GlucoseLineChart = function(cols, rows, element, isMaterial, display_unit) {
        this.height = parseInt(getComputedStyle(element)['height']);

        this.dataTable = this.buildDataTable(cols, rows);
        this.options = this.buildOptions(this.dataTable, isMaterial, display_unit);
        var chartConstructor = isMaterial ? google.charts.Line : google.visualization.LineChart;

        this.chart = new chartConstructor(element);
    };

    GlucoseLineChart.prototype.draw = function() {
        this.chart.draw(this.dataTable, this.options);
    };

    GlucoseLineChart.prototype.buildDataTable = function(cols, rows) {
        return new google.visualization.DataTable({cols: cols, rows: mapRows(rows)});
    };

    GlucoseLineChart.prototype.buildOptions = function(dataTable, isMaterial, display_unit) {
        var options = defaultOptions(dataTable, this.height, isMaterial);

        options.curveType = 'function';
        options.interval = {};
        options.intervals = { 'style': 'area' };
        options.titlePosition = 'in';

        if (display_unit == 'mmol/L') {
          options.vAxis = { minValue: 4 };
        } else {
          options.vAxis = { minValue: 70 };
        }

        if (isMaterial) {
            options = google.charts.Line.convertOptions(options);
        }

        return options;
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
            vAxes: {
                1: { textPosition: 'in' }
            }
        };

        return options
    };

    // Exports
    global.GlucoseLineChart = GlucoseLineChart;
    global.InputAreaChart = InputAreaChart;
})(window);
