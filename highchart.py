# coding=utf-8
"""
Munges data into formats appropriate for Highcharts usage

http://api.highcharts.com/highcharts
"""
from datetime import datetime
from dateutil.parser import parse


def timestamp(a_datetime):
    return int((a_datetime - datetime(1970,1,1)).total_seconds()) * 1000


def glucose_line_chart(glucose):
    rows = []
    
    for entry in glucose:
        date = entry.get('date') or entry['display_time']
        glucose = entry.get('sgv') or entry.get('amount') or entry.get('glucose')
    
        rows.append({
            'x': timestamp(parse(date)),
            'y': glucose
        })
    
    return rows


def glucose_target_range_chart(targets, start_datetime, end_datetime):
    rows = []

    start_time = datetime.fromtimestamp(start_datetime / 1000).time()
    end_time = datetime.fromtimestamp(end_datetime / 1000).time()

    start_target = targets.at(start_time)

    # TODO: Parse multiple targets

    end_target = targets.at(end_time)
    rows.append({
        'x': start_datetime,
        'low': end_target['low'],
        'high': end_target['high']
    })
    rows.append({
        'x': end_datetime,
        'low': end_target['low'],
        'high': end_target['high']
    })

    return rows
