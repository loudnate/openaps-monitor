# coding=utf-8
"""
Cleans up Units of measurement for graphing

"""

from openaps_reports import Settings

def fix_units(list):
    MMOLL_CONVERT_FACTOR = 18.0

    if Settings.DISPLAY_UNIT == 'mmol/L':
        for idx in range(0, len(list)):
            # Recent Glucose:
            if 'sgv' in list[idx]:
                list[idx]['sgv'] = list[idx]['sgv'] / MMOLL_CONVERT_FACTOR

            # Predicted Glucose:
            #    - "amount": 134.71313969351854, "unit": "mg/dL"
            #  or
            #    - "amount": 134.71313969351854 (and no unit supplied)
            if 'amount' in list[idx]:
                if ('unit' not in list[idx]) or (list[idx]['unit'] == 'mg/dL'):
                    list[idx]['amount'] = list[idx]['amount'] / MMOLL_CONVERT_FACTOR

    return list
