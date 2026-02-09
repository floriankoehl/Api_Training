import { useEffect, useState } from "react";
import { Add, Delete, Refresh } from "@mui/icons-material";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

function App() {
  const [examples, setExamples] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchExamples = async () => {
    try {
      const response = await axios.get(`${API_BASE}/examples/`);
      setExamples(response.data);
    } catch (error) {
      console.error("Error fetching examples:", error);
    }
  };

  useEffect(() => {
    fetchExamples();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await axios.post(`${API_BASE}/examples/`, {
        title,
        content,
      });
      setTitle("");
      setContent("");
      fetchExamples();
    } catch (error) {
      console.error("Error creating example:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/examples/${id}/`);
      fetchExamples();
    } catch (error) {
      console.error("Error deleting example:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#eef2ff_45%,_#f7f7f7)] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.4em] text-blue-500">
            Django + React
          </span>
          <h1 className="text-4xl font-semibold text-gray-900 md:text-5xl">
            Django API check
          </h1>
          <p className="max-w-2xl text-gray-600">
            Add an example and confirm the Vite frontend can read the Django
            backend data.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <section className="rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Add className="text-blue-500" />
              Add Example
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-gray-600">Title</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Content</label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  rows={4}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  required
                />
              </div>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400"
                type="submit"
                disabled={isSaving}
              >
                <Add fontSize="small" />
                {isSaving ? "Saving..." : "Save example"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Examples</h2>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs uppercase tracking-widest text-gray-500 transition hover:border-blue-200 hover:text-blue-600"
                onClick={fetchExamples}
                type="button"
              >
                <Refresh fontSize="inherit" />
                Refresh
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {examples.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                  No examples yet. Add one to test the API.
                </div>
              ) : (
                examples.map((example) => (
                  <article
                    key={example.id}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {example.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {example.content}
                        </p>
                      </div>
                      <button
                        className="rounded-full p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        onClick={() => handleDelete(example.id)}
                        type="button"
                      >
                        <Delete fontSize="small" />
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-gray-400">
                      {new Date(example.created_at).toLocaleString()}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
