import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiUrl } from "@/lib/api";

/** Panel sayfalarındaki elle useEffect+fetch deseninin tek noktadan yerini alır.
 *  staleTime: panel verisi sık değişmiyor. placeholderData: sayfa/route
 *  değişiminde flicker olmasın diye önceki veri korunur. */
export function useApiQuery<T>(key: readonly unknown[], path: string) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const res = await fetch(apiUrl(path), { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Veri alınamadı");
      return json as T;
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
