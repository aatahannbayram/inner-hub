import { jsx, jsxs } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { Link, Router } from "wouter";
import { useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Zap, Users, TrendingUp, BookOpen, Radio, Fingerprint, Code2, Target, Linkedin, Instagram, ArrowRight } from "lucide-react";
import { useFormContext, FormProvider, Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useReducedMotion, motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import Lenis from "lenis";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const TooltipProvider = TooltipPrimitive.Provider;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const NO_BODY_STATUS = /* @__PURE__ */ new Set([204, 205, 304]);
const DEFAULT_JSON_ACCEPT = "application/json, application/problem+json";
function isRequest(input) {
  return typeof Request !== "undefined" && input instanceof Request;
}
function resolveMethod(input, explicitMethod) {
  if (explicitMethod) return explicitMethod.toUpperCase();
  if (isRequest(input)) return input.method.toUpperCase();
  return "GET";
}
function isUrl(input) {
  return typeof URL !== "undefined" && input instanceof URL;
}
function applyBaseUrl(input) {
  return input;
}
function resolveUrl(input) {
  if (typeof input === "string") return input;
  if (isUrl(input)) return input.toString();
  return input.url;
}
function mergeHeaders(...sources) {
  const headers = new Headers();
  for (const source of sources) {
    if (!source) continue;
    new Headers(source).forEach((value, key) => {
      headers.set(key, value);
    });
  }
  return headers;
}
function getMediaType(headers) {
  const value = headers.get("content-type");
  return value ? value.split(";", 1)[0].trim().toLowerCase() : null;
}
function isJsonMediaType(mediaType) {
  return mediaType === "application/json" || Boolean(mediaType?.endsWith("+json"));
}
function isTextMediaType(mediaType) {
  return Boolean(
    mediaType && (mediaType.startsWith("text/") || mediaType === "application/xml" || mediaType === "text/xml" || mediaType.endsWith("+xml") || mediaType === "application/x-www-form-urlencoded")
  );
}
function hasNoBody(response, method) {
  if (method === "HEAD") return true;
  if (NO_BODY_STATUS.has(response.status)) return true;
  if (response.headers.get("content-length") === "0") return true;
  if (response.body === null) return true;
  return false;
}
function stripBom(text) {
  return text.charCodeAt(0) === 65279 ? text.slice(1) : text;
}
function looksLikeJson(text) {
  const trimmed = text.trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}
function getStringField(value, key) {
  if (!value || typeof value !== "object") return void 0;
  const candidate = value[key];
  if (typeof candidate !== "string") return void 0;
  const trimmed = candidate.trim();
  return trimmed === "" ? void 0 : trimmed;
}
function truncate(text, maxLength = 300) {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
function buildErrorMessage(response, data) {
  const prefix = `HTTP ${response.status} ${response.statusText}`;
  if (typeof data === "string") {
    const text = data.trim();
    return text ? `${prefix}: ${truncate(text)}` : prefix;
  }
  const title = getStringField(data, "title");
  const detail = getStringField(data, "detail");
  const message = getStringField(data, "message") ?? getStringField(data, "error_description") ?? getStringField(data, "error");
  if (title && detail) return `${prefix}: ${title} — ${detail}`;
  if (detail) return `${prefix}: ${detail}`;
  if (message) return `${prefix}: ${message}`;
  if (title) return `${prefix}: ${title}`;
  return prefix;
}
class ApiError extends Error {
  name = "ApiError";
  status;
  statusText;
  data;
  headers;
  response;
  method;
  url;
  constructor(response, data, requestInfo) {
    super(buildErrorMessage(response, data));
    Object.setPrototypeOf(this, new.target.prototype);
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
  }
}
class ResponseParseError extends Error {
  name = "ResponseParseError";
  status;
  statusText;
  headers;
  response;
  method;
  url;
  rawBody;
  cause;
  constructor(response, rawBody, cause, requestInfo) {
    super(
      `Failed to parse response from ${requestInfo.method} ${response.url || requestInfo.url} (${response.status} ${response.statusText}) as JSON`
    );
    Object.setPrototypeOf(this, new.target.prototype);
    this.status = response.status;
    this.statusText = response.statusText;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
    this.rawBody = rawBody;
    this.cause = cause;
  }
}
async function parseJsonBody(response, requestInfo) {
  const raw = await response.text();
  const normalized = stripBom(raw);
  if (normalized.trim() === "") {
    return null;
  }
  try {
    return JSON.parse(normalized);
  } catch (cause) {
    throw new ResponseParseError(response, raw, cause, requestInfo);
  }
}
async function parseErrorBody(response, method) {
  if (hasNoBody(response, method)) {
    return null;
  }
  const mediaType = getMediaType(response.headers);
  if (mediaType && !isJsonMediaType(mediaType) && !isTextMediaType(mediaType)) {
    return typeof response.blob === "function" ? response.blob() : response.text();
  }
  const raw = await response.text();
  const normalized = stripBom(raw);
  const trimmed = normalized.trim();
  if (trimmed === "") {
    return null;
  }
  if (isJsonMediaType(mediaType) || looksLikeJson(normalized)) {
    try {
      return JSON.parse(normalized);
    } catch {
      return raw;
    }
  }
  return raw;
}
function inferResponseType(response) {
  const mediaType = getMediaType(response.headers);
  if (isJsonMediaType(mediaType)) return "json";
  if (isTextMediaType(mediaType) || mediaType == null) return "text";
  return "blob";
}
async function parseSuccessBody(response, responseType, requestInfo) {
  if (hasNoBody(response, requestInfo.method)) {
    return null;
  }
  const effectiveType = responseType === "auto" ? inferResponseType(response) : responseType;
  switch (effectiveType) {
    case "json":
      return parseJsonBody(response, requestInfo);
    case "text": {
      const text = await response.text();
      return text === "" ? null : text;
    }
    case "blob":
      if (typeof response.blob !== "function") {
        throw new TypeError(
          'Blob responses are not supported in this runtime. Use responseType "json" or "text" instead.'
        );
      }
      return response.blob();
  }
}
async function customFetch(input, options = {}) {
  input = applyBaseUrl(input);
  const { responseType = "auto", headers: headersInit, ...init } = options;
  const method = resolveMethod(input, init.method);
  if (init.body != null && (method === "GET" || method === "HEAD")) {
    throw new TypeError(`customFetch: ${method} requests cannot have a body.`);
  }
  const headers = mergeHeaders(isRequest(input) ? input.headers : void 0, headersInit);
  if (typeof init.body === "string" && !headers.has("content-type") && looksLikeJson(init.body)) {
    headers.set("content-type", "application/json");
  }
  if (responseType === "json" && !headers.has("accept")) {
    headers.set("accept", DEFAULT_JSON_ACCEPT);
  }
  const requestInfo = { method, url: resolveUrl(input) };
  const response = await fetch(input, { ...init, method, headers });
  if (!response.ok) {
    const errorData = await parseErrorBody(response, method);
    throw new ApiError(response, errorData, requestInfo);
  }
  return await parseSuccessBody(response, responseType, requestInfo);
}
const getSubmitRequestUrl = () => {
  return `/api/request`;
};
const submitRequest = async (invitationInput, options) => {
  return customFetch(
    getSubmitRequestUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(invitationInput)
    }
  );
};
const getSubmitRequestMutationOptions = (options) => {
  const mutationKey = ["submitRequest"];
  const { mutation: mutationOptions, request: requestOptions } = { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return submitRequest(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useSubmitRequest = (options) => {
  return useMutation(getSubmitRequestMutationOptions());
};
const ease = [0.16, 1, 0.3, 1];
function FadeIn({
  children,
  className,
  delay = 0
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return /* @__PURE__ */ jsx("div", { className, children });
  }
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-40px" },
      transition: { duration: 0.55, ease, delay },
      className,
      children
    }
  );
}
function Lockup({
  className = "",
  fontSize,
  showHub = true
}) {
  const textStyle = {
    fontFamily: "'Fraunces', serif",
    fontStyle: "normal",
    fontWeight: 100,
    fontVariationSettings: "'opsz' 144, 'WONK' 1",
    letterSpacing: "-0.015em",
    ...fontSize ? { fontSize } : {}
  };
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-baseline gap-[0.15em] ${className}`, children: [
    /* @__PURE__ */ jsx("span", { style: textStyle, children: "inner" }),
    /* @__PURE__ */ jsx(
      "span",
      {
        className: "inline-block bg-[#18FF85] flex-shrink-0",
        style: { width: "0.42em", height: "0.42em", marginBottom: "0.05em" },
        "aria-hidden": "true"
      }
    ),
    showHub && /* @__PURE__ */ jsx("span", { style: textStyle, children: "hub" })
  ] });
}
function SignatureMark() {
  return /* @__PURE__ */ jsx(
    Link,
    {
      href: "/",
      className: "inline-flex group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2",
      children: /* @__PURE__ */ jsx(
        Lockup,
        {
          className: "text-foreground group-hover:opacity-80 transition-opacity",
          fontSize: "clamp(24px, 2.6vw, 34px)"
        }
      )
    }
  );
}
function formatIstanbul(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("hour")}:${get("minute")}:${get("second")}`;
}
function LiveClock() {
  const [time, setTime] = useState(() => formatIstanbul(/* @__PURE__ */ new Date()));
  useEffect(() => {
    const id = setInterval(() => setTime(formatIstanbul(/* @__PURE__ */ new Date())), 1e3);
    return () => clearInterval(id);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "text-right font-mono text-[10px] uppercase tracking-widest leading-relaxed", children: [
    /* @__PURE__ */ jsxs("div", { className: "hidden md:block tabular-nums text-muted-foreground", children: [
      "İstanbul 41.00°N 28.97°E · ",
      time,
      " TRT"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "md:hidden tabular-nums text-muted-foreground", children: [
      time,
      " TRT"
    ] })
  ] });
}
function Grain() {
  return /* @__PURE__ */ jsx("div", { className: "grain-overlay", "aria-hidden": "true" });
}
const SECTIONS = [
  { id: "section-01", label: "01" },
  { id: "section-02", label: "02" },
  { id: "section-03", label: "03" },
  { id: "section-04", label: "04" },
  { id: "section-05", label: "05" },
  { id: "section-06", label: "06" },
  { id: "section-07", label: "07" }
];
function IndexRail() {
  const [active, setActive] = useState("section-01");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsx(
    "nav",
    {
      "aria-label": "Section index",
      className: "hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-4",
      children: SECTIONS.map(({ id, label }) => {
        const isActive = active === id;
        return /* @__PURE__ */ jsxs(
          "a",
          {
            href: `#${id}`,
            className: "flex items-center gap-2 font-mono text-[11px] tabular-nums tracking-widest transition-opacity duration-500",
            style: { opacity: isActive ? 1 : 0.35 },
            children: [
              isActive && /* @__PURE__ */ jsx(
                "span",
                {
                  className: "w-[5px] h-[5px] bg-[var(--inner-green)] flex-shrink-0",
                  "aria-hidden": "true"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: isActive ? "text-foreground" : "text-muted-foreground", children: label })
            ]
          },
          id
        );
      })
    }
  );
}
const TOTAL = 34;
const RADIUS = 130;
const SIZE = 7;
const VIEWBOX = 320;
const CENTER = VIEWBOX / 2;
function DiagramCircle() {
  const squares = Array.from({ length: TOTAL }, (_, i) => {
    const angle = i / TOTAL * Math.PI * 2 - Math.PI / 2;
    const x = CENTER + RADIUS * Math.cos(angle);
    const y = CENTER + RADIUS * Math.sin(angle);
    return { x, y, isGreen: i === 0 };
  });
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-6", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx(
      "svg",
      {
        viewBox: `0 0 ${VIEWBOX} ${VIEWBOX}`,
        className: "w-full max-w-[320px] h-auto animate-diagram-spin",
        role: "presentation",
        focusable: "false",
        children: squares.map((s, i) => /* @__PURE__ */ jsx(
          "rect",
          {
            x: s.x - SIZE / 2,
            y: s.y - SIZE / 2,
            width: SIZE,
            height: SIZE,
            fill: s.isGreen ? "var(--inner-green)" : "var(--bone)",
            opacity: s.isGreen ? 1 : 0.85
          },
          i
        ))
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest opacity-50", children: "34 · One circle" }),
    /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Thirty-four squares forming one circle." })
  ] });
}
function Preloader() {
  const [phase, setPhase] = useState("idle");
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("inner_preloader_seen");
    if (reduced || seen) {
      setPhase("done");
      return;
    }
    sessionStorage.setItem("inner_preloader_seen", "1");
    setPhase("in");
    const t1 = setTimeout(() => setPhase("out"), 500);
    const t2 = setTimeout(() => setPhase("done"), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  if (phase === "done") return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      "aria-hidden": "true",
      className: "fixed inset-0 z-[9998] bg-[var(--ink)] flex items-center justify-center",
      style: {
        transition: "transform 400ms var(--ease-expo), visibility 0ms 400ms",
        transform: phase === "out" ? "translateY(-110%)" : "translateY(0)",
        visibility: phase === "out" ? "hidden" : "visible"
      },
      children: /* @__PURE__ */ jsx(
        "span",
        {
          className: "w-[14px] h-[14px] bg-[var(--inner-green)]",
          style: {
            animation: phase === "in" ? "preloader-pulse 500ms ease-in-out" : void 0
          }
        }
      )
    }
  );
}
function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1.4
    });
    let frame = 0;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [enabled]);
}
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  LabelPrimitive.Root,
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label.displayName = LabelPrimitive.Root.displayName;
const Form = FormProvider;
const FormFieldContext = React.createContext(null);
const FormField = ({
  ...props
}) => {
  return /* @__PURE__ */ jsx(FormFieldContext.Provider, { value: { name: props.name }, children: /* @__PURE__ */ jsx(Controller, { ...props }) });
};
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>");
  }
  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};
const FormItemContext = React.createContext(null);
const FormItem = React.forwardRef(({ className, ...props }, ref) => {
  const id = React.useId();
  return /* @__PURE__ */ jsx(FormItemContext.Provider, { value: { id }, children: /* @__PURE__ */ jsx("div", { ref, className: cn("space-y-2", className), ...props }) });
});
FormItem.displayName = "FormItem";
const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return /* @__PURE__ */ jsx(
    Label,
    {
      ref,
      className: cn(error && "text-destructive", className),
      htmlFor: formItemId,
      ...props
    }
  );
});
FormLabel.displayName = "FormLabel";
const FormControl = React.forwardRef(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return /* @__PURE__ */ jsx(
    Slot,
    {
      ref,
      id: formItemId,
      "aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
      "aria-invalid": !!error,
      ...props
    }
  );
});
FormControl.displayName = "FormControl";
const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return /* @__PURE__ */ jsx(
    "p",
    {
      ref,
      id: formDescriptionId,
      className: cn("text-[0.8rem] text-muted-foreground", className),
      ...props
    }
  );
});
FormDescription.displayName = "FormDescription";
const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;
  if (!body) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "p",
    {
      ref,
      id: formMessageId,
      className: cn("text-[0.8rem] font-medium text-destructive", className),
      ...props,
      children: body
    }
  );
});
FormMessage.displayName = "FormMessage";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      className: cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ref,
      ...props
    }
  );
});
Textarea.displayName = "Textarea";
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default: (
          // @replit: no hover, and add primary border
          "bg-primary text-primary-foreground border border-primary-border"
        ),
        destructive: "bg-destructive text-destructive-foreground shadow-sm border-destructive-border",
        outline: (
          // @replit Shows the background color of whatever card / sidebar / accent background it is inside of.
          // Inherits the current text color. Uses shadow-xs. no shadow on active
          // No hover state
          " border [border-color:var(--button-outline)] shadow-xs active:shadow-none "
        ),
        secondary: (
          // @replit border, no hover, no shadow, secondary border.
          "border bg-secondary text-secondary-foreground border border-secondary-border "
        ),
        // @replit no hover, transparent border
        ghost: "border border-transparent",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        // @replit changed sizes
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-md px-3 text-xs",
        lg: "min-h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  whoYouAre: z.string().min(1, "Please tell us who you are"),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  whoIntroduced: z.string().optional(),
  company: z.string().optional()
});
const fieldClass = "rounded-none border-0 border-b border-border bg-transparent px-0 py-4 focus-visible:ring-0 focus-visible:border-foreground focus-visible:border-b-2 transition-[border-width]";
function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 48);
    const id = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(start);
      if (start >= to) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [inView, to]);
  return /* @__PURE__ */ jsxs("span", { ref, children: [
    val,
    suffix
  ] });
}
function SectionLabel({ label, meta }) {
  return /* @__PURE__ */ jsx(FadeIn, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-6 pb-6 mb-16 border-b border-border/20 font-mono text-xs uppercase tracking-widest", children: [
    /* @__PURE__ */ jsx("span", { children: label }),
    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground whitespace-nowrap", children: meta })
  ] }) });
}
const MODULES = [
  {
    id: "signal",
    name: "inner·signal",
    desc: "AI-powered deal and opportunity feed. The right signals, before anyone else sees them.",
    icon: Zap,
    tag: "AI Layer"
  },
  {
    id: "match",
    name: "inner·match",
    desc: "Co-founder, mentor, and investor matching inside a closed circle. Trust-based connections.",
    icon: Users,
    tag: "Matching"
  },
  {
    id: "capital",
    name: "inner·capital",
    desc: "Private deal flow and investment pipeline. SPVs, demo days, and co-investment opportunities.",
    icon: TrendingUp,
    tag: "Investments"
  },
  {
    id: "vault",
    name: "inner·vault",
    desc: "Shared knowledge base. Pitch decks, market research, and documents — permissioned and searchable.",
    icon: BookOpen,
    tag: "Knowledge"
  },
  {
    id: "pulse",
    name: "inner·pulse",
    desc: "Live ecosystem signal dashboard. What's moving, what's trending, what matters — inside only.",
    icon: Radio,
    tag: "Intelligence"
  },
  {
    id: "id",
    name: "inner·id",
    desc: "Portable verified membership identity. Your inner.hub membership carries weight beyond the platform.",
    icon: Fingerprint,
    tag: "Identity"
  },
  {
    id: "api",
    name: "inner·api",
    desc: "Platform API for integrations and partners. Build on top of the inner.hub infrastructure.",
    icon: Code2,
    tag: "Platform"
  },
  {
    id: "bounty",
    name: "inner·bounty",
    desc: "Community task system. Companies post challenges, members solve them, platform facilitates.",
    icon: Target,
    tag: "Marketplace"
  }
];
const MARQUEE_ITEMS = [
  "inner·signal",
  "inner·match",
  "inner·capital",
  "inner·vault",
  "inner·pulse",
  "inner·id",
  "inner·api",
  "inner·bounty"
];
function MarqueeStrip() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return /* @__PURE__ */ jsx("div", { className: "overflow-hidden border-y border-border/15 py-4 bg-background", children: /* @__PURE__ */ jsx(
    motion.div,
    {
      className: "flex gap-16 whitespace-nowrap",
      animate: { x: ["0%", "-50%"] },
      transition: { duration: 24, ease: "linear", repeat: Infinity },
      children: items.map((item, i) => /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs uppercase tracking-widest text-muted-foreground flex-shrink-0", children: [
        item,
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--inner-green)] ml-4", children: "·" })
      ] }, i))
    }
  ) });
}
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      className: "fixed top-0 left-0 right-0 h-[2px] bg-[var(--inner-green)] origin-left z-[9999]",
      style: { scaleX: scrollYProgress }
    }
  );
}
function ModuleCard({ mod, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = mod.icon;
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      ref,
      initial: { opacity: 0, y: 32 },
      animate: inView ? { opacity: 1, y: 0 } : {},
      transition: { duration: 0.5, delay: index % 4 * 0.08, ease: [0.16, 1, 0.3, 1] },
      className: "group border border-border/15 p-6 md:p-8 flex flex-col gap-4 hover:border-border/40 transition-colors duration-300 cursor-default",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsx("div", { className: "size-9 border border-border/20 flex items-center justify-center group-hover:border-[var(--inner-green)]/40 transition-colors duration-300", children: /* @__PURE__ */ jsx(Icon, { className: "size-4 text-muted-foreground group-hover:text-[var(--ink)] transition-colors duration-300", strokeWidth: 1.5 }) }),
          /* @__PURE__ */ jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50 border border-border/15 px-2 py-1", children: mod.tag })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-serif italic text-xl mb-2 text-foreground/90 group-hover:text-foreground transition-colors duration-300", children: mod.name }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: mod.desc })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-auto pt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300", children: [
          /* @__PURE__ */ jsx("div", { className: "h-[1px] flex-1 bg-[var(--inner-green)]/30" }),
          /* @__PURE__ */ jsx(ArrowRight, { className: "size-3 text-[var(--inner-green)]" })
        ] })
      ]
    }
  );
}
function StatItem({ n, label, suffix = "" }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start", children: [
    /* @__PURE__ */ jsx("span", { className: "font-display font-serif italic text-5xl md:text-7xl leading-none mb-3 text-[var(--bone)]", children: /* @__PURE__ */ jsx(Counter, { to: n, suffix }) }),
    /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest opacity-40 text-[var(--bone)]", children: label })
  ] });
}
function Home() {
  useLenis(true);
  const { mutate: submitRequest2, isSuccess, isError, isPending } = useSubmitRequest();
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 120]);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", whoYouAre: "", link: "", whoIntroduced: "", company: "" }
  });
  useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
    }
  }, []);
  const onSubmit = (data) => {
    submitRequest2({
      data: {
        name: data.name,
        email: data.email,
        whoYouAre: data.whoYouAre,
        link: data.link || null,
        whoIntroduced: data.whoIntroduced || null,
        company: data.company || null
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground flex flex-col", children: [
    /* @__PURE__ */ jsx("a", { href: "#main-content", className: "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-foreground focus:text-background focus:px-4 focus:py-2 font-mono text-xs uppercase tracking-widest", children: "Skip to content" }),
    /* @__PURE__ */ jsx(ScrollProgress, {}),
    /* @__PURE__ */ jsx(Preloader, {}),
    /* @__PURE__ */ jsx(Grain, {}),
    /* @__PURE__ */ jsx(IndexRail, {}),
    /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-50 h-[60px] md:h-[72px] px-6 md:px-12 lg:px-[10%] flex items-center justify-between bg-background/90 backdrop-blur-sm border-b border-border/20", children: [
      /* @__PURE__ */ jsx(SignatureMark, {}),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
        /* @__PURE__ */ jsx(LiveClock, {}),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/panel",
            className: "font-mono text-xs uppercase tracking-widest text-foreground/80 hover:text-foreground transition-colors",
            children: "Giriş Yap"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { id: "main-content", className: "flex-grow", children: [
      /* @__PURE__ */ jsxs("section", { ref: heroRef, className: "h-[100svh] flex flex-col justify-center px-6 md:px-12 lg:px-[10%] relative overflow-hidden", children: [
        /* @__PURE__ */ jsx(
          motion.div,
          {
            className: "absolute inset-0 pointer-events-none",
            style: { y: heroY },
            children: /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 right-[5%] -translate-y-1/2 size-[600px] rounded-full bg-[var(--inner-green)]/[0.025] blur-3xl" })
          }
        ),
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 24 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-[var(--inner-green)] animate-beacon" }),
                "İstanbul → Global · Est. 2026"
              ] }),
              /* @__PURE__ */ jsx("h1", { className: "font-display font-serif italic text-5xl md:text-7xl lg:text-8xl leading-[1.05] max-w-[18ch] text-balance", children: "What comes next starts here." })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 24 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
            className: "mt-12",
            children: /* @__PURE__ */ jsx("p", { className: "max-w-[50ch] text-lg md:text-xl text-foreground/80 leading-[1.6]", children: "inner.hub is a private circle of founders, builders, and investors. People who meet early and support each other first." })
          }
        ),
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.8, delay: 0.5 },
            className: "absolute bottom-10 left-6 md:left-12 lg:left-[10%] flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground",
            children: [
              /* @__PURE__ */ jsx(
                motion.div,
                {
                  animate: { y: [0, 6, 0] },
                  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  children: "↓"
                }
              ),
              /* @__PURE__ */ jsx("span", { children: "scroll" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx(MarqueeStrip, {}),
      /* @__PURE__ */ jsxs("section", { id: "section-01", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
        /* @__PURE__ */ jsx(SectionLabel, { label: "01 · The idea", meta: "Coming together" }),
        /* @__PURE__ */ jsx(FadeIn, { children: /* @__PURE__ */ jsx("div", { className: "max-w-[65ch] text-lg md:text-xl leading-[1.7] text-foreground/90", children: "AI is the center of this circle. Around it are the founders, builders, and investors pushing what comes next. inner.hub brings them together. It starts in İstanbul, and it starts early." }) })
      ] }),
      /* @__PURE__ */ jsxs("section", { id: "section-02", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
        /* @__PURE__ */ jsx(SectionLabel, { label: "02 · The first thirty-four", meta: "Founding seats" }),
        /* @__PURE__ */ jsx(FadeIn, { children: /* @__PURE__ */ jsx("p", { className: "max-w-[65ch] text-lg leading-[1.7] text-foreground/90 mb-16", children: "It starts with thirty-four people, chosen one by one:" }) }),
        /* @__PURE__ */ jsx("div", { className: "max-w-3xl mb-16", children: [
          { label: "Founders", line: "People building startups, in AI and beyond." },
          { label: "Builders", line: "Engineers and researchers doing serious AI work." },
          { label: "Investors", line: "Angel investors and people from venture funds." }
        ].map((item, i) => /* @__PURE__ */ jsx(FadeIn, { delay: i * 0.1, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12 py-6 border-t border-border/15 last:border-b", children: [
          /* @__PURE__ */ jsx("div", { className: "font-mono text-xs uppercase tracking-widest text-muted-foreground w-full md:w-48 flex-shrink-0", children: item.label }),
          /* @__PURE__ */ jsx("p", { className: "text-lg text-foreground/90", children: item.line })
        ] }) }, item.label)) }),
        /* @__PURE__ */ jsx(FadeIn, { delay: 0.2, children: /* @__PURE__ */ jsx("p", { className: "max-w-[65ch] text-lg leading-[1.7] text-foreground/90", children: "These thirty-four are not just members. They are the founding members of inner.hub." }) })
      ] }),
      /* @__PURE__ */ jsxs("section", { id: "section-03", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
        /* @__PURE__ */ jsx(SectionLabel, { label: "03 · The platform", meta: "Eight tools" }),
        /* @__PURE__ */ jsxs(FadeIn, { children: [
          /* @__PURE__ */ jsx("h2", { className: "font-display font-serif italic text-4xl md:text-5xl max-w-2xl mb-4 text-balance", children: "Everything a closed circle needs." }),
          /* @__PURE__ */ jsx("p", { className: "max-w-[55ch] text-lg text-foreground/70 leading-[1.7] mb-16", children: "Eight interconnected tools built for operators who move fast and think in systems." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border/15", children: MODULES.map((mod, i) => /* @__PURE__ */ jsx("div", { className: "bg-background", children: /* @__PURE__ */ jsx(ModuleCard, { mod, index: i }) }, mod.id)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { id: "section-04", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
        /* @__PURE__ */ jsx(SectionLabel, { label: "04 · What this is", meta: "The point" }),
        /* @__PURE__ */ jsx(FadeIn, { children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "max-w-[46ch] text-foreground/90",
            style: { fontSize: "clamp(19px, 2.4vw, 26px)", lineHeight: 1.55 },
            children: /* @__PURE__ */ jsx("p", { children: "Big things start here. New ideas are discussed here, tested here, and supported here — by people who can actually build them and fund them." })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("section", { id: "section-05", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
        /* @__PURE__ */ jsx(SectionLabel, { label: "05 · Entry", meta: "By invitation" }),
        /* @__PURE__ */ jsxs(FadeIn, { children: [
          /* @__PURE__ */ jsx("h2", { className: "font-display font-serif italic text-4xl md:text-5xl max-w-2xl mb-8 text-balance", children: "Entry is by invitation. Always." }),
          /* @__PURE__ */ jsx("p", { className: "max-w-[65ch] text-lg leading-[1.7] text-foreground/90 mb-20", children: "There are no tickets, no tiers, and no public list. Members are put forward from inside the circle, considered with care, and invited personally." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-w-3xl", children: [
          { label: "Your name", line: "Someone inside the circle puts your name forward." },
          { label: "Consideration", line: "We take our time. Fit beats fame." },
          { label: "Invitation", line: "If it is right, you hear from us directly." }
        ].map((item, i) => /* @__PURE__ */ jsx(FadeIn, { delay: i * 0.1, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12 py-6 border-t border-border/15 last:border-b", children: [
          /* @__PURE__ */ jsx("div", { className: "font-mono text-xs uppercase tracking-widest text-muted-foreground w-full md:w-48 flex-shrink-0", children: item.label }),
          /* @__PURE__ */ jsx("p", { className: "text-lg text-foreground/90", children: item.line })
        ] }) }, item.label)) })
      ] }),
      /* @__PURE__ */ jsxs(
        "section",
        {
          id: "section-06",
          className: "px-6 md:px-12 lg:px-[10%] py-32 md:py-48 border-t border-border/15 bg-[var(--ink)] text-[var(--bone)] transition-colors duration-700 overflow-hidden relative",
          children: [
            /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 size-[500px] bg-[var(--inner-green)]/[0.03] blur-3xl pointer-events-none" }),
            /* @__PURE__ */ jsxs(FadeIn, { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-6 pb-6 mb-20 border-b border-white/15 font-mono text-xs uppercase tracking-widest opacity-60", children: [
                /* @__PURE__ */ jsx("span", { children: "06 · The gathering" }),
                /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: "Sep 2026 · İstanbul" })
              ] }),
              /* @__PURE__ */ jsx("h2", { className: "font-display font-serif italic text-4xl md:text-5xl lg:text-6xl max-w-3xl mb-24 text-balance", children: "The first inner.hub gathering. İstanbul, September 2026." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center gap-16 mb-24", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-6 md:gap-10 min-w-0 lg:flex-1", children: [
                /* @__PURE__ */ jsx(StatItem, { n: 34, label: "People" }),
                /* @__PURE__ */ jsx(StatItem, { n: 2, label: "Days" }),
                /* @__PURE__ */ jsx(StatItem, { n: 8, label: "Modules" })
              ] }),
              /* @__PURE__ */ jsx(FadeIn, { delay: 0.2, className: "flex-shrink-0", children: /* @__PURE__ */ jsx(DiagramCircle, {}) })
            ] }),
            /* @__PURE__ */ jsx(FadeIn, { delay: 0.15, children: /* @__PURE__ */ jsx("p", { className: "font-serif text-2xl md:text-3xl max-w-2xl text-balance opacity-80", children: "Thirty-four people. Two days. One circle. The first of many." }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("section", { id: "section-07", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
        /* @__PURE__ */ jsx(SectionLabel, { label: "07 · What's next", meta: "In time" }),
        /* @__PURE__ */ jsxs(FadeIn, { children: [
          /* @__PURE__ */ jsx("h2", { className: "font-display font-serif italic text-4xl md:text-5xl max-w-2xl mb-8 text-balance", children: "hub is where it starts." }),
          /* @__PURE__ */ jsx(
            "p",
            {
              className: "max-w-[46ch] text-foreground/90",
              style: { fontSize: "clamp(19px, 2.4vw, 26px)", lineHeight: 1.55 },
              children: "We are building something bigger, step by step. We announce things when they are real. There is more."
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { id: "section-08", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
        /* @__PURE__ */ jsx(SectionLabel, { label: "08 · Request an invitation", meta: "We read everything" }),
        /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: isSuccess ? /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 16 },
            animate: { opacity: 1, y: 0 },
            className: "max-w-2xl py-12",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
                /* @__PURE__ */ jsx("div", { className: "size-2 rounded-full bg-[var(--inner-green)] animate-beacon" }),
                /* @__PURE__ */ jsx("span", { className: "font-mono text-xs uppercase tracking-widest text-muted-foreground", children: "Received" })
              ] }),
              /* @__PURE__ */ jsx("h2", { className: "font-display font-serif italic text-4xl md:text-5xl text-balance", children: "If it fits, we will be in touch." })
            ]
          },
          "success"
        ) : /* @__PURE__ */ jsx(motion.div, { children: /* @__PURE__ */ jsx(FadeIn, { children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-display font-serif italic text-4xl md:text-5xl mb-6 text-balance", children: "Request an invitation." }),
          /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground mb-16 leading-[1.7]", children: "Most people arrive by invitation, but good people also find us on their own. Tell us who you are and what you are building." }),
          /* @__PURE__ */ jsx(Form, { ...form, children: /* @__PURE__ */ jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-10", children: [
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "name",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { className: "font-mono text-xs tracking-widest uppercase", children: "Name" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Your full name", className: fieldClass, "data-testid": "input-name", ...field }) }),
                  /* @__PURE__ */ jsx(FormMessage, { className: "font-mono text-[10px] uppercase text-[var(--error)]" })
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "email",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { className: "font-mono text-xs tracking-widest uppercase", children: "Email" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { type: "email", placeholder: "you@example.com", className: fieldClass, "data-testid": "input-email", ...field }) }),
                  /* @__PURE__ */ jsx(FormMessage, { className: "font-mono text-[10px] uppercase text-[var(--error)]" })
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "whoYouAre",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { className: "font-mono text-xs tracking-widest uppercase", children: "Who you are / What you're building" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Textarea, { placeholder: "A brief note on your work and intent.", className: `${fieldClass} min-h-[120px] resize-none`, "data-testid": "input-who-you-are", ...field }) }),
                  /* @__PURE__ */ jsx(FormMessage, { className: "font-mono text-[10px] uppercase text-[var(--error)]" })
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "link",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { className: "font-mono text-xs tracking-widest uppercase text-muted-foreground", children: "Link (Optional)" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "LinkedIn or website", className: `${fieldClass} text-muted-foreground`, "data-testid": "input-link", ...field }) }),
                  /* @__PURE__ */ jsx(FormMessage, { className: "font-mono text-[10px] uppercase text-[var(--error)]" })
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "whoIntroduced",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { className: "font-mono text-xs tracking-widest uppercase text-muted-foreground", children: "Who introduced you (Optional)" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Name of your connection", className: `${fieldClass} text-muted-foreground`, "data-testid": "input-who-introduced", ...field }) }),
                  /* @__PURE__ */ jsx(FormMessage, { className: "font-mono text-[10px] uppercase text-[var(--error)]" })
                ] })
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "sr-only", "aria-hidden": "true", children: /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "company",
                render: ({ field }) => /* @__PURE__ */ jsx(FormItem, { children: /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { tabIndex: -1, autoComplete: "off", ...field }) }) })
              }
            ) }),
            isError && /* @__PURE__ */ jsx("div", { className: "text-[var(--error)] font-mono text-xs uppercase tracking-widest", "data-testid": "text-error", children: "Something went wrong. Please try again." }),
            /* @__PURE__ */ jsx("div", { className: "pt-8", children: /* @__PURE__ */ jsxs(
              Button,
              {
                type: "submit",
                disabled: isPending,
                className: "group/btn relative overflow-hidden rounded-none bg-foreground text-background border border-foreground font-mono text-xs tracking-widest uppercase px-12 py-6 h-auto transition-colors duration-300",
                "data-testid": "button-submit",
                children: [
                  /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "absolute left-0 top-0 h-full w-2 bg-background -translate-x-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0" }),
                  /* @__PURE__ */ jsx("span", { className: "relative inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-1", children: isPending ? "Sending…" : "Send" })
                ]
              }
            ) })
          ] }) })
        ] }) }) }, "form") })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("footer", { id: "site-footer", className: "bg-[var(--ink)] px-6 md:px-12 lg:px-[10%] pt-20 pb-6 flex flex-col gap-16 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsx("img", { src: "/inner-logo.png", alt: "inner", width: 140, height: 140, className: "w-[140px] h-[140px]" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] opacity-60", children: /* @__PURE__ */ jsx("span", { children: "The next wave knows each other · İstanbul → Global" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center md:justify-end gap-5", children: [
            /* @__PURE__ */ jsx("a", { href: "#", "aria-label": "inner on LinkedIn", className: "text-[var(--bone)] opacity-60 hover:opacity-100 transition-opacity duration-300", children: /* @__PURE__ */ jsx(Linkedin, { size: 20, strokeWidth: 1.5 }) }),
            /* @__PURE__ */ jsx("a", { href: "#", "aria-label": "inner on Instagram", className: "text-[var(--bone)] opacity-60 hover:opacity-100 transition-opacity duration-300", children: /* @__PURE__ */ jsx(Instagram, { size: 20, strokeWidth: 1.5 }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] opacity-30", children: "© 2026 inner. İstanbul." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-[var(--bone)] leading-none -mb-4 md:-mb-8", "aria-hidden": "true", children: /* @__PURE__ */ jsx(Lockup, { showHub: false, fontSize: "clamp(4rem, 16vw, 13rem)" }) }),
      /* @__PURE__ */ jsx("span", { className: "sr-only", children: "inner." })
    ] })
  ] });
}
function render() {
  const queryClient = new QueryClient();
  return renderToString(
    /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsx(Router, { ssrPath: "/", children: /* @__PURE__ */ jsx(Home, {}) }) }) })
  );
}
export {
  render
};
