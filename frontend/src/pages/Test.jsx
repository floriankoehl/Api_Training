import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useEffect, useRef, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import SaveAltIcon from '@mui/icons-material/SaveAlt';






const TASKWIDTH = 200
const TASKHEIGHT = 70






export default function Test() {
  const [titleToCreate, setTitleToCreate] = useState("");
  const [tasks, setTasks] = useState([]);
  const containerRef = useRef(null);
  const scheduledRef = useRef(null);
  const doneRef = useRef(null)

  const load_all_tasks = async () => {
    const response = await fetch("http://127.0.0.1:8000/api/get_all_tasks/");

    const answer = await response.json();


    const task_object_with_postions = {};
    for (let task of answer) {
      task_object_with_postions[task.title] = {
        ...task,
        x: task.x,
        y: task.y,
        height: TASKHEIGHT,
        width: TASKWIDTH,
      };
    }
    console.log("the created while loading: ", task_object_with_postions)
    setTasks(task_object_with_postions);

    // setTasks(answer);
  };

  useEffect(() => {
    load_all_tasks();
  }, []);

  const create_task = async () => {
    const response = await fetch("http://127.0.0.1:8000/api/create_task/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "first try",
        task_title: titleToCreate,
      }),
    });

    const answer = await response.json();
    load_all_tasks();
  };

  const delete_task = async (title_of_task) => {
    const res = await fetch("http://127.0.0.1:8000/api/delete_task/", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title_to_delete: title_of_task,
      }),
    });

    const answer = await res.json();
    load_all_tasks();
  };

  const mark_as_done = async (title_of_task, type="toggle") => {
    const res = await fetch("http://127.0.0.1:8000/api/toggle_done/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title_to_mark: title_of_task,
        type: type
      }),
    });

    const answer = await res.json();
    // Update local state instead of reloading from server, to preserve drag positions
    setTasks((prev) => ({
      ...prev,
      [title_of_task]: {
        ...prev[title_of_task],
        done: type === "done" ? true : type === "scheduled" ? false : !prev[title_of_task].done,
      },
    }));
  };


  const safePostionsofAllTasks = async(tasks_to_save) => {
    const res = await fetch("http://127.0.0.1:8000/api/update_x_and_y_of_tasks/",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tasks: tasks_to_save
        })
    })
    const answer = await res.json()
  }




//   const adjustCoordinatestoBox = (task) => {
//     // console.log("THE KEY", task_key)
//     // const task = tasks[task_key]
//     console.log("THE CURRENT ELEMENT: ", task)

//     const containerRect = containerRef.current.getBoundingClientRect()
//     const scheduledBoxCoordinates = scheduledRef.current.getBoundingClientRect()
//     const doneBoxCoordinates = doneRef.current.getBoundingClientRect()

//     // Convert viewport coords to container-relative coords
//     const schedX = scheduledBoxCoordinates.x - containerRect.x
//     const schedY = scheduledBoxCoordinates.y - containerRect.y
//     const schedRight = scheduledBoxCoordinates.right - containerRect.x
//     const schedBottom = scheduledBoxCoordinates.bottom - containerRect.y

//     if (task.x > schedX &&
//         task.y > schedY &&
//         task.x + task.width < schedRight &&
//         task.y + task.height < schedBottom
//     ) {
//         console.log("THIS IS INSIDE SCHEUDULED DBODOOXOD")
//     }






//     console.log("SCHEUDLED COORDINATES: ", scheduledBoxCoordinates)
//     console.log("DONE COORDINATES: ", doneBoxCoordinates)
//   }


//   const TaskInScheduled = (task) => {
//     const containerRect = containerRef.current.getBoundingClientRect()
//     const scheduledBoxCoordinates = scheduledRef.current.getBoundingClientRect()

//     // Convert viewport coords to container-relative coords
//     const schedX = scheduledBoxCoordinates.x - containerRect.x
//     const schedY = scheduledBoxCoordinates.y - containerRect.y
//     const schedRight = scheduledBoxCoordinates.right - containerRect.x
//     const schedBottom = scheduledBoxCoordinates.bottom - containerRect.y

//     if (task.x > schedX &&
//         task.y > schedY &&
//         task.x + task.width < schedRight &&
//         task.y + task.height < schedBottom
//     ) {
//         console.log("IS INSIDE SCHEDULED")
//         return true
//     }
//     return false
//   }





  const TaskinDone = (task) => {
    const containerRect = containerRef.current.getBoundingClientRect()
    const doneBoxCoordinates = doneRef.current.getBoundingClientRect()

    // Convert viewport coords to container-relative coords
    const schedX = doneBoxCoordinates.x - containerRect.x
    const schedY = doneBoxCoordinates.y - containerRect.y
    const schedRight = doneBoxCoordinates.right - containerRect.x
    const schedBottom = doneBoxCoordinates.bottom - containerRect.y

    if (task.x > schedX &&
        task.y > schedY &&
        task.x + task.width < schedRight &&
        task.y + task.height < schedBottom
    ) {
        console.log("IS INSIDE DONE")
        return true
    }
    return false
  }














  const handleDrag = (event, task_key) => {
    const startX = event.clientX - tasks[task_key].x
    const startY = event.clientY - tasks[task_key].y

    let updated = tasks

    const onMouseMove = (e) => {
        const new_x = e.clientX - startX
        const new_y = e.clientY - startY

        setTasks((prev)=>{
            updated = {
                ...prev, 
                [task_key]: {
                    ...prev[task_key],
                    x: new_x, 
                    y: new_y
                }
            }




            return updated
        })
        


    };

    const onMouseUp = () => {
        
        if (TaskinDone(updated[task_key])) {
            console.log("CORRECT WAY TO CASLL")
            mark_as_done(task_key, "done")
        } else {
            mark_as_done(task_key, "scheduled")
        }

        safePostionsofAllTasks(updated)

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <>
      <div className="h-screen w-screen bg-gray-200 p-10">
        <div className="h-full w-full bg-white rounded flex flex-col">
          {/* Task Create */}
          <div className="w-full flex justify-center gap-1 py-2">
            {/* {titleToCreate} */}
            <TextField
              onChange={(e) => {
                setTitleToCreate(e.target.value);
              }}
              id="outlined-basic"
              label="create a task"
              variant="outlined"
            />
            <Button
              onClick={() => {
                create_task();
              }}
              variant="contained"
            >
              Create
            </Button>
          </div>

          {/* All Tasks */}
          <div
            style={{
              backgroundColor: "#021736",
            }}
            ref={containerRef}
            className="flex-1 overflow-y-auto relative flex justify-center items-center"
          >
            <SaveAltIcon 
            onClick={()=>{safePostionsofAllTasks()}}
            className="text-white! 
            absolute top-0 right-0 text-[40px]!
            hover:text-[43px]! hover:text-white/80!
            
            "/>

            <div className="flex gap-10">
                <div 
                ref={scheduledRef}
                className="h-100 w-70 border border-white bg-white/20 rounded-xl">
                    Scheduled
                </div>
                <div 
                ref={doneRef}
                className="h-100 w-70 border border-white bg-white/20 rounded-xl">
                    Done
                </div>
            </div>





            {Object.entries(tasks).map(([key, task_object]) => {

              return (
                <div
                    onMouseDown={(e)=>{handleDrag(e, key)}}
                  className="
                    bg-white/100
                    rounded
                    absolute
                    shadow-lg
                    border
                    select-none
                    "
                  style={{
                    top: `${task_object.y}px`,
                    left: `${task_object.x}px`,
                    width: `${task_object.width}px`,
                    height: `${task_object.height}px`,
                  }}
                  key={key}
                >
                  <div className="flex h-10 items-center">
                    <div>
                      <Checkbox
                        onClick={() => {
                          mark_as_done(task_object.title);
                        }}
                        checked={task_object.done}
                      />
                    </div>
                    <div>{key}</div>
                  </div>
                  <div className="absolute bottom-0 right-0">
                    <Button
                      onClick={() => {
                        delete_task(task_object.title);
                      }}
                      color="error"
                      variant="contained"
                      className="h-5! w-5!"
                    >
                      Del
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
