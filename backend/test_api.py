import urllib.request
import json
import argparse

def main():
    parser = argparse.ArgumentParser(description="Test DL risk prediction API.")
    parser.add_argument("--age", type=int, default=45, help="Patient age")
    parser.add_argument("--hr", type=int, default=110, help="Heart rate")
    parser.add_argument("--bp-sys", type=int, default=140, help="Systolic BP")
    parser.add_argument("--bp-dia", type=int, default=90, help="Diastolic BP")
    parser.add_argument("--temp", type=float, default=38.5, help="Temperature")
    parser.add_argument("--spo2", type=int, default=92, help="SpO2")
    parser.add_argument("--rr", type=int, default=22, help="Respiratory Rate")
    parser.add_argument("--condition", type=str, default="general", help="Patient condition")
    
    args = parser.parse_args()
    
    payload = {
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
    
    data = json.dumps(payload).encode("utf-8")
    
    print("Testing API with payload:")
    print(json.dumps(payload, indent=2))
    
    req = urllib.request.Request("http://localhost:8000/predict", data=data, headers={"Content-Type": "application/json"})
    
    try:
        response = urllib.request.urlopen(req)
        print("\nAPI Response:")
        print(json.dumps(json.loads(response.read().decode("utf-8")), indent=2))
    except Exception as e:
        print("\nError calling API:", e)

if __name__ == "__main__":
    main()
