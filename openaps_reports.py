"""
Interface for openaps reports

"""
from datetime import datetime
from glob import glob
import json
import os

from settings import Settings

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
        except (IOError, ValueError):
            return default

    # Reports #############################

    def read_bg_targets(self):
        return self._read_json(Settings.READ_BG_TARGETS, {'targets': []})

    def predicted_glucose(self):
        return self._read_json(Settings.PREDICT_GLUCOSE, [])

    def recent_glucose(self):
        return self._read_json(Settings.CLEAN_GLUCOSE, [])

    def normalized_history(self):
        return self._read_json(Settings.NORMALIZE_HISTORY, [])

    def iob(self):
        return self._read_json(Settings.IOB, [])
