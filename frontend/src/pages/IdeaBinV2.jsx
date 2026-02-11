import { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const API = "http://127.0.0.1:8000/api";

function Button({ text, handleButtonClick }) {
  return (
    <>
      <div
        onClick={() => {
          handleButtonClick();
        }}
        className=" 
            bg-white select-none
            shadow-xl border border-gray-200 rounded-full h-10 w-40
            flex justify-center items-center
            hover:bg-gray-100 active:bg-gray-300


            "
      >
        {text}
      </div>
    </>
  );
}

function CreateCategoryForm({ onButtonClick }) {
  const [categoryName, setCategoryName] = useState("");

  const create_category = async () => {
    const res = await fetch(`${API}/create_category/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: categoryName,
      }),
    });
    const created_category = await res.json();
    console.log("THIS IS THE RESPONSE", created_category);
  };

  const button_click = async () => {
    await create_category(); // wait until POST finishes
    onButtonClick(); // now refetch
  };

  return (
    <>
      <div
        className="w-100 border border-gray-300 p-5
                rounded shadow-xl bg-white
                justify-center items-center"
      >
        <div className=" flex flex-col mb-4">
          {categoryName}
          <TextField
            onChange={(e) => {
              setCategoryName(e.target.value);
            }}
            id="outlined-basic"
            label="Name"
            variant="outlined"
          />
        </div>
        <div className="w-full flex justify-center items-center">
          <Button handleButtonClick={button_click} text={"Create"} />
        </div>
      </div>
    </>
  );
}

export default function IdeaBinV2() {
  const [categories, setCategories] = useState({});
  const [displayForm, setDisplayForm] = useState(false);
  const categoryContainerRef = useRef(null);
  const [resizeCategory, setResizeCategory] = useState(null);
  const [resizeProportions, setResizeProportions] = useState({ 0: 0 });

  // Idea state
  const [ideas, setIdeas] = useState({});
  const [ideaIdOrder, setIdeaIdOrder] = useState([]);
  const [ideaName, setIdeaName] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [dragging, setDragging] = useState(null);
  const [prevIndex, setPrevIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const IdeaListRef = useRef(null);

//   const handleResizeProportions = (event, category_key) => {
//     const category = categories[category_key];

//     const startMouseX = event.clientX;
//     const startMouseY = event.clientY;

//     const startWidth = category.width;
//     const startHeight = category.height;

//     const onMouseMove = (e) => {
//       const deltaX = e.clientX - startMouseX;
//       const deltaY = e.clientY - startMouseY;

//       const new_width = startWidth + deltaX;
//       const new_height = startHeight + deltaY;

//       setCategories((prev) => ({
//         ...prev,
//         [category_key]: {
//           ...prev[category_key],
//           width: Math.max(50, new_width),
//           height: Math.max(50, new_height),
//         },
//       }));
//     };

//     const onMouseUp = () => {
//       document.removeEventListener("mousemove", onMouseMove);
//       document.removeEventListener("mouseup", onMouseUp);
//     };

//     document.addEventListener("mousemove", onMouseMove);
//     document.addEventListener("mouseup", onMouseUp);
//   };

const handleResizeProportions = (event, category_key) => {
  const category = categories[category_key];
  const containerRect = categoryContainerRef.current.getBoundingClientRect();

  const startMouseX = event.clientX - containerRect.left;
  const startMouseY = event.clientY - containerRect.top;

  const startWidth = category.width;
  const startHeight = category.height;

  const onMouseMove = (e) => {
    const currentMouseX = e.clientX - containerRect.left;
    const currentMouseY = e.clientY - containerRect.top;

    const deltaX = currentMouseX - startMouseX;
    const deltaY = currentMouseY - startMouseY;

    setCategories(prev => ({
      ...prev,
      [category_key]: {
        ...prev[category_key],
        width: Math.max(50, startWidth + deltaX),
        height: Math.max(50, startHeight + deltaY)
      }
    }));
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};


  const cursor_hovers_corner = (e) => {
    if (!categoryContainerRef.current) return;
    const container_rect = categoryContainerRef.current.getBoundingClientRect();

    const categoryList = Object.values(categories);
    let hovering = false;

    for (let i = 0; i < categoryList.length; i++) {
      const category = categoryList[i];

      const right_bottom_coordinates = {
        x: category.x + category.width + container_rect.left,
        y: category.y + category.height + container_rect.top,
      };

      if (
        e.clientX < right_bottom_coordinates.x + 20 &&
        e.clientX > right_bottom_coordinates.x - 20 &&
        e.clientY < right_bottom_coordinates.y + 20 &&
        e.clientY > right_bottom_coordinates.y - 20 &&
        e.ctrlKey
      ) {
        hovering = true;
        setResizeCategory(category.id);
        console.log(e);
        break;
      }
    }

    document.body.style.cursor = hovering ? "se-resize" : "default";
    if (!hovering) {
      setResizeCategory(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousemove", cursor_hovers_corner);

    return () => {
      document.removeEventListener("mousemove", cursor_hovers_corner);
    };
  }, [categories]);

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (resizeCategory !== null && e.ctrlKey) {
        handleResizeProportions(e, resizeCategory);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [resizeCategory]);

  const fetch_categories = async () => {
    try {
    const res = await fetch(`${API}/get_all_categories/`);
    const categories = await res.json();
    console.log("categories received: ", categories.categories);
    const all_categories = categories.categories;

    const serialized_categories = {};
    for (let i = 0; i < all_categories.length; i++) {
      const category = all_categories[i];
      // console.log("Index: ", i)
      // console.log("category: ", category)
      serialized_categories[category.id] = {
        id: category.id,
        name: category.name,
        x: category.x,
        y: category.y,
        width: category.width,
        height: category.height,
      };
    }

    // console.log("serialized categories objects: ", serialized_categories)
    setCategories(serialized_categories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };
  useEffect(() => {
    fetch_categories();
  }, []);

  const set_position_category = async (category_id, new_position) => {
    const res = await fetch(`${API}/set_position_category/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: category_id,
        position: new_position,
      }),
    });
    const answer = await res.json();
    console.log("answer: ", answer);
  };

  const handleCategoryDrag = (event, category_key) => {
    const category = categories[category_key];
    console.log("category: ", category.x);

    const startX = event.clientX - category.x;
    const startY = event.clientY - category.y;
    let new_x = startX;
    let new_y = startY;

    const onMouseMove = (e) => {
      new_x = e.clientX - startX;
      new_y = e.clientY - startY;

      setCategories((prev) => {
        return {
          ...prev,
          [category_key]: {
            ...prev[category_key],
            x: new_x,
            y: new_y,
          },
        };
      });
    };
    const onMouseUp = () => {
      const new_position = {
        x: new_x,
        y: new_y,
      };
      set_position_category(category_key, new_position);

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const customFormButtonClick = () => {
    setDisplayForm(false);
    fetch_categories();
  };

  // ===== IDEA FUNCTIONS =====

  const fetch_all_ideas = async () => {
    try {
    const res = await fetch(`${API}/get_all_ideas/`);
    const data = await res.json();
    const idea_list = data?.data || [];
    const order = data?.order || [];

    const idea_object = {};
    for (let i = 0; i < idea_list.length; i++) {
      const idea = idea_list[i];
      idea_object[idea.id] = { ...idea };
    }

    setIdeaIdOrder(order);
    setIdeas(idea_object);
    } catch (err) {
      console.error("Failed to fetch ideas:", err);
    }
  };

  const create_idea = async () => {
    const res = await fetch(`${API}/create_idea/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idea_name: ideaName,
        description: ideaDescription,
      }),
    });
    const answer = await res.json();
    fetch_all_ideas();
  };

  const delete_idea = async (idea_id) => {
    const res = await fetch(`${API}/delete_idea/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: idea_id }),
    });
    const answer = await res.json();
    fetch_all_ideas();
  };

  const safe_order = async (new_order) => {
    const res = await fetch(`${API}/safe_order/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: new_order }),
    });
    const answer = await res.json();
  };

  const handleDrag = (event, idea, index) => {
    const from_index = index;
    let to_index = index;

    let ghost = {
      idea,
      x: event.clientX,
      y: event.clientY,
    };

    setDragging(ghost);
    setPrevIndex(index);

    const container = IdeaListRef.current;
    const idea_dom_elements = [...container.children];

    const onMouseMove = (e) => {
      ghost = { ...ghost, x: e.clientX, y: e.clientY };
      setDragging(ghost);

      for (let i = 0; i < idea_dom_elements.length - 1; i++) {
        const element = idea_dom_elements[i];
        const next_element = idea_dom_elements[i + 1];
        const rect = element.getBoundingClientRect();
        const next_rect = next_element.getBoundingClientRect();

        if (ghost.y > rect.y && ghost.y < next_rect.y) {
          setHoverIndex(i);
          to_index = i;
        }
      }
    };

    const onMouseUp = () => {
      let updated_order = ideaIdOrder;

      setIdeaIdOrder((prevOrder) => {
        const newOrder = [...prevOrder];
        const [movedId] = newOrder.splice(from_index, 1);
        newOrder.splice(to_index, 0, movedId);
        updated_order = newOrder;
        return newOrder;
      });

      safe_order(updated_order);

      setDragging(null);
      setPrevIndex(null);
      setHoverIndex(null);

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  useEffect(() => {
    fetch_all_ideas();
  }, []);






  return (
    <>
      <div className="h-screen w-screen p-10 flex justify-center items-center select-none">
        <div
          style={{
            display: displayForm ? "block" : "none",
          }}
          className="fixed z-2"
        >
          <CreateCategoryForm onButtonClick={customFormButtonClick} />
        </div>

        {/* Overlay */}
        <div
          style={{
            display: displayForm ? "block" : "none",
          }}
          className="h-full w-full fixed bg-black/40 z-1"
        ></div>

        <div className="h-full w-full bg-white shadow-2xl border border-gray-300 rounded flex">
          <div className="w-1/4 h-full shadow-xl bg-gray-200 border border-gray-200 select-none">
            {/* Create Idea Form */}
            <div className="h-4/10 bg-gray-100 p-2">
              <h1 className="text-2xl mb-2">Create ideas</h1>
              <div className="flex flex-col gap-1 md:gap-5">
                <TextField
                  value={ideaName}
                  onChange={(e) => setIdeaName(e.target.value)}
                  id="idea-name"
                  label="Idea name"
                  variant="outlined"
                />
                <TextField
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  multiline
                  rows={4}
                  id="idea-description"
                  label="Description"
                  variant="outlined"
                  fullWidth
                />
                <Button
                  handleButtonClick={() => create_idea()}
                  text={"Create"}
                />
              </div>
            </div>

            {/* Idea List */}
            <div ref={IdeaListRef} className="h-6/10 p-2 relative overflow-y-auto">
              <h1 className="text-2xl">The ideas</h1>
              {ideaIdOrder.map((ideaId, arrayIndex) => {
                const idea = ideas[ideaId];
                if (!idea) return null;
                return (
                  <div key={`${idea.title}_${ideaId}`}>
                    <div
                      style={{
                        opacity: arrayIndex === hoverIndex ? 1 : 0,
                        transform:
                          arrayIndex === hoverIndex
                            ? "translateY(5px)"
                            : "translateY(0px)",
                        transition: "opacity 100ms ease",
                      }}
                      className="w-full h-2 my-[1px] rounded bg-gray-700"
                    ></div>

                    <div
                      onMouseDown={(e) => handleDrag(e, idea, arrayIndex)}
                      style={{
                        backgroundColor:
                          arrayIndex === prevIndex ? "gray" : "black",
                        transform:
                          hoverIndex !== null &&
                          arrayIndex >= hoverIndex &&
                          arrayIndex !== prevIndex
                            ? "translateY(10px)"
                            : "translateY(0px)",
                        transition:
                          "transform 200ms ease, background-color 200ms ease",
                      }}
                      className="h-10 w-full rounded text-white px-2 flex justify-between items-center"
                    >
                      <div>{idea.title}</div>
                      <div>
                        <DeleteForeverIcon
                          onClick={() => delete_idea(idea.id)}
                          className="hover:text-red-500!"
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
                  className="fixed h-10 shadow border border-white/20 shadow-gray-700 bg-black rounded mt-2 text-white px-2 flex justify-between items-center"
                >
                  <div>{dragging.idea.title}</div>
                </div>
              )}
            </div>
          </div>

          {/* Category Container */}
          <div
            ref={categoryContainerRef}
            className="w-3/4 h-full shadow-xl border border-gray-200 relative"
          >
            {/* Catgory Displays */}
            {Object.entries(categories).map(([category_key, category_data]) => {
              // console.log("key", category_key)
              // console.log("value", category_data)
              return (
                <div
                  onMouseDown={(e) => {
                    if (!e.ctrlKey) {
                        handleCategoryDrag(e, category_key);
                    }
                    
                  }}
                  style={{
                    left: category_data.x,
                    top: category_data.y,
                    width: category_data.width,
                    height: category_data.height,
                  }}
                  key={category_key}
                  className="absolute bg-yellow-200 shadow-xl rounded"
                >
                  {category_data.name}
                </div>
              );
            })}

            {/* Button */}
            <div
              onClick={() => {
                setDisplayForm(true);
              }}
              className="absolute top-5 right-5 "
            >
              <Button
                text={"Create Category"}
                handleButtonClick={() => setDisplayForm(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
