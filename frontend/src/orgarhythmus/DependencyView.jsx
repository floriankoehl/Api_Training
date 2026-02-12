import { useEffect, useRef, useState } from "react"
import fetch_project_teams from "./api";



const TEAMHEIGHT = 50
const TEAM_DRAG_HIGHLIGHT_HEIGHT = 5
const MARIGN_BETWEEN_DRAG_HIGHLIGHT = 5
const ROW = TEAMHEIGHT + MARIGN_BETWEEN_DRAG_HIGHLIGHT + 2 * MARIGN_BETWEEN_DRAG_HIGHLIGHT


export default function DependencyView(){
    const [teamOrder, setTeamOrder] = useState([])
    const [teams, setTeams] = useState({})
    const [ghost, setGhost] = useState(null)
    const teamContainerRef = useRef(null)
    const [dropIndex, setDropIndex] = useState(null)



    // Fetch all teams
    useEffect(() => {
        const fetch_teams = async () => {
            const res = await fetch_project_teams()
            console.log("real data:", res.teams)
            const fetched_teams = res.teams

            const fetchedTeamOrder = []
            const fetchedTeamObject = {}
            for (let i = 0; i < fetched_teams.length; i ++) {
                const team = fetched_teams[i]

                
                fetchedTeamOrder.push(team.id)
                fetchedTeamObject[team.id] = {
                    ...team,
                    height: TEAMHEIGHT
                }
            }
            console.log(fetchedTeamOrder)
            setTeamOrder(fetchedTeamOrder)
            setTeams(fetchedTeamObject)
        }
        fetch_teams()
    }, [])









    const handleTeamDrag = (event, team_key, order_index) => {
        const team = teams[team_key]
        const from_index = order_index
        let to_index =order_index
        console.log("correctly in here", team)

        const parent = teamContainerRef.current
        const parent_rect = parent.getBoundingClientRect()
        console.log("parent_rect", parent_rect)

        const children = [...parent.children]
        console.log("CHILDS", children)

        const startX = event.clientX - parent_rect.x
        const startY = event.clientY - parent_rect.y

        // setDropIndex(order_index)

        setGhost({
            ...team, 
            x: startX, 
            y: startY
            
        })

        const onMouseMove = (e) => {
            const new_x = e.clientX - parent_rect.x
            const new_y = e.clientY - parent_rect.y

            const relativeY = e.clientY - parent_rect.top

            let index = Math.floor((relativeY + TEAMHEIGHT/2) / ROW)
            if (index == order_index +1) {
                index = order_index
            }

            const clamped = Math.max(0, Math.min(index, teamOrder.length))
            to_index = clamped
            setDropIndex(clamped)






            setGhost((prev)=>{
                return ({
                    ...prev, 
                    x: new_x,
                    y: new_y
                })
            })
        }

        const onMouseUp = () => {

            // Reorder team
            let copy = [...teamOrder]
            const [moved] = copy.splice(from_index, 1)
            let targetIndex = to_index
            if (from_index < to_index) {
                targetIndex -= 1
            }

            copy.splice(targetIndex, 0, moved)
            setTeamOrder(copy)





            setGhost(null)
            setDropIndex(null)
            document.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseup", onMouseUp)
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)
    }


















    return (
        <>
            <div className="h-screen w-screen p-10">
                <div 
                ref={teamContainerRef}
                className="h-full w-full bg-white shadow-xl border border-gray-200 relative select-none">
                    

                    {/* Teams List */}
                    {teamOrder.map((team_key, index)=>{
                        // console.log("INDEX??? ", index, teams[team_key].name)
                        const team = teams[team_key]
                        return (
                            <div 
                            
                            key={`${team_key}_container`}>
                                {/* Redrag Highlighter */}
                                
                                <div 
                                style={{
                                    marginBottom: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                                    marginTop: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                                    height:  `${TEAM_DRAG_HIGHLIGHT_HEIGHT}px`,
                                    opacity: dropIndex === index ? 1 : 0
                                    
                                }}
                                className="bg-black rounded-full"></div>
                                






                                {/* Team */}
                                <div
                                onMouseDown={(e)=>{handleTeamDrag(e, team_key, index)}}
                                style={{
                                    height: team.height,
                                    backgroundColor: `${team.color}`,
                                    opacity: ghost?.id === team_key ? 0.2 : 1
                                }}
                                className="w-full bg-gray-200"
                                >{teams[team_key].name}</div>

                                
                                
                                
                            </div>
                        )
                        
                    })}




                    {/* LAST DROP HIGHLIGHT */}
                    <div 
                        style={{
                            marginBottom: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                            marginTop: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                            height:  `${TEAM_DRAG_HIGHLIGHT_HEIGHT}px`,
                            opacity: dropIndex === teamOrder.length ? 1 : 0

                            
                        }}
                        className="bg-black rounded-full"></div>




                    {/* Ghost */}
                    {ghost && <div 
                    className="bg-blue-200 absolute"
                    style={{
                        height: `${ghost.height}px`,
                        width: `100px`,
                        left: `${ghost.x}px`,
                        top: `${ghost.y}px`,
                        backgroundColor: `${ghost.color}`
                    }}
                    >
                        {ghost.name}
                    </div>}
                    

                </div>
            </div>
        </>
    )
}

