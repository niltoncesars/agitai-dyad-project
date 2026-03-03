import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface BuyTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    price: number;
    image: string;
    city_name: string;
    date: string;
    time: string;
  } | null;
}

export function BuyTicketModal({ isOpen, onClose, event }: BuyTicketModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Usar opcionalmente o trpc se disponível, senão mockar
  let createCheckoutMutation: any = { mutateAsync: async () => ({ checkoutUrl: "#" }) };
  try {
    createCheckoutMutation = trpc.payments.createCheckoutSession.useMutation();
  } catch (e) {
    console.warn("tRPC não disponível no BuyTicketModal");
  }

  if (!event) return null;

  const handleBuyTicket = async () => {
    if (quantity < 1) {
      toast.error("Quantidade deve ser maior que 0");
      return;
    }

    setIsLoading(true);
    try {
      const priceInCents = Math.round(event.price * 100);
      const totalPriceInCents = priceInCents * quantity;

      const result = await createCheckoutMutation.mutateAsync({
        eventId: event.id,
        eventTitle: event.title,
        priceInCents: totalPriceInCents,
      });

      if (result?.checkoutUrl) {
        // Open checkout in new tab
        if (result.checkoutUrl !== "#") {
          window.open(result.checkoutUrl, "_blank");
          toast.success("Redirecionando para o checkout...");
        } else {
          toast.success("Compra simulada com sucesso!");
        }
        onClose();
      }
    } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error);
      toast.error("Erro ao processar compra. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = (event.price || 0) * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Comprar Ingressos</DialogTitle>
          <DialogDescription>
            Compre ingressos para {event.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Info */}
          <div className="flex gap-3">
            <img
              src={event.image}
              alt={event.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{event.title}</h3>
              <p className="text-xs text-muted-foreground">{event.city_name}</p>
              <p className="text-xs text-muted-foreground">{event.date} • {event.time}</p>
              <p className="text-sm font-bold text-blue-600 mt-1">
                {event.price === 0 ? "Gratuito" : `R$ ${event.price.toFixed(2)}`}
              </p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantidade de Ingressos</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isLoading}
              >
                −
              </Button>
              <Input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center"
                disabled={isLoading}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                disabled={isLoading}
              >
                +
              </Button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-muted p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Preço unitário:</span>
              <span>{event.price === 0 ? "Gratuito" : `R$ ${event.price.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Quantidade:</span>
              <span>{quantity}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span>Total:</span>
              <span className="text-blue-600">{event.price === 0 ? "Gratuito" : `R$ ${totalPrice.toFixed(2)}`}</span>
            </div>
          </div>

          {/* Warning for free events */}
          {event.price === 0 && (
            <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Este é um evento gratuito. Você será redirecionado para confirmar sua presença.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBuyTicket}
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {event.price === 0 ? "Confirmar Presença" : "Comprar Ingressos"}
                </>
              )}
            </Button>
          </div>

          {/* Payment Info */}
          {event.price > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Você será redirecionado para o Stripe para completar o pagamento de forma segura.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
