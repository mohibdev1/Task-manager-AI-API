
import { useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/tasks";
const STATUSES = ["pending", "in-progress", "completed"];

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  const [aiTitle, setAiTitle] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [plan, setPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Load all tasks
  async function getTasks() {
    try {
      const response = await fetch(API);
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Tasks load nahi huay.");
        return;
      }

      setTasks(
        Array.isArray(data)
          ? data
          : Array.isArray(data.tasks)
            ? data.tasks
            : []
      );
    } catch {
      alert("Backend connection check karo.");
    }
  }

  // Add a new task
  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;

    setTaskLoading(true);

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Task add nahi hua.");
        return;
      }

      const newTask = data.task || data;
      setTasks((previous) => [...previous, newTask]);
      setTitle("");
      setDescription("");
    } catch {
      alert("Backend connection check karo.");
    } finally {
      setTaskLoading(false);
    }
  }

  // Generate AI plan
  async function generatePlan(e) {
    e.preventDefault();
    if (!aiTitle.trim()) return;

    setAiLoading(true);
    setPlan(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/ai/plan-task",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: aiTitle.trim(),
            description: aiDescription.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "AI plan generate nahi hua.");
        return;
      }

      setPlan(data.plan);
    } catch {
      alert("Backend connection check karo.");
    } finally {
      setAiLoading(false);
    }
  }

  // Start editing
  function startEdit(task) {
    setEditingId(task._id || task.id);
    setEditTitle(task.title || "");
    setEditDescription(task.description || "");
  }

  // Save edited task
  async function saveEdit(e) {
    e.preventDefault();

    if (!editTitle.trim() || !editingId) return;

    try {
      const response = await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Task update nahi hua.");
        return;
      }

      const updatedTask = data.task || data;

      setTasks((previous) =>
        previous.map((task) =>
          (task._id || task.id) === editingId ? updatedTask : task
        )
      );

      setEditingId(null);
      setEditTitle("");
      setEditDescription("");
    } catch {
      alert("Backend connection check karo.");
    }
  }

  // Update task status
  async function updateTaskStatus(task) {
    const id = task._id || task.id;
    if (!id) return;

    const currentStatus = task.status || "pending";
    const currentIndex = STATUSES.indexOf(currentStatus);
    const nextStatus =
      STATUSES[(currentIndex + 1 + STATUSES.length) % STATUSES.length];

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Status update nahi hua.");
        return;
      }

      const updatedTask = data.task || data;

      setTasks((previous) =>
        previous.map((item) =>
          (item._id || item.id) === id
            ? { ...item, ...updatedTask, status: nextStatus }
            : item
        )
      );
    } catch {
      alert("Backend connection check karo.");
    }
  }

  // Delete task
  async function deleteTask(id) {
    if (!id) {
      alert("Task ID nahi mili.");
      return;
    }

    if (!window.confirm("Kya tum ye task delete karna chahte ho?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Task delete nahi hua.");
        return;
      }

      setTasks((previous) =>
        previous.filter((task) => (task._id || task.id) !== id)
      );
    } catch {
      alert("Backend connection check karo.");
    }
  }

  return (
    <main className="container">
      <header>
        <p className="eyebrow">SMART PRODUCTIVITY</p>
        <h1>
          Task Manager <span>AI</span>
        </h1>
        <p className="subtitle">
          Organize your work. Plan smarter. Get things done.
        </p>
      </header>

      {/* Create Task */}
      <section className="panel">
        <h2>Create a task</h2>

        <form onSubmit={addTask}>
          <label htmlFor="task-title">Task title</label>
          <input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Build a React website"
            required
          />

          <label htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your task..."
            rows="3"
          />

          <button type="submit" disabled={taskLoading}>
            {taskLoading ? "Adding..." : "+ Add Task"}
          </button>
        </form>
      </section>

      {/* AI Planner */}
      <section className="panel ai-panel">
        <h2>✨ AI Task Planner</h2>
        <p>Let AI break your goal into manageable steps.</p>

        <form onSubmit={generatePlan}>
          <label htmlFor="ai-title">What do you want to achieve?</label>
          <input
            id="ai-title"
            value={aiTitle}
            onChange={(e) => setAiTitle(e.target.value)}
            placeholder="e.g. Learn Node.js"
            required
          />

          <label htmlFor="ai-description">More details</label>
          <textarea
            id="ai-description"
            value={aiDescription}
            onChange={(e) => setAiDescription(e.target.value)}
            placeholder="Describe your goal..."
            rows="3"
          />

          <button type="submit" disabled={aiLoading}>
            {aiLoading ? "Generating plan..." : "✨ Generate AI Plan"}
          </button>
        </form>

        {plan && (
          <div className="plan-result">
            <h3>Your AI Plan</h3>
            <p>{plan.summary}</p>
            <p><strong>Priority:</strong> {plan.priority}</p>
            <p><strong>Estimated hours:</strong> {plan.estimatedHours}</p>
            <h4>Steps to complete</h4>
            <ol>
              {plan.steps?.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* Tasks */}
      <section className="task-section">
        <div className="section-heading">
          <h2>Your tasks</h2>
          <button className="secondary" onClick={getTasks}>
            Refresh tasks
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="empty">
            No tasks displayed yet. Add a task or refresh.
          </p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => {
              const id = task._id || task.id;

              return (
                <article className="task-card" key={id || task.title}>
                  {editingId === id ? (
                    <form onSubmit={saveEdit}>
                      <label htmlFor={`edit-title-${id}`}>Edit title</label>
                      <input
                        id={`edit-title-${id}`}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                      />

                      <label htmlFor={`edit-description-${id}`}>
                        Edit description
                      </label>
                      <textarea
                        id={`edit-description-${id}`}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows="3"
                      />

                      <button type="submit">Save Changes</button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <h3>{task.title}</h3>
                      <p>{task.description || "No description"}</p>

                      <span className="status">
                        {task.status || "pending"}
                      </span>

                      <div className="task-actions">
                        <button
                          className="secondary"
                          onClick={() => startEdit(task)}
                        >
                          Edit
                        </button>

                        <button
                          className="secondary"
                          onClick={() => updateTaskStatus(task)}
                        >
                          Update Status
                        </button>

                        <button
                        className="delete-button"
                          onClick={() => deleteTask(id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;

