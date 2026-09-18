"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Upload, Play, Pause, FileAudio, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { AudioRecording } from "@/lib/carenote-types";

interface AudioRecorderUploaderProps {
  encounterId: number;
  existingRecordings?: AudioRecording[];
  onAudioUploaded?: (recording: AudioRecording) => void;
}

export function AudioRecorderUploader({
  encounterId,
  existingRecordings = [],
  onAudioUploaded,
}: AudioRecorderUploaderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [recordings, setRecordings] = useState<AudioRecording[]>(existingRecordings);
  const [error, setError] = useState<string | null>(null);

  // Reproductor con URL firmada
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<number, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setRecordings(existingRecordings);
  }, [existingRecordings]);

  // Iniciar grabación de micrófono
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/ogg" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError("No se pudo acceder al micrófono. Verifique los permisos del navegador.");
    }
  };

  // Detener grabación
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Enviar audio grabado
  const uploadRecordedAudio = async () => {
    if (!audioBlob) return;
    await uploadFile(new File([audioBlob], `nota_voz_${Date.now()}.ogg`, { type: "audio/ogg" }));
  };

  // Enviar archivo adjunto
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("care_encounter_id", encounterId.toString());
    formData.append("audio_file", file);
    formData.append("duration_seconds", recordingTime > 0 ? recordingTime.toString() : "0");

    try {
      const res = await api.post<{ data: AudioRecording }>("/audio-recordings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newRec = res.data.data;
      setRecordings((prev) => [newRec, ...prev]);
      setAudioBlob(null);
      setRecordingTime(0);
      if (onAudioUploaded) onAudioUploaded(newRec);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al subir el archivo de audio.");
    } finally {
      setIsUploading(false);
    }
  };

  // Reproducir audio usando URL firmada del backend
  const handlePlayAudio = async (recording: AudioRecording) => {
    if (playingId === recording.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingId(null);
      }
      return;
    }

    try {
      let url = signedUrls[recording.id];
      if (!url) {
        const res = await api.get<{ signed_url: string }>(`/audio-recordings/${recording.id}/signed-url`);
        url = res.data.signed_url;
        setSignedUrls((prev) => ({ ...prev, [recording.id]: url }));
      }

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingId(recording.id);

        audioRef.current.onended = () => {
          setPlayingId(null);
        };
      }
    } catch (err: any) {
      setError("No se pudo obtener el enlace seguro de reproducción.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-4 border shadow-sm space-y-4">
      <audio ref={audioRef} className="hidden" />

      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <FileAudio className="w-5 h-5 text-blue-600" />
          Audios de la Atención
        </h3>
        <span className="text-xs text-slate-500 font-mono">Encuentro #{encounterId}</span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Panel de Grabación & Subida */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-lg border">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            variant="default"
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Mic className="w-4 h-4" />
            Grabar Voz
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            variant="destructive"
            className="animate-pulse flex items-center gap-2"
          >
            <Square className="w-4 h-4 fill-current" />
            Detener ({formatTime(recordingTime)})
          </Button>
        )}

        {audioBlob && !isRecording && (
          <Button
            onClick={uploadRecordedAudio}
            disabled={isUploading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
          >
            {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Subir Grabación ({formatTime(recordingTime)})
          </Button>
        )}

        <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none border border-slate-300 bg-white hover:bg-slate-100 h-9 px-3">
          <Upload className="w-4 h-4 mr-2 text-slate-600" />
          <span>{isUploading ? "Subiendo..." : "Adjuntar Audio"}</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Lista de Audios Registrados */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Grabaciones ({recordings.length})
        </p>

        {recordings.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-2">No se han grabado audios para esta atención aún.</p>
        ) : (
          <div className="divide-y border rounded-md">
            {recordings.map((rec) => (
              <div key={rec.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handlePlayAudio(rec)}
                    className="h-8 w-8 rounded-full"
                  >
                    {playingId === rec.id ? (
                      <Pause className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Play className="w-4 h-4 text-slate-700" />
                    )}
                  </Button>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{rec.original_filename}</p>
                    <p className="text-xs text-slate-500">
                      {(rec.file_size_bytes / 1024 / 1024).toFixed(2)} MB • {rec.mime_type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-200">
                    🔒 URL Firmada
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
