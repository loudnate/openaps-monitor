# openaps-monitor
Status dashboard for your openaps project

_This README is a work-in-progress_

## Installing

Check out the source using git:
```
$ git clone git@github.com:loudnate/openaps-monitor.git
```
Install the required python packages:
```
$ cd openaps-monitor
$ pip install -r requirements.txt
```

## Initial setup
The first time you run the server, it will need to cache some third-party assets, so make sure your machine is connected to the internet.

The server takes one argument, which is the path to your [openaps](https://github.com/openaps/openaps) project:
```
$ python monitor.py ../myopenaps
```

From a web browser, check that the server is running by entering the hostname of your machine in the address bar, followed by the port number.
* `http://myraspberrypi.local:5000`

## Customizing the monitor to graph report data

If you'd like to graph your report data, you can set the path names of your reports in the `Settings` class.
_TODO: This should probably be moved to a separate python file, maybe also a subclass?_

```python
class Settings(object):
    """Defines file names relative to the openaps path containing report data to display"""

    # A report containing glucose data in reverse-chronological order. Each entry should contain both a local timestamp
    # and a glucose value:
    # {
    #   "date" | "display_time" : "<ISO date string>",
    #   "sgv" | "amount" | "glucose" : 100
    # }
    CLEAN_GLUCOSE = 'clean_glucose.json'

    # A report containing history data in reverse-chronological order. Each entry should be in the dictionary format as
    # defined by openapscontrib.mmhistorytools, and should be fully munged by those steps for best display.
    NORMALIZE_HISTORY = 'normalize_history.json'

    # A report containing predicted glucose values in chronological order. Each entry should contain a local timestamp
    # and a glucose value:
    # {
    #   "date": "<ISO date string>",
    #   "glucose": 100
    # }
    PREDICT_GLUCOSE = 'predict_glucose.json'

    # A report containing the output of the openaps medtronic vendor command "read_bg_targets".
    READ_BG_TARGETS = 'read_bg_targets.json'

    # A report containing the last-applied doses, if not yet present in `NORMALIZE_HISTORY`.
    SET_DOSE = 'set_dose.json'
```

## Running the monitor server on machine startup
There are multiple ways to run the server automatically on startup. Advanced users might look into `supervisord`.

Here's a script to launch the server in a [screen](http://ss64.com/bash/screen.html) session, which you can access from a shell at various times without having to keep shell window open.

###### start-monitor.sh
```
cd /home/pi/src/openaps-monitor
screen -d -A -S monitor -m python monitor.py ../myopenaps
cd -
```

You can run that script using cron's `@reboot` directive, ignoring the output if you don't want to see an email about it.

###### crontab -e
```
@reboot              /home/pi/start-monitor.sh > /dev/null
```
