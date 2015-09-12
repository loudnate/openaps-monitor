# coding=utf-8
from dateutil.parser import parse

# How to convert from mg/dL (US format) to mmol/L (non-US format)
MMOLL_CONVERT_FACTOR = 1.0 / 18.0

def glucose_row(date, amount, targets, display_unit, predicted=False):
    assert(display_unit in ['mmol/L', 'mg/dL'])

    time = parse(date).time()
    target = targets.at(time)

    title = 'Predicted: ' if predicted else ''

    if display_unit == 'mmol/L':
        amount = amount * MMOLL_CONVERT_FACTOR
        format_string = '{} – {}{:.1f} {}'
    else:
        format_string = '{} – {}{:.0f} {}'

    return {'c': [
        {'v': date},
        {'v': amount},
        {'v': not predicted},
        {'v': target.get('low')},
        {'v': target.get('high')},
        {'v': format_string.format(time.strftime('%I:%M %p'), title, amount, display_unit)}
    ]}


def glucose_line_chart(recent_glucose, predicted_glucose, targets, display_unit):
    # https://developers.google.com/chart/interactive/docs/reference#dataparam

    cols = [{'type': 'date', 'label': 'Date'}]
    rows = []

    if recent_glucose is not None:
        cols.extend([
            {'type': 'number', 'label': 'Glucose'},
            {'type': 'boolean', 'label': 'Glucose Certainty', 'role': 'certainty'},
            {'id': 'rangeMin', 'type': 'number', 'role': 'interval'},
            {'id': 'rangeMax', 'type': 'number', 'role': 'interval'},
            {'type': 'string', 'role': 'tooltip'}
        ])

        for entry in reversed(recent_glucose):
            glucose = entry.get('sgv') or entry.get('amount') or entry.get('glucose')
            if not glucose:
                continue

            rows.append(glucose_row(
                entry.get('date') or entry['display_time'],
                glucose,
                targets,
                display_unit
            ))

        for entry in predicted_glucose[1:]:
            rows.append(glucose_row(entry['date'], entry['glucose'], targets, display_unit, 'Predicted: '))

    return cols, rows


def input_history_area_chart(normalized_history, display_unit):
    assert(display_unit in ['mmol/L', 'mg/dL'])

    cols = [{'type': 'date', 'label': 'Date'}]
    rows = []

    if normalized_history is not None:
        cols.extend([
            {'type': 'number', 'label': 'Basal Insulin'},
            {'type': 'string', 'role': 'tooltip'},
            {'type': 'number', 'label': 'Bolus Insulin'},
            {'type': 'string', 'role': 'tooltip'},
            {'type': 'number', 'label': 'Bolus Insulin'},
            {'type': 'string', 'role': 'tooltip'},
            {'type': 'number', 'label': 'Meal carbs'},
            {'type': 'string', 'role': 'tooltip'}
        ])

        for entry in normalized_history:
            for i in range(4):
                key = 'start_at' if i < 2 else 'end_at'
                tooltip = '{} – {}'.format(
                    parse(entry[key]).time().strftime('%I:%M %p'),
                    entry['description']
                )

                if i == 1:
                    amount = entry['amount']
                elif i == 2:
                    amount = entry['amount'] if entry['start_at'] != entry['end_at'] else 0
                else:
                    amount = None
                    tooltip = ''

                if amount and display_unit == 'mmol/L':
                    amount = amount * MMOLL_CONVERT_FACTOR

                values = [None] * 4

                if entry['type'] == 'TempBasal':
                    values[0] = amount
                elif entry['unit'] == 'U/hour':
                    values[1] = amount
                elif entry['type'] == 'Bolus':
                    values[2] = amount
                elif entry['type'] == 'Meal':
                    values[3] = amount

                rows.append({'c': [
                    {'v': entry[key]},
                    {'v': values[0]},
                    {'v': tooltip},
                    {'v': values[1]},
                    {'v': tooltip},
                    {'v': values[2]},
                    {'v': tooltip},
                    {'v': values[3]},
                    {'v': tooltip}
                ]})

    return cols, rows
