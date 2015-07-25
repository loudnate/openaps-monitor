"""
Interface for openaps reports

"""
from datetime import datetime
from glob import glob
import json
import os


class ReportFile(object):
    CLEAN_GLUCOSE = 'clean_glucose.json'
    NORMALIZE_HISTORY = 'normalize_history.json'
    PREDICT_GLUCOSE = 'predict_glucose.json'
    READ_BG_TARGETS = 'read_bg_targets.json'
    SET_DOSE = 'set_dose.json'


class OpenAPS(object):
    def __init__(self, path):
        self.path = path
        self.name = os.path.basename(path)

    # Filesystem utils ####################

    def _all_files(self):
        for f in sorted(glob('{}/*.json'.format(self.path)), key=os.path.getmtime, reverse=True):
            yield f

        for f in glob('{}/*.ini'.format(self.path)):
            yield f

    def all_filenames(self):
        for f in self._all_files():
            yield os.path.basename(f)

    def all_filenames_and_data(self):
        for f in self._all_files():
            with open(f) as fp:
                yield os.path.basename(f), datetime.fromtimestamp(os.path.getmtime(f)), fp.read()

    def _get_report_path(self, report_filename):
        return os.path.join(self.path, report_filename)

    def _read_json(self, filename, default=None):
        try:
            with open(self._get_report_path(filename)) as fp:
                return json.load(fp)
        except ValueError:
            return default

    # Reports #############################

    def read_bg_targets(self):
        return self._read_json(ReportFile.READ_BG_TARGETS, {})

    def predicted_glucose(self):
        return self._read_json(ReportFile.PREDICT_GLUCOSE, [])

    def recent_glucose(self):
        return self._read_json(ReportFile.CLEAN_GLUCOSE, [])

    def normalized_history(self):
        return self._read_json(ReportFile.NORMALIZE_HISTORY, [])

    def recent_dose(self):
        set_dose_timestamp = os.path.getmtime(self._get_report_path(ReportFile.SET_DOSE))
        history_timestamp = os.path.getmtime(self._get_report_path(ReportFile.NORMALIZE_HISTORY))

        if set_dose_timestamp > history_timestamp:
            return self._read_json(ReportFile.SET_DOSE, [])

        return []
