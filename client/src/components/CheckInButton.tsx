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
        <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-colors ${isCheckedIn ? 'bg-indigo-100' : 'bg-gray-200'}`}>
          {isCheckedIn ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-6 h-6 fill-indigo-600">
              <path d="M192 64C156.7 64 128 92.7 128 128L128 544C128 555.5 134.2 566.2 144.2 571.8C154.2 577.4 166.5 577.3 176.4 571.4L320 485.3L463.5 571.4C473.4 577.3 485.7 577.5 495.7 571.8C505.7 566.1 512 555.5 512 544L512 128C512 92.7 483.3 64 448 64L192 64z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-6 h-6 fill-gray-500">
              <path d="M128 128C128 92.7 156.7 64 192 64L448 64C483.3 64 512 92.7 512 128L512 545.1C512 570.7 483.5 585.9 462.2 571.7L320 476.8L177.8 571.7C156.5 585.9 128 570.6 128 545.1L128 128zM192 112C183.2 112 176 119.2 176 128L176 515.2L293.4 437C309.5 426.3 330.5 426.3 346.6 437L464 515.2L464 128C464 119.2 456.8 112 448 112L192 112z"/>
            </svg>
          )}
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
