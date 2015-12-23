# coding=utf-8
"""
System settings:

Please note that Filenames containing report data are relative to the openaps path
"""


class Settings(object):

    # What glucose measurement scale should we use. Use 'mg/dL' for most of the world, 'mmol/L' for the UK and
    # ex-UK colonies (e.g. South Africa, Australia).
    #
    #  - If your pump displays units like '100' and '110', this should be 'mg/dL'
    #  - If your pump displays units like '5.5' and '7', this should be 'mmol/L'
    #
    DISPLAY_UNIT = 'mg/dL'

    # A report containing glucose data in reverse-chronological order. Each entry should contain both a local timestamp
    # and a glucose value:
    # {
    #   "date" | "display_time" : "<ISO date string>",
    #   "sgv" | "amount" | "glucose" : 100
    # }
    CLEAN_GLUCOSE = 'clean_glucose.json'

    # A report containing COB levels in chronological order. Each entry should contain a local timestamp and a COB value:
    # {
    #   "date": "<ISO date string>",
    #   "amount": 12.0
    #   "unit": "g"
    # }
    COB = 'cob.json'

    # A report containing IOB levels in chronological order. Each entry should contain a local timestamp and an IOB value:
    # {
    #   "date": "<ISO date string>",
    #   "amount": 1.0
    #   "unit": "U"
    # }
    IOB = 'iob_with_dose.json'

    # A report containing history data in reverse-chronological order. Each entry should be in the dictionary format as
    # defined by openapscontrib.mmhistorytools, and should be fully munged by those steps for best display.
    NORMALIZE_HISTORY = 'normalize_history_and_dose.json'

    # A report containing predicted glucose values in chronological order. Each entry should contain a local timestamp
    # and a glucose value:
    # {
    #   "date": "<ISO date string>",
    #   "ammount": 100,
    #   "unit": "mg/dL"
    # }
    PREDICT_GLUCOSE = 'predict_glucose_with_dose.json'
    
    # A report containing predicted glucose values prior to added dose in chronological order. Each entry should contain a local timestamp
    # and a glucose value:
    # {
    #   "date": "<ISO date string>",
    #   "ammount": 100,
    #   "unit": "mg/dL"
    # }
    PREDICT_GLUCOSE_WITHOUT_DOSE = 'predict_glucose_from_reservoir_and_dose.json'

    # A report containing the output of the openaps medtronic vendor command "read_bg_targets".
    READ_BG_TARGETS = 'read_bg_targets.json'

