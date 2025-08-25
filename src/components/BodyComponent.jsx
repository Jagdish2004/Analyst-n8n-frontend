import { ChatInterface } from "./ChatInterface"
import { SideBar } from "./SideBar"
import { useState } from "react"

const BodyComponent = () => {
    const [selectedSessionId, setSelectedSessionId] = useState(null)

    return (
        <>
            <div style={{display:"flex", flexDirection:"row", width:"100%"}}>
                <SideBar onSelectSession={setSelectedSessionId} />
                <div style={{flex:1, padding:"0 16px"}}>
                    <ChatInterface sessionId={selectedSessionId} />
                </div>
            </div>
        </>
    )
}

export default BodyComponent