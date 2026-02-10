import { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { chipClasses } from "@mui/material/Chip";
import { order } from "@mui/system";

const API = "http://127.0.0.1:8000/api";

export default function IdeaBin() {
  const [ideas, setIdeas] = useState({});
  const [ideaIdOrder, setIdIdeaOrder] = useState([])
  const [ideaBeingCreated, setIdeaBeingCreated] = useState("");
  const [dragging, setDragging] = useState(false)
  const [prevIndex, setPrevIndex] = useState(null)
  const [hoverIndex, setHoverIndex] = useState(null)
  const IdeaListRef = useRef(null)
  const blueRef = useRef(null)
  const [isOverBlue, setIsOverBlue] = useState(false)



    //  API CALLS
  const fetch_all_ideas = async () => {
    const order = await get_order()
    console.log("THe order: ", order)
    
    const res = await fetch(`${API}/get_all_ideas/`);
    const ideas = await res.json();
    
    const idea_list = ideas?.data || []  // Fallback to empty array
   
    // console.log("HERE_______")
    // console.log("idea_list",  idea_list)
    const idea_object = {}
    for (let i = 0; i < idea_list.length; i ++) {
        let idea = idea_list[i]
        idea_object[idea.id] = {...idea}
    }
    // console.log("UPDATRED ID OBJECT", idea_object)

    console.log("ideas created: ", idea_object)
    setIdIdeaOrder(order)
    setIdeas(idea_object)
    // setIdeas(ideas.data);
    // console.log("receive all data", ideas.data)
  };

  useEffect(() => {

    fetch_all_ideas();
    // console.log("Test", ideas)

    



    // get_order()
  }, []);

  const create_idea = async () => {
    const res = await fetch(`${API}/create_idea/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idea_name: ideaBeingCreated,
      }),
    });

    const answer = await res.json();
    fetch_all_ideas();
  };

  const delete_idea = async (idea_name) => {
    const res = await fetch(`${API}/delete_idea/`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: idea_name
        })
    })

    const answer = await res.json()


    fetch_all_ideas();
  }


  const safe_order = async (new_order) => {
    const res = await fetch(`${API}/safe_order/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            order: new_order
        })
    })
    const answer = await res.json()
    console.log("answer_______", answer)
  }

  const get_order = async () => {
    const res = await fetch(`${API}/get_order/`)
    const answer = await res.json()
    return answer?.data?.order || []  // Return empty array as fallback
  }

  const set_category = async (idea_id_to_set, category_to_set) => {
    const res = await fetch(`${API}/set_category/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        idea_id: idea_id_to_set,
        category: category_to_set
      })
    })
  }










  const handleDrag = (event, idea, index) => {
    const from_index = index
    let to_index = index
    let is_over = false


    let ghost = {
        idea, 
        x: event.clientX, 
        y: event.clientY
    }


    setDragging(ghost)
    setPrevIndex(index)

    const container = IdeaListRef.current
    const container_rect = container.getBoundingClientRect()
    const idea_dom_elements = [...container.children]
    const blue_rect = blueRef.current.getBoundingClientRect()


    const onMouseMove = (e) => {
        ghost = {
            ...ghost, 
            x: e.clientX, 
            y: e.clientY
        }
        setDragging(ghost)


        console.log("GHOST WIDTH", ghost)
        if (ghost.x - 100 < container_rect.right) {
               for (let i = 0; i < idea_dom_elements.length -1; i ++){
            const element = idea_dom_elements[i]
            const next_element = idea_dom_elements[i+1]

            const rect = element.getBoundingClientRect()
            const next_rect = next_element.getBoundingClientRect()

            if (ghost.y > rect.y && 
                ghost.y < next_rect.y
            ) {
                setHoverIndex(i)
                to_index = i 
            }



          }
        } else {
          console.log("IS OVER THE BORDER")
          setPrevIndex(null)
          setHoverIndex(null)
          if (ghost.x < blue_rect.right &&
              ghost.x > blue_rect.left &&
              ghost.y > blue_rect.top &&
              ghost.y < blue_rect.bottom
          ) {
            setIsOverBlue(true)
            is_over = true
          } else {
            setIsOverBlue(false)
            is_over = false
          }


        }
   


    }

    const onMouseUp = () => {
        // Update the order array instead of the ideas object
        let updated_order = ideaIdOrder

        setIdIdeaOrder((prevOrder) => {
          const newOrder = [...prevOrder]
          const [movedId] = newOrder.splice(from_index, 1)
          newOrder.splice(to_index, 0, movedId)
          updated_order = newOrder
          return newOrder
        })

        if (is_over) {
          console.log("IDEA MMMMMMMMMMMMMMMMMMMMMMMMMMMMMM: ", idea.id)
          set_category(idea.id, "blue")
        }


        safe_order(updated_order)

        setDragging(null)
        setPrevIndex(null)
        setHoverIndex(null)

        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
    }


    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }












  return (
    <>
      <div className="h-screen w-screen p-10">
        <div className="h-full w-full rounded bg-white flex shadow-2xl border border-gray-300">
          <div className="w-1/4 select-none">
            {/* Form */}
            <div className="h-4/10 bg-gray-100 p-2">
              <h1 className="text-2xl mb-2">Create ideas</h1>
              <div className="flex flex-col gap-1 md:gap-5">
                <TextField
                  onChange={(e) => {
                    setIdeaBeingCreated(e.target.value);
                  }}
                  id="standard-basic"
                  label="Idea name"
                  variant="outlined"
                />
                <TextField
                  onChange={(e) => {
                    setIdeaBeingCreated(e.target.value);
                  }}
                  multiline
                  rows={4}
                  
                  id="idea-description"
                  label="Description"
                  variant="outlined"
                  fullWidth
                />
       



                <Button
                  onClick={() => {
                    create_idea();
                  }}
                  className="text-black!"
                  sx={{
                    backgroundColor: "#6cff4e",
                    "&:hover": { backgroundColor: "#4bad38" },
                  }}
                  variant="contained"
                >
                  Create
                </Button>
              </div>
            </div>

            {/* Task List */}
            <div 
            ref={IdeaListRef}
            className="h-8/10  p-2 relative">
              <h1 className="text-2xl">The ideas</h1>
              
              
              
              {ideaIdOrder.map((ideaId, arrayIndex) => {
                // console.log("ideaId", ideaId)
                // console.log("arrayIndex", arrayIndex)

                const idea = ideas[ideaId]
                if (!idea) return null
                // console.log("idea: ", index,  idea)
                return (
                    <div
                    key={`${idea.name}_${ideaId}`}>
                        <div 
                        style={{
                            opacity: arrayIndex === hoverIndex ? 1 : 0,
                            transform: arrayIndex === hoverIndex
                            ? "translateY(5px)"
                            : "translateY(0px)",
                            transition: "opacity 100ms ease"
                        }}
                        className="w-full h-2  my-[1px] rounded bg-gray-700">
                        </div>


                        <div
                            onMouseDown={(e)=>{handleDrag(e, idea, arrayIndex)}}
                            style={{
                                backgroundColor: arrayIndex === prevIndex ? "gray" : "black",
                                transform: hoverIndex !== null && arrayIndex >= hoverIndex && arrayIndex !== prevIndex
                                  ? "translateY(10px)"
                                  : "translateY(0px)",
                                transition: "transform 200ms ease, background-color 200ms ease",
                            }}
                            className="h-10 w-full 
                                            rounded text-white px-2 flex justify-between items-center
                                            "
                            key={idea.name}
                        >
                            <div>{idea.name}/Cat: {idea.category}</div>
                            <div>
                            <DeleteForeverIcon
                                onClick={() => {
                                delete_idea(idea.name);
                                }}
                                className="
                                hover:text-red-500!"
                            />
                            </div>
                        </div>

                        

                        
                  </div>
                );
              })}

              {/* GHOST & DRAGGING */}
              {dragging && (
                <div 
                style={{
                    top: `${dragging.y}px`,
                    left: `${dragging.x}px`,
                    transform: "translate(-100%, -100%)",
                    animation: "pickUp 150ms ease forwards",
                    
                }}
                
                className="fixed h-10 shadow border border-white/20 shadow-gray-700 bg-black rounded mt-2 text-white px-2 flex justify-between items-center">
                  <div>{dragging.idea.name}/Cat: {dragging.idea.category}</div>
                </div>
              )}







            </div>
          </div>

          {/* Color Containers */}
          <div className="w-3/4 bg-red-200 flex select-none">
            <div className="bg-white h-full w-full">
              <div className="w-full h-1/2  flex">
                <div className="w-1/2 h-full bg-blue-200">
                  <div className="h-1/7 ">
                    <h1
                    style={{
                      color: "#040084" 
                    }}
                    className="px-5 text-[50px] font-bold"
                    >Blue</h1>
                  </div>
                  <div className="h-6/7 p-5">
                    <div 
                    ref={blueRef}
                    style={{
                      backgroundColor: isOverBlue ? "#aca9ff" : "#ffffff"
                    }}
                    className="h-full w-full bg-white rounded">

                    </div>
                  </div>
                    
                </div>
                <div className="w-1/2 h-full bg-yellow-200"></div>
              </div>

              <div className="w-full h-1/2 flex">
                <div className="w-1/2 h-full bg-red-200"></div>
                <div className="w-1/2 h-full bg-green-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
