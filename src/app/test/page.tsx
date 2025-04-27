"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import toast from "react-hot-toast";
import SockJS from "sockjs-client";

interface Booking {
  isSuccess: boolean;
  user: { userId: string };
  status: string;
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

interface MyBooking {
  spotId: string;
  userId: string;
  parkingZone: string;
  duration: string;
  status: string;
}
export default function Home() {
  const client = useRef<Client | null>(null);
  const [checked3, setChecked3] = useState(false);
  const router = useRouter();

  const handleToggle = () => {
    router.push("/");
    setChecked3(!checked3);
  };
  const [mySpot, setMySpot] = useState<ParkingSpot[] | null>(null);
  const [myBooking, setMyBooking] = useState<MyBooking[] | null>(null);
  // console.log("My Spot Data:", mySpot);
  // console.log("My Booking Data:", myBooking);
  useEffect(() => {
    if (!mySpot) return;
  
    let spotArray: ParkingSpot[] = [];
  
    if (Array.isArray(mySpot)) {
      spotArray = mySpot;
    } else {
      spotArray = [mySpot];
    }
  
    const booked = spotArray.flatMap((spot) =>
      spot.durations
        .filter((d) => d.booking !== null)
        .map((bookedTimeSlot) => ({
          spotId: spot.id,
          userId: bookedTimeSlot.booking?.user?.userId ?? 'Unknown',
          parkingZone: spot.parkingZone,
          duration: bookedTimeSlot.duration ?? 'Unknown',
          status: bookedTimeSlot.booking?.status ?? 'Unknown',
        }))
    );
  
    setMyBooking(booked);
  }, [mySpot]);
  
  
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
            setMySpot(update);
          });
        },
      });
      client.current.activate();
  
      return () => {
        if (client.current) client.current.deactivate();
      };
    }, []);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const enterSpot = async (spotId: string, duration: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/enter`, null, {
        params: { spotId, duration },
      });

      if (res.status === 200) {
        toast.success("Spot entered successfully!");
        //setMySpot(null);
      } else {
        toast.error("Failed to enter the spot.");
      }
    } catch (err) {
      console.error("Enter failed", err);
      toast.error("An error occurred while entering the spot.");
  }
}

  const exitSpot = async (spotId: string, duration: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/release`, null, {
        params: { spotId, duration },
      });

      if (res.status === 200) {
        toast.success("Spot exited successfully!");
        //setMySpot(null);
      } else {
        toast.error("Failed to exit the spot.");
      }
    } catch (err) {
      console.error("Exit failed", err);
      toast.error("An error occurred while exiting the spot.");
    }
  };

  useEffect(() => {
    const searchAvailableParking = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/all`);
        const sorted = res.data.sort((a: ParkingSpot, b: ParkingSpot) =>
          a.id.localeCompare(b.id)
        );
        const filteredSpots = sorted.filter((spot: ParkingSpot) =>
          spot.durations.some((d) => d.booking !== null)
        );
        setMySpot(filteredSpots);
      } catch (err) {
        console.error("Search failed", err);
      }
    };

    searchAvailableParking();
  }, [BASE_URL]);



  // const releaseSpot = async () => {
  //   if (userId === "") {
  //     toast.error("Please enter your Car Plate Number");
  //     return;
  //   } else if (userId.length !== 8) {
  //     toast.error("Car Plate Number must be 8 characters");
  //     return;
  //   }

  //   if (!booking) {
  //     toast.error("No active booking to release");
  //     return;
  //   }

  //   try {
  //     const res = await axios.post(`${BASE_URL}/release`, null, {
  //       params: { userId },
  //     });

  //     if (res.status === 200) {
  //       toast.success("Spot released successfully!");
  //       setBooking(null);
  //     } else {
  //       toast.error("Failed to release the spot.");
  //     }
  //   } catch (err) {
  //     console.error("Release failed", err);
  //     toast.error("An error occurred while releasing the spot.");
  //   }
  // };

  // useEffect(() => {
  //   const searchAvailableParking = async () => {
  //     try {
  //       const res = await axios.get(`${BASE_URL}/all`);
  //       const sorted = res.data.sort((a: ParkingSpot, b: ParkingSpot) =>
  //         a.id.localeCompare(b.id)
  //       );
  //       setMySpot(sorted);
  //       console.log("aaa" + availableSpot);
  //     } catch (err) {
  //       console.error("Search failed", err);
  //     }
  //   };

  //   searchAvailableParking();
  // });

  return (
    <>
      <main className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="absolute top-4 left-4">
          <label className="absolute top-4 left-4 inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={checked3}
              onChange={handleToggle}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-700 peer-checked3:bg-blue-600 relative">
              <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-full" />
              <span className="ml-15 text-sm font-medium">Home</span>
            </div>
          </label>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-200 max-w-md mx-auto mt-8 bg-white rounded-2xl shadow-lg p-6">
            {myBooking && myBooking.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-blue-600 text-center">
                  My Bookings
                </h2>
                <ul className="space-y-3">
                  {myBooking.map((booking, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-4 bg-blue-50 rounded-lg shadow-sm hover:bg-blue-100 transition-all"
                    >
                      <div>
                        <p className="text-lg font-semibold text-gray-700">
                          📍 Zone:{" "}
                          <span className="text-blue-700">
                            {booking.parkingZone}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          🅿️ Spot ID:{" "}
                          <span className="font-medium">{booking.spotId}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          ⏰ Time:{" "}
                          <span className="font-medium">
                            {booking.duration}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          🚗 Car Plate:{" "}
                          <span className="font-medium">{booking.userId}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (booking.status === "BOOKED") {
                            enterSpot(booking.spotId, booking.duration); // Pass params
                          } else if (booking.status === "OCCUPIED") {
                            exitSpot(booking.spotId, booking.duration); // Pass params
                          }
                        }}
                        className={`ml-4 px-4 py-2 rounded-lg font-semibold transition-all
              ${
                booking.status === "BOOKED"
                  ? "bg-green-400 hover:bg-green-600 text-white"
                  : "bg-red-400 hover:bg-red-600 text-white"
              }
            `}
                      >
                        {booking.status === "BOOKED" ? "Enter" : "Exit"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center text-gray-500 p-6">
                <h2 className="text-xl font-semibold mb-2">
                  No Active Bookings
                </h2>
                <p>Start booking a parking spot now!</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
}
