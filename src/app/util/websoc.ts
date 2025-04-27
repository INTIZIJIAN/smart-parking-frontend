// useEffect(() => {
//   const socket = new SockJS("http://localhost:8080/ws");
//   client.current = new Client({
//     webSocketFactory: () => socket,
//     debug: (str) => console.log(str),
//     onConnect: () => {
//       console.log("Connected to WebSocket");
//       client.current?.subscribe("/topic/parking", (message) => {
//         const update = JSON.parse(message.body);
//         console.log("Received parking update:", update);
//         setAvailableSpot((prevSpots) => {
//           if (!prevSpots) return null;
//           return prevSpots.map((spot) =>
//             spot.id === update.id
//               ? {
//                   ...spot,
//                   available: update.available,
//                   booking: update.booking,
//                 }
//               : spot
//           );
//         });
//       });
//     },
//   });

//   client.current.activate();

//   return () => {
//     if (client.current) client.current.deactivate();
//   };
// }, []);

// const reserveSpotConcurrently = async () => {
//   const reqA = axios.post(`${BASE_URL}/reserve`, null, {
//     params: { userId, duration },
//   });
//   const reqB = axios.post(`${BASE_URL}/reserve`, null, {
//     params: { userId: userIdB, duration },
//   });

//   try {
//     const [resA, resB] = await Promise.all([reqA, reqB]);

//     if (resA.data && resA.data.success) {
//       setBooking(resA.data);
//       toast.success("Parking Booked for " + userId);
//     } else {
//       toast.error("Parking full");
//       setBooking(null);
//     }

//     if (resB.data && resB.data.success) {
//       setBookingB(resB.data);
//       toast.success("Parking Booked for" + userId);
//     } else {
//       toast.error("Parking full");
//       setBookingB(null);
//     }
//   } catch (err) {
//     console.error("Reservation failed", err);
//     setBooking(null);
//     setBookingB(null);
//   }
// };

{/* {bookingB && bookingB.success ? (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
                <p className="font-semibold">Reservation Confirmed</p>
                <p>Spot ID: {bookingB?.spot.id}</p>
              </div>
            ) : (
              <p className="text-center text-gray-500">No active booking</p>
            )} */}