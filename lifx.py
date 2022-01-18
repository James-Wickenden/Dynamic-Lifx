import requests

f = open("api_key.txt", "r")
token = f.read()

headers = {
    "Authorization": "Bearer %s" % token,
}

payload = {
    "power": "off",
}

response = requests.put('https://api.lifx.com/v1/lights/all/state', data=payload, headers=headers)
print(response.json())