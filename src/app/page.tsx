"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import toast from "react-hot-toast";
import SockJS from "sockjs-client";

export default function Home() {
  const [userId, setUserId] = useState("");
  const client = useRef<Client | null>(null);

  interface ParkingSpot {
    id: string;
    available: boolean;
    reservedBy: string | null;
  }

  const [availableSpot, setAvailableSpot] = useState<ParkingSpot[] | null>(
    null
  );
  interface Booking {
    spot: {
      id: string;
    };
  }

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
          setAvailableSpot((prevSpots) => {
            if (!prevSpots) return null;
            return prevSpots.map((spot) =>
              spot.id === update.id ? { ...spot, available: update.available } : spot
            );
          });
        });
      },
    });

    client.current.activate();

    return () => {
      if (client.current) client.current.deactivate();
    };
  }, []);

  const [booking, setBooking] = useState<Booking | null>(null);

  const BASE_URL = "http://localhost:8080/api/parking";

  const reserveSpot = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/reserve`, null, {
        params: { userId },
      });
      setBooking(res.data);
    } catch (err) {
      console.error("Reservation failed", err);
      setBooking(null);
    }
  };

  const releaseSpot = async () => {
    try {
      await axios.post(`${BASE_URL}/release`, null, {
        params: { userId },
      });
      setBooking(null);
    } catch (err) {
      console.error("Release failed", err);
    }
  };

  const searchAvailableParking = async () => {
    if (userId === "") {
      toast.error("Please enter your Car Plate Number");
      return;
    }
    try {
      const res = await axios.get(`${BASE_URL}/all`);
      console.log("Available parking spots:", res.data);
      setAvailableSpot(res.data);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  return (
    <>
      <main className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex flex-col w-full justify-center items-center space-y-6">
          {availableSpot && availableSpot.length > 0 && (
            <div className="flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-blue-500 text-center">
                  Available Parking Spots
                </h2>
                <ul className="mt-4 grid grid-cols-3 gap-4 text-black">
                  {availableSpot.map((spot: ParkingSpot) => (
                    <li
                      key={spot.id}
                      className={`p-4 rounded-md border text-center font-medium ${
                        spot.available
                          ? "bg-green-100 border-green-500"
                          : "bg-red-100 border-red-500"
                      }`}
                    >
                      <div>Spot ID: {spot.id}</div>
                      <div className="text-black">
                        {spot.available ? "✅ Available" : "❌ Unavailable"}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6 space-y-6">
            <h1 className="text-2xl font-bold text-center text-blue-600">
              Smart Parking
            </h1>

            <input
              type="text"
              placeholder="Enter your Car Plate Number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
            />

            <div className="flex space-x-2">
              <button
                onClick={reserveSpot}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Reserve
              </button>
              <button
                onClick={releaseSpot}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
              >
                Release
              </button>
              <button
                onClick={searchAvailableParking}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
              >
                Search
              </button>
            </div>

            {booking ? (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
                <p className="font-semibold">Reservation Confirmed</p>
                <p>Spot ID: {booking.spot.id}</p>
              </div>
            ) : (
              <p className="text-center text-gray-500">No active booking</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
