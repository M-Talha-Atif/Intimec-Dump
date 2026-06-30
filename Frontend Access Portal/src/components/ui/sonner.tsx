"use client"

import { useThemeContext } from "@/contexts/themeConfigContext"
import { Toaster as Sonner, ToasterProps } from "sonner"


const Toaster = ({ ...props }: ToasterProps) => {
  const { mode } = useThemeContext()

  return (
    <Sonner
      theme={mode as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        className: "bg-white dark:bg-[#0b1220] text-gray-900 dark:text-gray-50 ",
        classNames: {
          // Variants only handle border colors - background is controlled by base className above
          error: "border-red-200 dark:border-red-700",
          success: "border-green-200 dark:border-green-700",
          warning: "border-yellow-200 dark:border-yellow-700",
          info: "border-blue-200 dark:border-blue-700",
          description: "border-gray-200 dark:border-gray-700",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
