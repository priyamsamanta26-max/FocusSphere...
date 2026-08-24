import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Trash2, CheckCircle2, Circle, BookOpen } from 'lucide-react';

export default function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('is_completed', { ascending: true }).order('created_at', { ascending: false });
    if (data) setTasks(data);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const { data, error } = await supabase.from('tasks').insert([{
      user_id: user.id, title, subject, priority
    }]).select();

    if (!error && data) {
      setTasks([data[0], ...tasks]);
      setTitle('');
      setSubject('');
    }
  };

  const toggleTask = async (id, isCompleted) => {
    await supabase.from('tasks').update({ is_completed: !isCompleted }).eq('id', id);
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !isCompleted } : t));
  };

  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getPriorityColor = (p) => {
    if (p === 'High') return 'bg-rose-950/60 text-rose-400 border-rose-900/50';
    if (p === 'Medium') return 'bg-amber-950/60 text-amber-400 border-amber-900/50';
    return 'bg-teal-950/60 text-teal-400 border-teal-900/50';
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10 font-sans">
      {/* Left sidebar: add task + filters + stats */}
      <aside className="lg:col-span-1 glass-card p-6 rounded-2xl shadow-xl border border-teal-500/12 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Add New Task</h3>
          <p className="text-xs text-slate-400">Quickly add items to your backlog</p>
        </div>

        <form onSubmit={addTask} className="flex flex-col gap-3">
          <input type="text" placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-md text-slate-100" required />
          <input type="text" placeholder="Subject (optional)" value={subject} onChange={e => setSubject(e.target.value)} className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-md text-slate-100" />
          <select value={priority} onChange={e => setPriority(e.target.value)} className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-md text-slate-100">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button type="submit" className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-md font-bold">Add Task</button>
        </form>

        <div className="mt-3 pt-3 border-t border-slate-800/40">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div>Show completed</div>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={showCompleted} onChange={e => setShowCompleted(e.target.checked)} className="accent-teal-400" />
            </label>
          </div>

          <div className="mt-3 text-xs text-slate-400">Total tasks: <span className="font-bold text-slate-100">{tasks.length}</span></div>
          <div className="mt-1 text-xs text-slate-400">Pending: <span className="font-bold text-amber-400">{tasks.filter(t=>!t.is_completed).length}</span></div>
        </div>
      </aside>

      {/* Main backlog list */}
      <main className="lg:col-span-3 glass-card p-6 rounded-2xl shadow-xl border border-teal-500/12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-100">Study Backlog</h3>
          <div className="text-xs text-slate-400">Organize and prioritize your work</div>
        </div>

        {tasks.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <CheckCircle2 size={56} className="mx-auto mb-3 text-teal-500 animate-bounce" />
            <p className="font-bold text-slate-400">No tasks yet</p>
            <p className="text-xs mt-1">Add your first study task from the left panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.filter(t => showCompleted ? true : !t.is_completed).map(task => (
              <div key={task.id} className={`p-4 rounded-lg border ${task.is_completed ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-900/40 border-slate-800'} flex flex-col justify-between`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-sm ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>{task.title}</h4>
                    <div className="mt-2 flex items-center gap-2">
                      {task.subject && <span className="text-xs px-2 py-0.5 rounded-full bg-teal-950/40 text-teal-400">{task.subject}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <button onClick={() => toggleTask(task.id, task.is_completed)} className={`p-2 rounded-full ${task.is_completed ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300'}`} title="Toggle complete">
                      {task.is_completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-400 hover:text-rose-400" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-400">Added: {new Date(task.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
