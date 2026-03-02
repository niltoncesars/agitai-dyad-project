import {
  Share2,
  MessageCircle,
  Mail,
  Copy,
  Facebook,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ShareButtonsProps {
  eventTitle: string;
  eventCity?: string;
  eventDate?: string;
  eventPrice?: string;
  eventUrl?: string;
  className?: string;
}

export function ShareButtons({
  eventTitle,
  eventCity,
  eventDate,
  eventPrice,
  eventUrl,
  className,
}: ShareButtonsProps) {
  // Generate share URL (use current page URL or custom event URL)
  const shareUrl = eventUrl || (typeof window !== "undefined" ? window.location.href : "");

  // Generate share text
  const shareText = `Confira este evento: ${eventTitle}${
    eventCity ? ` em ${eventCity}` : ""
  }${eventDate ? ` - ${eventDate}` : ""}${eventPrice ? ` - R$ ${eventPrice}` : ""} 🎉`;

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      `${shareText}\n${shareUrl}`
    )}`;
    window.open(whatsappUrl, "_blank", "width=600,height=400");
    toast.success("Abrindo WhatsApp...");
  };

  const handleFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
    toast.success("Abrindo Facebook...");
  };

  const handleLinkedin = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(linkedinUrl, "_blank", "width=600,height=400");
    toast.success("Abrindo LinkedIn...");
  };

  const handleEmail = () => {
    const subject = `Confira este evento: ${eventTitle}`;
    const body = `${shareText}\n\n${shareUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    toast.success("Abrindo cliente de email...");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Compartilhado com sucesso!");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Erro ao compartilhar");
        }
      }
    } else {
      toast.info("Compartilhamento nativo não suportado neste navegador");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${className}`}
          title="Compartilhar evento"
        >
          <Share2 className="w-4 h-4" />
          Compartilhar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Native Share (if supported) */}
        {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
          <>
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* WhatsApp */}
        <DropdownMenuItem onClick={handleWhatsApp}>
          <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
          <span>WhatsApp</span>
        </DropdownMenuItem>

        {/* Facebook */}
        <DropdownMenuItem onClick={handleFacebook}>
          <Facebook className="w-4 h-4 mr-2 text-blue-600" />
          <span>Facebook</span>
        </DropdownMenuItem>

        {/* LinkedIn */}
        <DropdownMenuItem onClick={handleLinkedin}>
          <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
          <span>LinkedIn</span>
        </DropdownMenuItem>

        {/* Email */}
        <DropdownMenuItem onClick={handleEmail}>
          <Mail className="w-4 h-4 mr-2 text-gray-600" />
          <span>Email</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Copy Link */}
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="w-4 h-4 mr-2" />
          <span>Copiar Link</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
