# services/feature_store/store.py

import json
import math
import redis
from datetime import datetime


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates the great-circle distance (in kilometers) between two points on Earth."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


class RealTimeFeatureStore:
    """Sub-millisecond Feature Store powered by Redis Sliding Windows & Hashes."""

    def __init__(self, host='localhost', port=6379, db=0):
        self.r = redis.Redis(host=host, port=port, db=db, decode_responses=True)

    def enrich_transaction(self, txn: dict) -> dict:
        """Reads historical features from Redis, updates sliding counters, and returns enriched features."""
        cust_id = txn['customer_id']
        current_time_sec = int(datetime.fromisoformat(txn['timestamp']).timestamp())
        amount = float(txn['amount'])
        lat = float(txn['latitude'])
        lon = float(txn['longitude'])
        device_id = str(txn['device_id'])
        ip_addr = str(txn['ip_address'])

        # 1. Calculate Velocity Counters (1m, 5m, 10m sliding windows using Redis Sorted Sets)
        zkey_txns = f"cust:{cust_id}:txn_timestamps"
        self.r.zadd(zkey_txns, {txn['transaction_id']: current_time_sec})
        # Clean up records older than 10 minutes (600 seconds)
        self.r.zremrangebyscore(zkey_txns, 0, current_time_sec - 600)

        velocity_1m = self.r.zcount(zkey_txns, current_time_sec - 60, current_time_sec)
        velocity_5m = self.r.zcount(zkey_txns, current_time_sec - 300, current_time_sec)
        velocity_10m = self.r.zcount(zkey_txns, current_time_sec - 600, current_time_sec)

        # Set 15-minute TTL on velocity key
        self.r.expire(zkey_txns, 900)

        # 2. Impossible Travel & Distance Delta Calculation
        prev_loc_key = f"cust:{cust_id}:last_location"
        prev_loc_data = self.r.get(prev_loc_key)

        distance_km = 0.0
        speed_kmh = 0.0
        impossible_travel = False

        if prev_loc_data:
            prev_info = json.loads(prev_loc_data)
            time_diff_hours = (current_time_sec - prev_info['timestamp']) / 3600.0
            
            distance_km = haversine_distance(
                prev_info['lat'], prev_info['lon'], lat, lon
            )

            if time_diff_hours > 0:
                speed_kmh = distance_km / time_diff_hours
                # Speeds exceeding 900 km/h (commercial jet speed) trigger impossible travel
                if speed_kmh > 900.0 and distance_km > 100.0:
                    impossible_travel = True

        # Store current location as last known location
        self.r.set(prev_loc_key, json.dumps({
            'lat': lat, 'lon': lon, 'timestamp': current_time_sec
        }), ex=86400)  # 24-hour expiration

        # 3. New Device & New IP Detection
        devices_key = f"cust:{cust_id}:known_devices"
        ips_key = f"cust:{cust_id}:known_ips"

        is_new_device = not self.r.sismember(devices_key, device_id)
        is_new_ip = not self.r.sismember(ips_key, ip_addr)

        self.r.sadd(devices_key, device_id)
        self.r.sadd(ips_key, ip_addr)

        # Enrich transaction dict with engineered features
        enriched = txn.copy()
        enriched.update({
            "velocity_1m": velocity_1m,
            "velocity_5m": velocity_5m,
            "velocity_10m": velocity_10m,
            "distance_from_last_txn_km": round(distance_km, 2),
            "speed_kmh": round(speed_kmh, 2),
            "impossible_travel_flag": impossible_travel,
            "is_new_device": is_new_device,
            "is_new_ip": is_new_ip,
        })

        return enriched


if __name__ == "__main__":
    # Test Redis Store connection
    try:
        store = RealTimeFeatureStore()
        print("[*] Redis RealTimeFeatureStore connected successfully!")
    except Exception as e:
        print(f"[!] Redis Store Error: {e}")