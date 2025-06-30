// VoiceCall.jsx
import { forwardRef, useImperativeHandle, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", { withCredentials: true });

const VoiceCall = forwardRef(({ currentUserId, fuser_id }, ref) => {
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerRef = useRef(null);
  const [callIncoming, setCallIncoming] = useState(null);

  const servers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const setupMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
  };

  const startCall = async (isCaller) => {
    await setupMedia();

    peerRef.current = new RTCPeerConnection(servers);
    localStreamRef.current.getTracks().forEach(track => {
      peerRef.current.addTrack(track, localStreamRef.current);
    });

    peerRef.current.ontrack = (event) => {
      remoteAudioRef.current.srcObject = event.streams[0];
    };

    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: fuser_id,
          candidate: event.candidate,
        });
      }
    };

    if (isCaller) {
      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);
      socket.emit("offer", {
        to: fuser_id,
        offer,
        from: currentUserId,
      });
    }
  };

  // Expose to parent
  useImperativeHandle(ref, () => ({
    startCall
  }));

  useEffect(() => {
    socket.on("offer", async ({ offer, from }) => {
      const accept = window.confirm("Incoming call. Accept?");
      if (!accept) return;

      await setupMedia();

      peerRef.current = new RTCPeerConnection(servers);
      localStreamRef.current.getTracks().forEach(track => {
        peerRef.current.addTrack(track, localStreamRef.current);
      });

      peerRef.current.ontrack = (event) => {
        remoteAudioRef.current.srcObject = event.streams[0];
      };

      peerRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { to: from, candidate: event.candidate });
        }
      };

      await peerRef.current.setRemoteDescription(offer);
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);

      socket.emit("answer", { to: from, answer });
    });

    socket.on("answer", async ({ answer }) => {
      await peerRef.current.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", ({ candidate }) => {
      peerRef.current?.addIceCandidate(candidate);
    });
  }, []);

  return (
    <div>
      <audio ref={remoteAudioRef} autoPlay></audio>
    </div>
  );
});

export default VoiceCall;
