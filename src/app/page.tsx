"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
//import { Client } from "@stomp/stompjs";
import Link from "next/link";

interface Booking {
  isSuccess: boolean;
  user:  { userId: string };
}

interface ParkingSpot {
  id: string;
  available: boolean;
  parkingZone: string;
  durations: TimeSlot[];
}

interface TimeSlot {
  duration: string;
  available: boolean;
  booking: Booking | null;
}

export default function Home() {
  const [checked, setChecked] = useState(false);
  const [checked2, setChecked2] = useState(false);

  const router = useRouter();
  useEffect(() => {
    if (checked) router.push("/playground");
  }, [checked, router]);
  useEffect(() => {
    if (checked2) router.push("/test");
  }, [checked2, router]);

  const [availableSpot, setAvailableSpot] = useState<ParkingSpot[] | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const searchAvailableParking = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/all`);
        const sorted = res.data.sort((a: ParkingSpot, b: ParkingSpot) =>
          a.id.localeCompare(b.id)
        );
        setAvailableSpot(sorted);
      } catch (err) {
        console.error("Search failed", err);
      }
    };

    searchAvailableParking();
  }, [BASE_URL]);

  console.log("Available spots: ", JSON.stringify(availableSpot));
  return (
    <>
      <main className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="absolute top-4 left-4 flex flex-col gap-4 z-50">
          {/* Playground toggle */}
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={checked}
              onChange={() => setChecked(!checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 relative transition-colors">
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-full" />
            </div>
            <span className="ml-3 text-sm font-medium text-white">
              Playground
            </span>
          </label>

          {/* Enter/Exit toggle */}
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={checked2}
              onChange={() => setChecked2(!checked2)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-700 peer-checked2:bg-blue-600 relative transition-colors">
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-full" />
            </div>
            <span className="ml-3 text-sm font-medium text-white">
              Enter/Exit
            </span>
          </label>
        </div>

        <div className="flex flex-col w-full justify-center items-center space-y-6 mt-10">
          {availableSpot && availableSpot.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6">
              {Object.entries(
                availableSpot.reduce(
                  (acc: Record<string, ParkingSpot[]>, spot: ParkingSpot) => {
                    if (!acc[spot.parkingZone]) {
                      acc[spot.parkingZone] = [];
                    }
                    acc[spot.parkingZone].push(spot);
                    return acc;
                  },
                  {}
                )
              ).map(([zone, spots]) => (
                <div key={zone} className="bg-white p-5 rounded-lg shadow-md">
                  <h2 className="text-lg font-semibold text-blue-500 text-center mb-2">
                    {zone}
                  </h2>
                  <ul className="grid grid-cols-2 gap-3 text-black">
                    {spots.map((spot: ParkingSpot) => (
                      <Link
                        href={`/spot/${spot.id}`}
                        key={spot.id}
                        className={`p-3 rounded-md border text-center font-medium hover:shadow-md ${
                          spot.available
                            ? "bg-green-200 border-green-200"
                            : "bg-red-200 border-red-200"
                        }`}
                      >
                        <div className="font-bold">{spot.id}</div>
                        <div className="text-sm">
                          {spot.available ? "Available" : "Full"}
                        </div>
                      </Link>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
