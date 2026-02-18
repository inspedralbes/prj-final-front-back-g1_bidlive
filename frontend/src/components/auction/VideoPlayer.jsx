import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || "http://localhost:8080";

const RTC_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const VideoPlayer = ({ auctionId = "demo", role = "viewer", autoStart = false }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  
  // Per al venedor: un PeerConnection per cada espectador { viewerId: RTCPeerConnection }
  const pcsRef = useRef({}); 
  // Per a l'espectador: el PeerConnection únic amb el venedor
  const pcRef = useRef(null);
  
  const localStreamRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("idle");
  const [viewers, setViewers] = useState(0);
  const [mediaError, setMediaError] = useState("");

  useEffect(() => {
    if (!started) return;

    const socket = io(SIGNALING_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", async () => {
      console.log("Connected to signaling server");
      setStatus("socket-connected");
      socket.emit("join-room", { auctionId, role });

      if (role === "seller") {
        try {
          await getLocalStream();
          setStatus("local-ready");
        } catch (e) {
          console.error("getUserMedia failed:", e);
          setMediaError("No s'ha pogut accedir a la càmera/micro.");
          setStatus("media-error");
        }
      }
    });

    socket.on("viewer-count", ({ count }) => setViewers(count));

    socket.on("viewer-joined", async ({ viewerId }) => {
      if (role !== "seller") return;
      console.log("New viewer joined:", viewerId);

      // Crea un nou RTCPeerConnection per a aquest viewer
      const pc = createPeerConnection(viewerId);
      pcsRef.current[viewerId] = pc;

      // Afegeix el stream local al nou peer
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("offer", { auctionId, to: viewerId, sdp: offer });
    });

    socket.on("offer", async ({ from, sdp }) => {
      if (role !== "viewer") return;
      console.log("Received offer from:", from);

      const pc = createPeerConnection(from);
      pcRef.current = pc;

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer", { auctionId, to: from, sdp: answer });
      setStatus("connected");
    });

    socket.on("answer", async ({ from, sdp }) => {
      if (role !== "seller") return;
      console.log("Received answer from:", from);

      const pc = pcsRef.current[from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    });

    socket.on("ice-candidate", async ({ from, candidate }) => {
      const pc = role === "seller" ? pcsRef.current[from] : pcRef.current;
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ice candidate:", e);
        }
      }
    });

    socket.on("disconnect", () => setStatus("socket-disconnected"));

    return () => {
      cleanup();
      socket.disconnect();
    };
  }, [started, auctionId, role]);

  const getLocalStream = async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const createPeerConnection = (remoteId) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit("ice-candidate", { 
          auctionId, 
          candidate: e.candidate, 
          to: remoteId 
        });
      }
    };

    pc.ontrack = (e) => {
      if (role === "viewer" && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    return pc;
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    Object.values(pcsRef.current).forEach(pc => pc.close());
    pcsRef.current = {};
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  };

  const handleStart = async () => {
    try {
      setStatus("starting");
      if (role === "seller") await getLocalStream();
      setStarted(true);
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

useEffect(() => {
  if (autoStart && !started) {
    handleStart();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [autoStart]);


  return (
    <div className="relative w-full aspect-video bg-black group overflow-hidden rounded-none">
      {/* VIDEO LAYER */}
      {started ? (
        role === "seller" ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDEQEUWajgGhDVyR4kjPBRQqb-Wuf2_8KFPzzt2Q0AVzCNS5pRpbLeNTiNdQZwXmiNWs2ElKy_yFdw8aciwZOLzQQH1lRh1H372T27wJqT9LoyvRMIYPLDg9o0CZI0E5rgc9ABeYP7QRyIEAT4oCcY5AZ2W22yc6XJ6Zqf8uJgzl0TPH8FoxXmWWyKc2eKZf9LEGWiLvcXLvyDcvEyKcX-_plgmJ2uLQUeeMty6i4K_wEc4aeymCnfe0JNNqxnou_WcBWatnB0pTu09')",
          }}
        />
      )}

      {/* MEDIA ERROR OVERLAY */}
      {mediaError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-6 text-center text-white">
          <div>
            <div className="font-bold mb-2">Error de càmera/micro</div>
            <div className="text-sm opacity-90">{mediaError}</div>
          </div>
        </div>
      )}

      {/* TOP LEFT BADGES */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <div className="flex items-center gap-1.5 bg-primary px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-white">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE
        </div>
        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 text-white">
          <span className="material-symbols-outlined text-sm">visibility</span>
          {viewers || 0}
        </div>
      </div>

      {/* CENTER PLAY */}
      {!started && (
        <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity z-10">
          <button
            onClick={handleStart}
            className="flex shrink-0 items-center justify-center rounded-full size-20 bg-black/40 backdrop-blur-sm text-white border border-white/20 hover:scale-110 transition-transform"
            title={role === "seller" ? "Començar emissió" : "Veure en directe"}
          >
            <span className="material-symbols-outlined text-4xl leading-none">
              play_arrow
            </span>
          </button>
        </div>
      )}

      {/* BOTTOM RIGHT CONTROLS (mock) */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <button className="bg-black/60 backdrop-blur-md p-2 rounded-lg hover:bg-black/80 text-white">
          <span className="material-symbols-outlined text-sm">volume_up</span>
        </button>
        <button className="bg-black/60 backdrop-blur-md p-2 rounded-lg hover:bg-black/80 text-white">
          <span className="material-symbols-outlined text-sm">fullscreen</span>
        </button>
      </div>

      {/* DEBUG STATUS */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-xs text-white">
        {role} • {status}
      </div>
    </div>
  );
};

export default VideoPlayer;
