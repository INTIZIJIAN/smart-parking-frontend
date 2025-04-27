  // function Countdown({ endTime }: { endTime: string }) {
  //   const [timeLeft, setTimeLeft] = useState(getTimeLeft(endTime));

  //   function getTimeLeft(end: string) {
  //     const now = new Date();
  //     const endT = new Date(end);
  //     const diff = Math.max(
  //       0,
  //       Math.floor((endT.getTime() - now.getTime()) / 1000)
  //     ); // in seconds
  //     return diff;
  //   }

  //   useEffect(() => {
  //     const interval = setInterval(() => {
  //       setTimeLeft((prev) => Math.max(0, prev - 1));
  //     }, 1000);
  //     return () => clearInterval(interval);
  //   }, []);

  //   function formatTime(seconds: number) {
  //     const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
  //     const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  //     const secs = String(seconds % 60).padStart(2, "0");
  //     return `${hrs}:${mins}:${secs}`;
  //   }

  //   return (
  //     <p className="text-sm font-mono text-black">
  //       Time Left: {formatTime(timeLeft)}
  //     </p>
  //   );
  // }