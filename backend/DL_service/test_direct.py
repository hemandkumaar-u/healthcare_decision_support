import sys
import os
import json
import argparse
sys.path.append(os.getcwd())

from app import predict_risk

def main():
    parser = argparse.ArgumentParser(description="Test DL risk prediction locally.")
    parser.add_argument("--age", type=int, default=45, help="Patient age")
    parser.add_argument("--hr", type=int, default=110, help="Heart rate")
    parser.add_argument("--bp-sys", type=int, default=140, help="Systolic BP")
    parser.add_argument("--bp-dia", type=int, default=90, help="Diastolic BP")
    parser.add_argument("--temp", type=float, default=38.5, help="Temperature")
    parser.add_argument("--spo2", type=int, default=92, help="SpO2")
    parser.add_argument("--rr", type=int, default=22, help="Respiratory Rate")
    parser.add_argument("--condition", type=str, default="general", help="Patient condition")
    
    args = parser.parse_args()
    
    patient_data = {
        "age": args.age,
        "condition": args.condition,
        "vitalSigns": json.dumps({
            "HR": args.hr,
            "BP_SYS": args.bp_sys,
            "BP_DIA": args.bp_dia,
            "TEMP": args.temp,
            "SPO2": args.spo2,
            "RR": args.rr
        })
    }
    
    print("Testing with payload:")
    print(json.dumps(patient_data, indent=2))
    print("\nResult:")
    print(json.dumps(predict_risk(patient_data), indent=2))

if __name__ == "__main__":
    main()
