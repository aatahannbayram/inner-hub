import React, { useState, useEffect } from "react";
import { useListRequests, getListRequestsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Requests() {
  const [passcode, setPasscode] = useState(sessionStorage.getItem("inner_passcode") || "");
  const [inputVal, setInputVal] = useState("");
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    const previous = meta.getAttribute("content");
    meta.setAttribute("content", "noindex, nofollow");
    return () => {
      if (previous) meta!.setAttribute("content", previous);
    };
  }, []);

  const { data: requests, isLoading, isError } = useListRequests(
    { passcode },
    { 
      query: { 
        enabled: !!passcode,
        retry: false,
        queryKey: getListRequestsQueryKey({ passcode })
      } 
    }
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscode(inputVal);
    sessionStorage.setItem("inner_passcode", inputVal);
    setHasAttempted(true);
  };

  const handleLogout = () => {
    setPasscode("");
    setInputVal("");
    sessionStorage.removeItem("inner_passcode");
    setHasAttempted(false);
  };

  if (!passcode || (isError && hasAttempted)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
          <div className="font-mono text-xs uppercase tracking-widest mb-8">Admin Access</div>
          <Input
            type="password"
            placeholder="Passcode"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="rounded-none border-0 border-b border-border bg-transparent px-0 py-4 focus-visible:ring-0 focus-visible:border-foreground"
            data-testid="input-passcode"
          />
          {isError && hasAttempted && (
            <p className="text-destructive font-mono text-[10px] uppercase">Invalid passcode</p>
          )}
          <Button 
            type="submit"
            className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-xs tracking-widest uppercase w-full h-auto py-4"
            data-testid="button-login"
          >
            Enter
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 lg:p-[10%]">
      <div className="flex items-center justify-between mb-16">
        <h1 className="font-serif text-3xl">Requests</h1>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="font-mono text-xs tracking-widest uppercase rounded-none hover:bg-transparent hover:text-muted-foreground"
          data-testid="button-logout"
        >
          Exit
        </Button>
      </div>

      {isLoading ? (
        <div className="font-mono text-xs tracking-widest uppercase text-muted-foreground animate-pulse">Loading...</div>
      ) : !requests || requests.length === 0 ? (
        <div className="font-mono text-xs tracking-widest uppercase text-muted-foreground">No requests found.</div>
      ) : (
        <div className="overflow-x-auto border border-border/20 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border/20 hover:bg-transparent">
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground h-12">Date</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground h-12">Name</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground h-12">Email</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground h-12">Role</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground h-12">LinkedIn</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground h-12 min-w-[300px]">Background</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground h-12">Link</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground h-12">Intro By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id} className="border-border/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <TableCell className="font-mono text-[11px] align-top py-4 text-muted-foreground whitespace-nowrap">
                    {format(new Date(req.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium align-top py-4">{req.name}</TableCell>
                  <TableCell className="align-top py-4 text-muted-foreground">{req.email}</TableCell>
                  <TableCell className="align-top py-4 text-muted-foreground capitalize">{req.role || "-"}</TableCell>
                  <TableCell className="align-top py-4">
                    {req.linkedin ? (
                      <a href={req.linkedin} target="_blank" rel="noreferrer" className="underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors">
                        LinkedIn
                      </a>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="align-top py-4 max-w-md whitespace-pre-wrap">{req.whoYouAre}</TableCell>
                  <TableCell className="align-top py-4">
                    {req.link ? (
                      <a href={req.link} target="_blank" rel="noreferrer" className="underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors">
                        Link
                      </a>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="align-top py-4 text-muted-foreground">{req.whoIntroduced || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
