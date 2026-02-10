import { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

const API = "http://127.0.0.1:8000/api";

// ─── API helpers ──────────────────────────────────────────────
async function fetchTasks() {
  const res = await fetch(`${API}/get_all_tasks/`);
  return res.json();
}

async function apiCreateTask(title) {
  const res = await fetch(`${API}/create_task/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task_title: title }),
  });
  return res.json();
}

async function apiDeleteTask(title) {
  await fetch(`${API}/delete_task/`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title_to_delete: title }),
  });
}

async function apiUpdateTask(id, fields) {
  const res = await fetch(`${API}/update_task/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  return res.json();
}

// ─── Single task card ─────────────────────────────────────────
function TaskCard({ task, onDragStart, onDelete }) {
  return (
    <div
      onMouseDown={(e) => onDragStart(e, task)}
      className="
        bg-white rounded shadow border px-3 py-2
        flex items-center justify-between
        cursor-grab active:cursor-grabbing select-none
      "
    >
      <span className={task.done ? "line-through text-gray-400" : ""}>
        {task.title}
      </span>
      <IconButton
        size="small"
        color="error"
        onMouseDown={(e) => e.stopPropagation()} // don't trigger drag
        onClick={() => onDelete(task)}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </div>
  );
}

// ─── Column (drop zone) ──────────────────────────────────────
function Column({ title, children, innerRef, highlight }) {
  return (
    <div
      ref={innerRef}
      className={`
        flex-1 min-h-0 rounded-xl border-2 p-4 flex flex-col gap-2
        transition-colors duration-150 overflow-y-auto
        ${highlight ? "border-blue-400 bg-white/30" : "border-white/40 bg-white/10"}
      `}
    >
      <h2 className="text-white font-semibold text-lg mb-2 select-none">
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────
export default function DragTasks() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [dragging, setDragging] = useState(null); // { task, ghostX, ghostY }
  const [hoverColumn, setHoverColumn] = useState(null); // "todo" | "done"

  const todoRef = useRef(null);
  const doneRef = useRef(null);

  // ── Load tasks ──
  const loadTasks = async () => {
    const data = await fetchTasks();
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // ── Create task ──
  const handleCreate = async () => {
    const title = newTitle.trim();
    if (!title) return;
    const created = await apiCreateTask(title);
    setTasks((prev) => [...prev, created]);
    setNewTitle("");
  };

  // ── Delete task ──
  const handleDelete = async (task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    await apiDeleteTask(task.title);
  };

  // ── Drag logic ──
  const hitTest = (x, y) => {
    for (const [ref, name] of [
      [todoRef, "todo"],
      [doneRef, "done"],
    ]) {
      const rect = ref.current?.getBoundingClientRect();
      if (
        rect &&
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        return name;
      }
    }
    return null;
  };

  const handleDragStart = (e, task) => {
    e.preventDefault();
    const ghost = { task, ghostX: e.clientX, ghostY: e.clientY };
    setDragging(ghost);

    const onMove = (ev) => {
      setDragging((prev) =>
        prev ? { ...prev, ghostX: ev.clientX, ghostY: ev.clientY } : prev
      );
      setHoverColumn(hitTest(ev.clientX, ev.clientY));
    };

    const onUp = (ev) => {
      const target = hitTest(ev.clientX, ev.clientY);
      const newDone = target === "done";

      // Only update if the done status actually changed
      if (newDone !== task.done) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, done: newDone } : t))
        );
        apiUpdateTask(task.id, { done: newDone });
      }

      setDragging(null);
      setHoverColumn(null);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // ── Derived lists ──
  const todoTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);

  return (
    <div className="h-screen w-screen bg-gray-200 p-6 flex flex-col">
      {/* ── Create bar ── */}
      <div className="flex justify-center gap-2 mb-4">
        <TextField
          size="small"
          label="New task"
          variant="outlined"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button variant="contained" onClick={handleCreate}>
          Create
        </Button>
      </div>

      {/* ── Board ── */}
      <div
        className="flex-1 rounded-xl flex gap-6 p-6 min-h-0"
        style={{ backgroundColor: "#021736" }}
      >
        <Column
          title="To Do"
          innerRef={todoRef}
          highlight={hoverColumn === "todo" && dragging?.task.done}
        >
          {todoTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={handleDragStart}
              onDelete={handleDelete}
            />
          ))}
        </Column>

        <Column
          title="Done"
          innerRef={doneRef}
          highlight={hoverColumn === "done" && !dragging?.task.done}
        >
          {doneTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={handleDragStart}
              onDelete={handleDelete}
            />
          ))}
        </Column>
      </div>

      {/* ── Drag ghost ── */}
      {dragging && (
        <div
          className="fixed pointer-events-none z-50 bg-white rounded shadow-xl border px-3 py-2 opacity-80"
          style={{
            left: dragging.ghostX,
            top: dragging.ghostY,
            transform: "translate(-50%, -50%)",
          }}
        >
          {dragging.task.title}
        </div>
      )}
    </div>
  );
}
