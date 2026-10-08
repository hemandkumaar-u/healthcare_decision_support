import urllib.request
import json

data = json.dumps({
    "age": 45,
    "vitalSigns": json.dumps({
        "HR": 110,
        "BP_SYS": 140,
        "BP_DIA": 90,
        "TEMP": 38.5,
        "SPO2": 92,
        "RR": 22
    })
}).encode("utf-8")

req = urllib.request.Request("http://localhost:8000/predict", data=data, headers={"Content-Type": "application/json"})
response = urllib.request.urlopen(req)
print(response.read().decode("utf-8"))
