import requests

f = open("api_key.txt", "r")
token = f.read()

headers = {
    "Authorization": "Bearer %s" % token,
}


def update_light_power(is_on):
    # is_on: Boolean controlling light power.
    # a light set to 'off' will not emit light regardless of power, but can still receive updates
    payload = {
        "power": {True:"on", False:"off"}.get(is_on, "off")
    }

    response = requests.put('https://api.lifx.com/v1/lights/all/state', data=payload, headers=headers)
    print("updating power setting to", is_on)
    print(response,response.json())
    return response


def cycle_states():
    # doesn't work.
    payload = {
        "states": [{
                "brightness": 1.0
            },
            {
                "brightness": 0.5
            },
            {
                "brightness": 0.1
            },
            {
                "power": "off"
            }
        ],
        "defaults": {
            "power": "on",
            "saturation": 0,
            "duration": 2.0
        }
    }
    
    response = requests.post('https://api.lifx.com/v1/lights/all/cycle', data=payload, headers=headers)
    print("cycling next state...")
    print(response,response.json())
    return response


def update_temperature(temperature):
    # set temperature, given in kelvin.
    # doing so sets saturation to 0.0, effectively clearing any colour values
    payload = {
        "color": f"kelvin:{temperature}"
    }

    response = requests.put('https://api.lifx.com/v1/lights/all/state', data=payload, headers=headers)
    print("updating temperature...")
    print(response,response.json())
    return response


def update_colour(rgb_hex, brightness, duration):
    # set a state. format: hue, saturation, and brightness
    # duration: transition time in seconds
    # brightness: light brightness from 0..1
    
    payload = {
        "color": rgb_hex,
        "brightness": brightness,
        "duration": duration,
        "infrared": 0
    }
    response = requests.put('https://api.lifx.com/v1/lights/all/state', data=payload, headers=headers)
    print("updating colour...")
    print(response,response.json())
    return response


update_light_power(True)
update_colour("pink", 1.0, 0.5)
