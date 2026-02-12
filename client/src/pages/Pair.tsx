import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function getQueryParam(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

export default function Pair() {
  const deviceId = useMemo(() => getQueryParam("device_id"), []);
  const code = useMemo(() => getQueryParam("code"), []);
  const [isPairing, setIsPairing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pairedToken, setPairedToken] = useState<string | null>(null);

  async function onPair() {
    setIsPairing(true);
    setError(null);

    try {
      if (!deviceId) throw new Error("Missing device_id");

      const res = await fetch("/api/companion/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, code }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Pairing failed (${res.status})`);
      }

      const data = (await res.json()) as { token: string; deviceId: string };
      localStorage.setItem(`companion_pairing_token:${data.deviceId}`, data.token);
      setPairedToken(data.token);
    } catch (e: any) {
      setError(e?.message ?? "Pairing failed");
    } finally {
      setIsPairing(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Pair Companion</h1>
          <p className="text-sm text-muted-foreground">
            Confirm this device so your local Companion can sync assignments into StudyFlow.
          </p>
        </div>

        <div className="rounded-md border p-3 text-sm space-y-1">
          <div>
            <span className="text-muted-foreground">Device ID:</span>{" "}
            <span className="font-mono break-all">{deviceId ?? "(missing)"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Pairing Code:</span>{" "}
            <span className="font-mono">{code ?? "(missing)"}</span>
          </div>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        {pairedToken ? (
          <div className="space-y-2">
            <div className="text-sm">
              Paired. You can close this tab and return to the Companion to start a scan.
            </div>
            <div className="text-xs text-muted-foreground">
              (Dev note: token stored in localStorage.)
            </div>
          </div>
        ) : (
          <Button onClick={onPair} disabled={isPairing || !deviceId}>
            {isPairing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Pairing...
              </>
            ) : (
              "Pair"
            )}
          </Button>
        )}
      </Card>
    </div>
  );
}

