import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <Button
      variant="ghost"
      size="sm"
      className={`h-9 px-3 gap-1.5 transition-colors ${
        isCheckedIn
          ? "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
      onClick={handleCheckIn}
      title={isCheckedIn ? "Remover confirmação de presença" : "Confirmar presença"}
    >
      <MapPin
        className={`w-4 h-4 ${isCheckedIn ? "fill-blue-500" : ""}`}
      />
      {checkedInCount > 0 && (
        <span className="text-xs font-medium">{checkedInCount}</span>
      )}
    </Button>
  );
}
