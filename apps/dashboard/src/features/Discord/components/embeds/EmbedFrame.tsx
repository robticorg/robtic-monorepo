import { createContext } from "react"

export const EmbedContext = createContext({}).Provider

export const EmbedFrame = ({ color, children } : { color : string, children: React.ReactNode }) => {
    return (
        <EmbedContext value={color}>
            <div className="flex">
                <div></div>
                <div>
                    {children}
                </div>
            </div>
        </EmbedContext>
    )
}