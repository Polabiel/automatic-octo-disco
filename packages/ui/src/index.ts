import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: Parameters<typeof cx>) => twMerge(cx(inputs));

export { cn };

export { Badge } from "./badge";
export { Button } from "./button";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
export * from "./dropdown-menu";
export * from "./form";
export { Input } from "./input";
export { Label } from "./label";
export { ThemeProvider, useTheme } from "./theme";
export { toast, Toaster } from "./toast";
