# coding=utf-8
"""
Munges data into formats appropriate for Highcharts usage

http://api.highcharts.com/highcharts
"""
from datetime import datetime
from datetime import time
from dateutil.parser import parse
from dateutil.relativedelta import relativedelta
from itertools import chain


def timestamp(a_datetime):
    return int((a_datetime - datetime(1970,1,1)).total_seconds()) * 1000


def glucose_data_tuple(entry):
    return (
        entry.get('dateString') or entry.get('display_time') or entry['date'],
        entry.get('sgv', entry.get('amount', entry.get('glucose')))
    )


def line_chart(entries, name=''):
    rows = []
    
    for entry in entries:
        date, amount = glucose_data_tuple(entry)
    
        rows.append({
            'x': timestamp(parse(date)),
            'y': amount,
            'name': name
        })
    
    return rows


def next_datetime_after_datetime(start_datetime, with_time):
    """

    :param start_datetime:
    :type start_datetime: datetime
    :param with_time:
    :type with_time: time
    """
    start_date = start_datetime.date()
    start_time = start_datetime.timetz()
    next_datetime = datetime.combine(start_date, with_time)

    if start_time > with_time:
        next_datetime += relativedelta(days=+1)

    return next_datetime


def glucose_target_range_chart(targets, *args):
    rows = []

    start_timestamp = None
    end_timestamp = None
    
    for entry in chain(*args):
        date, _ = glucose_data_tuple(entry)
        if start_timestamp is None or date < start_timestamp:
            start_timestamp = date
        
        if end_timestamp is None or date > end_timestamp:
            end_timestamp = date

    if start_timestamp is not None and end_timestamp is not None:
        start_datetime = parse(start_timestamp)
        end_datetime = parse(end_timestamp)
    
        start_time = start_datetime.timetz()
        end_time = end_datetime.timetz()
        targets = targets.between(start_time, end_time)
    
        if len(targets) > 0:
            rows.append({
                'x': timestamp(start_datetime),
                'low': targets[0]['low'],
                'high': targets[0]['high']
            })

            for target in targets[1:]:
                target_time = parse(target['start']).timetz()

                rows.append({
                    'x': timestamp(next_datetime_after_datetime(start_datetime, target_time)),
                    'low': target['low'],
                    'high': target['high']
                })

            rows.append({
                'x': timestamp(end_datetime),
                'low': targets[-1]['low'],
                'high': targets[-1]['high']
            })

    return rows


def input_history_area_chart(normalized_history):
    basal = []
    bolus = []
    square = []
    carbs = []

    for entry in normalized_history:
        if entry['unit'] == 'U/hour':
            values = [
                {
                    'x': timestamp(parse(entry['start_at'])),
                    'y': entry['amount'],
                    'name': entry['description']
                },
                {
                    'x': timestamp(parse(entry['end_at'])),
                    'y': entry['amount'],
                    'name': entry['description']
                },
                {
                    'x': timestamp(parse(entry['end_at'])),
                    'y': None
                }
            ]

            if entry['type'] == 'TempBasal':
                basal += values
            else:
                square += values
        elif entry['unit'] == 'U':
            bolus += [
                {
                    'x': timestamp(parse(entry['start_at'])),
                    'y': entry['amount'],
                    'name': entry['description']
                },
                {
                    'x': timestamp(parse(entry['end_at'])),
                    'y': None
                },
            ]
        elif entry['unit'] == 'g':
            carbs += [
                {
                    'x': timestamp(parse(entry['start_at'])),
                    'y': entry['amount'],
                    'name': entry['description']
                },
                {
                    'x': timestamp(parse(entry['end_at'])),
                    'y': None
                },
            ]

    return basal, bolus, square, carbs
