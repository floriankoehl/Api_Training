import { useEffect, useRef, useState } from "react"
import {fetch_project_teams,
        safe_team_order,
        fetch_project_tasks }from "./api";


const TASKHEIGHT = 30
const TASKWIDTH = 200

const TEAMHEIGHT = 50
const TEAMWIDTH = 150

const TEAM_DRAG_HIGHLIGHT_HEIGHT = 5
const MARIGN_BETWEEN_DRAG_HIGHLIGHT = 5
const ROW = TEAMHEIGHT + MARIGN_BETWEEN_DRAG_HIGHLIGHT + 2 * MARIGN_BETWEEN_DRAG_HIGHLIGHT


export default function DependencyView(){
    const [teamOrder, setTeamOrder] = useState([])
    const [teams, setTeams] = useState({})
    const [ghost, setGhost] = useState(null)
    const teamContainerRef = useRef(null)
    const [dropIndex, setDropIndex] = useState(null)

    const [tasks, setTasks] = useState({})

    const [height, setHeight] = useState(0)

    useEffect(() => {
        if (!teamContainerRef.current) return
        setHeight(teamContainerRef.current.getBoundingClientRect().height)
    }, [])



    // ________________TEAMS___________________
    // ________________________________________
    // ________________________________________
    // ________________________________________
    // ________________________________________
    // Fetch all teams
    // useEffect(() => {
    //     const fetch_teams = async () => {
    //         const res = await fetch_project_teams()
    //         const fetched_teams = res.teams

    //         const fetchedTeamOrder = []
    //         const fetchedTeamObject = {}
    //         for (let i = 0; i < fetched_teams.length; i ++) {
    //             const team = fetched_teams[i]

                
    //             fetchedTeamOrder.push(team.id)
    //             fetchedTeamObject[team.id] = {
    //                 ...team,
    //                 height: TEAMHEIGHT,
    //                 tasks: []
    //             }
    //         }
    //         setTeamOrder(fetchedTeamOrder)
    //         setTeams(fetchedTeamObject)
    //     }
    //     fetch_teams()
    // }, [])

    useEffect(() => {
    const load_all = async () => {

        // 1️⃣ fetch teams
        const resTeams = await fetch_project_teams()
        const fetched_teams = resTeams.teams

        const teamOrder = []
        const teamObject = {}

        for (const team of fetched_teams) {
            teamOrder.push(team.id)
            teamObject[team.id] = {
                ...team,
                height: TEAMHEIGHT,
                tasks: []
            }
        }

        // 2️⃣ fetch tasks AFTER teams exist
        const resTasks = await fetch_project_tasks()
        console.log("RES TASKS", resTasks)

        for (const team_id in teamObject) {
            teamObject[team_id].tasks =
                resTasks.taskOrder?.[String(team_id)] || []
            
            teamObject[team_id].height = resTasks.taskOrder?.[String(team_id)].length * TASKHEIGHT
        }

        console.log(teamObject)
        // 3️⃣ commit state once
        setTeamOrder(teamOrder)
        setTeams(teamObject)
        setTasks(resTasks.tasks)
    }

    load_all()
}, [])











    const safe_team_order_local = async (new_order) => {
        const res = await safe_team_order(new_order)
    }

    const handleTeamDrag = (event, team_key, order_index) => {
        const team = teams[team_key]
        const from_index = order_index
        let to_index =order_index

        const parent = teamContainerRef.current
        const parent_rect = parent.getBoundingClientRect()

        const children = [...parent.children]

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

            // Determine drop index by comparing mouse Y to each team's midpoint.
            // Use only the team container nodes (ignore the trailing drop-highlighter child).
            const teamNodes = children.slice(0, teamOrder.length)
            let index = teamNodes.length // default: drop at end
            for (let i = 0; i < teamNodes.length; i++) {
                const childRect = teamNodes[i].getBoundingClientRect()
                const childTop = childRect.top - parent_rect.top
                const childMid = childTop + childRect.height / 2
                if (relativeY < childMid) {
                    index = i
                    break
                }
            }

            // If hovering just after the original item, treat it as the same gap
            if (index === order_index + 1) {
                index = order_index
            }

            const clamped = Math.max(0, Math.min(index, teamOrder.length))
            to_index = clamped
            setDropIndex(clamped)

            // for (let element of )




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

            safe_team_order_local(copy)




            setGhost(null)
            setDropIndex(null)
            document.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseup", onMouseUp)
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)
    }




    // ________________TASKS___________________
    // ________________________________________
    // ________________________________________
    // ________________________________________
    // ________________________________________


    // useEffect(()=>{
    //     if (Object.keys(teams).length === 0) return

    //     const fetch_all_tasks = async () => {
    //         const response = await fetch_project_tasks()
    //         const all_tasks = response.tasks
    //         setTasks(all_tasks)

    //         const task_orders = response.task_orders
            
    //         setTeams((prev_teams)=>{
    //             const updated_teams = {}
    //             for (let team_key in prev_teams) {
    //                 const team = prev_teams[team_key]
    //                 // console.log("These are the teams", team_key, team.name)
    //                 updated_teams[team_key] = {
    //                     ...team, 
    //                     tasks: task_orders?.[String(team_key)] || []
    //                 }
    //             }

    //             console.log("UPDATED TEAMS: ", updated_teams)
    //             return updated_teams
    //         })
    //     }
    //     fetch_all_tasks()
    // },[teams])











    return (
        <>
            <div className="h-screen w-screen p-10 flex">


                {/* ____________ Team Container ______________ */}
                {/* ____________ Team Container ______________ */}
                {/* ____________ Team Container ______________ */}
                {/* ____________ Team Container ______________ */}
                {/* ____________ Team Container ______________ */}
                {/* ____________ Team Container ______________ */}
                {/* ____________ Team Container ______________ */}
                <div 
                ref={teamContainerRef}
                style={{
                    width: `${TEAMWIDTH + TASKWIDTH}px`,
                    
                }}
                className="h-full w-full bg-white shadow-xl relative select-none">
                    

                    {/* Teams List */}
                    {teamOrder.map((team_key, index)=>{
                        const team = teams[team_key]
                        return (
                          <div key={`${team_key}_container`}>
                            {/* Redrag Highlighter */}

                            <div
                              style={{
                                marginBottom: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                                marginTop: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                                height: `${TEAM_DRAG_HIGHLIGHT_HEIGHT}px`,
                                opacity: dropIndex === index ? 1 : 0,
                              }}
                              className="bg-black rounded-l-full"
                            ></div>

                            {/* Team */}
                            <div
                              onMouseDown={(e) => {
                                handleTeamDrag(e, team_key, index);
                              }}
                              style={{
                                height: team.height,
                                backgroundColor: `${team.color}`,
                                opacity: ghost?.id === team_key ? 0.2 : 1,
                              }}
                              className="w-full bg-gray-200 flex border"
                            >
                              



                                    <div
                                    style={{
                                        width: `${TEAMWIDTH}px`
                                    }}
                                    // className="w-30"
                                    >
                                        {teams[team_key].name}
                                    </div>


                                    <div>
                                        {team.tasks.map((task_key, index) => {
                                        return (
                                        <div 
                                        className="border-b border-l"
                                        style={{
                                            height: `${TASKHEIGHT}px`,
                                            width: `${TASKWIDTH}px`,
                                            borderBottom: team.tasks.length-1 === index ? "none" : "1px solid black"

                                        }}
                                        key={`${task_key}_container`}>
                                            {tasks[task_key].name}
                                        </div>
                                        );
                                        })}
                                    </div>
                                    
                            </div>
                          </div>
                        );
                        
                    })}


                    {/* LAST DROP HIGHLIGHT */}
                    <div 
                        style={{
                            marginBottom: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                            marginTop: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                            height:  `${TEAM_DRAG_HIGHLIGHT_HEIGHT}px`,
                            opacity: dropIndex === teamOrder.length ? 1 : 0

                            
                        }}
                        className="bg-black rounded-l-full"></div>

                    {/* Ghost */}
                    {ghost && <div 
                    className="bg-blue-200 absolute"
                    style={{
                        height: `${ghost.height}px`,
                        width: `${TEAMWIDTH + TASKWIDTH}px`,
                        left: `${ghost.x}px`,
                        top: `${ghost.y}px`,
                        backgroundColor: `${ghost.color}`
                    }}
                    >
                        {ghost.name}
                    </div>}
                    

                </div>




                {/* ____________ Milestones Container ______________ */}
                <div
                style={{
                    // width: `${10000}px`,
                    height: `${height}px`
                }}
                className=" select-none overflow-x-auto"
                >
                    <div 
                    style={{
                        width: `10000px`
                    }}
                    >
                        {teamOrder.map((team_key, index)=>{
                        const team = teams[team_key]
                        return (
                          <div 
                          key={`${team_key}_container`}>
                            
                            
                            
                            {/* Redrag Highlighter */}
                            <div
                              style={{
                                marginBottom: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                                marginTop: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                                height: `${TEAM_DRAG_HIGHLIGHT_HEIGHT}px`,
                                opacity: dropIndex === index ? 1 : 0,
                              }}
                              className="bg-black rounded-r-full"
                            ></div>


                                <div className="border-t border-b"
                                style={{ height: `${team.height}px` }}>

                                {team.tasks.map((task_key, index) => {
                                    
                                    return (
                                        <div 
                                        style={{
                                            height: `${TASKHEIGHT}px`,
                                            borderBottom: team.tasks.length - 1 === index ? "none" : "1px solid black"
                                            
                                        }}
                                        key={`${task_key}_container`}>
                                </div>
                                );
                            })}
                            </div>

                          </div>
                        );
                        
                    })}

                    </div>
                </div>
            </div>
        </>
    )
}

