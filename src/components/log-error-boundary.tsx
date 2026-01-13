"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

class LogErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Component Crash:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-500">
                    <AlertTriangle className="h-4 w-4" />
                </Button>
            );
        }

        return this.props.children;
    }
}

export default LogErrorBoundary;
