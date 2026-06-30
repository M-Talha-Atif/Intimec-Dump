"use client";
import { useThemeContext } from "@/contexts/themeConfigContext";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";

export default function ThemeToggleButton({ isLogin }: { isLogin: boolean }) {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <Button
      size="icon"
      variant={"ghost"}
      onClick={toggleTheme}
      className={`${isLogin ? "absolute top-4 right-4 shadow-md" : ""
        }   hover:scale-105 transition`}
    >
      {mode === "light" ? (
        <Sun className="w-5 h-5 " />
      ) : (
        <Moon className="w-5 h-5 " />
      )}
    </Button>
  );
}
