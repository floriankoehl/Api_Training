import { useEffect, useRef, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon  from '@mui/icons-material/DeleteForever';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
  fetch_project_teams,
  safe_team_order,
  fetch_project_tasks,
  fetch_project_details,
  get_all_milestones,
  add_milestone,
  update_start_index,
  delete_milestone,
  change_duration
} from "./api";




const TASKHEIGHT = 50;
const TASKWIDTH = 200;

const TEAMHEIGHT = 50;
const TEAMWIDTH = 150;

const TEAM_DRAG_HIGHLIGHT_HEIGHT = 5;
const MARIGN_BETWEEN_DRAG_HIGHLIGHT = 5;
const ROW =
  TEAMHEIGHT +
  MARIGN_BETWEEN_DRAG_HIGHLIGHT +
  2 * MARIGN_BETWEEN_DRAG_HIGHLIGHT;

const DAYWIDTH = TASKHEIGHT




function daysBetween(start, end) {
    const startDate = new Date(start)
    const endDate = new Date(end)

    const diffMs = endDate - startDate
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    return diffDays
}












export default function DependencyView() {
    
  
  const [days, setDays] = useState(null)
  const [milestones, setMilestones] = useState({})
  const [hoveredMilestone, setHoveredMilestone] = useState(null)




  const [teamOrder, setTeamOrder] = useState([]);
  const [teams, setTeams] = useState({});
  const [ghost, setGhost] = useState(null);
  const teamContainerRef = useRef(null);
  const [dropIndex, setDropIndex] = useState(null);

  const [tasks, setTasks] = useState({});

  const [reloadData, setReloadData] = useState(false)










  // ________Global Event Listener___________
  // ________________________________________
  // ________________________________________
  // ________________________________________
  // ________________________________________

  
const [mode, setMode] = useState("drag")

useEffect(() => {
  const down = (e) => {
    if (e.ctrlKey) setMode("delete")
    else if (e.shiftKey) setMode("duration")
    
  }

  const up = () => setMode("drag")

  window.addEventListener("keydown", down)
  window.addEventListener("keyup", up)
  return () => {
    window.removeEventListener("keydown", down)
    window.removeEventListener("keyup", up)
  }
}, [])













  // ________________Layout_________________
  // ________________________________________
  // ________________________________________
  // ________________________________________
  // ________________________________________

  //   Define height
  // useEffect(() => {
  //   if (!teamContainerRef.current) return;
  //   setHeight(teamContainerRef.current.getBoundingClientRect().height);
  // }, []);

  // ________________Loading_________________
  // ________________________________________
  // ________________________________________
  // ________________________________________
  // ________________________________________

//   Fetch Project, Teams and Tasks
  useEffect(() => {
    const load_all = async () => {
        // Fetch Project
        const resProjcet = await fetch_project_details();
        const project = resProjcet.project
        const start_date = project.start_date
        const end_date = project.end_date

        const num_days = daysBetween(start_date, end_date)
        setDays(num_days)






      // 1️⃣ fetch teams
      const resTeams = await fetch_project_teams();
      const fetched_teams = resTeams.teams;

      const teamOrder = [];
      const teamObject = {};

      for (const team of fetched_teams) {
        teamOrder.push(team.id);
        teamObject[team.id] = {
          ...team,
          height: TEAMHEIGHT,
          tasks: [],
        };
      }

      // 2️⃣ fetch tasks AFTER teams exist
      const resTasks = await fetch_project_tasks();

      for (const team_id in teamObject) {
        teamObject[team_id].tasks = resTasks.taskOrder?.[String(team_id)] || [];

        teamObject[team_id].height =
          resTasks.taskOrder?.[String(team_id)].length * TASKHEIGHT;
      }






      // Update Milestones to also have x coordinates for dragging
      const resMilestones = await get_all_milestones();
      const fetched_Milestones = resMilestones.milestones;
      setMilestones(fetched_Milestones)


      const updated_milestones = {}
      for (let i = 0; i < fetched_Milestones.length; i ++ ) {
        const milestone = fetched_Milestones[i]
        updated_milestones[milestone.id] = {
          ...milestone, 
          x: milestone.start_index* DAYWIDTH,
          display: "default"
        }
      }




      // 3️⃣ commit state once
      setTeamOrder(teamOrder);
      setTeams(teamObject);
      setTasks(resTasks.tasks);
      setMilestones(updated_milestones)
    };

    load_all();
    setReloadData(false)
  }, [reloadData]);

  // ________________TEAMS___________________
  // ________________________________________
  // ________________________________________
  // ________________________________________
  // ________________________________________

  const safe_team_order_local = async (new_order) => {
    const res = await safe_team_order(new_order);
  };

  const handleTeamDrag = (event, team_key, order_index) => {
    const team = teams[team_key];
    const from_index = order_index;
    let to_index = order_index;

    const parent = teamContainerRef.current;
    const parent_rect = parent.getBoundingClientRect();

    const children = [...parent.children];

    const startX = event.clientX - parent_rect.x;
    const startY = event.clientY - parent_rect.y;

    // setDropIndex(order_index)

    setGhost({
      ...team,
      x: startX,
      y: startY,
    });

    const onMouseMove = (e) => {
      const new_x = e.clientX - parent_rect.x;
      const new_y = e.clientY - parent_rect.y;

      const relativeY = e.clientY - parent_rect.top;

      // Determine drop index by comparing mouse Y to each team's midpoint.
      // Use only the team container nodes (ignore the trailing drop-highlighter child).
      const teamNodes = children.slice(0, teamOrder.length);
      let index = teamNodes.length; // default: drop at end
      for (let i = 0; i < teamNodes.length; i++) {
        const childRect = teamNodes[i].getBoundingClientRect();
        const childTop = childRect.top - parent_rect.top;
        const childMid = childTop + childRect.height / 2;
        if (relativeY < childMid) {
          index = i;
          break;
        }
      }

      // If hovering just after the original item, treat it as the same gap
      if (index === order_index + 1) {
        index = order_index;
      }

      const clamped = Math.max(0, Math.min(index, teamOrder.length));
      to_index = clamped;
      setDropIndex(clamped);

      // for (let element of )

      setGhost((prev) => {
        return {
          ...prev,
          x: new_x,
          y: new_y,
        };
      });
    };

    const onMouseUp = () => {
      // Reorder team
      let copy = [...teamOrder];
      const [moved] = copy.splice(from_index, 1);
      let targetIndex = to_index;
      if (from_index < to_index) {
        targetIndex -= 1;
      }

      copy.splice(targetIndex, 0, moved);
      setTeamOrder(copy);

      safe_team_order_local(copy);

      setGhost(null);
      setDropIndex(null);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // ________________TASKS___________________
  // ________________________________________
  // ________________________________________
  // ________________________________________
  // ________________________________________





  // _____________MILESTONES________________
  // ________________________________________
  // ________________________________________
  // ________________________________________
  // ________________________________________

  const add_milestone_local = async (task_id) => {
  const res = await add_milestone(task_id)
  const milestone = res.added_milestone

  setReloadData(true)
}




  

const handleMileStoneDrag = (event, milestone_key) => {
  event.preventDefault() 

  const startX = event.clientX - milestones[milestone_key].x
  let new_x = milestones[milestone_key].x

  const onMouseMove = (e) => {
    // If Ctrl is pressed, stop dragging and snap to position
    if (e.ctrlKey) {
      onMouseUp()
      return 
    }

    new_x = e.clientX - startX



    if (new_x < 0) {
      new_x = 0
    }
    if (new_x + DAYWIDTH > days * DAYWIDTH) {
      new_x = days * DAYWIDTH - DAYWIDTH
    }






    setMilestones(prev => ({
      ...prev,
      [milestone_key]: {
        ...prev[milestone_key],
        x: new_x
      }
    }))
  }

  const onMouseUp = () => {
    const new_index = Math.round(new_x / DAYWIDTH)
    const snapped_x = new_index * DAYWIDTH


    setMilestones(prev => ({
      ...prev,
      [milestone_key]: {
        ...prev[milestone_key],
        x: snapped_x,
        start_index: new_index
      }
    }))

    update_start_index(milestone_key, new_index)



    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", onMouseUp)
  }

  document.addEventListener("mousemove", onMouseMove)
  document.addEventListener("mouseup", onMouseUp)
}




  const handleMileStoneMouseDown = (e, id) => {
    if (mode === "drag") {
      return handleMileStoneDrag(e, id)
    }
    else if (mode === "delete") {
      setReloadData(true)
      return delete_milestone(id)
    }
    // In duration mode, don't do anything here - icons have their own handlers
  }

  const handleDurationChange = (e, id, amount) => {
    e.stopPropagation() // Prevent parent mousedown from firing
    setReloadData(true)
    change_duration(id, amount)
  }
















  return (
    <>
      {/* Single scrollable container - scrolls both X and Y */}
      <div className="h-screen w-screen p-10 overflow-auto select-none">
        {/* Inner container with full width for horizontal scroll */}
        <div
          ref={teamContainerRef}
          style={{
            width: `${TEAMWIDTH + TASKWIDTH + (days || 0) * DAYWIDTH}px`,
          }}
          className="relative"
        >
          {mode}
          {/* Teams List */}
          {teamOrder.map((team_key, index) => {
            const team = teams[team_key];
            return (
              <div key={`${team_key}_container`}>
                {/* Redrag Highlighter */}
                <div className="flex">
                  <div
                    style={{
                      marginBottom: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                      marginTop: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                      height: `${TEAM_DRAG_HIGHLIGHT_HEIGHT}px`,
                      width: `${TEAMWIDTH + TASKWIDTH}px`,
                      opacity: dropIndex === index ? 1 : 0,
                      position: 'sticky',
                      left: 0,
                      zIndex: 10,
                    }}
                    className="bg-black rounded-l-full"
                  ></div>
                  <div
                    style={{
                      marginBottom: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                      marginTop: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                      height: `${TEAM_DRAG_HIGHLIGHT_HEIGHT}px`,
                      opacity: dropIndex === index ? 1 : 0,
                    }}
                    className="bg-black rounded-r-full flex-1"
                  ></div>
                </div>

                {/* Team Row - contains sticky left part + scrollable right part */}
                <div className="flex">
                  {/* STICKY LEFT: Team + Tasks */}
                  <div
                    
                    style={{
                      height: team.height,
                      width: `${TEAMWIDTH + TASKWIDTH}px`,
                      backgroundColor: `${team.color}`,
                      opacity: ghost?.id === team_key ? 0.2 : 1,
                      position: 'sticky',
                      left: 0,
                      zIndex: 10,
                    }}
                    className="bg-gray-200 flex border flex-shrink-0"
                  >
                    <div
                      style={{
                        width: `${TEAMWIDTH}px`,
                      }}
                    >
                      <div 
                      onMouseDown={(e) => {
                      handleTeamDrag(e, team_key, index);
                    }}
                      className="border h-full w-full cursor-pointer">
                        {teams[team_key].name}
                      </div>
                      
                    </div>

                    <div>
                      {team.tasks.map((task_key, taskIndex) => {
                        return (
                          <div
                            className="border-b border-l flex justify-between w-full items-center"
                            style={{
                              height: `${TASKHEIGHT}px`,
                              width: `${TASKWIDTH}px`,
                              borderBottom:
                                team.tasks.length - 1 === taskIndex
                                  ? "none"
                                  : "1px solid black",
                            }}
                            key={`${task_key}_container`}
                          >
                            <div>
                                {tasks[task_key].name}
                            </div>



                            {/* Add Milestone Button */}
                            <div 
                            onClick={()=>{add_milestone_local(task_key)}}
                            className="bg-white h-7 w-7 m-1 flex justify-center items-center rounded hover:bg-gray-100 active:bg-gray-200">
                              <AddIcon/>
                            </div>
                          
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SCROLLABLE RIGHT: Milestones/Days */}
                  <div
                    className="border-t border-b "
                    style={{ height: `${team.height}px` }}
                  >
                    {team.tasks.map((task_key, taskIndex) => {
                      return (
                        <div
                          className="flex relative"
                          style={{
                            height: `${TASKHEIGHT}px`,
                            borderBottom:
                              team.tasks.length - 1 === taskIndex
                                ? "none"
                                : "1px solid black",
                          }}
                          key={`${task_key}_milestone`}
                        >


                          {/* Milestone Rendering */}
                          {tasks[task_key].milestones.map((milestone_from_task)=>{
                            const milestone = milestones[milestone_from_task.id]
                            const showDelete = hoveredMilestone === milestone.id && mode === "delete"
                            const showDurationPlus = hoveredMilestone === milestone.id && mode === "duration"
                            const showDurationMinus = hoveredMilestone === milestone.id && mode === "duration" && milestone.duration > 1
                            


                            return (
                               <div
                                  onMouseDown={(e)=>{
                                    // handleMileStoneDrag(e, milestone_from_task.id)
                                    handleMileStoneMouseDown(e, milestone_from_task.id)
                                  }}

                                  onMouseEnter={() => setHoveredMilestone(milestone.id)}
                                  onMouseLeave={() => setHoveredMilestone(null)}



                                  className=" absolute p-1"
                                  style={{
                                      height: `${TASKHEIGHT}px`,
                                      width: `${DAYWIDTH * milestone.duration}px`,
                                      left: `${milestone.x}px`,
                                      opacity: ghost?.id === team_key ? 0.2 : 1,
                                  }}
                                  key={milestone.id}>
                                    <div className="h-full w-full rounded bg-black text-white flex justify-center items-center">
                                    {!showDelete && !showDurationPlus && !showDurationMinus && "X"}

                                    {showDelete && (
                                      <DeleteForeverIcon
                                        style={{ color: "#fa2020" }}
                                        className="animate-pulse"
                                      />
                                    )}

                                    <div 
                                    style={{
                                      display: showDurationMinus || showDurationPlus ? "flex" : "none"
                                    }}
                                    className="w-full flex justify-between px-1">
                                      {showDurationPlus && (
                                      <AddCircleOutlineIcon
                                        onClick={(e) => handleDurationChange(e, milestone.id, 1)}
                                        style={{}}
                                        className="cursor-pointer ml-1"
                                      />
                                    )}


                                      {showDurationMinus && (
                                      <RemoveCircleOutlineIcon
                                        onClick={(e) => handleDurationChange(e, milestone.id, -1)}
                                        style={{}}
                                        className="hover:text-blue-200 cursor-pointer"
                                      />
                                    )}

                                    
                                    </div>
                                    
                                    
                                  </div>

                                
                                </div>
                            )
                          })}


                          {/* Day rendering */}
                          {[...Array(days)].map((_, i) => {
                            return (
                              <div
                                className="border-r "
                                style={{
                                  height: `${TASKHEIGHT}px`,
                                  width: `${DAYWIDTH}px`,
                                  opacity: ghost?.id === team_key ? 0.2 : 1,
                                }}
                                key={i}
                              >
                              </div>
                            );
                          })}






                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* LAST DROP HIGHLIGHT */}
          <div className="flex">
            <div
              style={{
                marginBottom: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                marginTop: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                height: `${TEAM_DRAG_HIGHLIGHT_HEIGHT}px`,
                width: `${TEAMWIDTH + TASKWIDTH}px`,
                opacity: dropIndex === teamOrder.length ? 1 : 0,
                position: 'sticky',
                left: 0,
              }}
              className="bg-black rounded-l-full"
            ></div>
            <div
              style={{
                marginBottom: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                marginTop: `${MARIGN_BETWEEN_DRAG_HIGHLIGHT}px`,
                height: `${TEAM_DRAG_HIGHLIGHT_HEIGHT}px`,
                opacity: dropIndex === teamOrder.length ? 1 : 0,
              }}
              className="bg-black rounded-r-full flex-1"
            ></div>
          </div>

          {/* Ghost */}
          {ghost && (
            <div
              className="bg-blue-200 absolute"
              style={{
                height: `${ghost.height}px`,
                width: `${TEAMWIDTH + TASKWIDTH}px`,
                left: `${ghost.x}px`,
                top: `${ghost.y}px`,
                backgroundColor: `${ghost.color}`,
                zIndex: 20,
              }}
            >
              {ghost.name}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
