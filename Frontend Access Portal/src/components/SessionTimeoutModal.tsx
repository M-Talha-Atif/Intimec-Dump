"use client"

import { AlertTriangle,  LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface SessionTimeoutModalProps {
    remainingTime: number
    onLogout: () => void
    onStayActive: () => void
    isOpen?: boolean
    totalTime?: number
}

export default function SessionTimeoutModal({
                                                remainingTime,
                                                onLogout,
                                                onStayActive,
                                                isOpen = true,
                                                totalTime = 60,
                                            }: SessionTimeoutModalProps) {
    const progressValue = (remainingTime / totalTime) * 100

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
                <div className="text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                        <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold">Session Timeout Warning</h2>
                        <div className="text-muted-foreground space-y-2">
                            <p>You&#39;ve been inactive for a while.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 mt-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Time remaining</span>
                            <span>{remainingTime}s</span>
                        </div>
                        <Progress value={progressValue} className="h-2" />
                    </div>
                </div>

                <div className="flex flex-col justify-center sm:flex-row gap-2 mt-6">
                    <Button variant="outline" onClick={onLogout} className="w-full sm:w-auto order-2 sm:order-1 bg-transparent">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout Now
                    </Button>
                    <Button onClick={onStayActive} className="w-full sm:w-auto order-1 sm:order-2">
                        <User className="h-4 w-4 mr-2" />
                        I&#39;m Still Here
                    </Button>
                </div>
            </div>
        </div>
    )
}