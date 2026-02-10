



import { useState, useRef } from "react";

const INITIAL_ITEMS = [
  "Learn React",
  "Build a project",
  "Write tests",
  "Deploy to production",
  "Celebrate",
];

export default function DragAndDropDemo() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [dragIndex, setDragIndex] = useState(null);   // Index of the item currently being dragged
  const [overIndex, setOverIndex] = useState(null);    // Index of the item the cursor is hovering over
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // Cursor position for the ghost element
  const containerRef = useRef(null); // Ref to the list container, used to access child elements for hit detection

  const handleMouseDown = (e, index) => {
    e.preventDefault(); // Prevent text selection while dragging
    setDragIndex(index);
    setMousePos({ x: e.clientX, y: e.clientY });

    const onMouseMove = (e) => {
      // Update ghost position to follow the cursor
      setMousePos({ x: e.clientX, y: e.clientY });

      const container = containerRef.current;
      if (!container) return;

      // Loop through all list items and check which one the cursor is over
      // Uses getBoundingClientRect() to get each item's position in the viewport
      const children = [...container.children];
      console.log(children)
      for (let i = 0; i < children.length; i++) {
        const rect = children[i].getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
          setOverIndex(i); // Mark this item as the drop target
          return;
        }
      }
    };

    const onMouseUp = () => {
      // On release, reorder the list if the drag landed on a different item.
      // We read dragIndex and overIndex via setState callbacks to get the latest values,
      // since these closures would otherwise capture stale state.
      setDragIndex((prevDrag) => {
        setOverIndex((prevOver) => {
          if (prevDrag !== null && prevOver !== null && prevDrag !== prevOver) {
            setItems((prev) => {
              const next = [...prev];
              const [moved] = next.splice(prevDrag, 1); // Remove dragged item
              next.splice(prevOver, 0, moved);           // Insert it at the new position
              return next;
            });
          }
          return null; // Reset overIndex
        });
        return null; // Reset dragIndex
      });

      // Clean up global listeners so they don't fire after the drag ends
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    // Attach to document (not the element) so dragging works even if
    // the cursor moves outside the list or moves faster than React re-renders
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex items-center justify-center">
      <div className="w-80">
        <h1 className="text-xl font-semibold mb-4">Reorder List</h1>
        <div ref={containerRef} className="flex flex-col gap-1">
          {items.map((item, i) => {
            const isDragging = dragIndex === i;
            const isOver = overIndex === i && dragIndex !== i;

            return (
              <div
                key={item}
                onMouseDown={(e) => handleMouseDown(e, i)}
                className={`
                  px-4 py-3 rounded-lg cursor-grab select-none
                  transition-all duration-150
                  ${isDragging ? "opacity-30 scale-95 bg-blue-200" : "bg-white shadow-sm hover:shadow-md"}
                  ${isOver ? "border-2 border-blue-500" : "border-2 border-transparent"}
                `}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ghost: a fixed-position clone of the dragged item that follows the cursor.
          pointer-events-none ensures it doesn't block hover detection on the list items. */}
      {dragIndex !== null && (
        <div
          className="fixed pointer-events-none z-50 px-4 py-3 rounded-lg bg-white shadow-xl border-2 border-blue-500 w-80 opacity-90"
          style={{
            left: mousePos.x - 160,  // Center horizontally on cursor (w-80 = 320px / 2)
            top: mousePos.y - 20,    // Slight offset so cursor isn't hidden behind the ghost
          }}
        >
          {items[dragIndex]}
        </div>
      )}
    </div>
  );
}