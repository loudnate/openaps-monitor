# coding=utf-8
"""
Munges data into formats appropriate for Highcharts usage

http://api.highcharts.com/highcharts
"""

from dateutil.parser import parse


def glucose_line_chart(glucose):
    rows = []
    
    for entry in glucose:
        date = entry.get('date') or entry['display_time']
        glucose = entry.get('sgv') or entry.get('amount') or entry.get('glucose')
    
        rows.append({
            'x': date,
            'y': glucose
        })
    
    return rows
