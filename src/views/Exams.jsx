import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { GraduationCap, Plus, Trash2, Calendar, BookOpen } from 'lucide-react';

export default function Exams({ user }) {
  const [exams, setExams] = useState([]);
  const [examName, setExamName] = useState('');
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('*').order('exam_date', { ascending: true });
    if (data) setExams(data);
  };

  const addExam = async (e) => {
    e.preventDefault();
    if (!examName || !examDate) return;

    const newExam = {
      user_id: user.id,
      exam_name: examName,
      subject,
      exam_date: examDate
    };

    const { data, error } = await supabase.from('exams').insert([newExam]).select();
    if (!error && data) {
      setExams([...exams, data[0]].sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date)));
      setExamName('');
      setSubject('');
      setExamDate('');
    }
  };

  const deleteExam = async (id) => {
    await supabase.from('exams').delete().eq('id', id);
    setExams(exams.filter(e => e.id !== id));
  };

  const calculateDaysRemaining = (dateString) => {
    const examDateObj = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = examDateObj - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Completed', color: 'bg-slate-900 text-slate-550 border-slate-800' };
    if (diffDays === 0) return { text: 'Today!', color: 'bg-rose-950/60 text-rose-400 border-rose-900/50 animate-pulse' };
    if (diffDays <= 3) return { text: `${diffDays} Days Left`, color: 'bg-amber-950/60 text-amber-400 border-amber-900/50' };
    return { text: `${diffDays} Days Left`, color: 'bg-teal-950/60 text-teal-400 border-teal-900/50' };
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 font-sans">
      {/* Left: Timeline of exams */}
      <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-xl border border-teal-500/12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2"><GraduationCap className="text-teal-400" /> Exam Planner</h3>
          <div className="text-xs text-slate-400">Organize your upcoming tests</div>
        </div>

        {exams.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <GraduationCap size={48} className="mx-auto mb-3 text-slate-600 animate-pulse" />
            <p className="font-bold text-slate-400">No exams added yet</p>
            <p className="text-xs mt-1">Use the form on the right to schedule exams.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => {
              const status = calculateDaysRemaining(exam.exam_date);
              return (
                <div key={exam.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-teal-500/20 transition">
                  <div className="w-32 flex flex-col items-center">
                    <div className="text-xs font-mono text-slate-400">{new Date(exam.exam_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                    <div className="mt-2 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-slate-200 font-bold">{new Date(exam.exam_date).getDate()}</div>
                    <div className="mt-2 text-[10px] text-slate-400">{status.text}</div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-100">{exam.exam_name}</div>
                        <div className="text-xs text-slate-400 mt-1">{exam.subject || 'General'}</div>
                      </div>
                      <div className="text-xs text-slate-400">{new Date(exam.exam_date).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <button onClick={() => deleteExam(exam.id)} className="px-3 py-2 bg-rose-900/20 text-rose-300 rounded-md text-xs">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Add form + stats */}
      <div className="glass-card p-6 rounded-2xl shadow-xl border border-teal-500/12 flex flex-col gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-100">Schedule New Exam</h4>
          <p className="text-xs text-slate-400">Quickly add an exam to your planner</p>
        </div>

        <form onSubmit={addExam} className="flex flex-col gap-3">
          <input type="text" placeholder="Exam Title (e.g. Calculus Final)" value={examName} onChange={e => setExamName(e.target.value)} className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-md text-slate-100" required />
          <input type="text" placeholder="Subject Code" value={subject} onChange={e => setSubject(e.target.value)} className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-md text-slate-100" />
          <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-md text-slate-100" required />
          <button type="submit" className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-md font-bold">Add Exam</button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800/40">
          <div className="text-xs text-slate-400">Upcoming</div>
          <div className="mt-2 text-lg font-bold text-slate-100">{exams.length} exams</div>
          {exams[0] && (
            <div className="mt-2 text-xs text-slate-400">Soonest: {new Date(exams[0].exam_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          )}

          <div className="mt-4">
            <button onClick={() => { setExams([]); }} className="px-3 py-2 bg-slate-800 text-slate-300 rounded-md text-xs">Clear All</button>
          </div>
        </div>
      </div>
    </div>
  );
}
