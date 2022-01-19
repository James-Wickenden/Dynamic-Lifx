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
    return response


def set_state(brightness):
    # set a state. format: hue, saturation, kelvin, and brightness
    payload = {
        "brightness": brightness
    }

    response = requests.put('https://api.lifx.com/v1/lights/all/state', data=payload, headers=headers)
    return response

response = update_light_power(True)

print(response)
print(response.json())
