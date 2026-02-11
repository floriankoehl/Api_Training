import { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";

const API = "http://127.0.0.1:8000/api";

function Button({ text, handleButtonClick }) {
  return (
    <div
      onClick={() => handleButtonClick()}
      className="bg-white select-none shadow-xl border border-gray-200 rounded-full h-10 w-40
        flex justify-center items-center hover:bg-gray-100 active:bg-gray-300"
    >
      {text}
    </div>
  );
}

function CreateCategoryForm({ onButtonClick }) {
  const [categoryName, setCategoryName] = useState("");

  const create_category = async () => {
    const res = await fetch(`${API}/create_category/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: categoryName }),
    });
    await res.json();
  };

  const button_click = async () => {
    if (!categoryName.trim()) return;
    await create_category();
    setCategoryName("");
    onButtonClick();
  };

  return (
    <div className="w-100 border border-gray-300 p-5 rounded shadow-xl bg-white justify-center items-center">
      <div className="flex flex-col mb-4">
        <TextField
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              button_click();
            }
          }}
          id="outlined-basic"
          label="Category Name"
          variant="outlined"
        />
      </div>
      <div className="w-full flex justify-center items-center">
        <Button handleButtonClick={button_click} text={"Create"} />
      </div>
    </div>
  );
}

/* ===== CONFIRM MODAL ===== */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 z-50 min-w-[300px]">
        <p className="text-base mb-5">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
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

  // Idea state
  const [ideas, setIdeas] = useState({});
  const [unassignedOrder, setUnassignedOrder] = useState([]);
  const [categoryOrders, setCategoryOrders] = useState({});
  const [ideaName, setIdeaName] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(300);

  // Drag state
  const [dragging, setDragging] = useState(null);
  const [dragSource, setDragSource] = useState(null);
  const [prevIndex, setPrevIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [hoverCategory, setHoverCategory] = useState(null);
  const [hoverUnassigned, setHoverUnassigned] = useState(false);

  // Edit state
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingIdeaId, setEditingIdeaId] = useState(null);
  const [editingIdeaTitle, setEditingIdeaTitle] = useState("");

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState(null);

  // Archive drawer
  const [showArchive, setShowArchive] = useState(false);

  const IdeaListRef = useRef(null);
  const categoryRefs = useRef({});

  // ===== CATEGORY RESIZE =====

  const handleResizeProportions = (event, category_key) => {
    const category = categories[category_key];
    const containerRect = categoryContainerRef.current.getBoundingClientRect();

    const startMouseX = event.clientX - containerRect.left;
    const startMouseY = event.clientY - containerRect.top;

    const startWidth = category.width;
    const startHeight = category.height;

    let finalWidth = startWidth;
    let finalHeight = startHeight;

    const onMouseMove = (e) => {
      const currentMouseX = e.clientX - containerRect.left;
      const currentMouseY = e.clientY - containerRect.top;

      const deltaX = currentMouseX - startMouseX;
      const deltaY = currentMouseY - startMouseY;

      const maxWidth = containerRect.width - category.x;
      const maxHeight = containerRect.height - category.y;

      const minWidth = Math.max(80, category.name.length * 9 + 60);
      finalWidth = Math.max(minWidth, Math.min(startWidth + deltaX, maxWidth));
      finalHeight = Math.max(50, Math.min(startHeight + deltaY, maxHeight));

      setCategories((prev) => ({
        ...prev,
        [category_key]: {
          ...prev[category_key],
          width: finalWidth,
          height: finalHeight,
        },
      }));
    };

    const onMouseUp = () => {
      set_area_category(category_key, finalWidth, finalHeight);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const cursor_hovers_corner = (e) => {
    if (!categoryContainerRef.current) return;
    const container_rect = categoryContainerRef.current.getBoundingClientRect();

    const categoryList = Object.values(categories).filter((c) => !c.archived);
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
    return () => document.removeEventListener("mousemove", cursor_hovers_corner);
  }, [categories]);

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (resizeCategory !== null && e.ctrlKey) {
        handleResizeProportions(e, resizeCategory);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [resizeCategory]);

  // ===== CATEGORY API =====

  const fetch_categories = async () => {
    try {
      const res = await fetch(`${API}/get_all_categories/`);
      const data = await res.json();
      const all_categories = data.categories;

      const serialized = {};
      for (let i = 0; i < all_categories.length; i++) {
        const c = all_categories[i];
        const minWidth = Math.max(80, c.name.length * 9 + 60);
        serialized[c.id] = {
          id: c.id,
          name: c.name,
          x: c.x,
          y: c.y,
          width: Math.max(c.width, minWidth),
          height: c.height,
          z_index: c.z_index || 0,
          archived: c.archived || false,
        };
      }
      setCategories(serialized);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const set_position_category = async (category_id, new_position) => {
    await fetch(`${API}/set_position_category/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category_id, position: new_position }),
    });
  };

  const set_area_category = async (category_id, width, height) => {
    await fetch(`${API}/set_area_category/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category_id, width, height }),
    });
  };

  const delete_category = async (category_id) => {
    try {
      const res = await fetch(`${API}/delete_category/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: category_id }),
      });
      if (res.ok) {
        setCategories((prev) => {
          const updated = { ...prev };
          delete updated[category_id];
          return updated;
        });
        setCategoryOrders((prev) => {
          const updated = { ...prev };
          delete updated[category_id];
          return updated;
        });
        await fetch_all_ideas();
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  const confirm_delete_category = (category_id, category_name) => {
    setConfirmModal({
      message: `Delete category "${category_name}"? Its ideas will become unassigned.`,
      onConfirm: () => {
        delete_category(category_id);
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const bring_to_front_category = async (category_id) => {
    await fetch(`${API}/bring_to_front_category/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category_id }),
    });
    setCategories((prev) => {
      const maxZ = Math.max(
        0,
        ...Object.values(prev).map((c) => c.z_index || 0)
      );
      return {
        ...prev,
        [category_id]: { ...prev[category_id], z_index: maxZ + 1 },
      };
    });
  };

  const rename_category_api = async (category_id, new_name) => {
    await fetch(`${API}/rename_category/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category_id, name: new_name }),
    });
    setCategories((prev) => ({
      ...prev,
      [category_id]: { ...prev[category_id], name: new_name },
    }));
  };

  const toggle_archive_category = async (category_id) => {
    const res = await fetch(`${API}/toggle_archive_category/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category_id }),
    });
    const data = await res.json();
    setCategories((prev) => ({
      ...prev,
      [category_id]: { ...prev[category_id], archived: data.archived },
    }));
  };

  // ===== CATEGORY DRAG (clamped) =====

  const handleCategoryDrag = (event, category_key) => {
    const category = categories[category_key];
    const containerRect = categoryContainerRef.current.getBoundingClientRect();

    // Auto bring-to-front on click/drag
    bring_to_front_category(category_key);

    const startX = event.clientX - category.x;
    const startY = event.clientY - category.y;
    let new_x = category.x;
    let new_y = category.y;

    const onMouseMove = (e) => {
      const raw_x = e.clientX - startX;
      const raw_y = e.clientY - startY;
      const maxX = containerRect.width - category.width;
      const maxY = containerRect.height - category.height;

      new_x = Math.max(0, Math.min(raw_x, maxX));
      new_y = Math.max(0, Math.min(raw_y, maxY));

      setCategories((prev) => ({
        ...prev,
        [category_key]: { ...prev[category_key], x: new_x, y: new_y },
      }));
    };

    const onMouseUp = () => {
      set_position_category(category_key, { x: new_x, y: new_y });
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

  // ===== SIDEBAR RESIZE =====

  const handleSidebarResize = (event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (e) => {
      const delta = e.clientX - startX;
      const newWidth = Math.max(200, Math.min(startWidth + delta, window.innerWidth * 0.5));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      requestAnimationFrame(() => {
        if (categoryContainerRef.current) {
          const containerRect = categoryContainerRef.current.getBoundingClientRect();
          setCategories((prev) => {
            const updated = { ...prev };
            let changed = false;
            for (const [key, cat] of Object.entries(updated)) {
              if (cat.archived) continue;
              const maxX = Math.max(0, containerRect.width - cat.width);
              const maxY = Math.max(0, containerRect.height - cat.height);
              const clampedX = Math.max(0, Math.min(cat.x, maxX));
              const clampedY = Math.max(0, Math.min(cat.y, maxY));
              if (clampedX !== cat.x || clampedY !== cat.y) {
                updated[key] = { ...cat, x: clampedX, y: clampedY };
                set_position_category(key, { x: clampedX, y: clampedY });
                changed = true;
              }
            }
            return changed ? updated : prev;
          });
        }
      });
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // ===== IDEA API =====

  const fetch_all_ideas = async () => {
    try {
      const res = await fetch(`${API}/get_all_ideas/`);
      const data = await res.json();
      const idea_list = data?.data || [];
      const order = data?.order || [];
      const cat_orders = data?.category_orders || {};

      const idea_object = {};
      for (let i = 0; i < idea_list.length; i++) {
        const idea = idea_list[i];
        idea_object[idea.id] = { ...idea };
      }

      setIdeas(idea_object);
      setUnassignedOrder(order);
      setCategoryOrders(cat_orders);
    } catch (err) {
      console.error("Failed to fetch ideas:", err);
    }
  };

  const create_idea = async () => {
    if (!ideaName.trim()) return;
    await fetch(`${API}/create_idea/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea_name: ideaName, description: "" }),
    });
    setIdeaName("");
    fetch_all_ideas();
  };

  const delete_idea = async (idea_id) => {
    await fetch(`${API}/delete_idea/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: idea_id }),
    });
    fetch_all_ideas();
  };

  const update_idea_title_api = async (idea_id, new_title) => {
    if (!new_title.trim()) return;
    await fetch(`${API}/update_idea_title/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: idea_id, title: new_title }),
    });
    setIdeas((prev) => ({
      ...prev,
      [idea_id]: { ...prev[idea_id], title: new_title },
    }));
  };

  const safe_order = async (new_order, category_id = null) => {
    await fetch(`${API}/safe_order/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: new_order, category_id }),
    });
  };

  const assign_idea_to_category = async (idea_id, category_id) => {
    await fetch(`${API}/assign_idea_to_category/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea_id, category_id }),
    });
    fetch_all_ideas();
  };

  // ===== UNIFIED IDEA DRAG =====

  const isPointInRect = (px, py, rect) => {
    return (
      px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom
    );
  };

  const handleIdeaDrag = (event, idea, index, source) => {
    const from_index = index;
    let to_index = index;
    let drop_target = null;

    let ghost = { idea, x: event.clientX, y: event.clientY };

    setDragging(ghost);
    setPrevIndex(index);
    setDragSource(source);

    let sourceDomElements = [];
    if (source.type === "unassigned" && IdeaListRef.current) {
      sourceDomElements = [
        ...IdeaListRef.current.querySelectorAll("[data-idea-item]"),
      ];
    } else if (
      source.type === "category" &&
      categoryRefs.current[source.id]
    ) {
      sourceDomElements = [
        ...categoryRefs.current[source.id].querySelectorAll("[data-idea-item]"),
      ];
    }

    const onMouseMove = (e) => {
      ghost = { ...ghost, x: e.clientX, y: e.clientY };
      setDragging(ghost);

      let foundUnassigned = false;
      if (IdeaListRef.current) {
        const listRect = IdeaListRef.current.getBoundingClientRect();
        if (isPointInRect(e.clientX, e.clientY, listRect)) {
          foundUnassigned = true;
        }
      }

      let foundCategory = null;
      if (!foundUnassigned && categoryContainerRef.current) {
        const containerRect =
          categoryContainerRef.current.getBoundingClientRect();
        for (const [catId, catData] of Object.entries(categories)) {
          if (catData.archived) continue;
          const catRect = {
            left: containerRect.left + catData.x,
            top: containerRect.top + catData.y,
            right: containerRect.left + catData.x + catData.width,
            bottom: containerRect.top + catData.y + catData.height,
          };
          if (isPointInRect(e.clientX, e.clientY, catRect)) {
            foundCategory = catId;
            break;
          }
        }
      }

      setHoverCategory(foundCategory);
      setHoverUnassigned(foundUnassigned);
      drop_target = foundCategory
        ? { type: "category", id: foundCategory }
        : foundUnassigned
        ? { type: "unassigned" }
        : null;

      const isOverSource =
        (source.type === "unassigned" && foundUnassigned) ||
        (source.type === "category" &&
          foundCategory === String(source.id));

      if (isOverSource && sourceDomElements.length > 1) {
        for (let i = 0; i < sourceDomElements.length - 1; i++) {
          const rect = sourceDomElements[i].getBoundingClientRect();
          const next_rect =
            sourceDomElements[i + 1].getBoundingClientRect();
          if (ghost.y > rect.y && ghost.y < next_rect.y) {
            setHoverIndex(i);
            to_index = i;
          }
        }
      } else {
        setHoverIndex(null);
      }
    };

    const onMouseUp = () => {
      const sameSource =
        drop_target &&
        ((drop_target.type === source.type &&
          drop_target.type === "unassigned") ||
          (drop_target.type === "category" &&
            source.type === "category" &&
            String(drop_target.id) === String(source.id)));

      if (sameSource) {
        if (source.type === "unassigned") {
          const newOrder = [...unassignedOrder];
          const [movedId] = newOrder.splice(from_index, 1);
          newOrder.splice(to_index, 0, movedId);
          setUnassignedOrder(newOrder);
          safe_order(newOrder, null);
        } else if (source.type === "category") {
          const newOrder = [...(categoryOrders[source.id] || [])];
          const [movedId] = newOrder.splice(from_index, 1);
          newOrder.splice(to_index, 0, movedId);
          setCategoryOrders((prev) => ({ ...prev, [source.id]: newOrder }));
          safe_order(newOrder, source.id);
        }
      } else if (drop_target) {
        const target_category_id =
          drop_target.type === "category" ? parseInt(drop_target.id) : null;
        assign_idea_to_category(idea.id, target_category_id);
      }

      setDragging(null);
      setPrevIndex(null);
      setHoverIndex(null);
      setDragSource(null);
      setHoverCategory(null);
      setHoverUnassigned(false);

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // ===== INIT =====

  useEffect(() => {
    fetch_categories();
    fetch_all_ideas();
  }, []);

  // ===== RENDER HELPER =====

  const renderIdeaItem = (ideaId, arrayIndex, source) => {
    const idea = ideas[ideaId];
    if (!idea) return null;

    const isSource =
      dragSource &&
      dragSource.type === source.type &&
      (source.type === "unassigned" ||
        String(dragSource.id) === String(source.id));

    const isEditing = editingIdeaId === ideaId;

    return (
      <div key={`idea_${ideaId}`} data-idea-item="true">
        {/* Drop indicator */}
        <div
          style={{
            opacity: isSource && arrayIndex === hoverIndex ? 1 : 0,
            transform:
              isSource && arrayIndex === hoverIndex
                ? "translateY(2px)"
                : "translateY(0px)",
            transition: "opacity 100ms ease",
          }}
          className="w-full h-1 my-[1px] rounded bg-gray-700"
        />

        {isEditing ? (
          <div className="w-full mb-1">
            <input
              autoFocus
              value={editingIdeaTitle}
              onChange={(e) => setEditingIdeaTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  update_idea_title_api(ideaId, editingIdeaTitle);
                  setEditingIdeaId(null);
                } else if (e.key === "Escape") {
                  setEditingIdeaId(null);
                }
              }}
              onBlur={() => {
                update_idea_title_api(ideaId, editingIdeaTitle);
                setEditingIdeaId(null);
              }}
              className="w-full bg-gray-800 text-white text-xs px-2 py-1.5 rounded outline-none border border-blue-400 leading-snug"
            />
          </div>
        ) : (
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              handleIdeaDrag(e, idea, arrayIndex, source);
            }}
            style={{
              backgroundColor:
                isSource && arrayIndex === prevIndex ? "gray" : "#1a1a1a",
              transform:
                isSource &&
                hoverIndex !== null &&
                arrayIndex >= hoverIndex &&
                arrayIndex !== prevIndex
                  ? "translateY(6px)"
                  : "translateY(0px)",
              transition: "transform 200ms ease, background-color 200ms ease",
            }}
            className="w-full rounded text-white px-2 py-1.5 flex justify-between items-start text-xs mb-1 cursor-grab leading-snug"
          >
            <div className="flex-1 mr-1 break-words">{idea.title}</div>
            <div className="flex-shrink-0 mt-0.5 flex items-center gap-0.5">
              <EditIcon
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingIdeaId(ideaId);
                  setEditingIdeaTitle(idea.title);
                }}
                className="hover:text-blue-400! cursor-pointer"
                style={{ fontSize: 13 }}
              />
              <DeleteForeverIcon
                onClick={(e) => {
                  e.stopPropagation();
                  delete_idea(idea.id);
                }}
                className="hover:text-red-500!"
                style={{ fontSize: 14 }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // ===== ARCHIVE HELPERS =====

  const archivedCategories = Object.values(categories).filter((c) => c.archived);
  const activeCategories = Object.entries(categories).filter(([, c]) => !c.archived);

  // ===== JSX =====

  return (
    <>
      <div className="h-screen w-screen p-10 flex justify-center items-center select-none">
        {/* Create Category Form Overlay */}
        <div
          style={{ display: displayForm ? "block" : "none" }}
          className="fixed z-20"
        >
          <CreateCategoryForm onButtonClick={customFormButtonClick} />
        </div>
        <div
          style={{ display: displayForm ? "block" : "none" }}
          className="h-full w-full fixed bg-black/40 z-10"
        />

        {/* Confirm Modal */}
        {confirmModal && (
          <ConfirmModal
            message={confirmModal.message}
            onConfirm={confirmModal.onConfirm}
            onCancel={confirmModal.onCancel}
          />
        )}

        <div className="h-full w-full bg-white shadow-2xl border border-gray-300 rounded flex">
          {/* ===== LEFT SIDEBAR ===== */}
          <div
            style={{ width: `${sidebarWidth}px`, minWidth: 200 }}
            className="h-full shadow-xl bg-gray-200 border border-gray-200 select-none flex flex-col flex-shrink-0"
          >
            {/* Create Idea Form */}
            <div className="bg-gray-100 p-3 flex-shrink-0">
              <h1 className="text-xl mb-2">New Idea</h1>
              <TextField
                value={ideaName}
                onChange={(e) => setIdeaName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    create_idea();
                  }
                }}
                id="idea-name"
                label="What's your idea?"
                variant="outlined"
                multiline
                rows={2}
                fullWidth
                sx={{ backgroundColor: "white", borderRadius: 1 }}
              />
            </div>

            {/* Unassigned Idea List */}
            <div
              ref={IdeaListRef}
              style={{
                backgroundColor:
                  dragging && hoverUnassigned ? "#c7cbd1" : "#e5e7eb",
                transition: "background-color 150ms ease",
              }}
              className="flex-1 p-2 relative overflow-y-auto"
            >
              <h1 className="text-xl mb-1">Unassigned Ideas</h1>
              {unassignedOrder.map((ideaId, arrayIndex) =>
                renderIdeaItem(ideaId, arrayIndex, { type: "unassigned" })
              )}
            </div>
          </div>

          {/* ===== RESIZE HANDLE ===== */}
          <div
            onMouseDown={handleSidebarResize}
            className="w-1.5 h-full bg-gray-300 hover:bg-blue-400 cursor-col-resize flex-shrink-0 transition-colors duration-150"
          />

          {/* ===== CATEGORY CONTAINER ===== */}
          <div
            ref={categoryContainerRef}
            className="flex-1 h-full shadow-xl border border-gray-200 relative overflow-hidden"
          >
            {/* Create Category Button — always on top */}
            <div className="absolute top-4 right-4 z-[9999] flex gap-2">
              <Button
                text={"Create Category"}
                handleButtonClick={() => setDisplayForm(true)}
              />
              {archivedCategories.length > 0 && (
                <div
                  onClick={() => setShowArchive(!showArchive)}
                  className="bg-white select-none shadow-xl border border-gray-200 rounded-full h-10 px-4
                    flex justify-center items-center hover:bg-gray-100 active:bg-gray-300 cursor-pointer gap-1"
                >
                  <ArchiveIcon style={{ fontSize: 18 }} />
                  <span className="text-sm">{archivedCategories.length}</span>
                </div>
              )}
            </div>

            {/* Archive drawer */}
            {showArchive && archivedCategories.length > 0 && (
              <div className="absolute top-16 right-4 z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 p-3 min-w-[220px] max-h-[400px] overflow-y-auto">
                <h3 className="text-sm font-semibold mb-2 text-gray-500">Archived Categories</h3>
                {archivedCategories.map((cat) => {
                  const catIdeas = categoryOrders[cat.id] || [];
                  return (
                    <div
                      key={cat.id}
                      className="flex justify-between items-center p-2 rounded hover:bg-gray-50 mb-1 border border-gray-100"
                    >
                      <div className="flex-1">
                        <span className="text-sm font-medium">{cat.name}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          ({catIdeas.length} ideas)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <UnarchiveIcon
                          onClick={() => toggle_archive_category(cat.id)}
                          className="hover:text-green-600! cursor-pointer"
                          style={{ fontSize: 18 }}
                          titleAccess="Restore"
                        />
                        <DeleteForeverIcon
                          onClick={() =>
                            confirm_delete_category(cat.id, cat.name)
                          }
                          className="hover:text-red-500! cursor-pointer"
                          style={{ fontSize: 18 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Category Displays (only non-archived) */}
            {activeCategories.map(([category_key, category_data]) => {
              const catIdeas = categoryOrders[category_key] || [];
              const isHovered =
                dragging &&
                String(hoverCategory) === String(category_key);

              return (
                <div
                  onMouseDown={(e) => {
                    if (!e.ctrlKey) {
                      // Only start drag from header — this outer handler
                      // is needed so clicking the category body selects it
                      bring_to_front_category(category_key);
                    }
                  }}
                  style={{
                    left: category_data.x,
                    top: category_data.y,
                    width: category_data.width,
                    height: category_data.height,
                    zIndex: category_data.z_index || 0,
                    backgroundColor: isHovered ? "#fde68a" : "#fef08a",
                    transition: "background-color 150ms ease",
                  }}
                  key={category_key}
                  className="absolute shadow-xl rounded p-2 flex flex-col"
                >
                  {/* Category header (drag handle) */}
                  <div
                    onMouseDown={(e) => {
                      if (!e.ctrlKey) {
                        e.stopPropagation();
                        handleCategoryDrag(e, category_key);
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingCategoryId(category_key);
                      setEditingCategoryName(category_data.name);
                    }}
                    className="flex justify-between items-center mb-1 flex-shrink-0 bg-amber-300/50 rounded-t px-1 py-0.5 cursor-grab active:cursor-grabbing border-b border-amber-400/40"
                  >
                    {editingCategoryId === category_key ? (
                      <input
                        autoFocus
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            rename_category_api(category_key, editingCategoryName);
                            setEditingCategoryId(null);
                          } else if (e.key === "Escape") {
                            setEditingCategoryId(null);
                          }
                        }}
                        onBlur={() => {
                          rename_category_api(category_key, editingCategoryName);
                          setEditingCategoryId(null);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="bg-white text-sm font-semibold px-1 py-0.5 rounded outline-none border border-blue-400 flex-1 mr-1"
                      />
                    ) : (
                      <span className="font-semibold text-sm truncate">
                        {category_data.name}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <ArchiveIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle_archive_category(category_key);
                        }}
                        className="hover:text-amber-700! cursor-pointer"
                        style={{ fontSize: 16 }}
                        titleAccess="Archive"
                      />
                      <DeleteForeverIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          confirm_delete_category(
                            category_key,
                            category_data.name
                          );
                        }}
                        className="hover:text-red-500! cursor-pointer"
                        style={{ fontSize: 18 }}
                      />
                    </div>
                  </div>

                  {/* Ideas inside category (scrollable) */}
                  <div
                    ref={(el) =>
                      (categoryRefs.current[category_key] = el)
                    }
                    className="flex-1 overflow-y-auto overflow-x-hidden"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {catIdeas.map((ideaId, arrayIndex) =>
                      renderIdeaItem(ideaId, arrayIndex, {
                        type: "category",
                        id: category_key,
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GHOST (dragging indicator - rendered outside main layout) */}
      {dragging && (
        <div
          style={{
            top: `${dragging.y}px`,
            left: `${dragging.x}px`,
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
          }}
          className="fixed max-w-60 shadow border border-white/20 shadow-gray-700 bg-black rounded text-white px-2 py-1 flex items-center text-xs z-50 truncate"
        >
          {dragging.idea.title}
        </div>
      )}
    </>
  );
}
