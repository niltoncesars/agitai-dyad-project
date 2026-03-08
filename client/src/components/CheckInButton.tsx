import { useState, useEffect } from "react";

interface CheckInButtonProps {
  eventId: string;
  eventTitle: string;
}

export function CheckInButton({ eventId, eventTitle }: CheckInButtonProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkedInCount, setCheckedInCount] = useState(0);

  // Carregar estado de check-in do localStorage
  useEffect(() => {
    const checkIns = JSON.parse(localStorage.getItem("eventCheckIns") || "{}");
    const isChecked = checkIns[eventId] || false;
    setIsCheckedIn(isChecked);

    // Carregar contagem de check-ins
    const checkInCounts = JSON.parse(
      localStorage.getItem("eventCheckInCounts") || "{}"
    );
    setCheckedInCount(checkInCounts[eventId] || 0);
  }, [eventId]);

  const handleCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation();

    const checkIns = JSON.parse(localStorage.getItem("eventCheckIns") || "{}");
    const checkInCounts = JSON.parse(
      localStorage.getItem("eventCheckInCounts") || "{}"
    );

    if (isCheckedIn) {
      // Remover check-in
      delete checkIns[eventId];
      checkInCounts[eventId] = Math.max(0, (checkInCounts[eventId] || 1) - 1);
    } else {
      // Adicionar check-in
      checkIns[eventId] = true;
      checkInCounts[eventId] = (checkInCounts[eventId] || 0) + 1;
    }

    localStorage.setItem("eventCheckIns", JSON.stringify(checkIns));
    localStorage.setItem("eventCheckInCounts", JSON.stringify(checkInCounts));

    setIsCheckedIn(!isCheckedIn);
    setCheckedInCount(checkInCounts[eventId]);
  };

  return (
    <button
      onClick={handleCheckIn}
      title={isCheckedIn ? "Remover confirmação de presença" : "Confirmar presença"}
      className="flex items-center justify-center gap-2 transition-all hover:scale-110"
    >
      <div className="relative flex items-center justify-center">
        {/* Fundo circular cinza claro */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <img
            src={isCheckedIn ? "/check-in-enable.png" : "/check-in-disable.png"}
            alt={isCheckedIn ? "Presença confirmada" : "Confirmar presença"}
            className="w-6 h-6 object-contain"
          />
        </div>
        {/* Contador de check-ins */}
        {checkedInCount > 0 && (
          <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {checkedInCount > 9 ? "9+" : checkedInCount}
          </span>
        )}
      </div>
    </button>
  );
}
