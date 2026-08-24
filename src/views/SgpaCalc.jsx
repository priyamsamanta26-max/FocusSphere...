import React, { useState } from 'react';
import { Calculator, Plus, Trash2, Award } from 'lucide-react';

export default function SgpaCalc() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('');
  // allow decimal grade points (0.0 - 10.0)
  const [grade, setGrade] = useState('10');

  const addSubject = (e) => {
    e.preventDefault();
    if (!credits) return;

    const creditsVal = parseFloat(credits);
    const gradeVal = parseFloat(grade);
    if (isNaN(creditsVal) || creditsVal <= 0) return;
    if (isNaN(gradeVal) || gradeVal < 0 || gradeVal > 10) return;

    setSubjects([
      ...subjects,
      {
        id: Date.now(),
        name: name || `Subject ${subjects.length + 1}`,
        credits: creditsVal,
        grade: gradeVal
      }
    ]);
    setName('');
    setCredits('');
    setGrade('10');
  };

  const deleteSubject = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const totalScore = subjects.reduce((sum, s) => sum + (s.credits * s.grade), 0);
  const sgpa = totalCredits > 0 ? (totalScore / totalCredits).toFixed(2) : '0.00';

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 font-sans">
      {/* Left: Result & quick add */}
      <div className="lg:col-span-1 glass-card p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center">
        <Award className="text-teal-400 mb-2" size={36} />
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Estimated SGPA</div>
        <div className="text-6xl font-extrabold mt-3 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-amber-400">{sgpa}</div>
        <div className="mt-3 text-xs text-slate-400">Total Credits: <span className="font-bold text-slate-100">{totalCredits}</span></div>

        <div className="w-full mt-6">
          <h4 className="text-xs font-bold text-slate-200 mb-2">Quick Presets</h4>
          <div className="flex gap-2 justify-center">
            <button className="px-3 py-2 rounded-full bg-slate-800 text-slate-300 text-xs" onClick={() => { if (!subjects.length) { setSubjects([{ id: Date.now()+1, name: 'Sample 1', credits: 4, grade: 9 }, { id: Date.now()+2, name: 'Sample 2', credits: 3, grade: 8 }]); } }}>Add 2 sample</button>
            <button className="px-3 py-2 rounded-full bg-slate-800 text-slate-300 text-xs" onClick={() => { setSubjects([]); }}>Clear All</button>
          </div>
        </div>
      </div>

      {/* Center: Add Subject Form */}
      <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2"><Calculator className="text-teal-400" size={18} /> Add / Edit Subjects</h3>
          <div className="text-xs text-slate-400">Enter credits and grade points (decimals allowed)</div>
        </div>

        <form onSubmit={addSubject} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <input type="text" placeholder="Course name" value={name} onChange={e => setName(e.target.value)} className="sm:col-span-2 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-md text-slate-100" />
          <input type="number" min="0.01" max="30" step="0.01" placeholder="Credits" value={credits} onChange={e => setCredits(e.target.value)} className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-md text-slate-100" required />
          <input type="number" min="0" max="10" step="0.01" placeholder="Grade" value={grade} onChange={e => setGrade(e.target.value)} className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-md text-slate-100" required />
          <button type="submit" className="sm:col-span-4 mt-2 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md font-bold"> <Plus size={16}/> Add Subject</button>
        </form>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-800">
          <table className="w-full text-left bg-slate-900/40">
            <thead className="bg-slate-950/40 text-xs uppercase text-slate-400 font-black">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Credits</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-300 divide-y divide-slate-800">
              {subjects.length === 0 ? (
                <tr><td colSpan="4" className="py-6 text-center text-slate-500 italic">No courses added yet.</td></tr>
              ) : subjects.map(s => (
                <tr key={s.id} className="hover:bg-slate-900/60">
                  <td className="py-3 px-4 font-bold text-slate-100">{s.name}</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-slate-800 rounded text-xs">{s.credits}</span></td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-teal-950 rounded text-xs text-teal-400">{s.grade}</span></td>
                  <td className="py-3 px-4 text-right"><button onClick={() => deleteSubject(s.id)} className="p-2 text-slate-400 hover:text-rose-400"><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
