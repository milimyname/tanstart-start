import { Moon, Sun, Palette } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useTheme } from "@/app/components/theme-provider";

export function ModeToggle() {
  const { mode, company, setTheme } = useTheme();

  const showSunIcon =
    (company === "default" && mode !== "dark") || (company === "acme" && mode !== "dark");

  const showMoonIcon =
    (company === "default" && mode === "dark") || (company === "acme" && mode === "dark");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun
            className={`h-[1.2rem] w-[1.2rem] transition-all ${showSunIcon ? "rotate-0 scale-100" : "rotate-90 scale-0"}`}
          />
          <Moon
            className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${showMoonIcon ? "rotate-0 scale-100" : "rotate-90 scale-0"}`}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme({ company: "default" })}>
              Default
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme({ company: "acme" })}>
              Acme
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setTheme({ mode: "light" })}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme({ mode: "dark" })}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme({ mode: "system" })}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
