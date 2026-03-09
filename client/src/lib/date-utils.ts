/**
 * Utilitário para lidar com datas e fuso horários de forma consistente.
 * Evita o problema comum de datas "voltarem um dia" devido ao fuso horário local.
 */

/**
 * Normaliza uma string de data (YYYY-MM-DD) para um objeto Date ao meio-dia local.
 * Isso garante que a data seja exibida corretamente independentemente do fuso horário.
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();
  // Se a string já contém T, assume que já está formatada
  if (dateString.includes('T')) {
    return new Date(dateString);
  }
  // Adiciona T12:00:00 para garantir que a data seja interpretada no dia correto
  return new Date(`${dateString}T12:00:00`);
}

/**
 * Formata uma data para exibição no padrão brasileiro (DD/MM/YYYY).
 */
export function formatDisplayDate(dateString: string): string {
  try {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString("pt-BR");
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return dateString;
  }
}

/**
 * Formata uma data para o Mapa (Ex: Sábado, 15 de Março).
 */
export function formatFullDisplayDate(dateString: string): string {
  try {
    const date = parseLocalDate(dateString);
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    
    return `${dayName}, ${dayNum} de ${monthName}`;
  } catch (error) {
    console.error("Erro ao formatar data completa:", error);
    return 'Data não informada';
  }
}

/**
 * Valida se uma string de data é válida.
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
