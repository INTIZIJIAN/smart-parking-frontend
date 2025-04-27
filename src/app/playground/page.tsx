"use client";

import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import toast from "react-hot-toast";
import { BASE_URL } from "@/app/util/url";
import qs from "qs";
import Link from "next/link";

interface Booking {
  isSuccess: boolean;
  user: { userId: string };
}

interface TimeSlot {
  duration: string;
  available: boolean;
  booking: Booking | null;
}

interface ParkingSpot {
  id: string;
  available: boolean;
  parkingZone: string;
  durations: TimeSlot[];
}

export default function Concurrent() {
  const id = "ZONE-C-SPOT-10";

  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [spot2, setSpot2] = useState<ParkingSpot | null>(null);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const client = useRef<Client | null>(null);
  const [userId, setUserId] = useState("");
  const [userIdB, setUserIdB] = useState("");

  // console.log("Spot ID:", id);
  // console.log("Spot Data:", spot);
  // console.log("Selected Durations:", selectedDurations);
  // console.log("User ID:", userId);

  useEffect(() => {
    async function fetchSpot() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/all`);
        const filteredSpots = res.data.filter(
          (spot: ParkingSpot) => spot.id === id
        );
        setSpot(filteredSpots[0] ?? null);
        setSpot2(filteredSpots[0] ?? null);
      } catch (error) {
        console.error("Failed to fetch spot", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSpot();
  });

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    client.current = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("Connected to WebSocket");
        client.current?.subscribe("/topic/parking", (message) => {
          const update = JSON.parse(message.body);
          console.log("Received parking update:", update);
          setSpot(update);
        });
      },
    });

    client.current.activate();

    return () => {
      if (client.current) client.current.deactivate();
    };
  }, []);

  const reserveSpotConcurrently = async () => {
    try {
      // Fire both requests *simultaneously*, without awaiting first
      const reqA = axios.post(`${BASE_URL}/reserve`, null, {
        params: {
          userId: userId,
          spotId: id,
          selectedDurations: selectedDurations,
        },
        paramsSerializer: (params) =>
          qs.stringify(params, { arrayFormat: "repeat" }),
      });
  
      const reqB = axios.post(`${BASE_URL}/reserve`, null, {
        params: {
          userId: userIdB,
          spotId: id,
          selectedDurations: selectedDurations,
        },
        paramsSerializer: (params) =>
          qs.stringify(params, { arrayFormat: "repeat" }),
      });
  
      // Wait for both at the same time
      const [resA, resB] = await Promise.allSettled([reqA, reqB]);
  
      // Handle A
      if (resA.status === "fulfilled" && resA.value.status === 200) {
        toast.success(`🚗 ${userId} reserved successfully!`, { duration: 3000 });
      } else {
        toast.error(`❌ ${userId} failed to reserve.`, { duration: 3000 });
      }
  
      // Handle B
      if (resB.status === "fulfilled" && resB.value.status === 200) {
        toast.success(`🚗 ${userIdB} reserved successfully!`, { duration: 3000 });
      } else {
        toast.error(`❌ ${userIdB} failed to reserve.`, { duration: 3000 });
      }
    } catch (err) {
      console.error("Reservation failed unexpectedly", err);
      toast.error("Something went wrong!", { duration: 3000 });
    }
  };

  // const bookSpot = async () => {
  //   try {
  //     const res = await axios.post(`${BASE_URL}/reserve`, null, {
  //       params: {
  //         userId: userId,
  //         spotId: id,
  //         selectedDurations: selectedDurations,
  //       },
  //       paramsSerializer: (params) =>
  //         qs.stringify(params, { arrayFormat: "repeat" }),
  //     });

  //     if (res.status === 200) {
  //       toast.success("Spot reserved successfully!");
  //     }
  //   } catch (error) {
  //     console.error("Failed to book spot", error);
  //     if (axios.isAxiosError(error)) {
  //       const errorMessage =
  //         typeof error.response?.data === "string"
  //           ? error.response.data
  //           : error.response?.data?.message || "Fully booked.";

  //       toast.error(errorMessage);
  //     } else {
  //       toast.error("An unexpected error occurred.");
  //     }
  //   }
  // };

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Loading spot information...
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="text-center mt-10 text-gray-500">Spot not found</div>
    );
  }

  const toggleDuration = (duration: string) => {
    setSelectedDurations((prev) =>
      prev.includes(duration)
        ? prev.filter((d) => d !== duration)
        : [...prev, duration]
    );
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <div className='absolute top-4 left-4 z-50">'>
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Home
        </Link>
      </div>
      <h1 className="text-4xl">Concurrent Reservation Demo</h1>
      <h1 className="text-2xl font-bold text-blue-600 mb-4">{spot.id}</h1>
  
      <div className="flex grid-cols-1 grid-rows-2 gap-x-105">
        <div className="grid grid-cols-2 gap-4">
          {spot.durations.map((slot, index) => (
            <div
              key={index}
              onClick={() => {
                if (slot.available) {
                  toggleDuration(slot.duration);
                }
              }}
              className={`p-3 rounded-lg border font-medium text-center cursor-pointer transition-all ${
                slot.available
                  ? selectedDurations.includes(slot.duration)
                    ? "bg-blue-300 border-blue-600" 
                    : "bg-green-200 border-green-500" // available
                  : "bg-red-200 border-red-500 cursor-not-allowed" // booked
              }`}
            >
              <p className="text-sm text-black font-bold">{slot.duration}</p>
              <p className="text-xs text-black">
                {slot.available ? "Available" : "Booked"}
              </p>
              <p className="text-sm text-blue-600">Reserved by: {slot.booking?.user.userId ? slot.booking?.user.userId : '****'}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {spot2?.durations.map((slot, index) => (
            <div
              key={index}
              onClick={() => {
                if (slot.available) {
                  toggleDuration(slot.duration);
                }
              }}
              className={`p-3 rounded-lg border font-medium text-center cursor-pointer transition-all ${
                slot.available
                  ? selectedDurations.includes(slot.duration)
                    ? "bg-blue-300 border-blue-600" // selected
                    : "bg-green-200 border-green-500" // available
                  : "bg-red-200 border-red-500 cursor-not-allowed" // booked
              }`}
            >
              <p className="text-sm text-black font-bold">{slot.duration}</p>
              <p className="text-xs text-black">
                {slot.available ? "Available" : "Booked"}
              </p>
              <p className="text-sm text-blue-600">Reserved by: {slot.booking?.user.userId ? slot.booking?.user.userId : '****'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3">
        <div className="w-auto bg-white rounded-2xl shadow-md p-6 space-y-6 m-8 justify-items-center">
          <h1 className="text-xl font-bold text-center text-blue-600">
            Smart Parking (User A)
          </h1>
          <div>
            <input
              type="text"
              placeholder="Enter your Car Plate Number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-60 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
            />
          </div>
        </div>
        <div className="flex flex-col w-full justify-center items-center space-y-6 mt-10">
        <button
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedDurations.length > 0
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
              disabled={selectedDurations.length === 0}
              onClick={reserveSpotConcurrently}
            >
              Concurrent Booking{" "}
              {selectedDurations.length > 0
                ? `(${selectedDurations.length})`
                : ""}
            </button>
        </div>
      
        <div className="w-auto bg-white rounded-2xl shadow-md p-6 space-y-6 m-8 justify-items-center">
          <h1 className="text-xl font-bold text-center text-blue-600">
            Smart Parking (User B)
          </h1>
          <div>
            <input
              type="text"
              placeholder="Enter your Car Plate Number"
              value={userIdB}
              onChange={(e) => setUserIdB(e.target.value)}
              className="w-60 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
