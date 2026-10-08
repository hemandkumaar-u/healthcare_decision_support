import sys
import os
sys.path.append(os.getcwd())

from app import predict_risk

print(predict_risk({
    "age": 45,
    "vitalSigns": '{"HR": 110, "BP_SYS": 140, "BP_DIA": 90, "TEMP": 38.5, "SPO2": 92, "RR": 22}'
}))
