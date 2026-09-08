import { supabase } from './supabaseClient';
import { getCachedData, setCachedData, isNetworkError } from './cacheHelper';

function fromRow(e) {
  return {
    id: e.id,
    groupId: e.group_id || e.groupId,
    title: e.title || e.name || 'Imtihon',
    name: e.title || e.name || 'Imtihon',
    date: e.date || e.exam_date || new Date().toISOString().slice(0, 10),
    passingScore: e.passing_score ?? e.passingScore ?? 60,
    section: e.section || e.unit || e.category || 'Asosiy',
    calculationType: e.calculation_type || e.calculationType || '100 ballik tizim',
    templateId: e.template_id || e.templateId || null,
    maxScore: e.max_score || e.maxScore || 100,
    results: typeof e.results === 'string' ? JSON.parse(e.results) : (e.results || {}),
    createdAt: e.created_at || e.createdAt || new Date().toISOString(),
  };
}

export const DEFAULT_EXAM_TEMPLATES = [
  {
    id: 'tmpl-ielts',
    title: 'IELTS Mock Full Exam (Listening, Reading, Writing, Speaking)',
    passingScore: 5.5,
    maxScore: 9.0,
    section: 'IELTS Mock',
    calculationType: 'Band score (0-9)',
  },
  {
    id: 'tmpl-cefr',
    title: 'CEFR B2 Multi-level Shablon',
    passingScore: 50,
    maxScore: 75,
    section: 'Multi-level CEFR',
    calculationType: '75 ballik tizim',
  },
  {
    id: 'tmpl-midterm',
    title: 'Mid-Term Oylik Oraliq Imtihon',
    passingScore: 60,
    maxScore: 100,
    section: 'Oraliq nazorat',
    calculationType: '100 ballik tizim',
  },
  {
    id: 'tmpl-unit-quiz',
    title: 'Unit Quiz & Vocab Test',
    passingScore: 70,
    maxScore: 100,
    section: 'Unit Quiz',
    calculationType: 'Foiz (%)',
  },
  {
    id: 'tmpl-final',
    title: 'Final Course Exam (Yakuniy Imtihon)',
    passingScore: 70,
    maxScore: 100,
    section: 'Yakuniy test',
    calculationType: '100 ballik tizim',
  },
];

export async function fetchExams() {
  try {
    const { data, error } = await supabase.from('exams').select('*');
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase fetchExams info:', error.message || error);
      }
      return getCachedData('exams', []);
    }
    const result = (data || []).map(fromRow);
    setCachedData('exams', result);
    return result;
  } catch (err) {
    if (!isNetworkError(err)) {
      console.warn('Supabase fetchExams exception:', err.message || err);
    }
    return getCachedData('exams', []);
  }
}

export async function addExam(payload) {
  const base = {
    group_id: payload.groupId,
    title: payload.title || payload.name,
    date: payload.date || new Date().toISOString().slice(0, 10),
    passing_score: payload.passingScore ?? 60,
    section: payload.section || 'Asosiy',
    calculation_type: payload.calculationType || '100 ballik tizim',
    template_id: payload.templateId || null,
    max_score: payload.maxScore || 100,
    results: payload.results || {},
  };

  try {
    const { data, error } = await supabase
      .from('exams')
      .insert(base)
      .select()
      .single();
    if (error) throw error;
    const row = fromRow(data);
    const cached = getCachedData('exams', []);
    setCachedData('exams', [row, ...cached]);
    return row;
  } catch (err) {
    console.warn('Supabase addExam fallback to local storage:', err.message);
    const localRow = {
      id: crypto.randomUUID ? crypto.randomUUID() : `ex-${Date.now()}`,
      groupId: payload.groupId,
      title: payload.title || payload.name,
      name: payload.title || payload.name,
      date: payload.date || new Date().toISOString().slice(0, 10),
      passingScore: payload.passingScore ?? 60,
      section: payload.section || 'Asosiy',
      calculationType: payload.calculationType || '100 ballik tizim',
      templateId: payload.templateId || null,
      maxScore: payload.maxScore || 100,
      results: payload.results || {},
      createdAt: new Date().toISOString(),
    };
    const cached = getCachedData('exams', []);
    setCachedData('exams', [localRow, ...cached]);
    return localRow;
  }
}

export async function updateExam(id, payload) {
  const patch = {};
  if (payload.title !== undefined) patch.title = payload.title;
  if (payload.name !== undefined) patch.title = payload.name;
  if (payload.date !== undefined) patch.date = payload.date;
  if (payload.passingScore !== undefined) patch.passing_score = payload.passingScore;
  if (payload.section !== undefined) patch.section = payload.section;
  if (payload.calculationType !== undefined) patch.calculation_type = payload.calculationType;
  if (payload.templateId !== undefined) patch.template_id = payload.templateId;
  if (payload.maxScore !== undefined) patch.max_score = payload.maxScore;
  if (payload.results !== undefined) patch.results = payload.results;

  try {
    const { data, error } = await supabase
      .from('exams')
      .update(patch)
      .eq('id', id)
      .select();
    if (error) throw error;
    const row = data?.[0] ? fromRow(data[0]) : { id, ...payload };
    const cached = getCachedData('exams', []);
    setCachedData(
      'exams',
      cached.map((x) => (x.id === id ? { ...x, ...row } : x))
    );
    return row;
  } catch (err) {
    console.warn('Supabase updateExam fallback:', err.message);
    const cached = getCachedData('exams', []);
    const updated = cached.map((x) => (x.id === id ? { ...x, ...payload } : x));
    setCachedData('exams', updated);
    return { id, ...payload };
  }
}

export async function deleteExam(id) {
  try {
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.warn('Supabase deleteExam error:', err.message);
  }
  const cached = getCachedData('exams', []);
  setCachedData('exams', cached.filter((x) => x.id !== id));
}

export async function saveExamResults(examId, results) {
  return updateExam(examId, { results });
}
